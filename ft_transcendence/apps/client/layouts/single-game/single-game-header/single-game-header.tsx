import type { StaticImageData } from "next/image";
import SingleGamePlayerCard from "../../../components/single-game/single-game-player-card/single-game-player-card";
import SingleGameResult from "../../../components/single-game/single-game-result/single-game-result";
import { useSocket } from "@/contexts/socket-context";
import { useEffect, useState } from "react";
import { PopupWinner } from "../single-game-main/popup-winner/popup-winner";
import { PopupGameOver } from "../single-game-main/popup-gameOver/popup-gameOver";
import { useAppSelector } from "@/store/store";
import { useRouter } from "next/navigation";

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
interface PropsType {
  player1: Player;
  player2: Player;
}

export default function SingleGameHeader({
  player1,
  player2,
}: PropsType): JSX.Element {
  const [scores, setScores] = useState([0, 0]);
  const [winner, setWinner] = useState<boolean | null>(null);
  const { gameSocket: socket } = useSocket();
  const currentUser = useAppSelector((s) => s.user.user);
  const router = useRouter();

  useEffect(() => {
    const scoreCallback = ({ players }: { players: Player[] }) => {
      setScores(players.map((player) => player.score));
    };
    const statusCallback = ({
      status,
      players,
    }: {
      status: string;
      players: Player[];
    }) => {
      if (status === "player-left") setWinner(true);
      else if (
        players
          .filter((player) => player.winner)
          .find(({ user }) => user.uid === currentUser?.uid)
      )
        setWinner(true);
      else setWinner(false);
      setTimeout(() => {
        router.push("/game");
      }, 2000)
      
    };
    socket.on("score", scoreCallback);
    socket.on("game-status", statusCallback);
    return () => {
      socket.off("score", scoreCallback);
      socket.off("game-status", statusCallback);
    };
  });
  return (
    <div className="bg-[#1B1B1B] w-full  px-3 py-3 flex justify-between  items-center border border-[#B2F35F] rounded-lg">
      <SingleGamePlayerCard
        direction="ltr"
        fullName={player1.user.firstName + " " + player1.user.lastName}
        image={player1.user.profileImage}
        username={player1.user.login}
      />
      <SingleGameResult p1={scores[0]} p2={scores[1]} />

      <SingleGamePlayerCard
        direction="rtl"
        fullName={player2.user.firstName + " " + player1.user.lastName}
        image={player2.user.profileImage}
        username={player2.user.login}
      />

      {winner && <PopupWinner />}
      {winner === false && <PopupGameOver />}
    </div>
  );
}
