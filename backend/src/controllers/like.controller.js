import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Reply} from "../models/reply.model.js"
import eventBus from "../utils/eventBus.js"

const toggleVideoLike = asyncHandler(async (req, res) => {

    //fetch videoId from req params
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    //start the transaction via session
    const session = await mongoose.startSession();
    session.startTransaction();

    try 
    {
        //check if the videoId is correct or not
        const video = await Video.findById(videoId).session(session);
        if (!video) 
        {
            throw new ApiError(400, "Incorrect Video Id - Video does not exist");
        }

        //check if the video is already liked by the user or not
        const existingLike = await Like.findOne({
            video: videoId,
            likedBy: req.user._id,
            targetType: "video"
        }).session(session);
        if(existingLike) 
        {
            //if video is already liked, then remove the like doc & decrement the likes count in the video doc
            const isLikeDeleted = await Like.findByIdAndDelete(existingLike._id).session(session);
            if(!isLikeDeleted)
            {
                throw new ApiError(500,"Something went wrong while deleting like document");
            }
            video.likesCount -= 1;
        } 
        else 
        {
            //if video is not liked, then create a like doc & increment the likes count in the video doc
            const like = await Like.create([{
                video: videoId,
                likedBy: req.user._id,
                targetType: "video"
            }], { session });
            if(!like)
            {
                throw new ApiError(500,"Something went wrong while creating like document");
            }
            video.likesCount += 1;
        }

        //save the video doc
        const updatedVideo = await video.save({ validateBeforeSave: true, session });
        if(!updatedVideo)
        {
            throw new ApiError(500,"Something went wrong while updating Video document");
        }

        //emit updateVideoLikeCount event
        // eventBus.emit("video:updateVideoLikeCount",{id:videoId,data:video.likesCount},session);
        //emit public sync event for updating likeCount
        eventBus.broadcast(
            "public:sync",
            req.socketId,
            {
                id:videoId,
                domain:"video",
                action:"update",
                field:"likeCount",
                value:video.likesCount
            },
            session
        );

        //emit updateIsVideoLiked event
        // eventBus.emit("private:video:updateIsVideoLiked",{userId:req.user._id, id:videoId,data:!existingLike},session);
        //emit private sync event for updating isLiked
        eventBus.broadcast(
            "private:sync",
            req.socketId,
            {
                userId:req.user._id,
                id:videoId,
                domain:"video",
                action:"update",
                field:"isLiked",
                value:!existingLike
            },
            session
        );

        //end the transaction via session
        await session.commitTransaction();
        session.endSession();

        res.status(200)
        .json(
            new ApiResponse(
                200,
                { 
                    likesCount: video.likesCount, 
                    isLiked: !existingLike 
                },
                "Video like toggled Successfully"
            )
        );
    } 
    catch (error) 
    {
        //abort the transaction via session
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, "Something went wrong while toggling Video Like");
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    
    //fetch tweetId from req params
    const { tweetId } = req.params
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid Tweet Id");
    }

    //start the transaction via session
    const session = await mongoose.startSession();
    session.startTransaction();

    try
    {
        //check if the tweetId is correct or not
        const tweet = await Tweet.findById(tweetId).session(session);
        if(!tweet)
        {
            throw new ApiError(400,"Incorrect Tweet Id - Tweet does not exist");
        }

        //check if the tweet is already liked by the user or not
        const existingLike = await Like.findOne({
            tweet:tweetId,
            likedBy:req.user._id,
            targetType: "tweet"
        }).session(session);
        if(existingLike) 
        {
            //if tweet is already liked, then remove the like doc & decrement the likes count in the tweet doc
            const isLikeDeleted = await Like.findByIdAndDelete(existingLike._id).session(session);
            if(!isLikeDeleted)
            {
                throw new ApiError(500,"Something went wrong while deleting like document");
            }
            tweet.likesCount -= 1;
        }
        else
        {
            //if tweet is not liked, then create a like doc & increment the likes count in the tweet doc
            const like = await Like.create([{
                tweet:tweetId,
                likedBy: req.user._id,
                targetType: "tweet"
            }],{session});
            if(!like)
            {
                throw new ApiError(500,"Something went wrong while creating like document");
            }
            tweet.likesCount += 1
        }

        //save the tweet doc
        const updatedTweet = await tweet.save({validateBeforeSave: true,session});
        if(!updatedTweet)
        {
            throw new ApiError(500,"Something went wrong while updating Tweet document");
        }

        //emit updateTweetLikeCount event
        // eventBus.emit("tweet:updateTweetLikeCount",{id:tweetId,data:tweet.likesCount},session);
        //emit public sync event for updating likeCount
        eventBus.broadcast(
            "public:sync",
            req.socketId,
            {
                id:tweetId,
                domain:"tweet",
                action:"update",
                field:"likeCount",
                value:tweet.likesCount
            },
            session
        );

        //emit updateIsTweetLiked event
        // eventBus.emit("private:tweet:updateIsTweetLiked",{userId:req.user._id, id:tweetId,data:!existingLike},session);
        //emit private sync event for updating isLiked
        eventBus.broadcast(
            "private:sync",
            req.socketId,
            {
                userId:req.user._id,
                id:tweetId,
                domain:"tweet",
                action:"update",
                field:"isLiked",
                value:!existingLike
            },
            session
        );

        //end the transaction via session
        await session.commitTransaction();
        session.endSession();

        res.status(200)
        .json(
            new ApiResponse(
                200,
                { 
                    likesCount: tweet.likesCount, 
                    isLiked: !existingLike 
                },
                "Tweet like toggled Successfully"
            )
        );
    }
    catch (error) 
    {
        //abort the transaction via session
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, "Something went wrong while toggling Tweet Like");
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {

    //fetch commentId from req params
    const { commentId } = req.params
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Invalid Comment Id");
    }

    //start the transaction via session
    const session = await mongoose.startSession();
    session.startTransaction();

    try
    {
        //check if the commentId is correct or not
        const comment = await Comment.findById(commentId).session(session);
        if(!comment)
        {
            throw new ApiError(400,"Incorrect Comment Id - Comment does not exist");
        }

        //check if the comment is already liked by the user or not
        const existingLike = await Like.findOne({
            comment:commentId,
            likedBy:req.user._id,
            targetType: "comment"
        }).session(session);
        if(existingLike) 
        {
            //if comment is already liked, then remove the like doc & decrement the likes count in the comment doc
            const isLikeDeleted = await Like.findByIdAndDelete(existingLike._id).session(session);
            if(!isLikeDeleted)
            {
                throw new ApiError(500,"Something went wrong while deleting like document");
            }
            comment.likesCount -= 1;
        }
        else
        {
            //if comment is not liked, then create a like doc & increment the likes count in the comment doc

            //check if the comment is for video
            let like;
            if(comment.video && comment.video!='' && isValidObjectId(comment.video))
            {
                like = await Like.create([{
                    video: comment.video,
                    comment:commentId,
                    likedBy: req.user._id,
                    targetType: "comment"
                }],{session});
            }
            //check if the comment is for tweet
            if(comment.tweet && comment.tweet!='' && isValidObjectId(comment.tweet))
            {
                like = await Like.create([{
                    tweet: comment.tweet,
                    comment:commentId,
                    likedBy: req.user._id,
                    targetType: "comment"
                }],{session});
            }
            if(!like)
            {
                throw new ApiError(500,"Something went wrong while creating like document");
            }
            comment.likesCount += 1;
        }

        //save the comment doc
        const updatedComment = await comment.save({validateBeforeSave: true,session});
        if(!updatedComment)
        {
            throw new ApiError(500,"Something went wrong while updating Comment document");
        }

        //end the transaction via session
        await session.commitTransaction();
        session.endSession();

        res.status(200)
        .json(
            new ApiResponse(
                200,
                { 
                    likesCount: comment.likesCount, 
                    isLiked: !existingLike 
                },
                "Comment like toggled Successfully")
        );
    }
    catch (error) 
    {
        //abort the transaction via session
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        throw new ApiError(500, "Something went wrong while toggling Comment Like");
    }
});

