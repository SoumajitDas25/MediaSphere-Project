import { getSocket } from "../socket.config";

const eventNamePrefix = 'user';

const emitJoinUserPage = (viewedUserId)=>{
    const socket = getSocket();
    if(socket && socket.connected)
    {
        socket.emit(`${eventNamePrefix}:joinUserPage`,viewedUserId);
    }
}

const emitLeaveUserPage = (viewedUserId)=>{
    const socket = getSocket();
    if(socket && socket.connected)
    {
        socket.emit(`${eventNamePrefix}:leaveUserPage`,viewedUserId);
    }
}

export default {
    emitJoinUserPage,
    emitLeaveUserPage
};