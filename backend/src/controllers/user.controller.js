import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {User} from '../models/user.model.js'
import {fileUpload,deleteFile} from '../utils/cloudinary.js'
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const cookieOptions={
    httpOnly:true,
    secure: true,  //this will not allow frontend to modify the cookies(only server can modify it).
};

const generateAccessAndRefreshToken = async (userId)=>{
    try
    {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();
        if(!accessToken || !refreshToken)
        {
            throw new ApiError(500,"Something went wrong while generating Refresh and Access Token");
        }
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {refreshToken,accessToken};
    }
    catch(error)
    {
        throw new ApiError(500,"Something went wrong while generating Refresh and Access Token");
    }
}

const registerUser = asyncHandler(async (req,res)=>{

    // fetch user details from req
    const {username,channelName,email,password} = req.body;

    //validation - not empty
    if([username,channelName,email,password].some(field=>field?.trim()===""))
        throw new ApiError(400,"All fields are required");

    //check if user already exists(check by username or email)
    const existedUser = await User.findOne(
        {
            $or: [{username},{email}]
        }
    )
    if(existedUser)
        throw new ApiError(409,"User Already Exists");

    //upload files to cloudinary
    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0)
    {
        avatarLocalPath = req.files.avatar[0].path;
    }
    if(!avatarLocalPath) //compulsory(error to be thrown if not found)
    {
        throw new ApiError(400,"Avatar File is required");
    }
    const avatar = await fileUpload(avatarLocalPath,"users");       
    if(!avatar) //upload unsuccessful 
    {
        throw new ApiError(500,"Avatar file upload failed");
    }
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    const coverImage =(coverImageLocalPath)? await fileUpload(coverImageLocalPath,"users"):null; //not compulsory(no error to be thrown)
    if(!coverImage && coverImageLocalPath)//upload unsuccessful
    {
        throw new ApiError(500,"Cover Image file upload failed");
    }

    // create a user document(object)- create entry in db
    const user = await User.create({
        username: username.toLowerCase(),
        channelName: channelName,
        email: email.toLowerCase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        password
    });

    //check & retrieve the created user document and include only these fields
    const createdUser = await User.findById(user._id).select("username channelName email avatar coverImage");
    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering user");
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req,res)=>{

    //fetch user details from req body
    const {username,email,password}=req.body;
    if(!(username || email))
    {
        throw new ApiError(400,"Username or email is required");
    }

    //find the user document by username or email
    const user = await User.findOne({
        $or:[{username},{email}]
        // username
    });
    if(!user)
    {
        throw new ApiError(404,"User does not exists");
    }

    //check whether the password of user document matches the given password
    //commented for not checking the passsword hash - for testing purpose
    // const isPasswordValid = await user.isPasswordCorrect(password);
    // if(!isPasswordValid)
    // {
    //     throw new ApiError(401,"Incorrect Credentials");
    // }
    //this below code will be used to check the password - for testing purpose
    if(user.password !== password)
    {
        throw new ApiError(401,"Incorrect Credentials");
    }   

    //generate access & refresh token
    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id);

    //get the currrent user document & include only these fields
    const loggedInUser = await User.findById(user._id).select("username channelName email avatar coverImage");

    //send access & refresh tokens as cookies along with the response
    return res.status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(new ApiResponse(
        200,
        {
            user:loggedInUser,
            refreshToken,
            accessToken
        },
        "Login Successful"
    ));

})

const logoutUser = asyncHandler(async (req,res)=>{

    //find & update user document by setting refresh token to undefined
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1 // this will remove this field from the doc
            }
        },
        {
            new:true
        }
    );

    if(!updatedUser)
    {
        throw new ApiError(500,"Something went wrong while Logout");
    }

    //clear cookies while sending response
    return res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(
        new ApiResponse(200,true,"Logout Successful")
    );
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    //fetch refresh token from cookies or req body(in case of mob app) or header(in case of mob app) 
    let incomingRefreshToken;
    if((req.cookies && req.cookies.refreshToken) || 
    (req.body && req.body.refreshToken) ||
    (req.header && req.header.Authorization))
    {
        incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization").replace("Bearer ","");
    }
    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Unauthorized Request");
    }

    //decode the token
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    if(!decodedToken)
    {
        throw new ApiError(500,"Something went wrong while decoding Access Token");
    }
    
    //find the user document by id contained in the token
    const user =await User.findById(decodedToken._id);
    if(!user)
    {
        throw new ApiError(401,"Invalid Refresh Token");
    }
    
    //check the equality of the incoming token with the token contained in the user doc
    if(incomingRefreshToken !== user.refreshToken)
    {
        throw new ApiError(401,"Refresh Token is expired or used");
    }

    //generate new access & refresh tokens
    const {refreshToken:newRefreshToken,accessToken:newAccessToken} = await generateAccessAndRefreshToken(user._id);

    if(!newAccessToken || !newRefreshToken)
    {
        throw new ApiError(500,"Something went wrong while generating tokens");
    }

    //send new access & refresh tokens as cookies along with the response
    return res.status(200)
    .cookie("accessToken",newAccessToken,cookieOptions)
    .cookie("refreshToken",newRefreshToken,cookieOptions)
    .json(new ApiResponse(
        200,
        {
            refreshToken:newRefreshToken,
            accessToken:newAccessToken
        },
        "Access Token Refreshed"
    ));
    
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{

    //fetch old & new password from req body
    const {oldPassword,newPassword} = req.body;
    if(!oldPassword || !newPassword)
    {
        throw new ApiError(400,"Password fields are required");
    }

    //get user document by id from req.user
    const user = await User.findById(req.user?._id);
    
    //validate the old password with the password contained in the user doc
    const isPasswordValidated = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordValidated)
    {
        throw new ApiError(400,"Invalid Current Password");
    }

    //add the new password to the password field of  user doc
    user.password = newPassword;

    //save the user doc
    user.save({validateBeforeSave:false});

    res.status(200)
    .json(
        new ApiResponse(200,{},"Password Changed Successfully")
    );

})

