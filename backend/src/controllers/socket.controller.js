import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getUserSocketMap } from "../socketStore.js";

const registerSocket = asyncHandler(async (req,res)=>{

    //fetch userId and socketId
    const userId = req.user.id;
    const { socketId } = req.body;
    if (!socketId)
    {
        throw new ApiError(400,"SocketID not found");
    }

    //get userSocketMap reference
    const socketMap = getUserSocketMap();

    //if userId doesnt exist, then create a new set mapped with userId
    if (!socketMap.has(userId)) {
        socketMap.set(userId, new Set());
    }

    //add the socketId to the socket set
    socketMap.get(userId).add(socketId);

    console.log(socketMap);

    console.log(`Socket ${socketId} registered for user ${userId}`); //for logging and debugging

    //send a sucess message as response
    res.status(200)
    .json(
        new ApiResponse(200,{},"SocketID registered sucessfully")
    );
});

const removeSocket = asyncHandler(async (req,res)=>{

    //fetch userId and socketId
    const userId = req.user.id;
    const { socketId } = req.body;
    if (!socketId)
    {
        throw new ApiError(400,"SocketID not found");
    }

    //get userSocketMap reference
    const socketMap = getUserSocketMap();

    //delete the socketId from userId's socket set
    const socketSet = socketMap.get(userId);
    if(socketSet) 
    {
        socketSet.delete(socketId);
        if(socketSet.size === 0) 
        socketMap.delete(userId);
    }

    console.log(socketMap);

    console.log(`Socket ${socketId} removed for user ${userId}`); //for logging and debugging

    //send a sucess message as response
    res.status(200)
    .json(
        new ApiResponse(200,{},"SocketID removed sucessfully")
    );

});

export {registerSocket,removeSocket};