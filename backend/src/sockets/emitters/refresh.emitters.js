import {getSocketIO} from "../socket.config.js";

const eventNamePrefix = 'user';

const refreshContentList = (userId)=>{
    // let io = getSocketIO();
    // //emit to all users who is currently on userPage(has joined userPage room)
    // io.to(`userPage:${userId}`).emit(`${eventNamePrefix}:contentList`,{
    //     viewedUserId: userId
    // });
}

export default {
    refreshContentList
}