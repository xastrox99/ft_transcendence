import { useSocket } from "@/contexts/socket-context";
import Image from "next/image";
import React, { useEffect } from "react";
import { user } from "./interface/user";
import { useRouter } from "next/navigation";

const FriendItem: React.FC<user> = ({
  uid,
  firstName,
  login,
  profileImage,
}) => {
  const { gameSocket: socket} = useSocket();
  const router = useRouter();

  const handleInviteGame = () => {
    socket.emit("invite", uid);
  };
  useEffect(() => {
    const callback = async (payload: { roomId: string; players: object }) => {
      setTimeout(()=> {
        router.replace(`/game/${payload.roomId}`);
      }, 100)
    };
    socket.on("accept-invite", callback);
    return () => {
      socket.off("accept-invite", callback);
    };
  }, [socket, router]); // to delete 

  return (
    <li className="w-full py-1 rounded-full bg-slate-100">
      <div className="pl-2 pr-4 flex flex-row justify-between items-center gap-4">
        <div className="flex justify-start items-center gap-4 max-w-[calc(100%-4rem)]">
          <div className="flex-shrink-0">
            <Image
              alt="profile"
              // TODO: fix image
              width={480}
              height={480}
              className="relative w-10 h-10 overflow-hidden border border-black bg-gray-100 rounded-full dark:bg-gray-600"
              src={profileImage}
            />
          </div>
          <div className="flex-1 min-w-0 max-w-[calc(100%-3.5rem)]">
            {" "}
            {/* Added max-w-[calc(100%-4rem)] */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-900 truncate">
              {firstName}
            </p>
            <p className="text-sm text-gray-500 truncate">{login}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => {
              handleInviteGame();
            }}
            type="submit"
            className=" md:inline-flex items-center py-2 pl-2 pr-4 text-sm font-medium text-white bg-black rounded-full hover:bg-[#00000097] focus:ring-4 focus:outline-none focus:ring-blue-300"
          >
            <span className="inline-flex px-2">+</span>
            <p className="hidden md:block" >Invite</p>
            {/* TODO: integration */}
          </button>
        </div>
      </div>
    </li>
  );
};

export default FriendItem;
