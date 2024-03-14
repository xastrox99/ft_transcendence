"use client";
import React, { useEffect, useState } from "react";
import LeaderBoardCard from "../../../components/Card/LeaderBoardCard";
import { api } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/components/chat-main-channel/ConversationUiChannel";
import useReflection from "@/hooks/useReflection";
import withAuth from "@/hoc/auth";
import InviteGameModal from "@/components/game-home/InviteGameModal";
import { useSocket } from "@/contexts/socket-context";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";

type dataType = {
  senderId: string;
  displayName: string;
  roomId: string;
};

function LeaderBoardPage() {
  const query = useQuery({retry:0,
    throwOnError: false,
    queryFn: api.api().users.leaderBorad,
    queryKey: ["get-with-type", "Accepted"],
  });
  const { reflector } = useReflection();

  if (query.isLoading) {
    reflector({ type: "loading", isLoading: true, payload: null });
  } else {
    reflector({ type: "loading", isLoading: false, payload: null });
  }
  // invite to game logic
  const { gameSocket: socket } = useSocket();
  const [openModal, setOpenModal] = useState(false);
  const MyUid = useAppSelector(s => s.user.user?.uid)
  const [data, setData] = useState<dataType>({
    senderId: "null_hna",
    displayName: "null_hna",
    roomId: "null_hna",
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
      if (data.senderId !== MyUid) {
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
  }, [socket, router, MyUid]);
  //////////////////////////////////
  return (
    <div className=" overflow-hidden flex  h-full w-full rounded-lg m-5 bg-[#1B1B1B]">
      <div className=" overflow-y-auto max-h-[90%] flex flex-col items-center gap-4 p-2 m-2 rounded-lg h-full w-full  text-white justify-start ">
      {openModal && <InviteGameModal setOpenModal={() => setOpenModal(false)} onButtonClick={handleButtonClick}/>}
        <h2 className="h-11 w-44 mb-11 flex m-11 p-5 text-black rounded-lg justify-center items-center bg-[#B2F35F]">
          Leader Board
        </h2>
        {query.isSuccess &&
          (query.data?.data?.data as User[]).map((_, idx) => (
            <LeaderBoardCard
              name={_.login}
              url={_.profileImage}
              key={idx}
              uid={_.uid}
              points={idx}
            />
          ))}
      </div>
    </div>
  );
}

export default withAuth(LeaderBoardPage);
