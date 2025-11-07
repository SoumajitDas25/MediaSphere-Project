import mitt from 'mitt';

//Extend mitt with hasListeners()
const createEventBus = () => {

    const emitter = mitt();
    
    emitter.hasListeners = (eventName, handler) => {
        const listeners = emitter.all.get(eventName);
        if (!listeners) 
            return false;

        // If specific handler is passed, check if it's in the listeners list
        if (handler) 
        {
            return listeners.includes(handler);
        }

        // Otherwise, just check if the event has any listeners at all
        return listeners.length > 0;
    };
    
    return emitter;
}

const eventBus = createEventBus();

export default eventBus;
