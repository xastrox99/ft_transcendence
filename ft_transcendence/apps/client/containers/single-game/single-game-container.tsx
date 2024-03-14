import React, { useEffect, useState } from "react";
import Profile from "assets-workspace/images/mouarsas.jpeg";
import SingleGameHeader from "../../layouts/single-game/single-game-header/single-game-header";

import PingPongGame from "../../layouts/game-home-main/PingPongGame";
import { useSocket } from "@/contexts/socket-context";
import { api } from "@/api";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";

interface PropsTye {
  gameId: string;
}

type User = {
  uid: string;
  lastName: string;
  firstName: string;
  login: string;
  profileImage: string;
};
// TODO: robin pls move this to types and use it in all component that need this type
type Player = {
  score: number;
  winner: boolean;
  user: User;
};
export default function SingleGameContainer({ gameId }: PropsTye): JSX.Element {
  const { gameSocket } = useSocket();
  const gameMutation = useQuery({retry:0,
    queryFn: async () => {
      return (
        await axios.get<{
          status: string;
          players: Player[];
        }>(`http://localhost:8080/api/v1/games/${gameId}`, {
          withCredentials: true,
        })
      ).data;
    },

    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryKey: ["games", gameId],
  });

  useEffect(() => {
    return () => {
      gameSocket.emit("leave-game");
    };
  }, [gameSocket]);

  if (gameMutation.error) return redirect("/game");
  if (gameMutation.isPending) return <div>Pending</div>;

  return (
    <div className="bg-[#1B1B1B] relative flex justify-center items-center  h-full flex-col">
      <div className="w-full lg:w-[700px] h-full flex flex-col justify-center items-center gap-4">
        <SingleGameHeader
          player1={gameMutation.data.players[0]}
          player2={gameMutation.data.players[1]}
        />
        <div className="w-[90%] h-[60%] p-8">
          <PingPongGame roomId={gameId} />
        </div>
      </div>
    </div>
  );
}
