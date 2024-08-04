import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {User} from '../models/user.model.js'
import {fileUpload} from '../utils/cloudinary.js'
import jwt from "jsonwebtoken";

const cookieOptions={
    httpOnly:true,
    secure:true  //this will not allow frontend to modify the cookies(only server can modify it).
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
    const {username,fullName,email,password} = req.body;

    //validation - not empty
    if([username,fullName,email,password].some(field=>field?.trim()===""))
        throw new ApiError(400,"All fields are required");

    //check if user already exists(check by username or email)
    const existedUser = await User.findOne(
        {
            $or: [{username},{email}]
        }
    )
    if(existedUser)
        throw new ApiError(409,"User already Exists");

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
        fullName: fullName,
        email: email.toLowerCase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        password
    })

    //check & retrieve the created user document and remove the password & refresh token field
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
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
    });
    if(!user)
    {
        throw new ApiError(404,"User does not exists");
    }

    //check whether the password of user document matches the given password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid)
    {
        throw new ApiError(401,"Incorrect Credentials");
    }

    //generate access & refresh token
    const {refreshToken,accessToken} = await generateAccessAndRefreshToken(user._id);

    //remove unwanted fields from currrent user document
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

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
    const updatedUser = await user.save({validateBeforeSave:false});
    if(!updatedUser)
    {
        throw new ApiError(500,"Something went wrong while updating User document");
    }

    res.status(200)
    .json(
        new ApiResponse(200,{},"Password Changed Successfully")
    );

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword
}