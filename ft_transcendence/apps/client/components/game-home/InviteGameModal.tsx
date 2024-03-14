import React from "react";
import Image from "next/image";
import gameover from "assets-workspace/images/GameOver.gif";
import PongInvite from 'assets-workspace/images/pong_invite.png';
export default function InviteGameModal({
  setOpenModal,
  onButtonClick,
}: {
  setOpenModal: () => void;
  onButtonClick: (str: string) => void;
}) {
  return (
    <>
      <div className="absolute w-full h-full backdrop-blur-sm top-0 left-0 flex justify-center items-center z-10">
        <div className=" flex justify-center items-center w-full">
          <div className=" w-3/4 z-50 h-3/4 flex flex-col py-6 items-center backdrop-blur-2xl bg-white bg-opacity-25 rounded-lg text-white ">
            <Image alt="gameGif" height={200} src={PongInvite} width={400} />
            <div className="w-[80%] flex flex-col md:flex-row h-full items-center text-white text-sm md:justify-between gap-6">
              <button className="w-32 h-8 rounded-[10px] bg-[#B2F35F] text-black"
                onClick={() => {
                  setOpenModal();
                  onButtonClick("accept");
                }}
              >
                Accept Invite
              </button>
              <button
              className="w-32 h-8 rounded-[10px] bg-[#e5e7eb] text-black"
                onClick={() => {
                  setOpenModal();
                  onButtonClick("decline");
                }}
              >
                Decline Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
