import { Server } from "socket.io";

let ioInstance;

const initIO = (httpServer) =>{

    const io = new Server(httpServer, {
        cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        }
    });

    ioInstance = io;
    return io;
}

const getIO = () => {
    if(!ioInstance)
        throw new Error("Socket.IO not initialized");
    return ioInstance;
};

export { initIO,getIO };