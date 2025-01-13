/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
const SocketContext = createContext();
function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket)
    throw new Error("useSocket must be used within a SocketProvider");
  return socket;
}
export { SocketProvider, useSocket };
