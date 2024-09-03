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

const getUserPlaylists = asyncHandler(async (req, res) => {

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
    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(String(userId))
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        }
    ]);
    if(!playlists)
    {
        throw new ApiError(500,"Something went wrong while fetching playlist documents");
    }

    //send the playlists[] as response
    res.status(200)
    .json(
        new ApiResponse(200,playlists,"User Playlists fetched Sucessfully")
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
                as: "videos"
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
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
