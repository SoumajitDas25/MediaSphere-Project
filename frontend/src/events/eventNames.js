const listenEvents = [ //only those events for which data should be updated in real-time
    {
        namePrefix:"user",
        names: [
            'updateChannelName',
            'updateEmail',
            'updateAvatar',
            'updateCoverImage',
            'updateSubscriberCount',
            'updateSubscriptionCount',
            'updateVideoCount',
            'updateTweetCount',
            'updatePlaylistCount'
        ]
    },
    {
        namePrefix:"video",
        names: [ 
            'updateViewCount',
            'updateVideoLikeCount',
            'updateIsVideoLiked',
            'updateCommentLikeCount',
            'updateReplyLikeCount',
            'updateCommentCount',
            'updateReplyCount'
        ]
    }
];

const getListenEventNames = ()=> {

    const eventNames = [];
    for(const obj of listenEvents)
    {
        for(const name of obj.names)
        {
            eventNames.push(`${obj.namePrefix}:${name}`)
        }
    }
    return eventNames;
}

const getEmitEventNames = ()=> {

    const eventNames = [];
    for(const obj of listenEvents)
    {
        eventNames.push(`${obj.namePrefix}:joinRoom`);
        eventNames.push(`${obj.namePrefix}:leaveRoom`);
    }
    return eventNames;
}


export { getEmitEventNames,getListenEventNames };