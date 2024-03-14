"use client";
import { useParams } from "next/navigation";
import SingleGameContainer from "../../../../containers/single-game/single-game-container";
import withAuth from "@/hoc/auth";

function GamePage() {
  const { id } = useParams();
  return <SingleGameContainer gameId={id as string} />;
}

export default withAuth(GamePage);
