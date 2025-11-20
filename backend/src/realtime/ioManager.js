import { getIO } from "./ioInstance.js";
import initSyncDispatcher from "./syncDispatcher.js";
import initSocketListeners from "./SocketListener.js";

const initIOManager = () => {
    
    const io = getIO();

    io.on("connection", (socket) => {

        console.log("🟢 Socket connected:", socket.id);
    
        socket.on("disconnect", () => {
          //disconnection(either by mannaul logout or due to frontend crash) will auto-remove the socket from all its joined rooms.
          console.log("🔴 Socket disconnected:", socket.id);
        });

        //join the socket to its user private room
        socket.join(`private:${String(socket.userId)}`);
        console.log(`Socket ${socket.id} joined private:${String(socket.userId)}`);
    
        //listen socket public room join events from frontend & join the socket to the room
        initSocketListeners(socket);
        
    });

    //attach sync dispatcher - translates domain events to socket events & emits them to frontend
    initSyncDispatcher(io);
}

export default initIOManager;