import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async(req , res , next)=>{

    //fetch access token from cookies or header(in case of mob app)
    let token;
    if(req.cookies && req.cookies.accessToken && req.cookies.refreshToken)
    {
        token = req.cookies.accessToken || req.header("Authorization").replace("Bearer ","");
    }
    if(!token)
    {
        throw new ApiError(404,"User not found");
    }

    //decode the token
    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    if(!decodedToken)
    {
        throw new ApiError(500,"Something went wrong while decoding Access Token");
    }
    
    //find the user document by id contained in the token
    const user =await User.findById(decodedToken._id).select("-password -refreshToken -__v");
    if(!user)
    {
        throw new ApiError(401,"Invalid Access Token");
    }

    //add the user document to req object
    req.user=user;

    next();
});

export {verifyJWT};