import { getSocket } from "../socket.config";

const eventNamePrefix = 'refresh';

const listenToRefreshContentList = (callback)=>{
    const socket = getSocket();
    if(socket) 
    {
        socket.on(`${eventNamePrefix}:contentList`, ({uploaderId}) =>{
          callback(uploaderId);
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

export default {
    listenToRefreshContentList,
    stopListeningRefreshContentList
}