import { useEffect } from 'react';
import eventBus from '../eventBus';
import { useSelector } from 'react-redux';

const useUserEvents = ({ 
  data={
    userId:null,
  },
  listeners={
    updateChannelName:null,
    updateEmail:null,
    updateAvatar:null,
    updateCoverImage:null,
    updateSubscriberCount:null,
    updateSubscriptionCount:null,
    updateVideoCount:null,
    updateTweetCount:null,
    updatePlaylistCount:null,
    reloadVideoList:null,
    reloadTweetList:null,
    reloadPlaylistList:null
  }
}) => {
  
  const eventNamePrefix = "user";
  const {userId} =data;
  const {updateChannelName,updateEmail,updateAvatar,updateCoverImage,updateSubscriberCount,updateSubscriptionCount,updateVideoCount,updateTweetCount,updatePlaylistCount,reloadVideoList,reloadTweetList,reloadPlaylistList} = listeners;
  const isSocketConnected = useSelector(state=>state.auth.isSocketConnected);

  useEffect(() => {

    // console.log(userId);

    //join event room only if socket is connected & id is available
    if(isSocketConnected && userId)
    {
      eventBus.emit(`${eventNamePrefix}:joinRoom`,userId);
      console.log(`join ${eventNamePrefix} room`);
    }

    //add event listeners
    if (updateChannelName && !eventBus.hasListeners(`${eventNamePrefix}:updateChannelName`,updateChannelName)) 
      eventBus.on(`${eventNamePrefix}:updateChannelName`, updateChannelName);

    if (updateEmail && !eventBus.hasListeners(`${eventNamePrefix}:updateEmail`,updateEmail)) 
      eventBus.on(`${eventNamePrefix}:updateEmail`,updateEmail);

    if (updateAvatar && !eventBus.hasListeners(`${eventNamePrefix}:updateAvatar`,updateAvatar)) 
      eventBus.on(`${eventNamePrefix}:updateAvatar`, updateAvatar);

    if (updateCoverImage && !eventBus.hasListeners(`${eventNamePrefix}:updateCoverImage`,updateCoverImage)) 
      eventBus.on(`${eventNamePrefix}:updateCoverImage`, updateCoverImage);

    if (updateSubscriberCount && !eventBus.hasListeners(`${eventNamePrefix}:updateSubscriberCount`,updateSubscriberCount)) 
      eventBus.on(`${eventNamePrefix}:updateSubscriberCount`, updateSubscriberCount);

    if (updateSubscriptionCount && !eventBus.hasListeners(`${eventNamePrefix}:updateSubscriptionCount`,updateSubscriptionCount)) 
      eventBus.on(`${eventNamePrefix}:updateSubscriptionCount`, updateSubscriptionCount);

    if (updateVideoCount && !eventBus.hasListeners(`${eventNamePrefix}:updateVideoCount`,updateVideoCount)) 
      eventBus.on(`${eventNamePrefix}:updateVideoCount`, updateVideoCount);

    if (updateTweetCount && !eventBus.hasListeners(`${eventNamePrefix}:updateTweetCount`,updateTweetCount)) 
      eventBus.on(`${eventNamePrefix}:updateTweetCount`, updateTweetCount);

    if (updatePlaylistCount && !eventBus.hasListeners(`${eventNamePrefix}:updatePlaylistCount`,updatePlaylistCount)) 
      eventBus.on(`${eventNamePrefix}:updatePlaylistCount`, updatePlaylistCount);

    if (reloadVideoList && !eventBus.hasListeners(`${eventNamePrefix}:reloadVideoList`,reloadVideoList)) 
      eventBus.on(`${eventNamePrefix}:reloadVideoList`, reloadVideoList);

    if (reloadTweetList && !eventBus.hasListeners(`${eventNamePrefix}:reloadTweetList`,reloadTweetList)) 
      eventBus.on(`${eventNamePrefix}:reloadTweetList`, reloadTweetList);

    if (reloadPlaylistList && !eventBus.hasListeners(`${eventNamePrefix}:reloadPlaylistList`,reloadPlaylistList)) 
      eventBus.on(`${eventNamePrefix}:reloadPlaylistList`, reloadPlaylistList);

    return () => {

      //leave event room only if socket is connected & Id is available
      if(isSocketConnected && userId)
      {
        eventBus.emit(`${eventNamePrefix}:leaveRoom`,userId);
        console.log(`leave ${eventNamePrefix} room`);
      }

      //remove event listeners
      if (updateChannelName && eventBus.hasListeners(`${eventNamePrefix}:updateChannelName`,updateChannelName)) 
        eventBus.off(`${eventNamePrefix}:updateChannelName`,updateChannelName);

      if (updateEmail && eventBus.hasListeners(`${eventNamePrefix}:updateEmail`,updateEmail)) 
        eventBus.off(`${eventNamePrefix}:updateEmail`,updateEmail);

      if (updateAvatar && eventBus.hasListeners(`${eventNamePrefix}:updateAvatar`,updateAvatar)) 
        eventBus.off(`${eventNamePrefix}:updateAvatar`,updateAvatar);

      if (updateCoverImage && eventBus.hasListeners(`${eventNamePrefix}:updateCoverImage`,updateCoverImage)) 
        eventBus.off(`${eventNamePrefix}:updateCoverImage`,updateCoverImage);

      if (updateSubscriberCount && eventBus.hasListeners(`${eventNamePrefix}:updateSubscriberCount`,updateSubscriberCount)) 
        eventBus.off(`${eventNamePrefix}:updateSubscriberCount`,updateSubscriberCount);

      if (updateSubscriptionCount && eventBus.hasListeners(`${eventNamePrefix}:updateSubscriptionCount`,updateSubscriptionCount)) 
        eventBus.off(`${eventNamePrefix}:updateSubscriptionCount`,updateSubscriptionCount);

      if (updateVideoCount && eventBus.hasListeners(`${eventNamePrefix}:updateVideoCount`,updateVideoCount)) 
        eventBus.off(`${eventNamePrefix}:updateVideoCount`,updateVideoCount);

      if (updateTweetCount && eventBus.hasListeners(`${eventNamePrefix}:updateTweetCount`,updateTweetCount)) 
        eventBus.off(`${eventNamePrefix}:updateTweetCount`,updateTweetCount);

      if (updatePlaylistCount && eventBus.hasListeners(`${eventNamePrefix}:updatePlaylistCount`,updatePlaylistCount)) 
        eventBus.off(`${eventNamePrefix}:updatePlaylistCount`,updatePlaylistCount);

      if (reloadVideoList && eventBus.hasListeners(`${eventNamePrefix}:reloadVideoList`,reloadVideoList)) 
        eventBus.off(`${eventNamePrefix}:reloadVideoList`,reloadVideoList);

      if (reloadTweetList && eventBus.hasListeners(`${eventNamePrefix}:reloadTweetList`,reloadTweetList)) 
        eventBus.off(`${eventNamePrefix}:reloadTweetList`,reloadTweetList);

      if (reloadPlaylistList && eventBus.hasListeners(`${eventNamePrefix}:reloadPlaylistList`,reloadPlaylistList)) 
        eventBus.off(`${eventNamePrefix}:reloadPlaylistList`,reloadPlaylistList);
    };
  }, [isSocketConnected,userId]);
};

export default useUserEvents;