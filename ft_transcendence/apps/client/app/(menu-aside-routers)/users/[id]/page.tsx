"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "../../../../components/Button";
import AchevementCard from "../../../../components/Card/AchevementCard";
import HistoryCard from "../../../../components/Card/historyCard";
import withAuth from "../../../../hoc/auth";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../../api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useReflection from "../../../../hooks/useReflection";
import { useSocket } from "@/contexts/socket-context";
import InviteGameModal from "@/components/game-home/InviteGameModal";
///// mounach
type dataType = {
  senderId: string;
  displayName: string;
  roomId: string;
};
////////
import { useAppSelector } from "@/store/store";

const data = {
  name: "zakaria",
  url: "https://cdn.intra.42.fr/users/47192a7a27a46c2c714c6723e30a3cd2/zmaziane.jpg",
  score: 4
};
// let image = 'https://media.istockphoto.com/id/1444599665/vector/luxury-gold-and-silver-award-trophy-on-black-background.jpg?s=612x612&w=0&k=20&c=TsZe9tJwM1cIGyzo0IeCgda7R5OJUFDw_PgyF8I56Ec='
const data2 = {
  name: "amounach",
  url: "https://cdn.intra.42.fr/users/e02b4524213b7315479b9ed9f3551093/amounach.jpg",
};

function UserProfile() {
  const MyUid = useAppSelector((s) => s.user.user?.uid);
  const { id } = useParams();
  const router = useRouter();
  const ref = useReflection();
  const [status, setStatus] = useState("");

  const queryy = useQuery({
    throwOnError: false,
    queryKey: ["get-user-friend", id],
    queryFn: (meta) => api.api().users.getUserMatchHistrory(id as string),
  });

  const banMutation = useMutation({
    retry: 0,
    throwOnError: false,
    mutationKey: ["ban-friend"],
    mutationFn: api.api().users.ban,
    onMutate: () => {
      ref.reflector({ type: "loading", isLoading: true, payload: null });
    },
    onSuccess: () => {
      ref.reflector({ type: "loading", isLoading: false, payload: null });
      router.push("/users");
    },
    onError: (error) => {
      ref.reflector({ type: "loading", isLoading: false, payload: null });

      toast.error("Sorry you don't have the permitions !");
    },
  });

  const query = useQuery({
    retry: 0,
    throwOnError: false,
    queryKey: ["get-friend", id],
    queryFn: (meta) => api.api().users.getFriend(meta.queryKey[1] as string),
  });

  if (query.isError) {
    toast.error("Sorry you don't have the permitions !");
    router.push("/users");
  }

  if (query.isLoading) {
    ref.reflector({ type: "loading", isLoading: true, payload: null });
  } else {
    ref.reflector({ type: "loading", isLoading: false, payload: null });
  }
  // invite to game logic
  const { gameSocket: socket } = useSocket();
  const [openModal, setOpenModal] = useState(false);
  const [gamedata, setGameData] = useState<dataType>({
    senderId: "",
    displayName: "",
    roomId: "",
  });
  // const router = useRouter();
  const handleButtonClick = (action: string) => {
    if (action === "accept") {
      // Handle accept action
      socket.emit("accept-invite", {
        senderId: gamedata.senderId,
        roomId: gamedata.roomId,
        accepted: true,
      });
    } else if (action === "decline") {
      socket.emit("reject-invite", gamedata.roomId);
    }
  };
  useEffect(() => {
    const callback = async (gamedata: {
      senderId: string;
      displayName: string;
      roomId: string;
    }) => {
      if (gamedata.senderId !== MyUid) {
        setOpenModal(true);
        setGameData(gamedata);
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

    socket.on(
      "user-status",
      ({ status, userId }: { userId: string; status: string }) => {
        setStatus(status);
      }
    );

    socket.on("invite", callback);
    socket.on("accept-invite", accepteInvite);
    return () => {
      socket.off("invite", callback);
      socket.off("accept-invite", accepteInvite);
    };
  }, [socket, router, MyUid]);
  //////////////////////////////////
  const displayName = `${query.data?.data.lastName}   ${query.data?.data.firstName}(${query.data?.data.login}), Level: ${query.data?.data.points} ${query.data?.data.status}`;
  return (
    <div className="  overflow-y-auto flex flex-col p-4 w-full h-full gap-y-5">
      {openModal && (
        <InviteGameModal
          setOpenModal={() => setOpenModal(false)}
          onButtonClick={handleButtonClick}
        />
      )}
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
      <div className="w-full flex lg:flex-row flex-col gap-x-4 gap-y-14 py-2  px-4 ">
        <div className="lg:min-w-[140px]   relative">
          <Image
            width={140}
            height={140}
            className="rounded-full absolute inset-0 object-cover  h-36 w-36 border-4 border-[#ffffff1a] -top-24 lg:left-0  md:left-[40%] left-[30%]"
            alt="zakaria"
            src={
              query.data?.data.profileImage ||
              "https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg"
            }
          />

          <span className="absolute right-0 flex h-3 w-3">
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${query.data?.data.status === "online" ? "bg-green-400" : query.data?.data.status === "offline" ? "bg-red-500" : "bg-orange-500"}`}
            ></span>
          </span>
        </div>

        <div className="flex  md:flex-row flex-col w-full gap-4 justify-between pt-3">
          <span className="text-white text-xl font-medium whitespace-nowrap">
            <strong className="text-white">{displayName}</strong>
          </span>

          {/* <div className="flex gap-2 md:flex-row flex-col">

              <Button
              onClick={() => banMutation.mutate(id as string)}
              title="Block"
              />
          </div> */}
          <>
            {query.data?.data.uid !== MyUid && (
              <div className="flex gap-2 md:flex-row flex-col">
                <Button
                  onClick={() => banMutation.mutate(id as string)}
                  title="Block"
                />
              </div>
            )}
          </>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 mt-4  gap-5 h-full ">
        <div className="overflow-y-auto overflow-x-hidden max-h-full  w-full flex  gap-4 flex-col">
          <h2 className="ml-2">History</h2>

          {queryy.data?.data.map((history: any, idx: any) => (
            <HistoryCard user1={history.players[0]} user2={history.players[1]} key={idx} />
          ))}
        </div>
        <div className="overflow-y-auto overflow-x-hidden max-h-full gap-3 flex flex-col">
          <h2>Achievements</h2>
          {query.data?.data?.achivements.map((data: any, idx: any) => {
            let image: string = "";
            if (data.grade === "FirstLose") {
              image =
                "https://media.istockphoto.com/id/1444599665/vector/luxury-gold-and-silver-award-trophy-on-black-background.jpg?s=612x612&w=0&k=20&c=TsZe9tJwM1cIGyzo0IeCgda7R5OJUFDw_PgyF8I56Ec=";
            } else if (data.grade === "FirstWin") {
              image =
                "https://media.istockphoto.com/id/1425117356/photo/security-shield-check-mark-icon-on-dark-background-3d-render-concept.jpg?s=612x612&w=0&k=20&c=biUUjoayElOTxm4hGMpVSiIBWeupRd_tVwxMJAhDAbU=";
            } else if (data.grade === "Welcome") {
              image =
                "https://media.istockphoto.com/id/1056445350/photo/neon-sign-on-brick-wall-background-welcome-3d-rendering.jpg?s=612x612&w=0&k=20&c=HgV9FknkCyM7rt94VgXPHjVF6J81tKqWjR2nvIHGrj8=";
            }
            return <AchevementCard name={data.name} url={image} key={idx} />;
          })}
        </div>
      </div>
    </div>
  );
}

export default withAuth(UserProfile);
