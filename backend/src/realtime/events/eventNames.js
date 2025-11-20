//publicEvents: events which are to be emitted to a public room
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

//privateEvents: events which are to be emitted to a user private room
const privateEvents = [ //only those events which needs syncing across all sockets of the user
    {
        domain:"user",
        names: [
            'updateIsSubscribed'
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

export { publicEvents,privateEvents };