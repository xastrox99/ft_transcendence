"use client";
import { useSocket } from "@/contexts/socket-context";
import { Scope_One } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import Image from "next/image";
import gameover from "assets-workspace/images/GameOver.gif";
import "react-toastify/dist/ReactToastify.css";
import { PopupGameOver } from "../layouts/single-game/single-game-main/popup-gameOver/popup-gameOver";
import { log } from "console";

// useEffect(() => {
//   const callback = async (payload: { gameId: string; players: object }) => {
//     router.replace(`/game/${payload.gameId}`);
//   };
//   socket.on("start-game", callback);
//   return () => {
//     socket.off("start-game", callback);
//   };
// });

const CustomToast = ({
  closeToast,
  data,
  socket,
  router,
}: {
  closeToast: () => void;
  data: { senderId: string; displayName: string; roomId: string };
  socket: any;
  router: any;
}) => {
  const handleButtonClick = (action: string) => {
    if (action === "accept") {
      // Handle accept action
      socket.emit("accept-invite", {
        senderId: data.senderId,
        roomId: data.roomId,
        accepted: true,
      });
      toast.success("Accepted!");
    } else if (action === "decline") {
      socket.emit("reject-invite", data.roomId);
      toast.error("Declined!");
    }
    closeToast();
  };
  return (
    <div className="flex flex-col items-center">
      <span className="mb-4">{`You're invited by ${data.displayName}`}</span>
      <div className="flex gap-4">
        <button
          onClick={() => handleButtonClick("accept")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Accept
        </button>
        <button
          onClick={() => handleButtonClick("decline")}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export function InviteContainer() {
  const { gameSocket: socket } = useSocket();
  const [openModal, setOpenModal] = useState(false);
  // const [data, setData] = useState<dataType>({
  //   senderId: 'null_hna',
  //   displayName: 'null_hna',
  //   roomId: 'null_hna',
  // });
  // const router = useRouter();
  // const handleButtonClick = (action: string) => {
  //   if (action === "accept") {
  //     // Handle accept action
  //     socket.emit("accept-invite", {
  //       senderId: data.senderId,
  //       roomId: data.roomId,
  //       accepted: true,
  //     });
  //     toast.success("Accepted!");
  //   } else if (action === "decline") {
  //     socket.emit("reject-invite", data.roomId);
  //     toast.error("Declined!");
  //   }

  //   // closeToast();
  // };
  // useEffect(() => {
  //   const callback = async (data: {
  //     senderId: string;
  //     displayName: string;
  //     roomId: string;
  //   }) => {
  //     console.log("received an invite ..... ", socket.id);
  //     setOpenModal(true);
  //     setData(data);
  //     // toast.info(
  //     //   ({ closeToast }) => (
  //     //     <CustomToast closeToast={closeToast!} data= {data} socket={socket} router={router} />
  //     //   ),
  //     //   {
  //     //     autoClose: 5000,
  //     //     hideProgressBar: false,
  //     //     closeOnClick: true,
  //     //     pauseOnHover: true,
  //     //     draggable: true,
  //     //   }
  //     // );
  //   };
  //   const accepteInvite = async (payload: {
  //     roomId: string;
  //     players: object;
  //   }) => {
  //     console.log("roomID front: ", payload.roomId);
  //     setTimeout(() => {
  //       router.replace(`/game/${payload.roomId}`);
  //     }, 100);
  //   };
  //   console.log("enterd use effect for an event : ");
  //   socket.on("invite", callback);
  //   socket.on("accept-invite", accepteInvite);
  //   return () => {
  //     socket.off("invite", callback);
  //     socket.off('accept-invite', accepteInvite);
  //   };
  // }, [socket, router]);
  

  return (
    <>
    
      {openModal && (
        <div className="absolute w-full h-full backdrop-blur-sm top-0 flex justify-center items-center z-10">
          <div className=" flex justify-center items-center w-full">
            <div className=" w-3/4 z-50 h-3/4 flex flex-col py-6 items-center backdrop-blur-2xl bg-white bg-opacity-25 rounded-lg text-white ">
              <Image alt="gameGif" height={200} src={gameover} width={400} />
              <div className="w-[80%] flex flex-col md:flex-row h-full items-center text-white text-sm md:justify-between gap-6">
                <button
                  onClick={() => {
                    setOpenModal(false);
                    // handleButtonClick("accept");
                  }}
                  >
                  Accept Invite
                </button>
                <button
                  onClick={() => {
                    setOpenModal(false);
                    // handleButtonClick("decline");
                  }}
                >
                  Decline Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
