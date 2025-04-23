import { getSocket } from "../sockets/socket.config";
import Api from "./config/API";

const routePrefix = 'socket';
const ApiInstance = new Api(routePrefix);
const {api} = ApiInstance;

const registerSocket = async () =>{
    try
    {
        const socket = getSocket();
        if(socket && socket.id)
        {
            const socketId = socket.id;
            const response =  await api(
                `/register`,
                {
                    socketId
                },
                'POST'
            );
            return response;
        }
    }
    catch(error)
    {
        throw error;
    }
}

const removeSocket = async () =>{
    try
    {
        const socket = getSocket();
        if(socket && socket.id)
        {
            const socketId = socket.id;
            const response =  await api(
                `/remove`,
                {
                    socketId
                },
                'POST'
            );
            return response;
        }
    }
    catch(error)
    {
        throw error;
    }
}

export default {
    registerSocket,
    removeSocket
};