import { scopedEvents } from "./events/eventNames.js";

const initSocketListeners = (socket) =>{

    //scoped event listeners
    for(const event of scopedEvents)
    {
        socket.on(`${event.namePrefix}:joinRoom`,(id)=>{
            const roomName = `${event.namePrefix}:${id}`;
            if(!socket.rooms.has(roomName)) //if socket has not joined room
            {
                socket.join(roomName); //join event room
                console.log(`joined ${event.namePrefix} room`,roomName); //for debugging
            }
        })

        socket.on(`${event.namePrefix}:leaveRoom`,(id)=>{
            const roomName = `${event.namePrefix}:${id}`;
            if(socket.rooms.has(roomName)) //if socket has joined room
            {
                socket.leave(roomName); //leave event room
                console.log(`left ${event.namePrefix} room`,roomName); //for debugging
            }
        })
    }
}

export default initSocketListeners;