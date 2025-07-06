import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {Comment} from "../models/comment.model.js"
import { Reply } from "../models/reply.model.js"
import { Like } from "../models/like.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    //get tweet content from req body
    let content;
    if(req.body && req.body.content)
    content = req.body.content;
    if(!content)
    {
        throw new ApiError(400,"Tweet content is required");
    }

    //create entry in db
    const tweet = await Tweet.create({
        owner:req.user._id,
        content:content
    })
    if(!tweet)
    {
        throw new ApiError(500,"Something went wrong while creating tweet document");
    }

    //send the tweet document as response
    res.status(201)
    .json(
        new ApiResponse(201,tweet,"Tweet Published Sucessfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;

    //get userId from req params
    const {userId} = req.params;
    if(!isValidObjectId(userId))
    {
        throw new ApiError(400,"Invalid User Id");
    }

    //check if the user exists or not
    const user = await User.findById(userId);
    if(!user)
    {
        throw new ApiError(400,"Incorrect User Id - User does not exist")
    }

    //get all tweets for the user
    const totalTweets = await Tweet.find(
        {
            owner: userId
        }
    );
    if(!totalTweets)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Tweets");
    }
    if(totalTweets.length < 1)
    {
        data={
            totalTweets:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalTweets.length / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        //get paginated tweets for the user
        const paginatedTweets = await Tweet.aggregate([
            {
                $match: { //get all tweet docs with owner as user
                    owner: new mongoose.Types.ObjectId(String(userId))
                }
            },
            {   //No of docs to skip
                $skip: (Number(page) - 1) * Number(limit)
            },
            {   //Max No of docs to be fetched
                $limit: Number(limit)
            },
            {
                $lookup: { //get the like doc of the tweet for the user if it exists
                    from: "likes",
                    let: { tweetId: "$_id" }, // Reference the current tweetId
                    pipeline: [
                        {
                            $match:{
                                $expr: {
                                    $and: [
                                        { 
                                            $eq: ["$tweet", "$$tweetId"] 
                                        },
                                        { 
                                            $eq: ["$likedBy", new mongoose.Types.ObjectId(String(req.user._id))] 
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
                $addFields: { //add the owner info to each document
                    owner: {
                        _id: user._id,
                        username: user.username,
                        channelName: user.channelName,
                        avatar: user.avatar
                    }
                }
            },
            {
                $lookup: { //get all comment docs for each of the tweet doc
                    from: "comments",
                    localField: "_id",
                    foreignField: "tweet",
                    as: "commentsCount"
                }
            },
            {
                $addFields: { //calcuate & store the no of comment docs for each of the tweet doc
                    commentsCount: {
                        $size: "$commentsCount"
                    }
                }
            },
            {
                $project: {
                    content: 1,
                    owner: 1,
                    isLiked: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
        if(!paginatedTweets)
        {
            throw new ApiError(500,"Something went wrong while fetching tweet documents")
        }

        data={
            totalTweets: totalTweets.length,
            currentPage: Number(page),
            totalPages,
            paginatedContent:paginatedTweets,
        };
    }

    //send the paginatedTweets[] as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated User Tweets fetched Successfully"
        )
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    
    //get tweetId from req params
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid Tweet Id");
    }

    //fetch tweet content(to be updated) from req body
    let content;
    if(req.body && req.body.content)
    content = req.body.content;
    if(!content)
    {
        throw new ApiError(400,"Tweet Content is missing");
    }

    //find & update the reply doc by id & owner
    const updatedTweet = await Tweet.findOneAndUpdate(
        {
            _id:tweetId,
            owner:req.user._id
        },
        {
            content:content
        },
        {new:true}
    );
    if(!updatedTweet)
    {
        throw new ApiError(500,"Something went wrong while updating Tweet document");
    }

    //send the updated tweet doc as response
    res.status(200)
    .json(
        new ApiResponse(200,updatedTweet,"Tweet Updated Successfully")
    );

})

const deleteTweet = asyncHandler(async (req, res) => {

    //get tweetId from req params
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId))
    {
        throw new ApiError(400,"Invalid Tweet Id");
    }

     //find & delete the tweet doc by id & owner
     const deletedTweet = await Tweet.findOneAndDelete(
        {
            _id:tweetId,
            owner:req.user._id
        }
    );
    if(!deletedTweet)
    {
        throw new ApiError(500,"Something went wrong while deleting Tweet document");
    }

    //delete all the like docs for the tweet(including the likes for the comment & comment replies)
    const tweetLikes = await Like.deleteMany({
        tweet: tweetId
    });
    if(!tweetLikes)
    {
        throw new ApiError(500,"Something went wrong while deleting like documents")
    }

    //delete all the comment docs for the tweet
    const tweetComments = await Comment.deleteMany({
        tweet: tweetId
    });
    if(!tweetComments)
    {
        throw new ApiError(500,"Something went wrong while deleting comment documents")
    }

    //delete all the reply docs for the tweet
    const tweetReplies = await Reply.deleteMany({
        tweet: tweetId
    });
    if(!tweetReplies)
    {
        throw new ApiError(500,"Something went wrong while deleting comment reply documents")
    }

    res.status(200)
    .json(
        new ApiResponse(200,{},"Tweet Deleted Successfully")
    );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
