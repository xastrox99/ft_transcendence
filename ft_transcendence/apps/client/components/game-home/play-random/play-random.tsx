import { useSocket } from "@/contexts/socket-context";
import Avatar from "assets-workspace/images/avatar.jpeg";
import spinner from "assets-workspace/images/spinner.gif";
import { atom, useSetAtom } from "jotai";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ModalUI from "../../../components/Modal";
import { useAppSelector } from "../../../store/store";
import Tableblack from "./maps/TableBlack.svg";
import Tablegreen from "./maps/TableGreen.svg";
import Tableyellow from "./maps/TableYellow.svg";

export const mapColor = atom("");

export default function PlayRandom(props: { setSelected: any; setTypeGame: any }): JSX.Element {
  // const setColor = useSetAtom(mapColor);
  const setColor = useSetAtom(mapColor);

  const user = useAppSelector((s) => s.user.user);
  const [openModal, setOpenModal] = useState(false);
  const [color1, setColor1] = useState(false);
  const [color2, setColor2] = useState(false);
  const [color3, setColor3] = useState(false);
  const [gameStatus, setGameStatus] = useState<
    "none" | "joining" | "in_queue" | "started"
  >("none");
  const { gameSocket: socket } = useSocket();
  function handlClickMap1() {
    setColor1(true);
    setColor2(false);
    setColor3(false);
    setColor("#ebbf58");
  }
  function handlClickMap2() {
    setColor1(false);
    setColor2(true);
    setColor3(false);
    setColor("#000000");
  }
  function handlClickMap3() {
    setColor1(false);
    setColor2(false);
    setColor3(true);
    setColor("#60C58D");
  }
  const handleJoinQueue = () => {
    socket.emit("join-game", { gameMaps: "default" });
    setGameStatus("joining");
  };
  const handleLeaveQueue = () => {
    socket.emit("leave-queue");
    props.setSelected(false);
    props.setTypeGame(null);
  };

  useEffect(() => {
    const callback = ({ status }: { status: "in_queue" | "started" }) => {
      if (status === "in_queue") toast.error("You're already in queue!!");
      if (status === "started") toast.error("You're already in game");
      setGameStatus(status);
    };
    socket.on("game-status", callback);

    return () => {
      socket.off("game-status", callback);
    };
  }, [socket]);
  useEffect(() => {
    setOpenModal(true);
  }, []);
  return (
    <div className="flex flex-col items-center">
      <div className="w-full px-0 lg:px-12 flex flex-col md:flex-row items-center justify-between ">
        <div className=" w-40 mb-4 mt-10 overflow-hidden">
          <div className="w-full h-40 flex rounded-lg border border-[#B2F35F] overflow-hidden flex-col">
            <Image
              className="w-full h-32 object-cover"
              alt="profile"
              src={user?.profileImage || ""}
              width={300}
              height={300}
            />
            <div className="bg-[#1c1e21] w-full h-8 flex  flex-col items-center">
              <span className="text-[#e4e6eb] capitalize">
                {user?.login || ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center w-20 h-20 rounded-full border border-[#B2F35F]">
          <Image
            className="w-20 h-20 object-cover rounded-full"
            alt="profile"
            src={spinner}
          />
        </div>

        <div className="w-40 mb-4 mt-10 overflow-hidden">
          <div className="w-full h-40 flex rounded-lg border border-[#B2F35F] overflow-hidden flex-col">
            <Image
              className="w-full h-32 object-cover"
              alt="profile"
              src={Avatar}
            />
            <div className="bg-[#1c1e21] w-full h-8 flex flex-col items-center">
              <span className="text-[#e4e6eb] capitalize">?</span>
            </div>
          </div>
        </div>
      </div>
      <button
        disabled={gameStatus !== "none"}
        className={`w-full mb-10 bg-[#B2F35F] hover:opacity-90 cursor-pointer text-black py-3 px-6 rounded-lg mt-8  font-bold `}
        onClick={() => {
          handleJoinQueue();
        }}
      >
        {["in_queue", "started"].includes(gameStatus) && "You can't join !"}
        {gameStatus === "none" && "Join Queue"}
        {gameStatus === "joining" && "Joinging..."}
      </button>
      <button
        className={`w-full mb-10 bg-purple-700 hover:bg-purple-800 cursor-pointer text-white py-3 px-6 rounded-lg mt-8 font-bold`}
        onClick={() => {
          handleLeaveQueue();
          
        }}
      >
        Leave Queue
      </button>
      <ModalUI open={openModal} onClose={() => {}} title={""}>
        <div className="sm:w-[550px] sm:h-72 lg:w-[850px] lg:h-96 flex justify-evenly flex-col">
          <div className="flex justify-around items-center">
            <Image
            tabIndex={0}
              className={`sm:w-[100px] sm:h-[200px] lg:w-[160px] lg:h-[250px] ${
                color2 || color3 ? "opacity-20" : ""
              }`}
              src={Tableyellow}
              width={50}
              height={80}
              alt="yellow table"
              draggable={false}
              onClick={handlClickMap1}
            />
            <Image
            tabIndex={1}
              className={`sm:w-[100px] sm:h-[200px] lg:w-[160px] lg:h-[250px] ${
                color1 || color3 ? "opacity-20" : ""
              }`}
              src={Tableblack}
              width={50}
              height={80}
              alt="black table"
              draggable={false}
              onClick={handlClickMap2}
            />
            <Image
            tabIndex={2}
              className={`sm:w-[100px] sm:h-[200px] lg:w-[160px] lg:h-[250px] ${
                color1 || color2 ? "opacity-20" : ""
              }`}
              src={Tablegreen}
              width={50}
              height={80}
              alt="green table"
              draggable={false}
              onClick={handlClickMap3}
            />
          </div>
          <div className="w-full flex justify-center">
            <button
            
              disabled={color1 || color2 || color3 ? false : true}
              className={`bg-[#B2F35F] ${
                color1 || color2 || color3 ? "bg-[#B2F35F]" : "bg-[#e5e7eb]"
              } hover:opacity-90 cursor-pointer text-black py-3 px-6 rounded-lg mt-8  font-bold `}
              onClick={() => setOpenModal(false)}
            >
              Select
            </button>
          </div>
        </div>
      </ModalUI>
      {/* <div className="w-full text-center">
                <p className="text-[#e4e6eb]">
                    Queue: 2/20 waiting in the Queue
                </p>
                
            </div> */}
    </div>
  );
}
