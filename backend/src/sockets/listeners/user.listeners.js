const eventNamePrefix = 'user';

const listenToJoinUserPage = (socket)=>{
    socket.on(
        `${eventNamePrefix}:joinUserPage`,
        userId=>{
            socket.join(`userPage:${userId}`);
        }
    );
}

const listenToLeaveUserPage = (socket)=>{
    socket.on(
        `${eventNamePrefix}:leaveUserPage`,
        userId=>{
            socket.leave(`userPage:${userId}`);
        }
    );
}

export default (socket)=>{
    listenToJoinUserPage(socket);
    listenToLeaveUserPage(socket);
}