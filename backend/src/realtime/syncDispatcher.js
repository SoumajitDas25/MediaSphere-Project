import eventBus from "../utils/eventBus.js";
import { publicEvents,privateEvents } from "./events/eventNames.js";

const initSyncDispatcher = (io) => {

    //listen domain/bus events via eventBus & emit socket events to frontend

    //public events
    for(const event of publicEvents) 
    {
        for(const name of event.names)
        {
            if (!eventBus.hasListeners(`${event.domain}:${name}`)) 
            {
                eventBus.on(`${event.domain}:${name}`, ({id,data}) => {
                    io.to(`${event.domain}:${String(id)}`).emit(`${event.domain}:${name}`, data);
                });
            }
        }
    }

    //private events
    for(const event of privateEvents)
    {
        for(const name of event.names)
        {

            if (!eventBus.hasListeners(`private:${event.domain}:${name}`))
            {
                eventBus.on(`private:${event.domain}:${name}`, ({userId,id,data}) => {
                        io.to(`private:${String(userId)}`).emit(`private:${event.domain}:${name}`, {id,data});
                        // console.log(`private:${event.domain}:${name} event emitted to private:${String(userId)}`);
                });
            }
        }
    }

}

export default initSyncDispatcher;

//backend -> frontend
//backend 
//controllers --emits domain events-> syncDispatcher --emits socket events-> 
//frontend 
//--listens socket events-> socketManger --emits domain events-> components

//frontend -> backend
//frontend
//components --emits domain join events-> socketManager --emits socket join events->
//backend 
//--listens socket join events-> socketListener --joins socket to room