import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Reply} from "../models/reply.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {

    //fetch videoId from req params
    const { videoId } = req.params
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id");
    }
    //check if the videoId is correct or not
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Incorrect Video Id - Video does not exist");
    }

    //check if the video is already liked by the user or not
    const isVideoliked = await Like.findOne({
        $and: [{video:videoId},{likedBy:req.user._id}]
    })

    let like;
    if(isVideoliked) 
    {
        //if video is already liked, then remove the like doc & decrement the likes count in the video doc
        like = await Like.findByIdAndDelete(isVideoliked._id);
        if(!like)
        {
            throw new ApiError(500,"Something went wrong while deleting like document");
        }

        video.likesCount = video.likesCount - 1;
        // console.log("delete & decrement")
    }
    else
    {
        //if video is not liked, then create a like doc & increment the likes count in the video doc
        like = await Like.create({
            video:videoId,
            likedBy: req.user._id
        });
        if(!like)
        {
            throw new ApiError(500,"Something went wrong while creating like document");
        }

        video.likesCount = video.likesCount + 1;
        // console.log("insert & increment")
    }
    const updatedVideo = await video.save({validateBeforeSave: true});
    if(!updatedVideo)
    {
        throw new ApiError(500,"Something went wrong while updating Video document");
    }

    res.status(200)
    .json(
        new ApiResponse(200,video,"Video like toggled Successfully")
    );

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    
    //fetch tweetId from req params
    const { tweetId } = req.params
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid Tweet Id");
    }
    //check if the tweetId is correct or not
    const tweet = await Tweet.findById(tweetId);
    if(!tweet)
    {
        throw new ApiError(400,"Incorrect Tweet Id - Tweet does not exist");
    }

    //check if the tweet is already liked by the user or not
    const istweetliked = await Like.findOne({
        $and: [{tweet:tweetId},{likedBy:req.user._id}]
    })

    let like;
    if(istweetliked) 
    {
        //if tweet is already liked, then remove the like doc & decrement the likes count in the tweet doc
        like = await Like.findByIdAndDelete(istweetliked._id);
        if(!like)
        {
            throw new ApiError(500,"Something went wrong while deleting like document");
        }

        tweet.likesCount = tweet.likesCount - 1;
        // console.log("delete & decrement")
    }
    else
    {
        //if tweet is not liked, then create a like doc & increment the likes count in the tweet doc
        like = await Like.create({
            tweet:tweetId,
            likedBy: req.user._id
        });
        if(!like)
        {
            throw new ApiError(500,"Something went wrong while creating like document");
        }

        tweet.likesCount = tweet.likesCount + 1;
        // console.log("insert & increment")
    }
    const updatedTweet = await tweet.save({validateBeforeSave: true});
    if(!updatedTweet)
    {
        throw new ApiError(500,"Something went wrong while updating Tweet document");
    }

    res.status(200)
    .json(
        new ApiResponse(200,like,"Tweet like toggled Successfully")
    );

})

const toggleCommentLike = asyncHandler(async (req, res) => {

    //fetch commentId from req params
    const { commentId } = req.params
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Invalid Comment Id");
    }
    //check if the commentId is correct or not
    const comment = await Comment.findById(commentId);
    if(!comment)
    {
        throw new ApiError(400,"Incorrect Comment Id - Comment does not exist");
    }

    //check if the comment is already liked by the user or not
    const iscommentliked = await Like.findOne({
        $and: [{comment:commentId},{likedBy:req.user._id}]
    })

    let like;
    if(iscommentliked) 
    {
        //if comment is already liked, then remove the like doc & decrement the likes count in the comment doc
        like = await Like.findByIdAndDelete(iscommentliked._id);
        if(!like)
        {
            throw new ApiError(500,"Something went wrong while deleting like document");
        }

        comment.likesCount = comment.likesCount - 1;
        // console.log("delete & decrement")
    }
    else
    {
        //if comment is not liked, then create a like doc & increment the likes count in the comment doc

        //check if the comment is for video
        if(comment.video && comment.video!='' && isValidObjectId(comment.video))
        {
            like = await Like.create({
                video: comment.video,
                comment:commentId,
                likedBy: req.user._id
            });
        }
        //check if the comment is for tweet
        if(comment.tweet && comment.tweet!='' && isValidObjectId(comment.tweet))
        {
            like = await Like.create({
                tweet: comment.tweet,
                comment:commentId,
                likedBy: req.user._id
            });
        }
        if(!like)
        {
            throw new ApiError(500,"Something went wrong while creating like document");
        }

        comment.likesCount = comment.likesCount + 1;
        // console.log("insert & increment")
    }
    const updatedComment = await comment.save({validateBeforeSave: true});
    if(!updatedComment)
    {
        throw new ApiError(500,"Something went wrong while updating Comment document");
    }

    res.status(200)
    .json(
        new ApiResponse(200,like,"Comment like toggled Successfully")
    );

})

