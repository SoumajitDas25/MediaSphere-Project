import { useEffect } from 'react';
import eventBus from '../eventBus';
import { useSelector } from 'react-redux';

const useTweetEvents = ({ 
  data={
    tweetId:null,
  },
  publicListeners={
    updateTweet:null,
    deleteTweet:null,
    updateCommentCount:null,
    updateReplyCount:null,
    updateTweetLikeCount:null,
    updateCommentLikeCount:null,
    updateReplyLikeCount:null,
    reloadCommentList:null,
    reloadReplyList:null
  },
  privateListeners={
    updateIsTweetLiked:null
  }
}) => {
  
  const eventNamePrefix = "tweet";
  const {tweetId} =data;
  const {
    updateTweet,
    deleteTweet,
    updateCommentCount,
    updateReplyCount,
    updateTweetLikeCount,
    updateCommentLikeCount,
    updateReplyLikeCount,
    reloadCommentList,
    reloadReplyList
    } = publicListeners;
  const {
    updateIsTweetLiked
    } = privateListeners;
  const isSocketConnected = useSelector(state=>state.auth.isSocketConnected);

  useEffect(() => {

    // console.log(tweetId);

    //join event room only if socket is connected & id is available
    if(isSocketConnected && tweetId)
    {
      eventBus.emit(`${eventNamePrefix}:joinRoom`,tweetId);
       console.log(`join ${eventNamePrefix} room`);
    }

    //add public event listeners
    if (updateTweet && !eventBus.hasListeners(`${eventNamePrefix}:updateTweet`,updateTweet)) 
      eventBus.on(`${eventNamePrefix}:updateTweet`, updateTweet);

    if (deleteTweet && !eventBus.hasListeners(`${eventNamePrefix}:deleteTweet`,deleteTweet)) 
      eventBus.on(`${eventNamePrefix}:deleteTweet`, deleteTweet);

    if (updateCommentCount && !eventBus.hasListeners(`${eventNamePrefix}:updateCommentCount`,updateCommentCount)) 
      eventBus.on(`${eventNamePrefix}:updateCommentCount`, updateCommentCount);

    if (updateReplyCount && !eventBus.hasListeners(`${eventNamePrefix}:updateReplyCount`,updateReplyCount)) 
      eventBus.on(`${eventNamePrefix}:updateReplyCount`, updateReplyCount);

    if (updateTweetLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateTweetLikeCount`,updateTweetLikeCount)) 
      eventBus.on(`${eventNamePrefix}:updateTweetLikeCount`,updateTweetLikeCount);

    if (updateCommentLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount)) 
      eventBus.on(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount);

    if (updateReplyLikeCount && !eventBus.hasListeners(`${eventNamePrefix}:updateReplyLikeCount`,updateReplyLikeCount)) 
      eventBus.on(`${eventNamePrefix}:updateReplyLikeCount`,updateReplyLikeCount);

    if (reloadCommentList && !eventBus.hasListeners(`${eventNamePrefix}:reloadCommentList`,reloadCommentList)) 
      eventBus.on(`${eventNamePrefix}:reloadCommentList`,reloadCommentList);

    if (reloadReplyList && !eventBus.hasListeners(`${eventNamePrefix}:reloadReplyList`,reloadReplyList)) 
      eventBus.on(`${eventNamePrefix}:reloadReplyList`,reloadReplyList);

    //add private event listeners
    if (updateIsTweetLiked && !eventBus.hasListeners(`private:${eventNamePrefix}:updateIsTweetLiked`,updateIsTweetLiked)) 
      eventBus.on(`private:${eventNamePrefix}:updateIsTweetLiked`, updateIsTweetLiked);

    return () => {

      //leave event room only if socket is connected & Id is available
      if(isSocketConnected && tweetId)
      {
        eventBus.emit(`${eventNamePrefix}:leaveRoom`,tweetId);
        console.log(`leave ${eventNamePrefix} room`);
      }

      //remove public event listeners
      if (updateTweet && eventBus.hasListeners(`${eventNamePrefix}:updateTweet`,updateTweet)) 
        eventBus.off(`${eventNamePrefix}:updateTweet`,updateTweet);

      if (deleteTweet && eventBus.hasListeners(`${eventNamePrefix}:deleteTweet`,deleteTweet)) 
        eventBus.off(`${eventNamePrefix}:deleteTweet`,deleteTweet);

      if (updateCommentCount && eventBus.hasListeners(`${eventNamePrefix}:updateCommentCount`,updateCommentCount)) 
        eventBus.off(`${eventNamePrefix}:updateCommentCount`,updateCommentCount);
        
      if (updateReplyCount && eventBus.hasListeners(`${eventNamePrefix}:updateReplyCount`,updateReplyCount)) 
        eventBus.off(`${eventNamePrefix}:updateReplyCount`,updateReplyCount);

      if (updateTweetLikeCount && eventBus.hasListeners(`${eventNamePrefix}:updateTweetLikeCount`,updateTweetLikeCount)) 
        eventBus.off(`${eventNamePrefix}:updateTweetLikeCount`,updateTweetLikeCount);

      if (updateCommentLikeCount && eventBus.hasListeners(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount)) 
        eventBus.off(`${eventNamePrefix}:updateCommentLikeCount`,updateCommentLikeCount);

      if (updateReplyLikeCount && eventBus.hasListeners(`${eventNamePrefix}:updateReplyLikeCount`,updateReplyLikeCount)) 
        eventBus.off(`${eventNamePrefix}:updateReplyLikeCount`,updateReplyLikeCount);

      if (reloadCommentList && eventBus.hasListeners(`${eventNamePrefix}:reloadCommentList`,reloadCommentList)) 
        eventBus.off(`${eventNamePrefix}:reloadCommentList`,reloadCommentList);

      if (reloadReplyList && eventBus.hasListeners(`${eventNamePrefix}:reloadReplyList`,reloadReplyList)) 
        eventBus.off(`${eventNamePrefix}:reloadReplyList`,reloadReplyList); 

      //remove private event listeners
      if (updateIsTweetLiked && eventBus.hasListeners(`private:${eventNamePrefix}:updateIsTweetLiked`,updateIsTweetLiked)) 
        eventBus.off(`private:${eventNamePrefix}:updateIsTweetLiked`,updateIsTweetLiked);

    };
  }, [isSocketConnected,tweetId]);
};

export default useTweetEvents;