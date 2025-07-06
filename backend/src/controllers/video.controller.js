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
import {fileUpload,deleteFile,deleteVideoFile, fileUploadWithProgressTracking} from "../utils/cloudinary.js"
import { deleteTempFiles, getAbsoluteFilePath } from "../utils/FileHandler.js"
import {uploadEmitters} from "../sockets/emitters/index.js";

const assetFolderName ="videos";

//TODO
const getAllVideos = asyncHandler(async (req, res) => {

    let page,limit,query,sortBy,sortType,userId;
    if(req.query && (req.query.page && req.query.limit && req.query.query && req.query.sortBy && req.query.sortType && req.query.userId))
    {
        page = Number(req.query.page);
        limit = Number(req.query.limit);
        query = String(req.query.query);
        sortBy = String(req.query.sortBy);
        sortType = String(req.query.sortType);
        userId = String(req.query.userId);
    }
    // console.log(page,limit,query,sortBy,sortType,userId);
    if(!(page && limit && query && sortBy && sortType && userId))
    {
        throw new ApiError(400,"Request Queries are required");
    }
    //TODO: get all videos based on query, sort,pagination    
    
        const matchStage = {
            $match: {}
        };
    
        // Build filter object
        if (query) {
            matchStage.$match.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }
        if (userId) {
            matchStage.$match.owner = userId;
        }
    
        // Build sort object
        const sortStage = {
            $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 }
        };
    
        // Pagination stages
        const skipStage = {
            $skip: (page - 1) * limit
        };
    
        const limitStage = {
            $limit: Number(limit)
        };
    
        // Count stage
        const countStage = {
            $count: "totalVideos"
        };

        // Aggregate pipeline for getting paginated videos
        const videosPipeline = [
            matchStage,
            sortStage,
            skipStage,
            limitStage
        ];
    
        // Aggregate pipeline for counting total documents
        const countPipeline = [
            matchStage,
            countStage
        ];
    
        const videosPromise = Video.aggregate(videosPipeline);
        const countPromise = Video.aggregate(countPipeline);
    
        const [videos, totalCount] = await Promise.all([videosPromise, countPromise]);
    
        const totalVideos = totalCount[0]?.totalVideos || 0;
    
        res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalVideos,
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalVideos / limit),
                    videos
                },
                "Videos Fetched Successfully"
            )
        );
})

const getPaginatedUserVideos = asyncHandler(async (req,res)=>{

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;
    console.log(page,limit);

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
    let title,description;
    if(req.body.title && req.body.description)
    {
        title = req.body.title
        description = req.body.description
    }
    //get local paths of video & thumbail
    let videoLocalPath,thumbnailLocalPath;
    if(req.files && (Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) && (Array.isArray(req.files.thumbnailFile) && req.files.thumbnailFile.length > 0))
    {
        videoLocalPath = req.files.videoFile[0].path;
        thumbnailLocalPath = req.files.thumbnailFile[0].path;
    }
    if(!(videoLocalPath && thumbnailLocalPath))
    {
        deleteTempFiles(req.files);
        throw new ApiError(400,"Video file & thumbnail is required");
    }
    if(!(title && description))
    {
        deleteTempFiles(req.files);
        throw new ApiError(400,"Video title & description are required");
    }
    
    //upload to cloudinary with progress tracking
    const videoFile = await fileUploadWithProgressTracking(videoLocalPath,req.files.videoFile[0].size,1,assetFolderName,req.socketId);     
    if(!videoFile) //upload unsuccessful 
    {
        throw new ApiError(500,"Video file upload failed");
    }
    const thumbnail = await fileUploadWithProgressTracking(thumbnailLocalPath,req.files.thumbnailFile[0].size,2,assetFolderName,req.socketId);
    if(!thumbnail) //upload unsuccessful 
    {
        throw new ApiError(500,"Thumbnail file upload failed");
    }

    //create entry in db
    const video = await Video.create({
        videoFile: videoFile.secure_url,
        thumbnail: thumbnail.secure_url,
        title: title,
        description: description,
        duration: Math.floor(videoFile.duration),
        owner: req.user.id
    });
    if(!video)
    {
        throw new ApiError(500,"Something went wrong while creating video doc entry in db");
    }

    //send the uploadComplete event to the client
    const {emitUploadComplete} = uploadEmitters;
    emitUploadComplete(req.user._id);

    //send the video obj as response
    res.status(201)
    .json(
        new ApiResponse(201,{},"Video Published Successfully")
    );
})

const getVideoById = asyncHandler(async (req, res) => {
    
    //fetch videoId from req params
    const { videoId } = req.params;
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id");
    }

    //get video doc by id
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Incorrect Tweet Id - Tweet does not exist");
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
        video.viewsCount += 1;
        const savedVideo =await video.save({validateBeforeSave:false});
        if(!savedVideo)
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
    
    //send the video doc as response
    res.status(200)
    .json(
        new ApiResponse(200,video,"Video Fetched Successfully")
    );

})

const updateVideo = asyncHandler(async (req, res) => {

    //fetch videoId from req params
    const { videoId } = req.params
    if(!isValidObjectId(videoId))
    {
        throw new ApiError(400,"Invalid Video Id");
    }

    //get video details(to be updated) from req body
    let title,description;
    if(req.body && (req.body.title && req.body.description))
    {
        title = req.body.title;
        description = req.body.description;
    }
    if(!(title && description))
    {
        throw new ApiError(400,"Video title or description is missing");
    }

    //find the video doc by id
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(500,"Incorrect Video Id - Video does not exist");
    }

    //check if the video owner is current user or not
    if(String(video.owner)!==String(req.user._id))
    {
        throw new ApiError(400,"Video is not owned by the current user");
    }

    //upload the new thumbnail file to cloudinary
    let thumbnailLocalPath;
    if(req.file && req.file.path)
    thumbnailLocalPath = req.file.path;
    if(!thumbnailLocalPath)
    {
        throw new ApiError(400,"Video thumbnail is missing");
    }
    const thumbnail = await fileUpload(thumbnailLocalPath,assetFolderName);       
    if(!thumbnail) //upload unsuccessful 
    {
        throw new ApiError(500,"Video file upload failed");
    }

    //store the old thumbnail url
    const oldThumbnailUrl = video.thumbnail;

    //update the video doc
    video.title = title;
    video.description = description;
    video.thumbnail = thumbnail.secure_url;

    //save the video doc
    const updatedVideo = await video.save({validateBeforeSave: false});

    //delete the old thumbnail file from cloudinary
    const response = await deleteFile(oldThumbnailUrl);
    let isOldThumbnailDeleted;
    if(response)
    isOldThumbnailDeleted=true;
    else
    isOldThumbnailDeleted=false;

    //send the updated video doc as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                data:updatedVideo,
                isOldThumbnailDeleted
            },
            "Video details updated Successfully")
    );

})

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
    if(!updatedPlaylists)
    {
        throw new ApiError(500,"Something went wrong while updating user watch history");
    }

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

    //find the video doc by id
    const video = await Video.findByIdAndUpdate(videoId);
    if(!video)
    {
        throw new ApiError(500,"Something went wrong while fetching video document");
    }

    //update the publish status of video
    video.isPublished = !video.isPublished;

    //save the video doc
    video.save({validateBeforeSave: false});

    res.status(200)
    .json(
        new ApiResponse(200,video,"Video publish status updated Successfully")
    );
})

export {
    getAllVideos,
    getPaginatedUserVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}