import socket from './socketInstance';
import eventBus from '../events/eventBus';
import { getEmitEventNames,getListenEventNames } from '../events/eventNames';

const initSocketManager = () => {

    socket.on("connect", () => {
        console.log("Socket connected: ", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    //listen socket events from backend and broadcast domain/bus events via eventBus
    const listenEventNames = getListenEventNames();
    for (const name of listenEventNames) 
    {
        if (!socket.hasListeners(name)) 
        {
            socket.on(name, (payload) => {
                eventBus.emit(name, payload);
            });
        }
    }

    //listen domain/bus events via eventBus & emit socket events to backend
    const emitEventNames = getEmitEventNames();
    for (const name of emitEventNames) 
    {
        if (!eventBus.hasListeners(name)) 
        {
            eventBus.on(name, (payload) => {
                socket.emit(name, payload);
            });
        }
    }

    socket.connect(); // connect once globally
}

const disconnectSocket = () => {
    if(socket && socket.connected)
    {
        socket.disconnect();
        socket=null;
    }
}

const getSocket = () => socket;

export {initSocketManager,disconnectSocket,getSocket};