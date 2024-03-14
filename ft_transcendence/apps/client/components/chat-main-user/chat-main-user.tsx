"use client";
import { useSocket } from "@/contexts/socket-context";
import useReflection from "@/hooks/useReflection";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { IoMdMore } from "react-icons/io";
import { toast } from "react-toastify";
import { api } from "../../api";
import { useAppSelector } from "../../store/store";
import MenuItem from "../Menu-chat";

interface PropsType {
  fullName: string;
  uid: string;
  image: string | StaticImageData;
  close: () => void;
}

interface MESSAGE {
  content: string;
  conversationUid: string;
  createdAt: string;
  senderUid: string;
  uid: string;
  updatedAt: string;
}
export default function ConversationUi({ uid, close }: PropsType): JSX.Element {
  const userUid = useAppSelector((s) => s.user.user?.uid);
  const [status, setStatus] = useState("offline");
  const query = useQuery({retry:0,
    throwOnError: false,
    queryKey: ["get-single-cnv-" + uid, uid],
    retryDelay: 0,
    queryFn: ({ queryKey }) =>
      api.api().chat.getConversation(queryKey[1], "Single"),
  });
  const queryClient = useQueryClient();
  const { reflector } = useReflection();
  const { chatSocket } = useSocket();


  const [msg, setMsg] = useState("");
  const msgRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MESSAGE[]>([]);

  const { gameSocket: socket } = useSocket();

  useEffect(() => {
    socket.on(
      "user-status",
      ({ status, userId }: { userId: string; status: string }) => {
        // ! TODO: check this !
        // if (userId === userUid)
        setStatus(status);
      }
    );
  }, [socket, userUid]);

  useEffect(() => {
    if (query.isLoading) {
      reflector({ type: "loading", isLoading: true, payload: null });
    } else {
      reflector({ type: "loading", isLoading: false, payload: null });
    }
  }, [query.isLoading, reflector]);

  const handleInviteGame = () => {
    socket.emit("invite", query.data?.data.data.participants[0].uid);
  };

  useEffect(() => {
    if (query.isError) {
      toast.error("Sorry you don't have the permitions !");
      close();
      return;
    }
    if (query.isSuccess) {
      setMessages(query.data?.data.data.messages);
    }
  }, [
    query.isSuccess,
    query.data,
    query.isError,
    close,
    query.isLoading,
    query.isFetching,
    query.isPending,
  ]);

  const onSetMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (msg.length && msg.trim()) {
      chatSocket.emit("sendMessageInRoom", {
        message: msg,
        conversation: uid,
      });
      setMsg("");
    }
  };

  useEffect(() => {
    
    chatSocket.emit("joinRoom", {
      conversation: uid,
    });
    if (msgRef?.current) {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            const { target }: MutationRecord = mutation; // Type annotation to specify MutationRecord
            const divTarget = target as HTMLDivElement; // Explicit cast
            divTarget?.scroll({ top: divTarget.scrollHeight, behavior: 'smooth' });
          }
        }
      });
      chatSocket.on("newmessageingroup", (data: any) => {
        console.log('dslndsklndslfndlsknjgds')
        setMessages((old) => [...old, data.data]);
      });
    
      observer.observe(msgRef.current, { childList: true });
    
      // Make sure to disconnect the observer when it's no longer needed
      // observer.disconnect();
    }
    return () => {
      // msgRef?.current?.removeEventListener("DOMNodeInserted", () => {});
      chatSocket.off("newmessageingroup");
      chatSocket.emit("leaveRoom", {
        conversation: uid,
      });
    };
  }, [chatSocket, uid]);

  const banMutation = useMutation({retry:0,
    throwOnError: false,
    mutationKey: ["ban-friend"],
    mutationFn: api.api().users.ban,
    onSuccess: () => {
      close();
      toast.done("done");
      reflector({ type: "loading", isLoading: false, payload: null });
      queryClient.invalidateQueries({ queryKey: ["get-single-cnv-" + uid] });
    },
    onError: () => {
      reflector({ type: "loading", isLoading: false, payload: null });
      toast.error("Sorry you don't have the permitions !");
      close();
    },
  });

  useEffect(() => {
    if (banMutation.isPending) {
      reflector({ type: "loading", isLoading: true, payload: null });
    }
  }, [banMutation.isPending, reflector]);

  return (
    <div className="w-2/3 flex justify-center p-2 h-full">
      <div className="w-full flex flex-col ">
        <div className="w-full flex bg-black p-1 text-[#F5F5F5] justify-between items-center">
          <Link
            className="flex gap-5 items-center h-14"
            href={"/users/" + query.data?.data.data.participants[0].uid}
          >
            <div className="w-11 h-11 relative">
              <Image
                alt="user"
                className="rounded-full max-w-[44px] max-h-[44px]"
                height={44}
                src={
                  query.data?.data.data.participants[0].profileImage ||
                  "https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg"
                }
                width={44}
              />
              {query.data?.data.data.participants[0].status === "online" || query.data?.data.data.participants[0].status === "inGame" ? (
                <div className="absolute -right-1 bottom-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              ) : (
                <div className="absolute -right-1 bottom-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between">
              <h5 className="font-semibold">
                {query.data?.data.data.participants[0].firstName +
                  " " +
                  query.data?.data.data.participants[0].lastName}
              </h5>
              <span
                className={`text-xs font-normal ${
                  query.data?.data.data.participants[0].status === "online" || query.data?.data.data.participants[0].status === "inGame"
                    ? " text-green-400"
                    : "text-red-500"
                } `}
              >
                {query.data?.data.data.participants[0].status}
              </span>
            </div>
          </Link>
          <MenuItem iconBtn={<IoMdMore size={24} color="gray" />}>
            <button
              className="hover:bg-[#B2F35F] rounded-md px-2"
              onClick={() =>
                banMutation.mutate(query.data?.data?.data?.participants[0].uid)
              }
            >
              Block
            </button>
            <button
              className="hover:bg-[#B2F35F] rounded-md px-2"
              onClick={handleInviteGame}
            >
              Invite Game
            </button>
          </MenuItem>
        </div>

        <div
          className="flex flex-col h-[90%]"
          style={{
            backgroundImage:
              "url(https://cdn2.f-cdn.com/contestentries/2046262/58571795/61f00c583e000_thumb900.jpg)",
          }}
        >
          <div
            className="h-full w-full flex  overflow-y-auto flex-col  bg-green p-4 gap-4 scrollbar-hide"
            ref={msgRef}
          >
            {messages?.map(({ content, senderUid }, index) => (
              <div
                className={`w-max max-w-[50%] p-2 flex  rounded-xl break-all ${
                  senderUid === userUid
                    ? "bg-[#b9ef72] self-end"
                    : "bg-slate-300"
                }`}
                key={index}
              >
                <span>{content}</span>
              </div>
            ))}
          </div>
          <form
            className="h-16 w-full  px-6 py-2 relative"
            onSubmit={onSetMessage}
          >
            <input
              maxLength={90}
              className="w-full h-12 bg-[#2a2a2a] text-[#F5F5F5] rounded-xl pl-3 pr-10"
              placeholder="Message..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />

            <button className="" type="submit">
              <svg
                className="absolute top-5 right-8"
                fill="none"
                height="24"
                viewBox="0 0 25 24"
                width="25"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.315 12.197L5.78299 13.453C5.69639 13.4675 5.61513 13.5045 5.54737 13.5603C5.47961 13.6161 5.42775 13.6888 5.39699 13.771L2.79999 20.728C2.55199 21.368 3.22099 21.978 3.83499 21.671L21.835 12.671C21.9597 12.6088 22.0645 12.513 22.1378 12.3945C22.2111 12.276 22.2499 12.1394 22.2499 12C22.2499 11.8607 22.2111 11.7241 22.1378 11.6055C22.0645 11.487 21.9597 11.3913 21.835 11.329L3.83499 2.32901C3.22099 2.02201 2.55199 2.63301 2.79999 3.27201L5.39799 10.229C5.4286 10.3114 5.48041 10.3843 5.54818 10.4403C5.61594 10.4963 5.69728 10.5335 5.78399 10.548L13.316 11.803C13.3623 11.8111 13.4043 11.8353 13.4346 11.8714C13.4649 11.9074 13.4815 11.9529 13.4815 12C13.4815 12.0471 13.4649 12.0926 13.4346 12.1287C13.4043 12.1647 13.3623 12.1889 13.316 12.197H13.315Z"
                  fill="#B2F35F"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
