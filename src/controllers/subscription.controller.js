import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {

    //fetch channelId(id of channel owner) from req params
    const {channelId} = req.params;
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400,"Invalid Channel Id");
    }

    //check if the channel is Logged User itself or not
    if(channelId === String(req.user._id))
    {
        throw new ApiError(400,"User cannot subscribe to his own channel");
    }
    
    //Check if the channel(user) exist or not
    const channel = await User.findById(channelId);
    if(!channel)
    {
        throw new ApiError(400,"Incorrect Channel Id - Channel does not exist");
    }

    //Check if the channel is already subscribed or not
    const isChannelSubscribed = await Subscription.findOne({
        $and: [{channel: channelId,subscriber: req.user._id}]
    });
    if(isChannelSubscribed)
    {
        //if the channel is already subscribed, then delete the subscription doc
        const channel = await Subscription.findByIdAndDelete(isChannelSubscribed._id);
        if(!channel)
        {
            throw new ApiError(500,"Something went wrong while deleting Subscription document");
        }
    }
    else
    {
        //if channel is not subscribed, then create a subscription doc
        const channel = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        });
        if(!channel)
        {
            throw new ApiError(500,"Something went wrong while creating Subscription document");
        }
    }

    res.status(200)
    .json(
        new ApiResponse(200,{},"Subscription toggled Successfully")
    );

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    //fetch channelId(id of channel owner) from req params
    const {channelId} = req.params;
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400,"Invalid Channel Id");
    }
    
    //Check if the channel(user) exist or not
    const channel = await User.findById(channelId);
    if(!channel)
    {
        throw new ApiError(400,"Incorrect Channel Id - Channel does not exist");
    }

    //find the list of subscribers for the channel
    const subscribers = await Subscription.aggregate([
        {
            $match: { //find the subscription docs where channel is user whose channelId is passed
                channel: new mongoose.Types.ObjectId(String(channelId))
            }
        },
        {
            $lookup: { //find the user docs of subscribers 
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    {
                        $project: { //include only these fields
                            username: 1,
                            fullName: 1,
                            email: 1,
                            avatar: 1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: { //store the first element(obj) of subscriberDetails[] field
                subscriberDetails: {
                    $first: "$subscriberDetails"
                }
            }
        },
        {
            $project: { //include only this field
                subscriberDetails: 1
            }
        }
    ]);
    if(!subscribers)
    {
        throw new ApiError(500,"Something went wrong while fetching subscribers documents");
    }

    //send the subscribers[] as response
    res.status(200)
    .json(
        new ApiResponse(200,subscribers,"User Channel Subscribers Fetched Successfully")
    );

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

        //fetch subscriberId(id of channel owner) from req params
        const {subscriberId} = req.params;
        if(!isValidObjectId(subscriberId))
        {
            throw new ApiError(400,"Invalid User Id");
        }
        
        //Check if the subscriber(user) exist or not
        const subscriber = await User.findById(subscriberId);
        if(!subscriber)
        {
            throw new ApiError(400,"Incorrect Subscriber Id - Subscriber does not exist");
        }
    
        //find the list of channels where he has subscribed
        const channels = await Subscription.aggregate([
            {
                $match: { //find the subscription docs where subscriber is user whose subscriberId is passed
                    subscriber: new mongoose.Types.ObjectId(String(subscriberId))
                }
            },
            {
                $lookup: { //find the user docs of channel owners 
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelDetails",
                    pipeline: [
                        {
                            $project: { //include only these fields
                                username: 1,
                                fullName: 1,
                                email: 1,
                                avatar: 1,
                                coverImage: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: { //store the first element(obj) of channelDetails[] field
                    channelDetails: {
                        $first: "$channelDetails"
                    }
                }
            },
            {
                $project: { //include only this field
                    channelDetails: 1
                }
            }
        ]);
        if(!channels)
        {
            throw new ApiError(500,"Something went wrong while fetching channels documents");
        }
    
        //send the channels[] as response
        res.status(200)
        .json(
            new ApiResponse(200,channels,"User Subscribed Channels Fetched Successfully")
        );

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
