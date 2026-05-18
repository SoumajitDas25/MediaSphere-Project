import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {View} from "../models/view.model.js"
import {Comment} from "../models/comment.model.js"
import { Reply } from "../models/reply.model.js"
import { Like } from "../models/like.model.js"
import { Playlist } from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {fileUpload,generateFileUploadCredentials,deleteFile,deleteVideoFile} from "../utils/cloudinary.js"
import eventBus from "../utils/eventBus.js"

const assetFolderName ="videos";

//TODO
// const getAllVideos = asyncHandler(async (req, res) => {

//     let page,limit,query,sortBy,sortType,userId;
//     if(req.query && (req.query.page && req.query.limit && req.query.query && req.query.sortBy && req.query.sortType && req.query.userId))
//     {
//         page = Number(req.query.page);
//         limit = Number(req.query.limit);
//         query = String(req.query.query);
//         sortBy = String(req.query.sortBy);
//         sortType = String(req.query.sortType);
//         userId = String(req.query.userId);
//     }
//     // console.log(page,limit,query,sortBy,sortType,userId);
//     if(!(page && limit && query && sortBy && sortType && userId))
//     {
//         throw new ApiError(400,"Request Queries are required");
//     }
//     //TODO: get all videos based on query, sort,pagination    
    
//         const matchStage = {
//             $match: {}
//         };
    
//         // Build filter object
//         if (query) {
//             matchStage.$match.$or = [
//                 { title: { $regex: query, $options: 'i' } },
//                 { description: { $regex: query, $options: 'i' } }
//             ];
//         }
//         if (userId) {
//             matchStage.$match.owner = userId;
//         }
    
//         // Build sort object
//         const sortStage = {
//             $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 }
//         };
    
//         // Pagination stages
//         const skipStage = {
//             $skip: (page - 1) * limit
//         };
    
//         const limitStage = {
//             $limit: Number(limit)
//         };
    
//         // Count stage
//         const countStage = {
//             $count: "totalVideos"
//         };

//         // Aggregate pipeline for getting paginated videos
//         const videosPipeline = [
//             matchStage,
//             sortStage,
//             skipStage,
//             limitStage
//         ];
    
//         // Aggregate pipeline for counting total documents
//         const countPipeline = [
//             matchStage,
//             countStage
//         ];
    
//         const videosPromise = Video.aggregate(videosPipeline);
//         const countPromise = Video.aggregate(countPipeline);
    
//         const [videos, totalCount] = await Promise.all([videosPromise, countPromise]);
    
//         const totalVideos = totalCount[0]?.totalVideos || 0;
    
//         res.status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     totalVideos,
//                     currentPage: Number(page),
//                     totalPages: Math.ceil(totalVideos / limit),
//                     videos
//                 },
//                 "Videos Fetched Successfully"
//             )
//         );
// })

