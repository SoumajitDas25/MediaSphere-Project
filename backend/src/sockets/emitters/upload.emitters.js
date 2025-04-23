import {getSocketIO} from "../socket.config.js";

const eventNamePrefix = 'upload';

const emitUploadProgress=(socketId,progress,fileIndex,mediaType='video')=>{
    const io=getSocketIO();
    io.to(socketId).emit(`${eventNamePrefix}:progress`, {
        progress,
        fileIndex,
        mediaType: mediaType
    });
}

const emitUploadComplete=(uploaderId,mediaType='video')=>{
    const io = getSocketIO();
    //emit to all users who is currently on the uploader user Page(has joined uploaderUserPage room)
    io.to(`userPage:${uploaderId}`).emit(`${eventNamePrefix}:complete`,{
        uploaderId,
        mediaType 
    });
}

const emitUploadError=(socketId)=>{
    const io = getSocketIO();
    io.to(socketId).emit(`${eventNamePrefix}:error`);
}

export default {emitUploadProgress,emitUploadComplete,emitUploadError};