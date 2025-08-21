import eventBus from "../utils/eventBus.js";
import { scopedEvents,privateUserEvents } from "./events/eventNames.js";

const initSyncDispatcher = (io) => {

    //listen domain/bus events via eventBus & emit socket events to frontend

    //scoped events
    for(const event of scopedEvents) 
    {
        for(const name of event.names)
        {
            if (!eventBus.hasListeners(`${event.namePrefix}:${name}`)) 
            {
                eventBus.on(`${event.namePrefix}:${name}`, ({id,data}) => {
                    io.to(`${event.namePrefix}:${String(id)}`).emit(`${event.namePrefix}:${name}`, data);
                });
            }
        }
    }

    //private user events
    for(const event of privateUserEvents)
    {
        if (!eventBus.hasListeners(`userPrivate:${event}`))
        {
            eventBus.on(`userPrivate:${event}`, ({id,data}) => {
                    io.to(`userPrivate:${String(id)}`).emit(`userPrivate:${event}`, data);
                    console.log(String(id),data);
            });
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