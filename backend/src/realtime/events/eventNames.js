//scopedEvents: events which are to be emitted to a public room
const scopedEvents = [ //only those events for which data should be updated in real-time
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

//privateUserEvents: events which are to be emitted to a user private room
const privateUserEvents = [ //only those events which needs syncing across all sockets of the user
    'updateIsSubscribed'
]

export { scopedEvents,privateUserEvents };