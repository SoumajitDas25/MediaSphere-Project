import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import eventBus from "../utils/eventBus.js"


const createPlaylist = asyncHandler(async (req, res) => {

    //fetch playlist details from req body
    let name,description;
    if(req.body && (req.body.name && req.body.description))
    {
        name = req.body.name;
        description = req.body.description;    
    }
    if(!(name && description))
    {
        throw new ApiError(400,"Playlist name & description are required");
    }

    //create entry in db
    const playlist = await Playlist.create({
        name:name,
        description: description,
        owner: req.user._id
    });
    if(!playlist)
    {
        throw new ApiError(500,"Something went wrong while creating Playlist document");
    }

    //send the playlist document as response
    res.status(201)
    .json(
        new ApiResponse(201,playlist,"Playlist created Successfully")
    );

})

const getPaginatedUserPlaylists = asyncHandler(async (req, res) => {

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9,videoId = null} = req.query;

    //fetch userId from req params
    const {userId} = req.params;
    if(!isValidObjectId(userId))
    {
        throw new ApiError(400,"Invalid Object Id");
    }

    //check if the user exists or not
    const user = await User.findById(userId);
    if(!user)
    {
        throw new ApiError(400,"Incorrect User Id - User does not exist");
    }

    //get all playlists for the user
    const totalPlaylists = await Playlist.find(
        {
            owner: userId
        }
    );
    if(!totalPlaylists)
    {
        throw new ApiError(500,"Something went wrong while fetching Total User Playlists");
    }
    if(totalPlaylists.length < 1)
    {
        data={
            totalPlaylists:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalPlaylists.length / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        //get paginated playlists for the user
        // const paginatedPlaylists = await Playlist.aggregate([
        //     {
        //         $match: { //get the user playlist docs
        //             owner: new mongoose.Types.ObjectId(String(userId))
        //         }
        //     },
        //     {   //No of docs to skip
        //         $skip: (Number(page) - 1) * Number(limit)
        //     },
        //     {   //Max No of docs to be fetched
        //         $limit: Number(limit)
        //     },
        //     {
        //         $lookup: { //get the video docs in the playlist
        //             from: "videos",
        //             localField: "videos",
        //             foreignField: "_id",
        //             as: "videos"
        //         }
        //     },
        //     { 
        //     $addFields: { //count the videos docs in the playlists
        //             videosCount: {
        //                 $size: "$videos" 
        //             }
        //     }
        //     },
        //     {
        //         $addFields: { //add the owner info to each doc
        //             owner: {
        //                 _id: user._id,
        //                 username: user.username,
        //                 channelName: user.channelName,
        //                 avatar: user.avatar
        //             }
        //         }
        //     },
        //     {
        //         $addFields:{ //to store the thumbnail of first video obj from vidoes[]
        //             thumbnail: {
        //                 $cond: {
        //                     if: { 
        //                         $gt: [{ $size: "$videos" }, 0] 
        //                     }, // Check if the videos array has at least one video doc
        //                     then: { 
        //                         $first: "$videos.thumbnail"
        //                     }, // Get the thumbnail of the first video doc
        //                     else: null // Set to null if no video docs are found
        //                 }
        //             }
        //         }
        //     },
        //     {

        //     },
        //     {
        //         $project:{ //exclude the videos[] from each doc
        //             videos: 0 
        //         }
        //     }
        // ]);
        const pipeline = [
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(String(userId))
                }
            },
            {
                $skip: (Number(page) - 1) * Number(limit)
            },
            {
                $limit: Number(limit)
            },
            {
                // Only fetch the first video doc (for thumbnail)
                $lookup: {
                    from: "videos",
                    let: { videoIds: "$videos" },
                    pipeline: [
                        { $match: { $expr: { $in: ["$_id", "$$videoIds"] } } },
                        { $limit: 1 }, // grab only the first video doc
                        { $project: { _id: 1, thumbnail: 1 } } // keep it minimal
                    ],
                    as: "firstVideo"
                }
            },
            {
                // Add fields (videosCount, owner, thumbnail)
                $addFields: {
                    videosCount: { $size: "$videos" },
                    owner: {
                        _id: user._id,
                        username: user.username,
                        channelName: user.channelName,
                        avatar: user.avatar
                    },
                    thumbnail: {
                        $cond: {
                            if: { $gt: [{ $size: "$firstVideo" }, 0] },
                            then: { $first: "$firstVideo.thumbnail" },
                            else: null
                        }
                    }
                }
            },
            // ✅ Conditionally add isPresent only if videoId is passed
            ...(videoId
                ? [
                    {
                        $addFields: {
                            isVideoPresent: {
                                $in: [new mongoose.Types.ObjectId(String(videoId)), "$videos"]
                            }
                        }
                    }
                ]
                : []),
            {
                $project: {
                    firstVideo: 0,
                    videos: 0
                }
            }
        ];

        const paginatedPlaylists = await Playlist.aggregate(pipeline);
        if(!paginatedPlaylists)
        {
            throw new ApiError(500,"Something went wrong while fetching playlist documents");
        }

        data={
            totalPlaylists: totalPlaylists.length,
            currentPage: Number(page),
            totalPages,
            paginatedContent:paginatedPlaylists,
        };
    }

    //send the paginatedPlaylists[] as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated User Playlists fetched Successfully"
        )
    );

})

