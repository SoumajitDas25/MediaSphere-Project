import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Reply } from "../models/reply.model.js"
import { Like } from "../models/like.model.js"
import eventBus from "../utils/eventBus.js"


const getVideoComments = asyncHandler(async (req, res) => {

    let data;
    const {page = 1, limit = 10} = req.query

    //get videoId from req params
    const { videoId} = req.params;
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id");
    }

    //check if the video exists or not
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Incorrect Video Id - Video does not exist")
    }

    //get all comments for the video
    const totalComments = await Comment.find(
        {
            video: videoId
        }
    );
    if(!totalComments)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Video Comments");
    }
    if(totalComments.length < 1)
    {
        data={
            totalComments:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalComments.length / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        //get paginated comments for the video
        const paginatedComments = await Comment.aggregate([
            {
                $match: { //get all comment docs for the video
                    video: new mongoose.Types.ObjectId(String(videoId))
                }
            },
            {   //No of docs to skip
                $skip: (Number(page) - 1) * Number(limit)
            },
            {   //Max No of docs to be fetched
                $limit: Number(limit)
            },
            {
                $lookup: { //get the like doc of the comment for the user if it exists
                    from: "likes",
                    let: { commentId: "$_id" }, // Reference the current commentId
                    pipeline: [
                        {
                            $match:{
                                $expr: {
                                    $and: [
                                        { 
                                            $eq: ["$comment", "$$commentId"] 
                                        },
                                        { 
                                            $eq: ["$likedBy", new mongoose.Types.ObjectId(String(req.user._id))] 
                                        },
                                        {
                                            $eq:["$targetType","comment"]
                                        }  
                                    ]
                                }
                            }
                        }
                    ],
                    as: "isLikedData",
                }
            },
            {
                $addFields: { //if isLikedData[] contains data, then add isliked as true else false
                    isLiked: {
                        $cond: { 
                            if: { 
                                $gt: [
                                    { $size: "$isLikedData" },
                                    0
                                ] 
                            }, 
                            then: true, 
                            else: false 
                        }
                    }
                }
            },
            {
                $lookup: { //get the owner doc for each of the comment doc
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                channelName: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: { //store the owner obj from owner[]
                    owner: {
                        $first: "$owner"
                    }
                }
            },
            {
                $lookup: { //get all reply docs for each of the comment doc
                    from: "replies",
                    localField: "_id",
                    foreignField: "comment",
                    as: "repliesCount"
                }
            },
            {
                $addFields: { //calculate & store the no of reply docs for each of the comment doc
                    repliesCount: {
                        $size: "$repliesCount"
                    }
                }
            },
            {
                $project: {
                    content: 1,
                    owner: 1,
                    likesCount: 1,
                    repliesCount: 1,
                    isLiked: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        if(!paginatedComments)
        {
            throw new ApiError(500,"Something went wrong while fetching Paginated Video Comments")
        }

        data={
            totalComments: totalComments.length,
            currentPage: Number(page),
            totalPages,
            paginatedContent:paginatedComments,
        };
    }

    //send the paginatedComments[] as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated Video Comments fetched Successfully"
        )
    );

})

const getTweetComments = asyncHandler(async (req, res) => {

    const {page = 1, limit = 10} = req.query

    //get tweetId from req params
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid Tweet Id");
    }

    //check if the tweet exists or not
    const tweet = await Tweet.findById(tweetId);
    if(!tweet)
    {
        throw new ApiError(400,"Incorrect Tweet Id - Tweet does not exist")
    }

    //get all comments for the tweet
    const totalComments = await Comment.find(
        {
            tweet: tweetId
        }
    );
    if(!totalComments)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Tweet Comments");
    }

    //check if page no. exceeds max page no.
    let totalPages = Math.ceil(totalComments.length / Number(limit));
    if(totalPages < Number(page))
    {
        throw new ApiError(400,"Page Number exceeds Max Page Number");
    }

    //get paginated comments for the tweet
    const paginatedComments = await Comment.aggregate([
        {
            $match: { //get all comment docs for the tweet
                tweet: new mongoose.Types.ObjectId(String(tweetId))
            }
        },
        {   //No of docs to skip
            $skip: (Number(page) - 1) * Number(limit)
        },
        {   //Max No of docs to be fetched
            $limit: Number(limit)
        },
        {
            $lookup: { //get the owner doc for each of the comment doc
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: { //store the owner obj from owner[]
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $lookup: { //get all reply docs for each of the comment doc
                from: "replies",
                localField: "_id",
                foreignField: "comment",
                as: "repliesCount"
            }
        },
        {
            $addFields: { //calculate & store the no of reply docs for each of the comment doc
                repliesCount: {
                    $size: "$repliesCount"
                }
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                likesCount: 1,
                repliesCount: 1
            }
        }
    ]);

    if(!paginatedComments)
    {
        throw new ApiError(500,"Something went wrong while fetching Paginated Tweet Comments")
    }

    //send the paginatedComments[] as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalComments: totalComments.length,
                currentPage: Number(page),
                totalPages,
                paginatedComments,
            },
            "Paginated Tweet Comments fetched Successfully"
        )
    );

})

