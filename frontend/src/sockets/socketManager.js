import { io } from 'socket.io-client';
import conf from '../conf/conf';
import eventBus from '../events/eventBus';
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
    if (!socket.hasListeners("public:sync")) 
    {
        socket.on("public:sync", (payload) => {
            eventBus.emit("public:sync", payload);
        });
    }
    if (!socket.hasListeners("private:sync")) 
    {
        socket.on("private:sync", (payload) => {
            eventBus.emit("private:sync", payload);
        });
    }

    //listen domain/bus events via eventBus & emit socket events to backend
    if (!eventBus.hasListeners("joinRoom")) 
    {
        eventBus.on("joinRoom", ({domain='',id}) => {
            if(socket && socket.connected)
            {
                if(domain && id)
                socket.emit("joinRoom", {domain:domain.toLowerCase(),id});
            }
        });
    }
    if (!eventBus.hasListeners("leaveRoom")) 
    {
        eventBus.on("leaveRoom", ({domain,id}) => {
            if(socket && socket.connected)
            {
                if(domain && id)
                socket.emit("leaveRoom", {domain:domain.toLowerCase(),id});
            }
        });
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