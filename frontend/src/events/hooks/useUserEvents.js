import { useEffect } from 'react';
import eventBus from '../eventBus';

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
    updatePlaylistCount:null
  }
}) => {
  
  const eventNamePrefix = "user";
  const {userId} =data;
  const {updateChannelName,updateEmail,updateAvatar,updateCoverImage,updateSubscriberCount,updateSubscriptionCount,updateVideoCount,updateTweetCount,updatePlaylistCount} = listeners;

  useEffect(() => {

    console.log(userId);

    if(userId)
    {
        //join event room
        eventBus.emit(`${eventNamePrefix}:joinRoom`,userId);

        //add event listeners
        if (updateChannelName && !eventBus.hasListeners(`${eventNamePrefix}:updateChannelName`)) 
          eventBus.on(`${eventNamePrefix}:updateChannelName`, updateChannelName);

        if (updateEmail && !eventBus.hasListeners(`${eventNamePrefix}:updateEmail`)) 
          eventBus.on(`${eventNamePrefix}:updateEmail`,updateEmail);

        if (updateAvatar && !eventBus.hasListeners(`${eventNamePrefix}:updateAvatar`)) 
          eventBus.on(`${eventNamePrefix}:updateAvatar`, updateAvatar);

        if (updateCoverImage && !eventBus.hasListeners(`${eventNamePrefix}:updateCoverImage`)) 
          eventBus.on(`${eventNamePrefix}:updateCoverImage`, updateCoverImage);

        if (updateSubscriberCount && !eventBus.hasListeners(`${eventNamePrefix}:updateSubscriberCount`)) 
          eventBus.on(`${eventNamePrefix}:updateSubscriberCount`, updateSubscriberCount);

        if (updateSubscriptionCount && !eventBus.hasListeners(`${eventNamePrefix}:updateSubscriptionCount`)) 
          eventBus.on(`${eventNamePrefix}:updateSubscriptionCount`, updateSubscriptionCount);

        if (updateVideoCount && !eventBus.hasListeners(`${eventNamePrefix}:updateVideoCount`)) 
          eventBus.on(`${eventNamePrefix}:updateVideoCount`, updateVideoCount);

        if (updateTweetCount && !eventBus.hasListeners(`${eventNamePrefix}:updateTweetCount`)) 
          eventBus.on(`${eventNamePrefix}:updateTweetCount`, updateTweetCount);

        if (updatePlaylistCount && !eventBus.hasListeners(`${eventNamePrefix}:updatePlaylistCount`)) 
          eventBus.on(`${eventNamePrefix}:updatePlaylistCount`, updatePlaylistCount);
    }

    return () => {
        if(userId)
        {
            //leave event room
            eventBus.emit(`${eventNamePrefix}:leaveRoom`,userId);

            //remove event listeners
            if (updateChannelName) 
            eventBus.off(`${eventNamePrefix}:updateChannelName`);
            if (updateEmail) 
            eventBus.off(`${eventNamePrefix}:updateEmail`);
            if (updateAvatar) 
            eventBus.off(`${eventNamePrefix}:updateAvatar`);
            if (updateCoverImage) 
            eventBus.off(`${eventNamePrefix}:updateCoverImage`);
            if (updateSubscriberCount) 
            eventBus.off(`${eventNamePrefix}:updateSubscriberCount`);
            if (updateSubscriptionCount) 
            eventBus.off(`${eventNamePrefix}:updateSubscriptionCount`);
            if (updateVideoCount) 
            eventBus.off(`${eventNamePrefix}:updateVideoCount`);
            if (updateTweetCount) 
            eventBus.off(`${eventNamePrefix}:updateTweetCount`);
            if (updatePlaylistCount) 
            eventBus.off(`${eventNamePrefix}:updatePlaylistCount`);
        };
    }
}, [userId]);
};

export default useUserEvents;