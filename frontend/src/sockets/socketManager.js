// import socket from './socketInstance';
import { io } from 'socket.io-client';
import conf from '../conf/conf';
import eventBus from '../events/eventBus';
import { getEmitEventNames,getPublicListenEventNames,getPrivateListenEventNames } from '../events/eventNames';
import { setIsSocketConnected } from '../slices/authSlice';
import { store } from '../store/store';

let socket=null;

const initSocketManager = (authToken=null) => {

    if(socket)
        return; //prevent reinitialization

    socket = io(
    conf.socketUrl, 
    {
        withCredentials: true,
        autoConnect: false, // connect manually
        auth: { token: authToken }, //for authentication
    }
    );

    socket.on("connect", () => {
        console.log("Socket connected: ", socket.id);
        store.dispatch(setIsSocketConnected(true)); //update the redux state
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
        store.dispatch(setIsSocketConnected(false)); //update the redux state
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Socket connection failed:", err.message);
        store.dispatch(setIsSocketConnected(false)); //update the redux state
        // if (err.message === "Unauthorized") {
        //     // e.g., redirect to login or retry after refreshing token
        // }
    });

    //listen socket events from backend and broadcast domain/bus events via eventBus
    const publicEventNames = getPublicListenEventNames();
    const privateEventNames = getPrivateListenEventNames();
    const listenEventNames = [...publicEventNames,...privateEventNames];
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
                if(socket && socket.connected)
                {
                    socket.emit(name, payload);
                }
            });
        }
    }

    socket.connect(); // connect once globally
}

const disconnectSocket = () => {

     if (socket) 
    {
        // ✅ Remove all socket listeners to avoid memory leaks or duplicate handlers
        socket.removeAllListeners();
        // ✅ Disconnect only if connected
        if (socket.connected) 
        {
            socket.disconnect();
        }
        // ✅ Nullify socket instance
        socket = null;
    }
}

const getSocket = () => socket;

const isSocketConnected = () => {
    return socket && socket.connected;
}

export {initSocketManager,disconnectSocket,getSocket,isSocketConnected};