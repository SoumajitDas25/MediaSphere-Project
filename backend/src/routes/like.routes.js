import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    toggleReplyLike
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/video/:videoId").get(toggleVideoLike);
router.route("/toggle/comment/:commentId").get(toggleCommentLike);
router.route("/toggle/tweet/:tweetId").get(toggleTweetLike);
router.route("/toggle/reply/:replyId").get(toggleReplyLike);
router.route("/videos").get(getLikedVideos);

export default router