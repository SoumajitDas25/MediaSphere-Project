import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middlewares/socketAuthMiddleware.js";

let ioInstance;

const initIO = (httpServer) =>{

    const io = new Server(httpServer, {
        cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        }
    });

    io.use(socketAuthMiddleware); //socket authentication middleware

    ioInstance = io;
    return io;
}

const getIO = () => {
    if(!ioInstance)
        throw new Error("Socket.IO not initialized");
    return ioInstance;
};

export { initIO,getIO };