import jwt from "jsonwebtoken";
import cookie from "cookie";

const socketAuthMiddleware = (socket, next) =>{
    try 
    {
        const token = extractToken(socket);

        if (!token) 
        {
        return next(new Error("Unauthorized")); //abort the connection & trigger connect_error event on the cleint-side
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        socket.userId = decodedToken._id;

        next(); //trigger the connection event
    } 
    catch (err) 
    {
        next(new Error("Unauthorized")); //abort the connection & trigger connect_error event on the cleint-side
    }
}

function extractToken(socket) 
{
    let token = socket.handshake.auth?.token;
    if (!token && socket.handshake.headers?.cookie) 
    {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies?.accessToken;
    }
    return token;
}

export {socketAuthMiddleware};