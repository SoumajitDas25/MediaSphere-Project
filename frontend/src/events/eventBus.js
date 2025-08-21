import mitt from 'mitt';

//Extend mitt with hasListeners()
const createEventBus = () => {

    const emitter = mitt();
    emitter.hasListeners = (eventName) => {
        return Boolean(emitter.all.has(eventName) && emitter.all.get(eventName).length > 0);
    };
    return emitter;
}

const eventBus = createEventBus();

export default eventBus;