const getAllVideos = asyncHandler(async (req,res)=>{

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;
    // console.log(page,limit);


    //get all vidoes
    const totalVideos = await Video.find().countDocuments();
    if(!totalVideos)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Videos");
    }
    if(totalVideos < 1)
    {
        data={
            totalVideos:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalVideos / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        const paginatedVideos = await Video.aggregate([
            {         
                $sort: { //sort the documents with the most recent to least recent
                    createdAt: 1 
                }
            },
            {
                //No. of docs to skip
                $skip: Number(page)<1 ? 0: ((Number(page) - 1) * Number(limit))
            },
            {   //No. of docs to be fetched
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
                                _id: 1,
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
                $project: {
                    thumbnail: 1,
                    title: 1,
                    duration: 1,
                    owner: 1,
                    viewsCount: 1,
                    // likesCount: 1,
                    // commentsCount: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);

        if(!paginatedVideos)
        {
            throw new ApiError(500,"Something went wrong while fetching Video documents")
        }

        data={
            totalVideos: totalVideos,
            currentPage: Number(page),
            totalPages,
            paginatedContent:paginatedVideos,
        };
    }
    
    //send the data as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated Videos fetched Successfully"
        )
    );
});

const getAllUserVideos = asyncHandler(async (req,res)=>{

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;
    // console.log(page,limit);

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

    //get all vidoes for the user
    const totalVideos = await Video.find(
        {
            owner: userId
        }
    );
    if(!totalVideos)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Videos");
    }
    if(totalVideos.length < 1)
    {
        data={
            totalVideos:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalVideos.length / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        const paginatedVideos = await Video.aggregate([
            {
                $match:{ //get the user videos
                    owner: new mongoose.Types.ObjectId(String(userId))
                }
            },
            {         
                $sort: { //sort the documents with the most recent to least recent
                    createdAt: 1 
                }
            },
            {
                //No. of docs to skip
                $skip: Number(page)<1 ? 0: ((Number(page) - 1) * Number(limit))
            },
            {   //No. of docs to be fetched
                $limit: Number(limit)
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
                $project: {
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    owner: 1,
                    viewsCount: 1,
                    // likesCount: 1,
                    // commentsCount: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isPublished:1
                }
            }
        ]);

        if(!paginatedVideos)
        {
            throw new ApiError(500,"Something went wrong while fetching User Video documents")
        }

        data={
            totalVideos: totalVideos.length,
            currentPage: Number(page),
            totalPages,
            paginatedContent:paginatedVideos,
        };
    }
    
    //send the data as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated User Videos fetched Successfully"
        )
    );
})

const getPublishedUserVideos = asyncHandler(async (req,res)=>{

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;
    // console.log(page,limit);

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

    //get all vidoes for the user
    const totalVideos = await Video.find(
        {
            owner: userId,
            isPublished:true
        }
    );
    if(!totalVideos)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Videos");
    }
    if(totalVideos.length < 1)
    {
        data={
            totalVideos:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalVideos.length / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        const paginatedVideos = await Video.aggregate([
            {
                $match:{ //get the user videos
                    owner: new mongoose.Types.ObjectId(String(userId)),
                    isPublished:true
                }
            },
            {         
                $sort: { //sort the documents with the most recent to least recent
                    createdAt: 1 
                }
            },
            {
                //No. of docs to skip
                $skip: Number(page)<1 ? 0: ((Number(page) - 1) * Number(limit))
            },
            {   //No. of docs to be fetched
                $limit: Number(limit)
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
                $project: {
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    owner: 1,
                    viewsCount: 1,
                    // likesCount: 1,
                    // commentsCount: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    isPublished:1
                }
            }
        ]);

        if(!paginatedVideos)
        {
            throw new ApiError(500,"Something went wrong while fetching User Video documents")
        }

        data={
            totalVideos: totalVideos.length,
            currentPage: Number(page),
            totalPages,
            paginatedContent:paginatedVideos,
        };
    }
    
    //send the data as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated User Videos fetched Successfully"
        )
    );
})

const publishAVideo = asyncHandler(async (req, res) => {

    //get video details from req body
    let {title,description,videoMetadata,thumbnailMetadata} = req.body;

    //validation - not empty
    if(!(title && description && videoMetadata && thumbnailMetadata))
    {
        throw new ApiError(400,"All fields are required");
    }
    if(!(videoMetadata.secure_url && videoMetadata.duration && thumbnailMetadata.secure_url))
    {
        throw new ApiError(400,"Video or Thumbnail Metadata is invalid");
    }

    //create entry in db
    const video = await Video.create({
        videoFile: videoMetadata.secure_url,
        thumbnail: thumbnailMetadata.secure_url,
        title: title,
        description: description,
        duration: Math.floor(videoMetadata.duration),
        owner: req.user.id
    });
    if(!video)
    {
        throw new ApiError(500,"Something went wrong while creating video doc entry in db");
    }

    //emit public sync event for updating videoCount
    const updatedVideoCount = await Video.countDocuments({
        owner: req.user._id
    });
    // eventBus.emit("user:updateVideoCount",{id:req.user._id,data:updatedVideoCount});
    eventBus.emit(
        "public:sync",
        {
            id:req.user._id,
            domain:"user",
            action:"update",
            field:"videoCount",
            value:updatedVideoCount
        }
    );

    //emit public sync event for reloading videoList
    // eventBus.emit("user:reloadVideoList",{id:req.user._id,data:'insertOne'});
    eventBus.emit(
        "public:sync",
        {
            id:req.user._id,
            domain:"user",
            action:"reload",
            source:"videoList",
            value:"insertOne"
        }
    );

    //send the video obj as response
    res.status(201)
    .json(
        new ApiResponse(201,video,"Video Published Successfully")
    );
})

