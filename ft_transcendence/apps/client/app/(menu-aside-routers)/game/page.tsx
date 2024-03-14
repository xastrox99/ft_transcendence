"use client";
import React, { use, useEffect, useState } from "react";
import HomeGameMain from "../../../layouts/game-home-main/game-home-main";
import withAuth from "../../../hoc/auth";
import { useSocket } from "@/contexts/socket-context";
import { useRouter } from "next/navigation";
import InviteGameModal from "@/components/game-home/InviteGameModal";
import { useAppSelector } from "@/store/store";

type dataType = {
  senderId: string;
  displayName: string;
  roomId: string;
};

function Page(): JSX.Element {
  const Myuid = useAppSelector((s) => s.user.user?.uid);
  // invite to game logic
  const { gameSocket: socket } = useSocket();
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<dataType>({
    senderId: "",
    displayName: "",
    roomId: "",
  });
  const router = useRouter();
  const handleButtonClick = (action: string) => {
    if (action === "accept") {
      // Handle accept action
      socket.emit("accept-invite", {
        senderId: data.senderId,
        roomId: data.roomId,
        accepted: true,
      });
    } else if (action === "decline") {
      socket.emit("reject-invite", data.roomId);
    }
  };
  useEffect(() => {
    const callback = async (data: {
      senderId: string;
      displayName: string;
      roomId: string;
    }) => {
      if (data.senderId !== Myuid) {
        setOpenModal(true);
        setData(data);
      }
    };
    const accepteInvite = async (payload: {
      roomId: string;
      players: object;
    }) => {
      
      setTimeout(() => {
        router.replace(`/game/${payload.roomId}`);
      }, 100);
    };
    socket.on("invite", callback);
    socket.on("accept-invite", accepteInvite);
    return () => {
      socket.off("invite", callback);
      socket.off("accept-invite", accepteInvite);
    };
  }, [socket, router, Myuid]);
  //////////////////////////////////
  return <div className="w-full h-full bg-black flex justify-center items-center max-h-screen overflow-y-auto md:max-h-full">
    {openModal && <InviteGameModal setOpenModal={() => setOpenModal(false)} onButtonClick={handleButtonClick}/>}
    <HomeGameMain />
  </div>;
}
export default withAuth(Page)
