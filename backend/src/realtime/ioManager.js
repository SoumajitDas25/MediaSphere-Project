import { getIO } from "./ioInstance.js";
import eventBus from "../utils/eventBus.js";

const initIOManager = () => {
    
    const io = getIO();

    io.on("connection", (socket) => {

        console.log("🟢 Socket connected:", socket.id);
    
        socket.on("disconnect", () => {
          //disconnection(either by mannaul logout or due to frontend crash) will auto-remove the socket from all its joined rooms.
          console.log("🔴 Socket disconnected:", socket.id);
        });

        //join the socket to its user private room
        if(socket.userId)
        {
          socket.join(`private:${String(socket.userId)}`);
          console.log(`Socket ${socket.id} joined private:${String(socket.userId)}`);
        }
    
        //listen socket room join/leave events from frontend & join/leave the socket to the room
        socket.on('joinRoom',({domain='',id})=>{
            if(domain && id)
            {
              const roomName = `${domain.toLowerCase()}:${String(id)}`;
              if(!socket.rooms.has(roomName)) //if socket has not joined room
              {
                  socket.join(roomName); //join event room
                  console.log(`joined ${domain.toLowerCase()} room`,roomName); //for debugging
              }
            }
        })
        socket.on('leaveRoom',({domain='',id})=>{
            if(domain && id)
            {
              const roomName = `${domain.toLowerCase()}:${String(id)}`;
              if(socket.rooms.has(roomName)) //if socket has joined room
              {
                  socket.leave(roomName); //leave event room
                  console.log(`left ${domain.toLowerCase()} room`,roomName); //for debugging
              }
            }
        })
        
    });

    //listen domain/bus public/private events via eventBus & emit socket events to frontend
    if (!eventBus.hasListeners('public:sync')) 
    {
      eventBus.on('public:sync', ({id,domain='',action='',field=null,value=null,source=null,broadcast=false,socketId=null}) => {
        if(id && domain && action)
        {
          if(broadcast && socketId) //broadcast to all sockets in the room except the specified socket
            io.to(`${domain.toLowerCase()}:${String(id)}`).except(socketId).emit(
              'public:sync', 
              {
                id,
                domain:domain.toLowerCase(),
                action:action.toLowerCase(),
                field:field?field.toLowerCase():null,
                value,
                source:source?source.toLowerCase():null
              }
            );
          else //emit to all sockets in the room
            io.to(`${domain.toLowerCase()}:${String(id)}`).emit(
              'public:sync', 
              {
                id,
                domain:domain.toLowerCase(),
                action:action.toLowerCase(),
                field:field?field.toLowerCase():null,
                value,
                source:source?source.toLowerCase():null
              }
            );
        }
      });
    }
    if (!eventBus.hasListeners('private:sync')) 
    {
      eventBus.on('private:sync', ({userId,id,domain='',action='',field=null,value=null,source=null,broadcast=true,socketId=null}) => {
        if(userId && id && domain && action)
        {
          if(broadcast && socketId) //broadcast to all sockets in the room except the specified socket
            io.to(`private:${String(userId)}`).except(socketId).emit(
              'private:sync', 
              {
                id,
                domain:domain.toLowerCase(),
                action:action.toLowerCase(),
                field:field?field.toLowerCase():null,
                value,
                source:source?source.toLowerCase():null
              }
            );
          else //emit to all sockets in the room
            io.to(`private:${String(userId)}`).emit(
              'private:sync', 
              {
                id,
                domain:domain.toLowerCase(),
                action:action.toLowerCase(),
                field:field?field.toLowerCase():null,
                value,
                source:source?source.toLowerCase():null
              }
            );
        }
      });
    }
}

export default initIOManager;

//backend -> frontend
//backend 
//controllers --emits bus events-> ioManager --emits socket events-> 
//frontend 
//--listens socket events-> socketManger --emits bus events-> components

//frontend -> backend
//frontend
//components --emits bus (room join/leave) events-> socketManager --emits socket (room join/leave) events->
//backend 
//--listens socket (room join/leave) events-> ioManager --joins/leaves socket to room