const getPlaylistInfoById = asyncHandler(async (req,res)=>{

    //fetch playlistId from req params
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Invalid Playlist Id");
    }

    //get the playlist info
    const playlistInfo = await Playlist.aggregate([
        {
            $match:{ //get the playlist doc by id
                _id: new mongoose.Types.ObjectId(String(playlistId))
            }
        },
        { 
            $addFields: { //count the videos in the playlists
                 videosCount: {
                     $size: "$videos" 
                 }
            }
         },
         {
            $lookup:{ // get the owner info
                from:"users",
                foreignField:"_id",
                localField:"owner",
                as:"owner",
                pipeline:[{
                    $project:{
                        avatar:1,
                        username:1,
                        channelName:1
                    }
                }]
            }
         },
         {
            $addFields: { //store the first element(obj) of owner[] field
                owner: {
                    $first: "$owner"
                }
            }
         },
         {
            $addFields: {
                firstVideo:{
                    $first: "$videos"
                }
            }
         },
         {
            $lookup:{
                from:"videos",
                foreignField:"_id",
                localField:"firstVideo",
                as:"firstVideo",
                pipeline:[
                    {
                        $project:{ //return only thumbnail
                            thumbnail:1
                        }
                    }
                ]
            }
         },
        {
            $addFields:{ //to store the thumbnail of first video obj from vidoes[]
                thumbnail: {
                    $cond: {
                        if: { 
                            $gt: [{ $size: "$videos" }, 0] 
                        }, // Check if the videos array has at least one video doc
                        then: { 
                            $first: "$firstVideo.thumbnail"
                        }, // Get the thumbnail of the first video doc
                        else: null // Set to null if no video docs are found
                    }
                }
            }
        },
         {
            $project: {
                videos: 0,
                firstVideo: 0
            }
         }
    ])
    if(!playlistInfo)
    {
        throw new ApiError(400,"Incorrect Playlist Id - Playlist does not exist");
    }

    //send the Playlist info as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            // {
                // name: playlist.name,
                // description: playlist.description,
                // owner: playlist.owner,
                playlistInfo[0]
            // }
            ,
            "Playlist Thumbnail fetched Successfully")
    );

})

