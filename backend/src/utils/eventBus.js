import {EventEmitter} from "events";

const createEventBus = () =>{

    const emitter = new EventEmitter();
    emitter.hasListeners = (eventName) =>{
        return Boolean(emitter.listeners(eventName).length>0);
    }
    return emitter;
}

const eventBus = createEventBus();

export default eventBus;