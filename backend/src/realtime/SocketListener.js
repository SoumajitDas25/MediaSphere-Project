import { publicEvents } from "./events/eventNames.js";

const initSocketListeners = (socket) =>{

    //public event listeners
    for(const event of publicEvents)
    {
        socket.on(`${event.domain}:joinRoom`,(id)=>{
            const roomName = `${event.domain}:${id}`;
            if(!socket.rooms.has(roomName)) //if socket has not joined room
            {
                socket.join(roomName); //join event room
                console.log(`joined ${event.domain} room`,roomName); //for debugging
            }
        })

        socket.on(`${event.domain}:leaveRoom`,(id)=>{
            const roomName = `${event.domain}:${id}`;
            if(socket.rooms.has(roomName)) //if socket has joined room
            {
                socket.leave(roomName); //leave event room
                console.log(`left ${event.domain} room`,roomName); //for debugging
            }
        })
    }
}

export default initSocketListeners;