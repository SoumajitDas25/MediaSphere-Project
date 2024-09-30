import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Tweet} from "../models/tweet.model.js"
import ApiError from "../utils/ApiError.js"

import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    //get stats for user
    const stats = await User.aggregate([
        {
            $match:{ //find the user doc
                _id:new mongoose.Types.ObjectId(String(req.user._id))
            },
        },
        {
            $lookup: { //get total video docs
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "totalVideos"
            }
        },
        {
            $lookup: { //get channel subscribers
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "channelSubscribers"
            }
        },
        {
            $lookup: { //get channel subscribed
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "channelsSubscribed"
            }
        },
        {
            $lookup: { //get total likes given docs
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "totalLikesGivenOnVideos",
                pipeline: [{
                    $match: { //get total likes given on videos
                        video: {
                            $exists: true,
                            $ne: null
                        }
                    }
                }]
            },
        },
        {
            $lookup: { //get total likes given docs
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "totalLikesGivenOnTweets",
                pipeline: [{
                    $match: { //get total likes given on tweets
                        tweet: {
                            $exists: true,
                            $ne: null
                        }
                    }
                }]
            },
        },
        {
            $lookup: { //get total comments done docs
                from: "comments",
                localField: "_id",
                foreignField: "owner",
                as: "totalCommentsDone"
            },
        },
        {
            $lookup: { //get total playlist docs
                from: "playlists",
                localField: "_id",
                foreignField: "owner",
                as: "totalPlaylists"
            },
        },
        {
            $lookup: { //get total tweets docs
                from: "comments",
                localField: "_id",
                foreignField: "owner",
                as: "totalTweets"
            },
        },
        {
            $addFields: { 
                totalVideos: { //calculate total videos count
                    $size: "$totalVideos"
                },
                totalTweets: { //calculate total tweets count
                    $size: "$totalTweets"
                },
                channelSubscribers: { //calculate channel subscribers count
                    $size: "$channelSubscribers"
                },
                channelsSubscribed: { //calculate channels subscribed count
                    $size: "$channelsSubscribed"
                },
                totalPlaylists: { //calculate total playlists count
                    $size: "$totalPlaylists"
                },
                totalLikesGivenOnVideos: { //calculate total likes given on videos
                    $size: "$totalLikesGivenOnVideos"
                },
                totalLikesGivenOnTweets: { //calculate total likes given on tweets
                    $size: "$totalLikesGivenOnTweets"
                },
                totalCommentsDone: { //calculate total comments done count
                    $size: "$totalCommentsDone"
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                totalVideos: 1,
                channelSubscribers: 1,
                channelsSubscribed: 1,
                totalLikesGivenOnVideos: 1,
                totalLikesGivenOnTweets: 1,
                totalCommentsDone: 1,
                totalPlaylists: 1,
                totalTweets: 1
            }
        }
    ]);
    if(!stats)
    {
        throw new ApiError(500,"Something went wrong while fetching stats");
    }

    //get total likes,comments,views recieved on videos
    const totalVideoStats = await Video.aggregate([
        {
            $match:{ //get all video docs for the user
                owner: new mongoose.Types.ObjectId(String(req.user._id))
            }
        },
        {
            $lookup: { //get all likes received on videos
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likesReceived"
            }
        },
        {
            $lookup: { //get all comments received on videos
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "commentsReceived"
            }
        },
        {
            $addFields: {
                likesReceived: { //calculate total likes received on videos
                    $size: "$likesReceived"
                },
                commentsReceived: { //calculate total comments received on videos
                    $size: "$commentsReceived"
                }
            }
        },
        {
            $group: { //group all video docs by owner & caclulate sum of totalViews,totalLikesReceived,totalCommentsReceived fields
                _id: "$owner",
                totalViews: { $sum: "$viewsCount" },
                totalLikesReceived: {$sum: "$likesReceived"},
                totalCommentsReceived: {$sum: "$commentsReceived"},
            }
        }
    ]);
    if(!totalVideoStats)
    {
        throw new ApiError(500,"Something went wrong while fetching stats");
    }

    //get total likes recieved on tweets
    const totalTweetStats = await Tweet.aggregate([
        {
            $match:{ //get all tweets docs for the user
                owner: new mongoose.Types.ObjectId(String(req.user._id))
            }
        },
        {
            $lookup: { //get all likes received on tweets
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesReceived"
            }
        },
        {
            $addFields: {
                likesReceived: { //calculate total likes received on tweets
                    $size: "$likesReceived"
                }
            }
        },
        {
            $group: { //group all tweet docs by owner & caclulate sum of totalLikesReceived field
                _id: "$owner",
                totalLikesReceived: {$sum: "$likesReceived"}
            }
        }
    ]);
    if(!totalTweetStats)
    {
        throw new ApiError(500,"Something went wrong while fetching stats");
    }

    stats[0].totalViews = totalVideoStats[0].totalViews;
    stats[0].totalLikesReceivedOnVideos = totalVideoStats[0].totalLikesReceived;
    stats[0].totalLikesReceivedOnTweets = totalTweetStats[0].totalLikesReceived;
    stats[0].totalLikesReceived = stats[0].totalLikesReceivedOnVideos + stats[0].totalLikesReceivedOnTweets
    stats[0].totalLikesGiven = stats[0].totalLikesGivenOnVideos + stats[0].totalLikesGivenOnTweets
    stats[0].totalCommentsReceived = totalVideoStats[0].totalCommentsReceived;

    //send stats[0] as response
    res.status(200)
    .json(
        new ApiResponse(200,stats[0],"User Stats fetched Successfully")
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {

    //get all vidoes for the channel(user)
    const videos = await Video.find(
        {
            owner: req.user._id
        }
    );
    if(!videos)
    {
        throw new ApiError(500,"Something went wrong while fetching Channel Videos")
    }

    //send the video[] as response
    res.status(200)
    .json(
        new ApiResponse(200,videos,"Channel Videos fetched Successfully")
    );

})

export {
    getChannelStats, 
    getChannelVideos
    }
