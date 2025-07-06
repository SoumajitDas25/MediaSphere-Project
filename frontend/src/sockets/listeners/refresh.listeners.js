import { getSocket } from "../socket.config";

const eventNamePrefix = 'refresh';

const listenToRefreshContentList = (callback)=>{
    const socket = getSocket();
    if(socket) 
    {
        socket.on(`${eventNamePrefix}:contentList`, () =>{
          callback();
        });
    }
}

const stopListeningRefreshContentList = () => {
    const socket = getSocket();
    if (socket) 
    {
      socket.off(`${eventNamePrefix}:contentList`);
    }
};

const listenToRefreshSubscriberCount = (callback)=>{
    const socket = getSocket();
    if(socket) 
    {
        socket.on(`${eventNamePrefix}:subscriberCount`, (updatedSubscriberCount) =>{
          callback(updatedSubscriberCount);
        });
    }
}

const stopListeningRefreshSubscriberCount = () => {
    const socket = getSocket();
    if (socket) 
    {
      socket.off(`${eventNamePrefix}:subscriberCount`);
    }
};

const listenToRefreshSubscriptionCount = (callback)=>{
    const socket = getSocket();
    if(socket) 
    {
        socket.on(`${eventNamePrefix}:subscriptionCount`, (updatedSubscriptionCount) =>{
          callback(updatedSubscriptionCount);
        });
    }
}

const stopListeningRefreshSubscriptionCount = () => {
    const socket = getSocket();
    if (socket) 
    {
      socket.off(`${eventNamePrefix}:subscriptionCount`);
    }
};

export default {
    listenToRefreshContentList,
    stopListeningRefreshContentList,
    listenToRefreshSubscriberCount,
    stopListeningRefreshSubscriberCount,
    listenToRefreshSubscriptionCount,
    stopListeningRefreshSubscriptionCount
}