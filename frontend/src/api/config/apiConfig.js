import axios from "axios";
import { getSocket } from "../../sockets/socketManager";
import conf from "../../conf/conf"

axios.defaults.baseURL = conf.backendApiUrl;
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