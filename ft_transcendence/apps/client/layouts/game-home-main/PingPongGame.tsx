import React, { useEffect, useRef, useState, Fragment } from "react";
import GameModel from "./gameModel";
import { ToastContainer, toast } from "react-toastify";
import { useSocket } from "@/contexts/socket-context";
import { mapColor } from "@/components/game-home/play-random/play-random";
import { useAtomValue } from "jotai";

let game: GameModel;

function App({ roomId }: { roomId: string }) {
  const getChosenColor = useAtomValue(mapColor);
  const gameBoard = useRef<HTMLDivElement>(null);
  const { gameSocket: socket } = useSocket();

  const [gameId, setGameId] = useState("");

  useEffect(() => {
    game = new GameModel(gameBoard.current!, getChosenColor);
  }, []);

  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        socket.emit("move-paddle", { direction: "left", roomId: roomId });
      }
      if (e.key === "ArrowRight") {
        socket.emit("move-paddle", { direction: "right", roomId: roomId });
      }
    };

    window.addEventListener("keydown", callback, {passive: false});
    () => window.removeEventListener("keydown", callback);
  }, [roomId]);

  useEffect(() => {
    socket.on("ball-position", (data: any) => {
      game.moveBall(data);
    });

    // TODO: add type for game
    socket.on("start-game", (game: any) => {
      toast.success("game started");
      setGameId(roomId);
    });

    socket.on("paddle-position", (data: { y: number; x: number }[]) => {
      game.movePaddle(data[0], 1);
      game.movePaddle(data[1], 2);
    });
    return () => {
      game.destory();
      socket.off("ball-position");
      socket.off("paddle-position");
      socket.off("invite");
      socket.off("game-status");
      socket.off("score");
      socket.off("start-game");
    };
  }, [socket]);

  return (
    <Fragment>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex w-full h-full  justify-center" ref={gameBoard}></div>
    </Fragment>
  );
}

export default App;
