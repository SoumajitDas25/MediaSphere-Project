import {EventEmitter} from "events";

const createEventBus = () =>{

    const emitter = new EventEmitter();
    emitter.hasListeners = (eventName) =>{
        return Boolean(emitter.listeners(eventName).length>0);
    }
    emitter.broadcast = (eventName,socketId,payload) =>{
        emitter.emit(eventName,{...payload,socketId,broadcast:true});
    }
    return emitter;
}

const eventBus = createEventBus();

export default eventBus;