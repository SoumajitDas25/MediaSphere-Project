import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Video} from "../models/video.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


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

    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;

    //fetch userId from req params
    const {userId} = req.params
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

    //check if page no. exceeds max page no.
    let totalPages = Math.ceil(totalPlaylists.length / Number(limit));
    if(totalPages < Number(page))
    {
        throw new ApiError(400,"Page Number exceeds Max Page Number");
    }

    //get paginated playlists for the user
    const paginatedPlaylists = await Playlist.aggregate([
        {
            $match: { //get the user playlist docs
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
            $lookup: { //get the video docs in the playlist
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        { 
           $addFields: { //count the videos docs in the playlists
                videosCount: {
                    $size: "$videos" 
                }
           }
        },
        {
            $addFields: { //add the owner info to each doc
                owner: {
                    _id: user._id,
                    username: user.username,
                    channelName: user.channelName,
                    avatar: user.avatar
                }
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
                            $first: "$videos.thumbnail"
                        }, // Get the thumbnail of the first video doc
                        else: null // Set to null if no video docs are found
                    }
                }
            }
        },
        {
            $project:{ //exclude the videos[] from each doc
                videos: 0 
            }
        }
    ]);
    if(!paginatedPlaylists)
    {
        throw new ApiError(500,"Something went wrong while fetching playlist documents");
    }

    //send the paginatedPlaylists[] as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalPlaylists: totalPlaylists.length,
                currentPage: Number(page),
                totalPages,
                paginatedContent:paginatedPlaylists,
            },
            "Paginated User Playlists fetched Successfully"
        )
    );

})

const getPlaylistById = asyncHandler(async (req, res) => {

    //fetch playlistId from req params
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId))
    {
        throw new ApiError(400,"Invalid Playlist Id");
    }
    
    //get playlist by id
    const playlist = await Playlist.aggregate([
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
            $lookup: { //get the playlist owner obj by id
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: { //return only these fields
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
        }
    ]);
    if(!playlist)
    {
        throw new ApiError(500,"Something went wrong while fetching Playlist document");
    }
    if(!(playlist.length>0))
    {
        throw new ApiError(500,"Playlist does not exist");
    }

    //send the playist doc as response
    res.status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist fetched Successfully")
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

    //add videoId to playlist document
    playlist.videos.push(videoId);
    playlist.save({validateBeforeSave: false});

    //send the updated playlist doc as response
    res.status(200)
    .json(
        new ApiResponse(200,playlist,"Video added to Playlist Successfully")
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

    //remove videoId from playlist doc
    playlist.videos.pop();
    playlist.save({validateBeforeSave: false});

    //send the updated playlist doc as response
    res.status(200)
    .json(
        new ApiResponse(200,playlist,"Video removed from Playlist")
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
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
