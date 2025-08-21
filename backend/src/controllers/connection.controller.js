import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Connection } from "../models/connection.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import eventBus from "../utils/eventBus.js"

//controller to toggle subscription of a channel
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
    const isChannelSubscribed = await Connection.findOne({
        $and: [{channel: channelId,subscriber: req.user._id}]
    });
    if(isChannelSubscribed)
    {
        //if the channel is already subscribed, then delete the connection doc
        const connection = await Connection.findByIdAndDelete(isChannelSubscribed._id);
        if(!connection)
        {
            throw new ApiError(500,"Something went wrong while deleting Subscription document");
        }
    }
    else
    {
        //if channel is not subscribed, then create a connection doc
        const connection = await Connection.create({
            subscriber: req.user._id,
            channel: channelId
        });
        if(!connection)
        {
            throw new ApiError(500,"Something went wrong while creating Subscription document");
        }
    }

    //fetch updated owner subscriberCount
    const updatedOwnerSubscribers = await User.aggregate([
        {
            $match:{  //get the user(channel owner) doc
                _id: new mongoose.Types.ObjectId(String(channelId))
            }
        },
        {
            $lookup: {  //get those connection docs where channel = userid i.e., (list of subscribers)
                from: "connections",
                localField: "_id",
                foreignField: "channel",
                as:"subscribers"
            }
        },
        {
            $addFields: {
                subscriberCount: { //calculate the size of subscribers field
                    $size: "$subscribers"
                }
            }
        },
        {
            $project:{ //return only these fields
                subscriberCount: 1
            }
        }
    ]);

    //fetch updated viewer subscriptionCount
    const updatedViewerSubscriptions = await User.aggregate([
        {
            $match:{  //get the user(channel owner) doc
                _id: new mongoose.Types.ObjectId(String(req.user._id))
            }
        },
        {
            $lookup: {  //get those connection docs where subscribers = userid i.e., (list of subscriptions )
                from: "connections",
                localField: "_id",
                foreignField: "subscriber",
                as:"subscriptions"
            }
        },
        {
            $addFields: {
                subscriptionCount: { //calculate the size of subscription field
                    $size: "$subscriptions"
                }
            }
        },
        {
            $project:{ //return only these fields
                subscriptionCount: 1
            }
        }
    ]);
    if(!(updatedOwnerSubscribers && updatedOwnerSubscribers.length!==0 && updatedViewerSubscriptions && updatedViewerSubscriptions.length!==0))
    {
        throw new ApiError(404,"Something went wrong while fetching User Channel");
    }

    //emit updateSubcriberCount event to channel owner room
    eventBus.emit("user:updateSubscriberCount",{id:channelId,data:updatedOwnerSubscribers[0].subscriberCount});
    //emit updateSubcriptionCount event to channel viewer room
    eventBus.emit("user:updateSubscriptionCount",{id:req.user._id,data:updatedViewerSubscriptions[0].subscriptionCount});

    //send a success message as response
    res.status(200)
    .json(
        new ApiResponse(200,{},"Subscription toggled Successfully")
    );

})

// controller to return paginated subscriber list of a channel/user
const getSubscribers = asyncHandler(async (req, res) => {

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;

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

    //get all subscribers for the channel
    const totalSubscribers = await Connection.find(
        {
            channel: channelId
        }
    );
    if(!totalSubscribers)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Subscribers");
    }
    if(totalSubscribers.length < 1)
    {
        data={
            totalSubscribers:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalSubscribers.length / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        //get paginated subscribers for the channel
        const paginatedSubscribers = await Connection.aggregate([
            {
                $match: { //find the connection docs where channel is user whose channelId is passed
                    channel: new mongoose.Types.ObjectId(String(channelId))
                }
            },
            {   //No of docs to skip
                $skip: (Number(page) - 1) * Number(limit)
            },
            {   //Max No of docs to be fetched
                $limit: Number(limit)
            },
            {
                $lookup: { //find the user docs of subscribers 
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "channelDetails",
                    pipeline: [
                        {
                            $lookup: {  //get those connection docs where channel = ownerid i.e., (list of subscribers)
                                from: "connections",
                                localField: "_id",
                                foreignField: "channel",
                                as:"subscribers"
                            }
                        },
                        {
                            $addFields: {
                                subscribersCount: { //calculate the size of subscribers field
                                    $size: "$subscribers"
                                },
                                isSubscribed: { //check whether user/viewer has subscribed to the owner's channel
                                    $cond: {
                                        if: {$in: [req.user._id,"$subscribers.subscriber"]},
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        },
                        {
                            $project: { //include only these fields
                                _id:1,
                                username: 1,
                                channelName: 1,
                                avatar: 1,
                                subscribersCount: 1,
                                isSubscribed: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: { //store the first element(obj) of subscriberDetails[] field
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
        if(!paginatedSubscribers)
        {
            throw new ApiError(500,"Something went wrong while fetching subscribers documents");
        }

        data={
            totalSubscribers: totalSubscribers.length,
            currentPage: Number(page),
            totalPages,
            paginatedContent:paginatedSubscribers,
        };
    }

    //send the paginatedSubscribers[] as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated User Channel Subscribers Fetched Successfully"
        )
    );
})

// controller to return paginated subscription list for a subscriber/user
const getSubscriptions = asyncHandler(async (req, res) => {

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;   

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

    //get all subscriptions for the subscriber
    const totalSubscriptions = await Connection.find(
        {
            subscriber: subscriberId
        }
    );
    if(!totalSubscriptions)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Subscriptions");
    }
    if(totalSubscriptions.length < 1)
    {
        data={
            totalSubscriptions:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalSubscriptions.length / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        //get paginated subscriptions(channels) for the subscriber
        const paginatedSubscriptions = await Connection.aggregate([
            {
                $match: { //find the connection docs where subscriber is user whose subscriberId is passed
                    subscriber: new mongoose.Types.ObjectId(String(subscriberId))
                }
            },
            {   //No of docs to skip
                $skip: (Number(page) - 1) * Number(limit)
            },
            {   //Max No of docs to be fetched
                $limit: Number(limit)
            },
            {
                $lookup: { //find the user docs of channel owners 
                    from: "users",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelDetails",
                    pipeline: [
                        {
                            $lookup: {  //get those connection docs where channel = ownerid i.e., (list of subscribers)
                                from: "connections",
                                localField: "_id",
                                foreignField: "channel",
                                as:"subscribers"
                            }
                        },
                        {
                            $addFields: {
                                subscribersCount: { //calculate the size of subscribers field
                                    $size: "$subscribers"
                                },
                                isSubscribed: { //check whether user/viewer has subscribed to the owner's channel
                                    $cond: {
                                        if: {$in: [req.user._id,"$subscribers.subscriber"]},
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        },
                        {
                            $project: { //include only these fields
                                _id:1,
                                username: 1,
                                channelName: 1,
                                avatar: 1,
                                subscribersCount: 1,
                                isSubscribed: 1
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
        if(!paginatedSubscriptions)
        {
            throw new ApiError(500,"Something went wrong while fetching subscriptions documents");
        }

        data={
            totalSubscriptions: totalSubscriptions.length,
            currentPage: Number(page),
            totalPages,
            paginatedContent:paginatedSubscriptions,
        };
    }
    
    //send the paginatedSubscriptions[] as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated User Channel Subscriptions Fetched Successfully"
        )
    );
})

export {
    toggleSubscription,
    getSubscribers,
    getSubscriptions
}