const getPlaylistVideosById = asyncHandler(async (req, res) => {

    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;

    //fetch playlistId from req params
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Invalid Playlist Id");
    }

    //check if the playlist exists or not
    const playlist = await Playlist.findById(playlistId);
    if(!playlist)
    {
        throw new ApiError(400,"Incorrect Playlist Id - Playlist does not exist");
    }

    //get all videos for the playlist
    const totalPlaylistVideos = playlist.videos.length;

    if(!totalPlaylistVideos)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Playlists Videos");
    }

    //check if page no. exceeds max page no.
    let totalPages = Math.ceil(totalPlaylistVideos / Number(limit));
    if(totalPages < Number(page))
    {
        throw new ApiError(400,"Page Number exceeds Max Page Number");
    }
    
    //get playlist by id
    const paginatedPlaylistVideos = await Playlist.aggregate([
        {
            $match: { //find the playlist doc by id
                _id: new mongoose.Types.ObjectId(String(playlistId))
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {   //No of video docs to skip
                        $skip: (Number(page) - 1) * Number(limit)
                    },
                    {   //Max No of video docs to be fetched
                        $limit: Number(limit)
                    },
                    {
                        $lookup: { //get the video owner obj by id
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: { //include only these fields for owner doc
                                        channelName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: { //store the first element(obj) of owner[] field
                            owner: {
                                $first: "$owner"
                            }
                        }
                    },
                    {
                        $project: { //include only these fields for each video doc
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
                ]
            }
        },
        {
            $project:{
                videos: 1
            }
        }
    ]);
    if(!paginatedPlaylistVideos)
    {
        throw new ApiError(500,"Something went wrong while fetching Playlist document");
    }

    //send the playist doc as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalPlaylistVideos: totalPlaylistVideos,
                currentPage: Number(page),
                totalPages,
                paginatedContent:paginatedPlaylistVideos[0].videos
            },
            "Paginated Playlist Videos fetched Successfully"
        )
    );

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    //fetch playlistId and videoId from req params
    const {playlistId, videoId} = req.params
    if(!(isValidObjectId(playlistId) &&  isValidObjectId(videoId)))
    {
        throw new ApiError(400,"Invalid Playlist Id or Video Id");
    }

    //check if the playlist & video exist or not
    const playlist = await Playlist.findById(playlistId);
    if(!playlist)
    {
        throw new ApiError(400,"Incorrect Playlist Id- Playlist does not exist");
    }
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Incorrect Video Id - Video does not exist");
    }

    //check if the playlist owner is current user or not
    if(String(playlist.owner)!==String(req.user._id))
    {
        throw new ApiError(400,"Playlist is not owned by the current user");
    }

    //check if the videoId is already present in the playlist
    if(playlist.videos.includes(videoId))
    {
        throw new ApiError(400,"Video already exist in the Playlist - Cannot insert same Video again")
    }

    //check if the video is already added in any playlist before adding video to the playlist
    const isVideoPresent = await Playlist.find(
        {
            videos:videoId
        }
    ).countDocuments() > 0;

    //add videoId to playlist document
    const updatedPlaylist = await Playlist.updateOne(
        { _id: playlistId },
        { $push: { videos: videoId } }
    );
    if(!updatedPlaylist)
    {
        throw new ApiError(500,"Something went wrong while adding video to playlist");
    }

    //if video is not present in any playlist before add then emit updateIsVideoPresentInPlaylist event 
    if(!isVideoPresent)
    eventBus.emit('private:video:updateIsVideoPresentInPlaylist',{userId:req.user._id, id:videoId,data:true});

    //send the updated playlist doc as response
    res.status(200)
    .json(
        new ApiResponse(200,{},"Video added to Playlist Successfully")
    );

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    //fetch playlistId and videoId from req params
    const {playlistId, videoId} = req.params
    if(!(isValidObjectId(playlistId) &&  isValidObjectId(videoId)))
    {
        throw new ApiError(400,"Invalid Playlist Id or Video Id");
    }
    
    //check if the playlist & video exist or not
    const playlist = await Playlist.findById(playlistId);
    if(!playlist)
    {
        throw new ApiError(400,"Incorrect Playlist Id- Playlist does not exist");
    }
    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,"Incorrect Video Id - Video does not exist");
    }

    //check if the playlist owner is current user or not
    if(String(playlist.owner)!==String(req.user._id))
    {
        throw new ApiError(400,"Playlist is not owned by the current user");
    }

    //check if the videoId is already present in the playlist
    if(!playlist.videos.includes(videoId))
    {
        throw new ApiError(400,"Video does not exist in the Playlist")
    }

    //remove videoId from playlist doc
    const updatedPlaylist = await Playlist.updateOne(
        { _id: playlistId },
        { $pull: { videos: videoId } }
    );
    if(!updatedPlaylist)
    {
        throw new ApiError(500,"Something went wrong while removing video from playlist");
    }

    //check if the video is added in any playlist after removing video from the playlist
    const isVideoPresent = await Playlist.find(
        {
            videos:videoId
        }
    ).countDocuments() > 0;

    //if video is not added in any playlist after removal then emit updateIsVideoPresentInPlaylist event 
    if(!isVideoPresent)
    eventBus.emit('private:video:updateIsVideoPresentInPlaylist',{userId:req.user._id, id:videoId,data:false});

    //send the updated playlist doc as response
    res.status(200)
    .json(
        new ApiResponse(200,{},"Video removed from Playlist")
    );

})

const deletePlaylist = asyncHandler(async (req, res) => {

    //fetch playlistId from req params
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Invalid Playlist Id");
    }

    //find & delete playlist by id & owner
    const playlist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
            owner: req.user._id
        }
    );
    if(!playlist)
    {
        throw new ApiError(500,"Something went wrong while deleting Playlist document")
    }

    res.status(200)
    .json(
        new ApiResponse(200,{},"Playlist deleted Successfully")
    );

})

const updatePlaylist = asyncHandler(async (req, res) => {

    //fetch playlistId from req params
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Invalid Playlist Id");
    }

    //fetch name,description(to be updated) from req body
    let name,description;
    if(req.body && (req.body.name && req.body.description))
    {
        name = req.body.name;
        description = req.body.description;
    }
    if(!(name && description))
    {
        throw new ApiError(400,"Playlist name or description is missing");
    }

    //find & update the playlist doc
    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $set: {
                name: name,
                description: description
            }
        },
        {new: true}
    );
    if(!playlist)
    {
        throw new ApiError(500,"Something went wrong while updating Playlist document");
    }

    //send the updated playlist as response
    res.status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist updated Successfully")
    );
})

export {
    createPlaylist,
    getPaginatedUserPlaylists,
    getPlaylistInfoById,
    getPlaylistVideosById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
