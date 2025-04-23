import { io } from "socket.io-client";

let socket;
const backendUrl='http://localhost:3000';

const initializeSocketConnection = () => {
  if (!socket || !socket.connected) 
  {
    socket = io(
        backendUrl, 
        {
        withCredentials: true,
        }
    );

    socket.on("connect", () => {
      console.log("Socket connected: ", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  return socket;
};

const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
    socket=null;
  }
};

const getSocket = () => socket;

export {initializeSocketConnection,disconnectSocket,getSocket};