const addVideoComment = asyncHandler(async (req, res) => {
    
    //fetch videoId from req params
    const { videoId } = req.params
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id");
    }

    //check if the video exists
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Incorrect Video Id - Video does not exist");
    }

    //fetch comment content from req body
    let content;
    if(req.body && req.body.content)
    content = req.body.content;
    if(!content)
    {
        throw new ApiError(400,"Comment Content is required");
    }

    //create entry in db
    const comment = await Comment.create({
        content:content,
        video:videoId,
        owner:req.user._id
    }); 
    if(!comment)
    {
        throw new ApiError(500,"Something went wrong while creating comment document in db");
    }

    //increment comment count by 1 in the video doc
    video.commentsCount = video.commentsCount + 1;
    const savedVideo = await video.save({validateBeforeSave:true});
    if(!savedVideo)
    {
        throw new ApiError(500,"Something went wrong while saving updated video document in db");
    }

    //emit updateCommentCount event
    eventBus.emit("video:updateCommentCount",{id:videoId,data:video.commentsCount});

    //send the comment doc as response
    res.status(201)
    .json(
        new ApiResponse(201,comment,"Comment created Successfully")
    );
})

const addTweetComment = asyncHandler(async (req,res) =>{
    //fetch tweetId from req params
    const { tweetId } = req.params
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid Tweet Id");
    }

    //check if the tweet exists
    const tweet = await Tweet.findById(tweetId);
    if(!tweet)
    {
        throw new ApiError(400,"Incorrect Tweet Id - Tweet does not exist");
    }

    //fetch comment content from req body
    let content;
    if(req.body && req.body.content)
    content = req.body.content;
    if(!content)
    {
        throw new ApiError(400,"Comment Content is required");
    }

    //create entry in db
    const comment = await Comment.create({
        content:content,
        tweet:tweetId,
        owner:req.user._id
    }); 
    if(!comment)
    {
        throw new ApiError(500,"Something went wrong creating comment document in db");
    }

    //send the comment doc as response
    res.status(201)
    .json(
        new ApiResponse(201,comment,"Comment created Successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    
    //fetch commentId from req params
    const { commentId } = req.params
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Invalid comment Id");
    }

    //fetch comment content(to be updated) from req body
    let content;
    if(req.body && req.body.content)
    content = req.body.content;
    if(!content)
    {
        throw new ApiError(400,"Comment Content is missing");
    }

    //check if the comment exists or not
    const comment = await Comment.findById(commentId);
    if(!comment)
    {
        throw new ApiError(400,"Incorrect Comment Id - Comment does not exist")
    }

    //check if the comment owner is current user or not
    if(String(comment.owner)!==String(req.user._id))
    {
        throw new ApiError(400,"Comment is not owned by the Current User");
    }

    //update & save the comment doc
    comment.content = content;
    const updatedComment = await comment.save({validateBeforeSave: false});
    if(!updatedComment)
    {
        throw new ApiError(500,"Something went wrong while updating Comment document");
    }

    //send the updated comment doc as response
    res.status(200)
    .json(
        new ApiResponse(200,updatedComment,"Comment Updated Successfully")
    );

})

const deleteComment = asyncHandler(async (req, res) => {
    
    //fetch commentId from req params
    const { commentId } = req.params
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Invalid comment Id");
    }

    //find & delete the comment doc by id
    const deletedComment = await Comment.findOneAndDelete(
        {
            _id:commentId,
            owner:req.user._id
        }
    );
    if(!deletedComment)
    {
        throw new ApiError(500,"Something went wrong while deleting comment document");
    }

    //find the video doc & decrement the comment count
    const video = await Video.findByIdAndUpdate(
        deletedComment.video,
        {
            $inc: {
                commentsCount: -1
            }
        },
        {new: true}
    );
    if(!video)
    {
        throw new ApiError(200,"Something went wrong while decrementing comment count")
    }

    //delete all the like docs for the comment(including the likes for the comment replies)
    const commentLikes = await Like.deleteMany({
        comment: commentId
    });
    if(!commentLikes)
    {
        throw new ApiError(500,"Something went wrong while deleting comment like documents")
    }

    //delete all the reply docs for the comment
    const commentReplies = await Reply.deleteMany({
        comment: commentId
    });
    if(!commentReplies)
    {
        throw new ApiError(500,"Something went wrong while deleting comment reply documents")
    }

    res.status(200)
    .json(
        new ApiResponse(200,{},"Comment Deleted Successfully")
    );
})

export {
    getVideoComments,
    getTweetComments, 
    addVideoComment,
    addTweetComment, 
    updateComment,
    deleteComment
}