import { Server } from "socket.io";
import {userListeners} from './listeners/index.js';

let ioInstance;

const setupSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });

    userListeners(socket);

  });

  ioInstance = io;
  return io;
};

const getSocketIO = () => ioInstance;

export {setupSocket,getSocketIO};