const toggleReplyLike = asyncHandler(async (req, res) => {
    //fetch replyId from req params
    const { replyId } = req.params
    if(!isValidObjectId(replyId))
    {
        throw new ApiError(400,"Invalid Reply Id");
    }
    //check if the replyId is correct or not
    const reply = await Reply.findById(replyId);
    if(!reply)
    {
        throw new ApiError(400,"Incorrect Reply Id - Reply does not exist");
    }

    //check if the reply is already liked by the user or not
    const isreplyliked = await Like.findOne({
        $and: [{reply:replyId},{likedBy:req.user._id}]
    })

    let like;
    if(isreplyliked) 
    {
        //if reply is already liked, then remove the like doc & decrement the likes count in the reply doc
        like = await Like.findByIdAndDelete(isreplyliked._id);
        if(!like)
        {
            throw new ApiError(500,"Something went wrong while deleting like document");
        }

        reply.likesCount = reply.likesCount - 1;
        // console.log("delete & decrement")
    }
    else
    {
        //if reply is not liked, then create a like doc & increment the likes count in the reply doc

        //get the comment doc for the reply
        const comment = await Comment.findById(reply.comment);

        //check if the comment is for video
        if(comment.video && comment.video!='' && isValidObjectId(comment.video))
        {
            like = await Like.create({
                video: comment.video,
                comment: reply.comment,
                reply: replyId,
                likedBy: req.user._id
            });
        }
        //check if the comment is for tweet
        if(comment.tweet && comment.tweet!='' && isValidObjectId(comment.tweet))
        {
            like = await Like.create({
                tweet: comment.tweet,
                comment: reply.comment,
                reply: replyId,
                likedBy: req.user._id
            });
        }
        if(!like)
        {
            throw new ApiError(500,"Something went wrong while creating like document");
        }
        
        reply.likesCount = reply.likesCount + 1;
        // console.log("insert & increment")
    }
    const updatedReply = await reply.save({validateBeforeSave: true});
    if(!updatedReply)
    {
        throw new ApiError(500,"Something went wrong while updating Reply document");
    }

    res.status(200)
    .json(
        new ApiResponse(200,like,"Reply like toggled Successfully")
    );

})

const getLikedVideos = asyncHandler(async (req, res) => {

    //get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match:{ //get all like docs which user has liked
                likedBy:req.user._id,
                video: {
                    $exists: true,
                    $ne: null
                }
            }
        },
        {
            $lookup: { // get all liked video docs
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $project: { //include only this field in each like doc
                video: 1
            }
        },
        {
            $addFields: { //store the first element(obj) of video[] field
                video: {
                    $first: "$video"
                }
            }
        }
    ])
    if(!likedVideos)
    {
        throw new ApiError(500,"Something went wrong while getting all Liked Videos");
    }

    //send all liked vidoes as response
    res.status(200)
    .json(
        new ApiResponse(200,likedVideos,"All Liked Vidoes fetched Successfully")
    );

})

export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    toggleReplyLike,
    getLikedVideos
}