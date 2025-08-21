import { scopedEvents } from "./events/eventNames.js";

const initSocketListeners = (socket) =>{

    //scoped event listeners
    for(const event of scopedEvents)
    {
        socket.on(`${event.namePrefix}:joinRoom`,(id)=>{
            socket.join(`${event.namePrefix}:${id}`); //join event room
            console.log(`joined ${event.namePrefix} room`,`${event.namePrefix}:${id}`); //for debugging
        })

        socket.on(`${event.namePrefix}:leaveRoom`,(id)=>{
            socket.leave(`${event.namePrefix}:${id}`); //leave event room
            console.log(`left ${event.namePrefix} room`,`${event.namePrefix}:${id}`); //for debugging
        })
    }
}

export default initSocketListeners;