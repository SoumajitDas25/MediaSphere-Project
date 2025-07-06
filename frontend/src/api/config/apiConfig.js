import axios from "axios";
import { getSocket } from "../../sockets/socket.config";

axios.defaults.baseURL = 'http://localhost:3000/api/v1';
axios.defaults.withCredentials = true; //allow all credentials
axios.interceptors.request.use((config)=>{
    //set socketId(if available) as request header
    const socket=getSocket();
    if(socket && socket.connected)
    config.headers['x-socket-id']=socket.id;
    return config
},(error)=>{
    return Promise.reject(error);
})
export default axios; //returns the configured axios