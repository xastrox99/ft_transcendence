"use client";
import { useSocket } from "@/contexts/socket-context";
import { useAppSelector } from "@/store/store";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function Wrapper() {
  const relection = useAppSelector((s) => s.reflection.LoadingPage);
  const { chatSocket } = useSocket();
  useEffect(() => {
    chatSocket.on("error", (msg: string) => {
      toast.error(msg);
    });
    return () => {
      chatSocket.off("error");
    };
  }, [chatSocket]);
  return (
    <>
      <div>
        {relection.isLoading ? (
          <div className="absolute inset-0 w-screen h-screen bg-black flex justify-center items-center text-2xl text-white z-50">
            Loading...
          </div>
        ) : null}
      </div>
    </>
  );
}