const getCurrentUser = asyncHandler(async (req,res)=>{

    //return user doc from req.user as response
    const user = req.user;
    return res.status(200)
    .json(
        new ApiResponse(200,user,"Current User fetched Successfully")
    );
})

const updateAccountDetails = asyncHandler(async (req,res)=>{

    //fetch user details(to be updated) from req body
    const {fullName,email} = req.body;
    if(!fullName || !email)
    {
        throw new ApiError(400,"All fields are required");
    }
    //find and update user doc by id
    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password -refreshToken");
    if(!user)
    {
        throw new ApiError(500,"Something went wrong while updating user details");
    }
    
    res.status(200)
    .json(
        new ApiResponse(200,user,"Account details Updated Successfully")
    );
})

const updateUserAvatar = asyncHandler(async (req,res)=>{

    //fetch user avatar from req.file
    let avatarLocalPath;
    if(req.file && req.file.path)
    avatarLocalPath=req.file.path;
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is missing");
    }

    //upload the new avatar file to cloudinary
    const avatar = await fileUpload(avatarLocalPath,"users");       
    if(!avatar.url) //upload unsuccessful 
    {
        throw new ApiError(500,"Avatar file upload failed");
    }

    //find & update the user doc by id
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("avatar");
    if(!user)
    {
        throw new ApiError(500,"Something went wrong while updating User Avatar");
    }

    //delete the old avatar from cloudinary
    const response = await deleteFile(req.user?.avatar);
    let isOldAvatarDeleted;
    if(response)
    isOldAvatarDeleted=true;
    else
    isOldAvatarDeleted=false;

    //return the user doc as response
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                avatar:user.avatar,
                isOldAvatarDeleted
            },
            "User Avatar updated Successfully"
        )
    );
})

