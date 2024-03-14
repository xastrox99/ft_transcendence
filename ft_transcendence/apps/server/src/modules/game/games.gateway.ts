import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { parse as cookieParser } from "cookie";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/global/prisma/prisma.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Inject } from "@nestjs/common";
import GameModel from "./services/game.model.service";
import { Body } from "matter-js";
import { Game } from "./game.interface";

interface JoinGamePayload {
  gameMaps: "default" | "opt";
}
@WebSocketGateway({
  cors: true,
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  queue: string[];
  modeQueue: string[];

  @WebSocketServer()
  server: Server;
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
    @Inject("GAMES")
    private games: Map<string, Game>,
    @Inject("CLIENTS")
    private clients: Map<string, string[]>
  ) {
    this.queue = [];
    this.modeQueue = [];
    this.clients = new Map<string, string[]>();
  }

  async points(uid: string, points: number) {
    return this.prismaService.user.update({
      where: { uid },
      data: {
        points: points > 0 ? { increment: points } : { decrement: -points },
      },
    });
  }

  async handleConnection(client: Socket) {
    try {
      console.log("Client Connected!");
      const cookies = cookieParser(client.handshake.headers["cookie"] ?? "");
      const authToken = cookies["token"];
      if (!authToken) throw new WsException("missing auth-token.");

      const payload: { email: string } = await this.jwtService.verifyAsync(
        authToken,
        { secret: process.env.JWT_SECRET_TOKEN }
      );

      const user = await this.prismaService.user.update({
        where: { email: payload.email },
        data: {
          status: "online",
        },
      });

      client.broadcast.emit("user-status", {
        userId: user.uid,
        status: "online",
      });

      client.user = user;
      client.inGame = false;

      this.clients.set(user.uid, [
        ...(this.clients.get(user.uid) ?? []),
        client.id,
      ]);
    } catch (err) {
      let msg = "Something went wrong.";
      if (err instanceof WsException) msg = err.message;
      client.emit("error", msg);
      client.disconnect();
    }
  }
  // Leave queue leave game in case of disconnect
  async handleDisconnect(client: Socket) {
    if (client.user) {
      const userId = client.user.uid;
      this.clients.set(
        client.user.uid,
        this.clients
          .get(client.user.uid)
          ?.filter((value) => value !== client.id) ?? []
      );
      const tabs = (this.clients.get(userId) ?? []).filter(
        (socketId) => socketId != client.id
      );
      if (!tabs.length) {
        await this.prismaService.user
          .update({
            where: {
              uid: client.user.uid,
              status: {
                not: "inGame",
              },
            },
            data: {
              status: "offline",
            },
          })
          .catch(console.error);
        client.broadcast.emit("user-status", {
          userId: client.user.uid,
          status: "offline",
        });
      }
      this.clients.set(userId, tabs);

      const [deletePendingGames, startingGames] =
        await this.prismaService.$transaction([
          this.prismaService.game.deleteMany({
            where: {
              status: "WAITING",
              players: {
                some: { userId: client.user.uid },
              },
            },
          }),
          this.prismaService.game.findMany({
            where: {
              status: "STARTING",
              players: {
                some: { userId: client.user.uid },
              },
            },
            include: {
              players: {
                select: {
                  gameId: true,
                  userId: true,
                },
              },
            },
          }),
        ]);
      if (!client.inGame) return;

      startingGames.map(async ({ id, players }) => {
        const playerGame = players.filter(
          ({ userId }) => userId != client.user.uid
        )[0];

        await this.points(playerGame.userId, 20);

        client.to(id).emit("game-status", {
          timestamp: new Date(),
          status: "player-left",
        });
        if (this.games.get(id)) clearInterval(this.games.get(id).interval);
        this.games.delete(id);
        const { players: gamePlayers } = await this.prismaService.game.update({
          where: { id },
          data: {
            status: "ENDING",
          },
          include: {
            players: {
              where: {
                userId: {
                  not: {
                    equals: client.user.uid,
                  },
                },
              },
            },
          },
        });

        if (gamePlayers.length)
          await this.prismaService.user.update({
            where: {
              uid: gamePlayers[0].userId,
            },
            data: {
              status: "offline",
            },
          });

        const odlGame = this.games.get(id);
        if (odlGame) {
          clearInterval(this.games.get(id).interval);
          this.games.delete(id);
        }
        await this.prismaService.game.update({
          where: { id },
          data: {
            status: "ENDING",
          },
        });
        await this.prismaService.gameOnUsers.update({
          where: {
            gameId_userId: {
              ...playerGame,
            },
          },
          data: {
            score: 10,
            winner: true,
          },
        });
      });
    }
  }

  // Listening for 'join-game' WebSocket event
  @SubscribeMessage("join-game")
  async joinGame(client: Socket, payload: JoinGamePayload) {
    const { gameMaps } = payload;
    if (!client.user) return;
    if (this.queue.includes(client.user.uid)) {
      client.emit("game-status", { timestamp: new Date(), status: "in_queue" });
      return;
    }
    const playing = await this.prismaService.game.count({
      where: {
        players: { some: { userId: client.user.uid } },
        status: "STARTING",
      },
    });
    if (playing) {
      client.emit("game-status", { timestamp: new Date(), status: "started" });
      return;
    }
    this.queue.push(client.user.uid);
    // Check if the queue has one player
    if (this.queue.length == 1) {
      // If only one player is in the queue, create a new game and join the user to it
      const newGame = await this.prismaService.game.create({
        data: {
          players: {
            create: {
              score: 0,
              winner: false,
              userId: client.user.uid,
            },
          },
        },
      });
      client.join(newGame.id);
      client.emit("player-data", client.user);
    } else if (this.queue.length == 2) {
      const pendingGame = await this.prismaService.game.findFirst({
        where: {
          status: "WAITING",
          players: {
            some: {
              userId: this.queue[0],
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      if (pendingGame) {
        const { id: gameId } = await this.prismaService.game.update({
          where: { id: pendingGame.id },
          data: {
            players: {
              create: {
                score: 0,
                winner: false,
                userId: client.user.uid,
              },
            },
          },
        });
        client.inGame = true;
        client.join(pendingGame.id);
        this.eventEmitter.emit("game.play", gameId);
      }
      this.queue.pop();
      this.queue.pop();
    }
  }

  // Leave Queue
  @SubscribeMessage("leave-queue")
  async leaveQueue(client: Socket) {
    if (!client.user) return;
    if (this.queue.length == 1) {
      this.queue.pop();
      const game = await this.prismaService.game.deleteMany({
        where: {
          status: "WAITING",
          players: {
            some: { userId: client.user.uid },
          },
        },
      });
    }
  }

  @SubscribeMessage("leave-game")
  async leaveGame(client: Socket) {
    if (!client.user) return;
    const startingGames = await this.prismaService.game.findMany({
      where: {
        OR: [
          {
            status: "STARTING",
          },
          {
            status: "WAITING",
          },
        ],
        players: {
          some: { userId: client.user.uid },
        },
      },
      include: {
        players: {
          select: {
            gameId: true,
            userId: true,
          },
        },
      },
    });

    startingGames.map(async ({ id, players }) => {
      const playerGame = players.filter(
        ({ userId }) => userId != client.user.uid
      )[0];

      client.to(id).emit("game-status", {
        timestamp: new Date(),
        status: "player-left",
      });
      if (this.games.get(id)) clearInterval(this.games.get(id).interval);
      this.games.delete(id);
      await this.prismaService.game.update({
        where: { id },
        data: {
          status: "ENDING",
        },
      });
      if (playerGame)
        await this.prismaService.gameOnUsers.update({
          where: {
            gameId_userId: {
              ...playerGame,
            },
          },
          data: {
            score: 10,
            winner: true,
          },
        });
    });
  }

  @SubscribeMessage("invite")
  async invite(client: Socket, userId: string) {
    if (!client.user) return;
    let gameId: string;

    const oldGame = await this.prismaService.game.findFirst({
      where: {
        status: "INVITING",
        players: {
          some: {
            userId: client.user.uid,
          },
        },
      },
    });
    if (oldGame) gameId = oldGame.id;
    else {
      const newGame = await this.prismaService.game.create({
        data: {
          status: "INVITING",
          players: {
            create: {
              score: 0,
              winner: false,
              userId: client.user.uid,
            },
          },
        },
      });
      gameId = newGame.id;
    }
    const displayName = client.user.firstName + " " + client.user.lastName;
    const activeTabs = this.clients.get(userId) ?? [];
    client.join(gameId);
    console.log("user tabs:::::", activeTabs)

    if(activeTabs.length === 0)
      return ;
      this.server.to(activeTabs).emit("invite", {
        senderId: client.user.uid,
        receiver: userId,
        displayName: displayName,
        roomId: gameId,
      });
      return gameId;
  }

  @SubscribeMessage("accept-invite")
  async joinInvite(
    client: Socket,
    payload: { senderId: string; roomId?: string; accepted: boolean }
  ) {
    if (!client.user) return;
    if (!payload.roomId) return;
    const game = await this.prismaService.game.findFirst({
      where: { id: payload.roomId },
      include: { _count: true },
    });
    if (game && payload.accepted == true && game._count.players !== 2) {
      const updatedGame = await this.prismaService.game.update({
        where: { id: payload.roomId },
        data: {
          status: "INVITING",
          players: {
            create: {
              score: 0,
              winner: false,
              userId: client.user.uid,
            },
          },
        },
      });
      client.inGame = true;
      client.join(updatedGame.id);
      const senderTabs = this.clients.get(payload.senderId) ?? [];
      const recieverTabs = this.clients.get(client.user.uid) ?? [];
      this.server
        .to([...senderTabs, ...recieverTabs])
        .emit("accept-invite", { roomId: updatedGame.id });

      this.eventEmitter.emit("game.play", updatedGame.id);
    } else {
      console.log("Something went wrong");
    }
  }

  @SubscribeMessage("reject-invite")
  async rejectInvite(client: Socket, roomId: string) {
    if (!client.user) return;
    if (!roomId) return;
    try {
      if (roomId) {
        await this.prismaService.game.delete({
          where: { id: roomId },
        });
      }
    } catch (error) {}
  }

  @SubscribeMessage("move-paddle")
  async paddlePosition(
    client: Socket,
    { roomId, direction }: { direction: "right" | "left"; roomId: string }
  ) {

    if (!client.user) return ;
    const game = await this.prismaService.game.findUnique({
      where: {
        id: roomId,
      },
      include: {
        players: {
          orderBy: { createdAt: "asc" },
          select: {
            userId: true,
          },
        },
      },
    });
    if (!game || game.players.length != 2) return;

    const paddleLabel =
      game.players[0].userId === client.user.uid ? "paddle1" : "paddle2";
    const odlGame = this.games.get(roomId);
    if (!odlGame) return;

    const { gameModel } = odlGame;
    const paddle = gameModel.engine.world.bodies.find(
      (body) => body.label === paddleLabel
    );

    const paddleWidth = gameModel.map(120, 600, gameModel.width);

    const calcDeltaX: Record<
      "left" | "right",
      (gameModel: GameModel) => number
    > = {
      left: (gameModel: GameModel) =>
        Math.max(-20, -paddle.position.x + paddleWidth / 2),
      right: (gameModel: GameModel) =>
        Math.min(20, gameModel.width - (paddle.position.x + paddleWidth / 2)),
    };

    const deltaX = calcDeltaX[direction](gameModel);

    // Use Body.setPosition to update the position in the physics engine
    Body.setPosition(paddle, {
      x: paddle.position.x + deltaX,
      y: paddle.position.y,
    });

    const paddle1 = gameModel.engine.world.bodies.find(
      ({ label }) => label === "paddle1"
    );
    const paddle2 = gameModel.engine.world.bodies.find(
      ({ label }) => label === "paddle2"
    );
    this.server.to(roomId).emit("paddle-position", [
      { x: paddle1.position.x, y: paddle1.position.y },
      { x: paddle2.position.x, y: paddle2.position.y },
    ]);
  }
}