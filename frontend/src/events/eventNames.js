const publicEvents = [ //only those events for which data should be updated in real-time
    {
        domain:"user",
        names: [
            'updateChannelName',
            'updateEmail',
            'updateAvatar',
            'updateCoverImage',
            'updateSubscriberCount',
            'updateSubscriptionCount',
            'updateVideoCount',
            'updateTweetCount',
            'updatePlaylistCount',
            'reloadVideoList',
            'reloadTweetList',
            'reloadPlaylistList'
        ]
    },
    {
        domain:"video",
        names: [ 
            'updateViewCount',
            'updateCommentCount',
            'updateReplyCount',
            'updateVideoLikeCount',
            'updateCommentLikeCount',
            'updateReplyLikeCount',
            'reloadCommentList',
            'reloadReplyList'
        ]
    },
    {
        domain:"tweet",
        names: [ 
            'updateTweet',
            'deleteTweet',
            'updateCommentCount',
            'updateReplyCount',
            'updateTweetLikeCount',
            'updateCommentLikeCount',
            'updateReplyLikeCount',
            'reloadCommentList',
            'reloadReplyList'
        ]
    }
];

const privateEvents = [ //only those events which needs syncing across all sockets of the user
    {
        domain:"user",
        names: [
            'updateIsSubscribed',
        ]
    },
    {
        domain:"video",
        names: [ 
            'updateIsVideoLiked',
            'updateIsVideoPresentInPlaylist'
        ]
    },
    {
        domain:"tweet",
        names: [ 
            'updateIsTweetLiked'
        ]
    }
]

const getPublicListenEventNames = ()=> {

    const eventNames = [];
    for(const obj of publicEvents)
    {
        for(const name of obj.names)
        {
            eventNames.push(`${obj.domain}:${name}`)
        }
    }
    return eventNames;
}

const getPrivateListenEventNames = ()=> {

    const eventNames = [];
    for(const obj of privateEvents)
    {
        for(const name of obj.names)
        {
            eventNames.push(`private:${obj.domain}:${name}`)
        }
    }
    return eventNames;
}

const getEmitEventNames = ()=> {

    const eventNames = [];
    for(const obj of publicEvents)
    {
        eventNames.push(`${obj.domain}:joinRoom`);
        eventNames.push(`${obj.domain}:leaveRoom`);
    }
    return eventNames;
}


export { getEmitEventNames,getPublicListenEventNames,getPrivateListenEventNames };