const updateUserCoverImage = asyncHandler(async (req,res)=>{

    //fetch user coverImage from req.file
    let coverImageLocalPath;
    if(req.file && req.file.path)
    coverImageLocalPath=req.file.path;
    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"Cover Image file is missing");
    }

    //upload the new coverImage file to cloudinary
    const coverImage = await fileUpload(coverImageLocalPath,"users");    
    if(!coverImage.url) //upload unsuccessful 
    {
        throw new ApiError(500,"Cover Image file upload failed");
    }

    //find & update the user doc by id
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("coverImage");
    if(!user)
    {
        throw new ApiError(500,"Something went wrong while updating Cover Image");
    }

    //delete the old coverImage from cloudinary
    let isOldCoverImageDeleted;
    if(req.user.coverImage!="")
    {
    const response = await deleteFile(req.user.coverImage);
    if(response)
    isOldCoverImageDeleted=true;
    else
    isOldCoverImageDeleted=false;
    }
    else
    isOldCoverImageDeleted="No previous Cover Image";

    //return the user doc as response
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                coverImage:user.coverImage,
                isOldCoverImageDeleted
            },
            "Cover Image updated Successfully"
        )
    );
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{

    //fetch user(channel owner) details from req params
    const {username}=req.params;
    if(!(username && username.trim()))
    {
        throw new ApiError(400,"Username is missing");
    }
    
    //get channel owner details through aggregation pileline
    const channel = await User.aggregate([
        {
            $match:{  //get the user(channel owner) doc
                username: username?.toLowerCase()
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
            $lookup: {  //get those connection docs where subscribers = userid i.e., (list of channels user has subscribed )
                from: "connections",
                localField: "_id",
                foreignField: "subscriber",
                as:"subscriptions"
            }
        },
        {
            $lookup: {  //get list of user videos
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as:"videos"
            }
        },
        {
            $addFields: {
                subscriberCount: { //calculate the size of subscribers field
                    $size: "$subscribers"
                },
                subscriptionCount: { //calculate the size of subscribedTo field
                    $size: "$subscriptions"
                },
                isSubscribed: { //check whether user(visiter) has subscribed to the owner's channel
                    $cond: {
                        if: {$in: [req.user._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                },
                videosCount:{ //calculate the size of videos field
                    $size: "$videos"
                }
            }
        },
        {
            $project:{ //return only these fields
                channelName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                subscriptionCount: 1,
                isSubscribed: 1,
                videosCount: 1
            }
        }
    ]);
    if(!channel)
    {
        throw new ApiError(404,"Something went wrong while fetching User Channel");
    }
    if(!channel.length)
    {
        throw new ApiError(404,"User Channel does not exists");
    }

    //send the first & only obj of channel[] as response
    res.status(200)
    .json(
        new ApiResponse(200,channel[0],"User Channel Details fetched successfully")
    );

})

const getWatchHistory = asyncHandler(async (req,res)=>{

    let data;
    //fetch page & limit from req query
    const {page = 1, limit = 9} = req.query;

    //get all watch history for the user
    const totalWatchHistory = req.user?.watchHistory;
    if(!totalWatchHistory)
    {
        throw new ApiError(500,"Something went wrong while fetching Total Watch History");
    }
    if(totalWatchHistory.length < 1)
    {
        data={
            totalWatchHistory:0,
            paginatedContent:null,
            totalPages:0
        }
    }
    else
    {
        //check if page no. exceeds max page no.
        let totalPages = Math.ceil(totalWatchHistory.length / Number(limit));
        if(totalPages < Number(page))
        {
            throw new ApiError(400,"Page Number exceeds Max Page Number");
        }

        //get paginated watch history for the user
        const user = await User.aggregate([
            {
                $match: { //find the user doc by id
                    _id: new mongoose.Types.ObjectId(String(req.user?._id))
                }
            },
            {
                $lookup: { //get the video docs by their ids contained in this watchHistory[]
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchedVideos",
                    pipeline: [
                        {
                            $lookup: { //get the owner obj by id
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
                    ]
                }
            },
            {
                $addFields: { //Reorder watchedVideos to match watchHistory[]
                    watchedVideos: {
                        $map: {
                            input: "$watchHistory",
                            as: "vidId",
                            in: {
                                $arrayElemAt: [
                                    "$watchedVideos",
                                    {
                                        $indexOfArray: [
                                            "$watchedVideos._id","$$vidId"
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    watchHistory: 1,
                    watchedVideos: {
                        $slice: ["$watchedVideos",(Number(page) - 1) * Number(limit),Number(limit)]
                    }
                }
            }
        ]);
        if(!user)
        {
            throw new ApiError(500,"Something went wrong while fetching watch history");
        }

        data={
            totalWatchHistory: totalWatchHistory.length,
            currentPage: Number(page),
            totalPages,
            paginatedContent:user[0].watchedVideos,
        };
    }

    //send the sorted watch history[] as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            data,
            "Paginated Watch History fetched Sucessfully"
        )
    );
})

const deleteWatchHistory = asyncHandler(async(req,res)=>{
    
    //update watchHistory[] in user doc to empty
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                watchHistory:[]
            }
        },
        {new: true}
    ).select("watchHistory");
    if(updatedUser.watchHistory.length!==0){
        throw new ApiError(500,"Something went wrong while deleting watchHistory");
    }

    //send a success message as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                isWatchHistoryDeleted:true
            },
            "Watch History deleted successfully"
        )
    );
})

const deleteVideoFromWatchHistory =  asyncHandler(async(req,res)=>{

    //fetch video id from req params
    const {videoId} = req.params;
    if(!videoId)
    {
        throw new ApiError(400,"Video ID is missing");
    }

    //get the user doc
    const user = await User.findById(req.user?._id).select("watchHistory");
    if(!user)
    {
        throw new ApiError(500,"Something went wrong while deleting video from watch history");
    }
    
    //exclude the videoId from watchHistory[] field of user doc
    user.watchHistory = user.watchHistory.filter(id=>String(id)!==String(videoId));

    //save the user doc
    const updatedUser = await user.save();
    if(!updatedUser)
    {
        throw new ApiError(500,"Something went wrong while deleting video from watch history");
    }
    // console.log(updatedUser);

    //send a success message as response
    res.status(200)
    .json(
        new ApiResponse(
            200,
            {
                isVideoDeletedFromWatchHistory:true
            },
            "Video deleted from Watch History successfully"
        )
    );

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    deleteWatchHistory,
    deleteVideoFromWatchHistory
};