const generateVideoUploadCredentials = asyncHandler((req,res)=>{

    //fetch mediaType from req params
    const {mediaType='image'} = req.params;

    //generate upload signature
    const uploadCredentials = generateFileUploadCredentials(mediaType,'videos');

    //send signature data to the frontend
    res.status(200)
    .json(
        new ApiResponse(200,uploadCredentials,"Video Upload Signature Generated Successfully")
    );

})

const getVideoById = asyncHandler(async (req, res) => {
    
    //fetch videoId from req params
    const { videoId } = req.params;
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id");
    }

    //check if the video exists or not
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Incorrect Video Id - Video does not exist");
    }

    //check if user has already viewed this video or not
    const view = await View.findOne({
        $and: [{video:videoId},{viewedBy:req.user._id}]
    });
    if(!view)
    {
        //if user has not viewed this video,then
        // create a view doc
        //increment viewsCount by 1 in the video doc
        const newView = await View.create({
            video:videoId,
            viewedBy: req.user._id
        })
        if(!newView)
        {
            throw new ApiError(500,"Something went wrong while creating view document")
        }
        // video.viewsCount += 1;
        // const savedVideo =await video.save({validateBeforeSave:false});
        const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { viewsCount: 1 } },
        { new: true } // return updated document
        );
        if(!updatedVideo)
        {
            throw new ApiError(500,"Something went wrong while incrementing viewsCount in Video document")
        }
    }

    //find user doc by id
    const user = await User.findById(req.user._id);
    if(!user)
    {
        throw new ApiError(500,"Something went wrong while fetching User document")
    }

    //check if the videoId is present in the watchHistory[] in user doc
    const index = user.watchHistory.indexOf(videoId);
    if(index!== -1)
    {
        //if videoId is present, delete the videoId from its current index
        user.watchHistory.splice(index, 1)[0];
    }
    //push the videoId to watchHistory to the first/top index
    user.watchHistory.unshift(videoId);

    const savedUserdoc = await user.save({validateBeforeSave:false});
    if(!savedUserdoc)
    {
        throw new ApiError(500,"Something went wrong while saving User document");
    }

    const finalVideo = await Video.aggregate([
        {
            $match: { //find the video doc by id
                _id: new mongoose.Types.ObjectId(String(videoId))
            }
        },
        {
            $lookup: { //get the owner obj by id
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
            $lookup: { //get the like doc of the video for the user if it exists
                from: "likes",
                let: { videoId: "$_id" }, // Reference the current videoId
                pipeline: [
                    {
                        $match:{
                            $expr: {
                                $and: [
                                    { 
                                        $eq: ["$video", "$$videoId"] 
                                    },
                                    { 
                                        $eq: ["$likedBy", new mongoose.Types.ObjectId(String(req.user._id))] 
                                    },
                                    {
                                        $eq:["$targetType","video"]
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
            // Only fetch the first playlist doc where it contains the videoId in its videos[]
            $lookup: {
                from: "playlists",
                let: { videoId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $in: ["$$videoId", "$videos"] } } },
                    { $limit: 1 }, // grab only the first playlist doc
                    { $project: { _id: 1 }} // keep it minimal
                ],
                as: "firstPlaylistContainingVideo"
            }
        },
        {
            $addFields: { 
                owner: { //store the first element(obj) of owner[] field
                    $first: "$owner"
                },
                isLiked: { //if isLikedData[] contains data, then add isliked as true else false
                    $cond: { 
                        if: { 
                            $gt: [
                                { $size: "$isLikedData" },0] 
                        }, 
                        then: true, 
                        else: false 
                    }
                },
                isVideoPresentInPlaylist:{
                    //if firstPlaylistContainingVideo[] contains data, then add isVideoPresentInPlaylist as true else false
                    $cond: { 
                        if: { 
                            $gt: [
                                { $size: "$firstPlaylistContainingVideo" },0] 
                        }, 
                        then: true, 
                        else: false 
                    }
                }
            }
        },
        {
            $project: {
                isLikedData: 0,
                firstPlaylistContainingVideo: 0
            }
        }
    ]);
    if(!(finalVideo && finalVideo.length!==0))
    {
        throw new ApiError(500,"Something went wrong while fetching video document");
    }

    //emit updateViewCount event
    // eventBus.emit("video:updateViewCount",{id:videoId,data:finalVideo[0].viewsCount});
    //emit public sync event for updating viewCount
    eventBus.emit(
        "public:sync",
        {
            id:videoId,
            domain:"video",
            action:"update",
            field:"viewCount",
            value:finalVideo[0].viewsCount
        }
    );
    
    //send the video doc as response
    res.status(200)
    .json(
        new ApiResponse(200,finalVideo[0],"Video Fetched Successfully")
    );

})

const updateVideo = asyncHandler(async (req, res) => {

    //fetch videoId from req params
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    //check if the video exists or not
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video does not exist");
    }

    //check if the video owner is current user or not
    if (String(video.owner) !== String(req.user._id)) {
        throw new ApiError(403, "Video is not owned by the current user");
    }

    //Destructure optional fields
    const { title = null, description = null } = req.body;

    const updatePayload = {};

    //store title if present
    if (title !== null && title.trim() !== video.title) {
        updatePayload.title = title.trim();
    }

    //store description if present
    if (description !== null && description.trim() !== video.description) {
        updatePayload.description = description.trim();
    }

    //upload the new thumbnail file to cloudinary if present
    let isOldThumbnailDeleted = false;
    if (req.file && req.file.path) {
        const uploaded = await fileUpload(req.file.path, assetFolderName);
        if (!uploaded) {
            throw new ApiError(500, "Thumbnail upload failed");
        }
        //store thumbnail url
        updatePayload.thumbnail = uploaded.secure_url;

        //delete the old thumbnail file from cloudinary
        const delResponse = await deleteFile(video.thumbnail);
        isOldThumbnailDeleted = !!delResponse;
    }

    //if nothing is present then give an error message
    if (Object.keys(updatePayload).length === 0) 
    {
        throw new ApiError(400, "No changes provided for update");
    }

    //update the video doc with the changed data
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        updatePayload,
        { new: true }
    );

    //send reloadVideoList event
    // eventBus.emit("user:reloadVideoList",{id:req.user._id,data:'current'});
    //emit public sync event for reloading videoList
    eventBus.emit(
        "public:sync",
        {
            id:req.user._id,
            domain:"user",
            action:"reload",
            source:"videoList",
            value:"current"
        }
    );

    if(title)
    //emit public sync event for updating title
    eventBus.broadcast(
        "public:sync",
        req.socketId,
        {
            id:videoId,
            domain:"video",
            action:"update",
            field:"title",
            value: updatedVideo.title
        }
    );
    if(description)
    //emit public sync event for updating description
    eventBus.broadcast(
        "public:sync",
        req.socketId,
        {
            id:videoId,
            domain:"video",
            action:"update",
            field:"description",
            value: updatedVideo.description
        }
    );
    
    res.status(200)
    .json(
        new ApiResponse(
            200, 
            {
            data: updatedVideo,
            isOldThumbnailDeleted
            }, 
            "Video updated successfully"
        )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    
    //fetch videoId from req params
    const { videoId } = req.params
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id");
    }
 
    //find & delete the video doc by id
    const video = await Video.findOneAndDelete(
        {
            _id:videoId,
            owner:req.user._id
        }
    );
    if(!video)
    {
        throw new ApiError(500,"Something went wrong while deleting video document");
    }

    //delete the video & thumbnail file from cloudinary
    const isVideoFileDeleted = await deleteVideoFile(video.videoFile);
    if(!isVideoFileDeleted)
    {
        throw new ApiError(500,"Something went wrong while deleting video file from cloudinary");
    }
    const isthumbnailDeleted = await deleteFile(video.thumbnail);
    if(!isthumbnailDeleted)
    {
        throw new ApiError(500,"Something went wrong while deleting thumbnail file from cloudinary");
    }

    //delete all the like docs for the video(including the likes for the comment & comment replies)
    const videoLikes = await Like.deleteMany({
        video: videoId
    });
    if(!videoLikes)
    {
        throw new ApiError(500,"Something went wrong while deleting like documents")
    }

    //delete all the comment docs for the video
    const videoComments = await Comment.deleteMany({
        video: videoId
    });
    if(!videoComments)
    {
        throw new ApiError(500,"Something went wrong while deleting comment documents")
    }

    //delete all the reply docs for the video
    const videoReplies = await Reply.deleteMany({
        video: videoId
    });
    if(!videoReplies)
    {
        throw new ApiError(500,"Something went wrong while deleting comment reply documents")
    }

    //delete the videoId from all playlists where it exists
    const updatedPlaylists = await Playlist.updateMany(
        { 
            videos: videoId
        },
        { 
            $pull: { videos: videoId } 
        }
    );
    if(!updatedPlaylists)
    {
        throw new ApiError(500,"Something went wrong while updating playlists");
    }

     //delete the videoId from all users watch history where it exists
     const updatedUserWatchHistory = await User.updateMany(
        { 
            watchHistory: videoId
        },
        { 
            $pull: { watchHistory: videoId } 
        }
    );
    if(!updatedUserWatchHistory)
    {
        throw new ApiError(500,"Something went wrong while updating user watch history");
    }
    
    //emit public sync event for updating videoCount
    const updatedVideoCount = await Video.countDocuments({
        owner: req.user._id
    });
    // eventBus.emit("user:updateVideoCount",{id:req.user._id,data:updatedVideoCount})
    eventBus.emit(
        "public:sync",
        {
            id:req.user._id,
            domain:"user",
            action:"update",
            field:"videoCount",
            value:updatedVideoCount
        }
    );
    
    //emit public sync event for reloading videoList
    // eventBus.emit("user:reloadVideoList",{id:req.user._id,data:'deleteOne'});
    eventBus.emit(
        "public:sync",
        {
            id:req.user._id,
            domain:"user",
            action:"reload",
            source:"videoList",
            value:"deleteOne"
        }
    );

    //emit public sync event for deleting video
    eventBus.emit(
        "public:sync",
        {
            id:videoId,
            domain:"video",
            action:"delete"
        }
    );

    res.status(200)
    .json(
        new ApiResponse(200,{},"Video deleted Successfully")
    );

})

const togglePublishStatus = asyncHandler(async (req, res) => {

    //fetch videoId from req params
    const { videoId } = req.params
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id");
    }

    //find & update the tweet
    const updatedVideo = await Video.findOneAndUpdate(
        {
            _id:videoId,
            owner:req.user._id
        },
        [
            { $set: { isPublished: { $not: "$isPublished" } } }
        ],
        {new:true}
    );
    
    //emit public sync event for reloading videoList
    // eventBus.broadcast("user:reloadVideoList",req.socketId,{id:req.user._id,data:'current'});
    eventBus.broadcast(
        "public:sync",
        req.socketId,
        {
            id:req.user._id,
            domain:"user",
            action:"reload",
            source:"videoList",
            value:"current"
        }
    );

    //emit public sync event for updating isPublished
    eventBus.broadcast(
        "public:sync",
        req.socketId,
        {
            id:videoId,
            domain:"video",
            action:"update",
            field:"isPublished",
            value:updatedVideo.isPublished
        }
    );

    res.status(200)
    .json(
        new ApiResponse(200,updatedVideo.isPublished,"Video publish status updated Successfully")
    );
})

export {
    getAllVideos,
    getAllUserVideos,
    getPublishedUserVideos,
    publishAVideo,
    generateVideoUploadCredentials,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}