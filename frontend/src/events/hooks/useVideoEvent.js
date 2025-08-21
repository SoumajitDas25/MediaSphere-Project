import { useEffect } from 'react';
import eventBus from '../eventBus';

const useVideoEvents = ({ 
  data={
    videoId:null,
  },
  listeners={
    updateViewCount:null,
    updateVideoLikeCount:null,
    updateIsVideoLiked:null,
    updateCommentLikeCount:null,
    updateReplyLikeCount:null,
    updateCommentCount:null,
    updateReplyCount:null
  }
}) => {
  
  const eventNamePrefix = "video";
  const {videoId} =data;
  const {updateViewCount,updateVideoLikeCount,updateIsVideoLiked,updateCommentLikeCount,updateReplyLikeCount,updateCommentCount,updateReplyCount} = listeners;

  useEffect(() => {

    // console.log(videoId);

    //join event room
    eventBus.emit(`${eventNamePrefix}:joinRoom`,videoId);

    //add event listeners
    if (updateViewCount && !eventBus.hasListeners(`${eventNamePrefix}:updateViewCount`)) 
      eventBus.on(`${eventNamePrefix}:updateViewCount`, updateViewCount);

    if (updateVideoLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateVideoLikeCount`)) 
      eventBus.on(`${eventNamePrefix}:updateVideoLikeCount`, updateVideoLikeCount);

    if (updateIsVideoLiked && !eventBus.hasListeners(`${eventNamePrefix}:updateIsVideoLiked`)) 
      eventBus.on(`${eventNamePrefix}:updateIsVideoLiked`, updateIsVideoLiked);

    if (updateCommentLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateCommentLikeCount`)) 
      eventBus.on(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount);

    if (updateReplyLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateReplyLikeCount`)) 
      eventBus.on(`${eventNamePrefix}:updateReplyLikeCount`,updateCommentLikeCount);

    if (updateCommentCount && !eventBus.hasListeners(`${eventNamePrefix}:updateCommentCount`)) 
      eventBus.on(`${eventNamePrefix}:updateCommentCount`, updateCommentCount);

    if (updateReplyCount && !eventBus.hasListeners(`${eventNamePrefix}:updateReplyCount`)) 
      eventBus.on(`${eventNamePrefix}:updateReplyCount`, updateReplyCount);

    return () => {
      //leave event room
      eventBus.emit(`${eventNamePrefix}:leaveRoom`,videoId);

      //remove event listeners
      if (updateViewCount) 
        eventBus.off(`${eventNamePrefix}:updateViewCount`);

      if (updateVideoLikeCount) 
        eventBus.off(`${eventNamePrefix}:updateVideoLikeCount`);

      if (updateIsVideoLiked) 
        eventBus.off(`${eventNamePrefix}:updateIsVideoLiked`);

      if (updateCommentLikeCount) 
        eventBus.off(`${eventNamePrefix}:updateCommentLikeCount`);

      if (updateReplyLikeCount) 
        eventBus.off(`${eventNamePrefix}:updateReplyLikeCount`);

      if (updateCommentCount) 
        eventBus.off(`${eventNamePrefix}:updateCommentCount`);
      
      if (updateReplyCount) 
        eventBus.off(`${eventNamePrefix}:updateReplyCount`);
    };
  }, [videoId]);
};

export default useVideoEvents;