import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import ApiError from './utils/ApiError.js';
import errorHandler from './middlewares/errorHandler.middleware.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({
    limit: "15kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "15kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import likeRouter from './routes/like.routes.js'
import commentRouter from './routes/comment.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import connectionRouter from './routes/connection.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import replyRouter from './routes/reply.routes.js'
import socketRouter from './routes/socket.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videoRouter);
app.use("/api/v1/likes",likeRouter);
app.use("/api/v1/comments",commentRouter);
app.use("/api/v1/tweets",tweetRouter);
app.use("/api/v1/connections",connectionRouter);
app.use("/api/v1/playlists",playlistRouter);
app.use("/api/v1/dashboard",dashboardRouter);
app.use("/api/v1/replies",replyRouter);
app.use("/api/v1/socket",socketRouter);

//route not found middleware
app.use((req,res)=>{
    throw new ApiError(404,"Route not found");
})
//error handler middleware
app.use(errorHandler);

export { app };