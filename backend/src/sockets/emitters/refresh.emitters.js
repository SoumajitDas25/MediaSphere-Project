import {getSocketIO} from "../socket.config.js";

const eventNamePrefix = 'refresh';

const emitRefreshContentList = (socketId)=>{
    let io = getSocketIO();
    io.to(socketId).emit(`${eventNamePrefix}:contentList`);
}

const emitRefreshSubscriberCount = (channelOwnerId,updatedSubscriberCount) => {

    let io = getSocketIO();
    //emit to all users who is currently on the channel owner page
    io.to(`userPage:${channelOwnerId}`).emit(`${eventNamePrefix}:subscriberCount`,updatedSubscriberCount);
}

const emitRefreshSubscriptionCount = (channelViewerId,updatedSubscriptionCount) => {

    let io = getSocketIO();
    //emit to all users who is currently on the channel viewer page
    io.to(`userPage:${channelViewerId}`).emit(`${eventNamePrefix}:subscriptionCount`,updatedSubscriptionCount);
}

export default {
    emitRefreshContentList,
    emitRefreshSubscriberCount,
    emitRefreshSubscriptionCount
}