const toggleReplyLike = asyncHandler(async (req, res) => {

    //fetch replyId from req params
    const { replyId } = req.params
    if(!isValidObjectId(replyId))
    {
        throw new ApiError(400,"Invalid Reply Id");
    }

    //start the transaction via session
    const session = await mongoose.startSession();
    session.startTransaction();

    try
    {
        //check if the replyId is correct or not
        const reply = await Reply.findById(replyId).session(session);
        if(!reply)
        {
            throw new ApiError(400,"Incorrect Reply Id - Reply does not exist");
        }

        //check if the reply is already liked by the user or not
        const existingLike = await Like.findOne({
            reply:replyId,
            likedBy:req.user._id,
            targetType: "reply"
        }).session(session);
        if(existingLike) 
        {
            //if reply is already liked, then remove the like doc & decrement the likes count in the reply doc
            const isLikeDeleted = await Like.findByIdAndDelete(existingLike._id).session(session);
            if(!isLikeDeleted)
            {
                throw new ApiError(500,"Something went wrong while deleting like document");
            }
            reply.likesCount -= 1;
        }
        else
        {
            //if reply is not liked, then create a like doc & increment the likes count in the reply doc

            //get the comment doc for the reply
            const comment = await Comment.findById(reply.comment).session(session);

            //check if the comment is for video
            let like;
            if(comment.video && comment.video!='' && isValidObjectId(comment.video))
            {
                like = await Like.create([{
                    video: comment.video,
                    comment: reply.comment,
                    reply: replyId,
                    likedBy: req.user._id,
                    targetType: "reply"
                }],{session});
            }
            //check if the comment is for tweet
            if(comment.tweet && comment.tweet!='' && isValidObjectId(comment.tweet))
            {
                like = await Like.create([{
                    tweet: comment.tweet,
                    comment: reply.comment,
                    reply: replyId,
                    likedBy: req.user._id,
                    targetType: "reply"
                }],{session});
            }
            if(!like)
            {
                throw new ApiError(500,"Something went wrong while creating like document");
            }          
            reply.likesCount += 1;
        }

        //save the reply doc
        const updatedReply = await reply.save({validateBeforeSave: true,session});
        if(!updatedReply)
        {
            throw new ApiError(500,"Something went wrong while updating Reply document");
        }

        //end the transaction via session
        await session.commitTransaction();
        session.endSession();

        res.status(200)
        .json(
            new ApiResponse(
                200,
                { 
                    likesCount: reply.likesCount, 
                    isLiked: !existingLike 
                },
                "Reply like toggled Successfully"
            )
        );
    }
    catch (error) 
    {
        //abort the transaction via session
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, "Something went wrong while toggling Reply Like");
    }
});

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
        new ApiResponse(200,likedVideos[0],"All Liked Vidoes fetched Successfully")
    );

});

export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    toggleReplyLike,
    getLikedVideos
}