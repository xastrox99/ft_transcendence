"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import AchevementCard from "../../../components/Card/AchevementCard";
import HistoryCard from "../../../components/Card/historyCard";
import withAuth from "../../../hoc/auth";
import { useParams } from "next/navigation";
import { useAppSelector } from "../../../store/store";
import { useSocket } from "@/contexts/socket-context";
import { useRouter } from "next/navigation";

import InviteGameModal from "@/components/game-home/InviteGameModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";

const data3 = {
  name: "zakaria",
  url: "https://cdn.intra.42.fr/users/47192a7a27a46c2c714c6723e30a3cd2/zmaziane.jpg",
};

const data2 = {
  name: "amounach",
  url: "https://cdn.intra.42.fr/users/e02b4524213b7315479b9ed9f3551093/amounach.jpg",
};
  


type dataType = {
  senderId: string;
  receiver: string;
  displayName: string;
  roomId: string;
};
function MyProfile() {
  const { id } = useParams();
  const query = useQuery({
    throwOnError: false,
    queryKey: ["get-match-history", id],
    queryFn: (meta) => api.api().users.getMatchHistory(),
  });

    
  const user = useAppSelector((s) => s.user.user);

  // invite to game logic
  const { gameSocket: socket } = useSocket();
  const [openModal, setOpenModal] = useState(false);
  const [data, setData] = useState<dataType>({
    senderId: "",
    receiver: '',
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
      receiver: string,
      displayName: string;
      roomId: string;
    }) => {
      if (data.senderId !== user?.uid) {
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
  }, [socket, router, user?.uid]);
  //////////////////////////////////

  return (
    <div className="  flex flex-col overflow-y-auto p-4 w-full h-full gap-y-5 ">
      <div
        className="w-full min-h-[300px] bg-[#ffffff1a] relative rounded-lg"
        style={{
          backgroundImage:
          "url(https://cdn.intra.42.fr/coalition/cover/76/Commodore_BG.jpg)",
          objectFit: "cover",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        />
        {openModal && <InviteGameModal setOpenModal={() => setOpenModal(false)} onButtonClick={handleButtonClick}/>}
      <div className="w-full flex lg:flex-row flex-col gap-x-4 gap-y-14 py-2  px-4 ">
        <div className="lg:min-w-[140px]   relative">
          <Image
            width={140}
            height={140}
            className="rounded-full absolute inset-0 object-cover  h-36 w-36 border-4 border-[#ffffff1a] -top-24 lg:left-0  md:left-[40%] left-[30%]"
            alt="zakaria"
            src={user?.profileImage as string}
          />
        </div>
        <div className="flex  md:flex-row flex-col w-full gap-4 justify-between pt-3">
          <span className="text-white text-xl font-medium whitespace-nowrap">
            <strong className="text-white">
              {(user?.lastName &&
                user?.firstName + " " + user?.lastName + ", " + user?.login)+  '  Points: ' + user?.points ||
                "" }
            </strong>
          </span>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 mt-4  gap-5  h-full">
        <div className=" overflow-y-auto overflow-x-hidden h-full flex  flex-col">
          <h2 className=" ml-2">History</h2>




          {query.data?.data.map((data: any, idx: any) => (
            <HistoryCard user1={data.players[0]} user2={data.players[1]} key={idx} />
          ))}
        </div>
        <div className="overflow-y-auto overflow-x-hidden">
          <h2>Achivements</h2>
          {user?.achivements.map((data, idx) => {
            let image:  string = '';
            if (data.grade ==='FirstLose') {
              image = 'https://media.istockphoto.com/id/1444599665/vector/luxury-gold-and-silver-award-trophy-on-black-background.jpg?s=612x612&w=0&k=20&c=TsZe9tJwM1cIGyzo0IeCgda7R5OJUFDw_PgyF8I56Ec='
            } else if (data.grade === 'FirstWin') {
              image = 'https://media.istockphoto.com/id/1425117356/photo/security-shield-check-mark-icon-on-dark-background-3d-render-concept.jpg?s=612x612&w=0&k=20&c=biUUjoayElOTxm4hGMpVSiIBWeupRd_tVwxMJAhDAbU='
              
            } else if (data.grade === 'Welcome') {
              image = 'https://media.istockphoto.com/id/1056445350/photo/neon-sign-on-brick-wall-background-welcome-3d-rendering.jpg?s=612x612&w=0&k=20&c=HgV9FknkCyM7rt94VgXPHjVF6J81tKqWjR2nvIHGrj8='
              
            }
            return <AchevementCard
            name={data.name}
            url={image}
            key={idx}
            />;
          })}
          </div>
        </div>       
      </div>
  );
}


export default withAuth(MyProfile);
