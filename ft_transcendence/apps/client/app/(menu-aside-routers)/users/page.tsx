"use client";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import BannedCArd from "../../../components/Card/BannedCArd";
import FriendCard from "../../../components/Card/FriendCard";
import InviteCard from "../../../components/Card/FriendCard";
import InvitationsCard from "../../../components/Card/InvitationsCard";
import withAuth from "../../../hoc/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../api";
import useReflection from "@/hooks/useReflection";
import InviteGameModal from "@/components/game-home/InviteGameModal";
import { useSocket } from "@/contexts/socket-context";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";

type ComponeetType = "search" | "friends" | "invitations" | "blocked";
type paramsdata = "Accepted" | "Pending" | "Banned";
///// mounach
type dataType = {
  senderId: string;
  displayName: string;
  roomId: string;
};
////////
export interface dataUsersTypee {
  uid: string;
  login: string;
  profileImage: string;
  refetch: Function;
}

function Users(): JSX.Element {
  const [data, setData] = useState<dataUsersTypee[]>([]);
  const [componenet, setComponent] = useState<ComponeetType>("search");
  const [searchString, setSearchString] = useState("");

  const queryParam =
    componenet == "friends"
      ? "Accepted"
      : componenet === "invitations"
        ? "Pending"
        : componenet === "blocked"
          ? "Banned"
          : undefined;


  const {refetch, ...usersQuery} = useQuery({
    retry:0,
    throwOnError: false,
    queryFn: (d) => {
      return api.api().users.findTheAll(d.queryKey[1] as paramsdata);
    },
    queryKey: ["get-with-type", queryParam],
    enabled: false,
    staleTime: 0,
  });

  const {reflector} = useReflection()

  if (usersQuery.isLoading) {
    reflector({type: 'loading', isLoading: true, payload: null})
  } else {
    reflector({type: 'loading', isLoading: false, payload: null})
  }

  useEffect(() => {
    if (usersQuery.isSuccess && usersQuery.data && usersQuery.data.data) {
      setData(
        componenet === "blocked"
          ? usersQuery.data.data.data?.map((user: any) => user.user2)
          : usersQuery.data.data.data
      );
    }
  }, [usersQuery.data, usersQuery.isSuccess, componenet]);

  const {mutate, ...searchMutation} = useMutation({retry:0,
    throwOnError: false,
    mutationKey: ["search-mutation"],
    mutationFn: api.api().users.search,
    onSuccess: (d) => {
      setData(d.data.data);
    },
  });

  if (searchMutation.isPending) {
    reflector({type: 'loading', isLoading: true, payload: null})
  } else {
    reflector({type: 'loading', isLoading: false, payload: null})
  }
  // invite to game logic
  const { gameSocket: socket } = useSocket();
  const MyUid = useAppSelector(s => s.user.user?.uid)
  const [openModal, setOpenModal] = useState(false);
  const [gamedata, setGameData] = useState<dataType>({
    senderId: "",
    displayName: "",
    roomId: "",
  });
  const router = useRouter();
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
    socket.on("invite", callback);
    socket.on("accept-invite", accepteInvite);
    return () => {
      socket.off("invite", callback);
      socket.off("accept-invite", accepteInvite);
    };
  }, [socket, router, MyUid]);
  //////////////////////////////////
  useEffect(() => {
    if (componenet === "search") mutate(searchString);
    else refetch();
  }, [componenet, searchString, mutate, refetch]);

  const render = () => {
    if (componenet === "blocked") {
      return (
        <div className="grid lg:grid-cols-5 2xl:grid-cols-7  sm:grid-cols-3 grid-cols-2 gap-5  w-full">
          {searchMutation.isSuccess &&
            data?.map((user, idx) => (
              <BannedCArd
                {...user}
                key={idx}
                refetch={refetch} // TODO: fix banned logic
              />
            ))}
        </div>
      );
    }

    if (componenet === "invitations") {
      return (
        <div className="grid lg:grid-cols-5 2xl:grid-cols-7  sm:grid-cols-3 grid-cols-2 gap-5  w-full">
          {searchMutation.isSuccess &&
            data?.map((inveted, idx) => (
              <InvitationsCard
                {...inveted}
                key={idx}
                refetch={refetch}
              />
            ))}
        </div>
      );
    }
    if (componenet === "friends") {
      return (
        <div className="grid lg:grid-cols-5 2xl:grid-cols-7  sm:grid-cols-3 grid-cols-2 gap-5  w-full">
          {data?.map((_, idx) => (
            <FriendCard {..._} key={idx} refetch={refetch} />
          ))}
        </div>
      );
    }
    if (componenet === "search") {
      return (
        <div className="grid lg:grid-cols-5 2xl:grid-cols-8  sm:grid-cols-3 grid-cols-2 gap-5  w-full">
          {searchMutation.isSuccess &&
            data?.map((user, idx) => (
              <Card
                {...user}
                key={idx}
                refetch={mutate.bind(null, searchString)}
              />
            ))}
        </div>
      );
    }
  };
  return (
    <div className="flex flex-col overflow-y-auto  whitespace-nowrap  p-4 h-full w-full gap-5">
      {openModal && <InviteGameModal setOpenModal={() => setOpenModal(false)} onButtonClick={handleButtonClick}/>}
      {componenet === "search" && (
        <div className="flex md:flex-row flex-col w-full items-center justify-center gap-5 mt-10">
          <input
            className="h-10 p-1 px-3 rounded-md w-full "
            type="text"
            placeholder=" Search"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
          />
          <Button
            onClick={() => mutate(searchString)}
            title="Search"
            className="w-full"
          />
        </div>
      )}
      <div>
        <select
          value={componenet}
          onChange={(e) => {
            setComponent(e.target.value as ComponeetType);
          }}
          className="block w-full p-2  text-sm rounded-lg bg-[#ffffff1a] border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
        >
          {["search", "friends", "invitations", "blocked"].map((el) => (
            <option key={el} value={el}>
              {el}
            </option>
          ))}
        </select>
      </div>
      {render()}
    </div>
  );
}

export default withAuth(Users);
