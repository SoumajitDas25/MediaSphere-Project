import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
// import { getSocketIO, setupSocket } from "./sockets/socket.config.js";
import {createServer} from 'http';
import { initIO } from "./realtime/ioInstance.js";
import initIOManager from "./realtime/ioManager.js";
import { initUserSocketMap } from "./socketStore.js";

dotenv.config({
    path:"./.env"
});

connectDB()
.then(()=>{
    console.log("DATABASE connected !");

    //create http server with the express app
    const server = createServer(app);
    //initialize socket-io with this server
    // setupSocket(server);
    initIO(server);
    //intialize socket-io manager
    initIOManager();

    initUserSocketMap(); //intialize userSocketMap

    app.on('error',(error)=>{
        console.log("ERROR: ",error);
        throw error;
    })

    server.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is listening at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("DATABASE connection failed: ",err);
});