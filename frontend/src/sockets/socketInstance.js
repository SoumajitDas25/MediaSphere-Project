import { io } from 'socket.io-client';
import conf from '../conf/conf';

const socket = io(
    conf.socketUrl, 
    {
        withCredentials: true,
        autoConnect: false, // connect manually
    }
);
export default socket;