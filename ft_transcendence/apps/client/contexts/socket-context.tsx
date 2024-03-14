"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import io, {
  Socket,
  type ManagerOptions,
  type SocketOptions,
} from "socket.io-client";
import { useAppSelector } from "../store/store";

type SocketContextProps = {
  gameSocket: Socket;
  chatSocket: Socket;
};
const SocketContext = createContext<Partial<SocketContextProps>>({
  gameSocket: undefined,
  chatSocket: undefined,
});

const useSocket = () => {
  const context = useContext(SocketContext);

  if (context) return context as unknown as SocketContextProps;

  throw new Error(`useSocket must be used within a SocketContextProvider`);
};

type SocketProviderProps = { children: React.ReactNode };
const SocketProvider = ({ children }: SocketProviderProps) => {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const { gameSocket, chatSocket } = useMemo(() => {
    const uri = "ws://localhost:8080/";
    const opts = {
      transports: ["websocket"],
      autoConnect: false,
      withCredentials: true,
    } satisfies Partial<ManagerOptions & SocketOptions>;

    const gameSocket = io(uri, opts);
    const chatSocket = io(uri + "chat", opts);
    return {
      gameSocket,
      chatSocket,
    } satisfies SocketContextProps;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      gameSocket.connect();

      chatSocket.connect();
    }
    return () => {
      if (gameSocket.connected) gameSocket.disconnect();
      if (chatSocket.connected) chatSocket.disconnect();
    };
  }, [isAuthenticated, gameSocket, chatSocket]);

  return (
    <SocketContext.Provider value={{ gameSocket, chatSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
export { SocketProvider, useSocket };
