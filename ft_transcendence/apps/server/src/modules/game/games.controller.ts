import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "db";
import { Response } from "express";
import { attempt } from "joi";
import { PrismaService } from "src/global/prisma/prisma.service";
import { GetUser } from "src/shared/decorators/get-user.decorator";

interface user {
  name: string;
  score: number;
  url: string;
}
interface Game {
  user1: user;
  user2: user;
}

@Controller("games")
@UseGuards(AuthGuard())
export class GameController {
  constructor(private prismaService: PrismaService) {}

  @Get("history/me")
  async getMatchHistory(@Res() res: Response, @GetUser() { uid }: User) {
    const games = await this.prismaService.game.findMany({
      where: {
        AND: [
          {
            status: "ENDING",
          },
          {
            players: {
              some: {
                userId: uid,
              },
            },
          },
        ],
      },
      include: {
        players: {
          select: {
            score: true,
            winner: true,
            user: {
              select: {
                login: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(
      games.map((game) => ({
        ...game,
        players: game.players.map(({ user, ...rest }) => ({
          ...rest,
          ...user,
        })),
      }))
    );
  }
  
  @Get("history/:userId")
  async getMatchHistoryForPlayer(@Res() res: Response, @Param('userId') userId: string) {
    const games = await this.prismaService.game.findMany({
      where: {
        AND: [
          {
            status: "ENDING",
          },
          {
            players: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        players: {
          select: {
            score: true,
            winner: true,
            user: {
              select: {
                login: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json(
      games.map((game) => ({
        ...game,
        players: game.players.map(({ user, ...rest }) => ({
          ...rest,
          ...user,
        })),
      }))
    );
  }
  
  @Get(":id")
  async getOne(@Param("id") gameId: string) {
    const game = await this.prismaService.game.findFirst({
      where: {
        AND: [
          {
            id: gameId,
          },
          {
            AND: [
              {
                status: { not: "ENDING" },
              },
              {
                status: { not: "STARTING" },
              },
            ],
          },
        ],
      },
      include: {
        players: {
          select: {
            score: true,
            winner: true,
            user: {
              select: {
                uid: true,
                lastName: true,
                firstName: true,
                login: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    if (!game) {

      throw new NotFoundException();
    }

    return game;
  }
}
