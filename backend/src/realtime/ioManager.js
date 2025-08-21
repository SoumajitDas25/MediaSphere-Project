import { getIO } from "./ioInstance.js";
import initSyncDispatcher from "./syncDispatcher.js";
import initSocketListeners from "./SocketListener.js";

const initIOManager = () => {
    
    const io = getIO();

    io.on("connection", (socket) => {

        console.log("🟢 Socket connected:", socket.id);
    
        socket.on("disconnect", () => {
          console.log("🔴 Socket disconnected:", socket.id);
        });

        //join the socket to its user private room
        // socket.join()
    
        //listen socket public room join events from frontend & join the socket to the room
        initSocketListeners(socket);
        
    });

    //attach sync dispatcher - translates domain events to socket events & emits them to frontend
    initSyncDispatcher(io);
}

export default initIOManager;