import { useEffect } from 'react';
import eventBus from '../eventBus';
import { useSelector } from 'react-redux';

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
  const isSocketConnected = useSelector(state=>state.auth.isSocketConnected);

  useEffect(() => {

    // console.log(videoId);

    //join event room only if socket is connected & id is available
    if(isSocketConnected && videoId)
    {
      eventBus.emit(`${eventNamePrefix}:joinRoom`,videoId);
       console.log(`join ${eventNamePrefix} room`);
    }

    //add event listeners
    if (updateViewCount && !eventBus.hasListeners(`${eventNamePrefix}:updateViewCount`,updateViewCount)) 
      eventBus.on(`${eventNamePrefix}:updateViewCount`, updateViewCount);

    if (updateVideoLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateVideoLikeCount`,updateVideoLikeCount)) 
      eventBus.on(`${eventNamePrefix}:updateVideoLikeCount`, updateVideoLikeCount);

    if (updateIsVideoLiked && !eventBus.hasListeners(`${eventNamePrefix}:updateIsVideoLiked`,updateIsVideoLiked)) 
      eventBus.on(`${eventNamePrefix}:updateIsVideoLiked`, updateIsVideoLiked);

    if (updateCommentLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount)) 
      eventBus.on(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount);

    if (updateReplyLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateReplyLikeCount`,updateReplyLikeCount)) 
      eventBus.on(`${eventNamePrefix}:updateReplyLikeCount`,updateReplyLikeCount);

    if (updateCommentCount && !eventBus.hasListeners(`${eventNamePrefix}:updateCommentCount`,updateCommentCount)) 
      eventBus.on(`${eventNamePrefix}:updateCommentCount`, updateCommentCount);

    if (updateReplyCount && !eventBus.hasListeners(`${eventNamePrefix}:updateReplyCount`,updateReplyCount)) 
      eventBus.on(`${eventNamePrefix}:updateReplyCount`, updateReplyCount);

    return () => {

      //leave event room only if socket is connected & Id is available
      if(isSocketConnected && videoId)
      {
        eventBus.emit(`${eventNamePrefix}:leaveRoom`,videoId);
        console.log(`leave ${eventNamePrefix} room`);
      }

      //remove event listeners
      if (updateViewCount && eventBus.hasListeners(`${eventNamePrefix}:updateViewCount`,updateViewCount)) 
        eventBus.off(`${eventNamePrefix}:updateViewCount`,updateViewCount);

      if (updateVideoLikeCount && eventBus.hasListeners(`${eventNamePrefix}:updateVideoLikeCount`,updateVideoLikeCount)) 
        eventBus.off(`${eventNamePrefix}:updateVideoLikeCount`,updateVideoLikeCount);

      if (updateIsVideoLiked && eventBus.hasListeners(`${eventNamePrefix}:updateIsVideoLiked`,updateIsVideoLiked)) 
        eventBus.off(`${eventNamePrefix}:updateIsVideoLiked`,updateIsVideoLiked);

      if (updateCommentLikeCount && eventBus.hasListeners(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount)) 
        eventBus.off(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount);

      if (updateReplyLikeCount && eventBus.hasListeners(`${eventNamePrefix}:updateReplyLikeCount`,updateReplyLikeCount)) 
        eventBus.off(`${eventNamePrefix}:updateReplyLikeCount`,updateReplyLikeCount);

      if (updateCommentCount && eventBus.hasListeners(`${eventNamePrefix}:updateCommentCount`,updateCommentCount)) 
        eventBus.off(`${eventNamePrefix}:updateCommentCount`,updateCommentCount);
        
      if (updateReplyCount && eventBus.hasListeners(`${eventNamePrefix}:updateReplyCount`,updateReplyCount)) 
        eventBus.off(`${eventNamePrefix}:updateReplyCount`,updateReplyCount);
    };
  }, [isSocketConnected,videoId]);
};

export default useVideoEvents;