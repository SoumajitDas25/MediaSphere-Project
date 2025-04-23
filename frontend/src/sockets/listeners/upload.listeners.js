import { getSocket } from "../socket.config";

const eventNamePrefix = 'upload';

const listenToUploadProgress = (callback) => {
  const socket = getSocket();
  if (socket) 
  {
    socket.on(`${eventNamePrefix}:progress`, ({ progress,fileIndex }) => {
      callback(progress,2,fileIndex);
    });
  }
};

const stopListeningUploadProgress = () => {
  const socket = getSocket();
  if (socket) 
  {
    socket.off(`${eventNamePrefix}:progress`);
  }
};

const listenToUploadComplete = (callback) => {
  const socket = getSocket();
  if (socket) 
  {
    socket.on(`${eventNamePrefix}:complete`, ({uploaderId,mediaType}) => {
      callback(uploaderId,mediaType);
    });
  }
};

const stopListeningUploadComplete = () => {
  const socket = getSocket();
  if (socket) 
  {
    socket.off(`${eventNamePrefix}:complete`);
  }
};

const listenToUploadError = (callback) => {
  const socket = getSocket();
  if (socket) 
  {
    socket.on(`${eventNamePrefix}:error`, () => {
      callback();
    });
  }
};

const stopListeningUploadError = () => {
  const socket = getSocket();
  if (socket) 
  {
    socket.off(`${eventNamePrefix}:error`);
  }
};

const stopListeningUploadEvents = () => {
  const socket = getSocket();
  if (socket) 
  {
    socket.off(`${eventNamePrefix}:progress`);
    socket.off(`${eventNamePrefix}:complete`);
    socket.off(`${eventNamePrefix}:error`);
  }
};

export default{
  listenToUploadProgress,
  stopListeningUploadProgress,
  listenToUploadComplete,
  stopListeningUploadComplete,
  listenToUploadError,
  stopListeningUploadError,
  stopListeningUploadEvents
};