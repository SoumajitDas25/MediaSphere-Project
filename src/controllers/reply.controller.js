import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Reply } from "../models/reply.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const addVideoCommentReply = asyncHandler(async (req,res) => {

    //fetch commentId from req params
    const {commentId,repliedToId} = req.params;
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Invalid Comment Id");
    }
    if(!isValidObjectId(repliedToId))
    {
        throw new ApiError(400,"Invalid Reply Id");
    }

    //check if the comment exist or not
    const comment = await Comment.findById(commentId);
    if(!comment)
    {
        throw new ApiError(400,"Incorrect Comment Id - Comment does not exist");
    }

    //check if the video field exist or not
    if(!(comment.video && comment.video!='' && isValidObjectId(comment.video)))
    {
        throw new ApiError(400,"Video Comment does not exist");
    }

    //fetch reply details from req body
    let content;
    if(req.body && req.body.content)
    {
        content = req.body.content;
    }
    if(!content)
    {
        throw new ApiError(400,"Reply content is required");
    }

    //create entry in db
    const reply = await Reply.create({
        video: comment.video,
        comment: commentId,
        repliedTo: repliedToId,
        owner: req.user._id,
        content: content
    });
    if(!reply)
    {
        throw new ApiError(500,"Something went wrong while creating entry in db");
    }

    //push the replyId to the replies[] in the comment doc
    comment.replies.push(reply._id);
    const updatedComment = await comment.save({vaidateBeforeSave:false});
    if(!updatedComment)
    {
        throw new ApiError(500,"Something went wrong while updating comment document");
    }

    //send the reply doc as response
    res.status(201)
    .json(
        new ApiResponse(201,reply,"Reply Added Successfully")
    )

});

const addTweetCommentReply = asyncHandler(async (req,res) => {

    //fetch commentId from req params
    const {commentId,repliedToId} = req.params;
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Invalid Comment Id");
    }
    if(!isValidObjectId(repliedToId))
    {
        throw new ApiError(400,"Invalid Reply Id");
    }

    //check if the comment exist or not
    const comment = await Comment.findById(commentId);
    if(!comment)
    {
        throw new ApiError(400,"Incorrect Comment Id - Comment does not exist");
    }

    //check if the tweet field exist or not
    if(!(comment.tweet && comment.tweet!='' && isValidObjectId(comment.tweet)))
    {
        throw new ApiError(400,"Tweet Comment does not exist");
    }

    //fetch reply details from req body
    let content;
    if(req.body && req.body.content)
    {
        content = req.body.content;
    }
    if(!content)
    {
        throw new ApiError(400,"Reply content is required");
    }

    //create entry in db
    const reply = await Reply.create({
        tweet: comment.tweet,
        comment: commentId,
        repliedTo: repliedToId,
        owner: req.user._id,
        content: content
    });
    if(!reply)
    {
        throw new ApiError(500,"Something went wrong while creating entry in db");
    }

    //push the replyId to the replies[] in the comment doc
    comment.replies.push(reply._id);
    const updatedComment = await comment.save({vaidateBeforeSave:false});
    if(!updatedComment)
    {
        throw new ApiError(500,"Something went wrong while updating comment document");
    }

    //send the reply doc as response
    res.status(201)
    .json(
        new ApiResponse(201,reply,"Reply Added Successfully")
    )

});

const getCommentReplies = asyncHandler(async (req,res) =>{

    //fetch commentId from req params
    const {commentId} = req.params;
    if(!isValidObjectId(commentId))
    {
        throw new ApiError(400,"Invalid Comment Id");
    }

    //get all reply docs for the comment
    const replies = await Reply.aggregate([
        {
            $match: { //get all reply docs for the comment
                comment: new mongoose.Types.ObjectId(String(commentId))
            }
        },
        {
            $lookup: { //get the owner doc for each of the reply doc
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: { //include only these fields
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { //store the owner obj from owner[]
                    $first: "$owner"
                }
            }
        },
        {
            $lookup: { //get the repliedTo doc for each of the reply doc
                from: "users",
                localField: "repliedTo",
                foreignField: "_id",
                as: "repliedTo",
                pipeline: [
                    {
                        $project: { //include only these fields
                            fullName: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                repliedTo: { //store the repliedTo obj from repliedTo[]
                    $first: "$repliedTo"
                }
            }
        },
        {
            $project: { //include only these fields
                repliedTo: 1,
                owner: 1,
                content: 1,
                likesCount: 1
            }
        }
    ]);
    if(!replies)
    {
        throw new ApiError(500,"Something went wrong while fetching Comment Replies");
    }

    //send the replies[] as response
    res.status(200)
    .json(
        new ApiResponse(200,replies,"Comment Replies fetched Sucessfully")
    );

});

const updateReply = asyncHandler(async (req,res) =>{

    //fetch replyId from req params
    const {replyId} = req.params;
    if(!isValidObjectId(replyId))
    {
        throw new ApiError(400,"Invalid Reply Id");
    }

    //fetch reply content(to be updated) from req body
    let content;
    if(req.body && req.body.content)
    {
        content = req.body.content;
    }
    if(!content)
    {
        throw new ApiError(400,"Reply Content is missing");
    }

    //find & update the reply doc by id & owner
    const updatedReply = await Reply.findOneAndUpdate(
        {
            _id:replyId,
            owner:req.user._id
        },
        {
            content:content
        },
        {new:true}
    );
    if(!updatedReply)
    {
        throw new ApiError(500,"Something went wrong while updating Reply document");
    }

    //send the updatedReply doc as response
    res.status(200)
    .json(
        new ApiResponse(200,updatedReply,"Reply Updated Successfully")
    );    

});

const deleteReply = asyncHandler(async (req,res) =>{

    //fetch replyId from req params
    const {replyId} = req.params;
    if(!isValidObjectId(replyId))
    {
        throw new ApiError(400,"Invalid Reply Id");
    }

     //find & delete the reply doc by id & owner
     const deletedReply = await Reply.findOneAndDelete(
        {
            _id:replyId,
            owner:req.user._id
        }
    );
    if(!deletedReply)
    {
        throw new ApiError(500,"Something went wrong while deleting Reply document");
    }

    //find the comment doc for the reply
    const comment = await Comment.findById(deletedReply.comment);

    //remove the replyId from replies[] in the comment doc
    comment.replies.splice(comment.replies.indexOf(replyId),1);

    const updatedComment = await comment.save({validateBeforeSave:false});
    if(!updatedComment)
    {
        throw new ApiError(500,"Something went wrong while updating Comment document");
    }

    //delete all the like docs for the reply
    const replyLikes = await Like.deleteMany({
            reply: replyId
    });
    if(!replyLikes)
    {
        throw new ApiError(500,"Something went wrong while deleting reply like documents")
    }

    res.status(200)
    .json(
        new ApiResponse(200,{},"Reply Deleted Successfully")
    ); 
});

export {
    addVideoCommentReply,
    addTweetCommentReply,
    getCommentReplies,
    updateReply,
    deleteReply
}