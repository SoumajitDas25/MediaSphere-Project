import { Router } from 'express';
import {
    getVideoComments,
    getTweetComments, 
    addVideoComment,
    addTweetComment, 
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/video/:videoId").get(getVideoComments).post(addVideoComment);
router.route("/tweet/:tweetId").get(getTweetComments).post(addTweetComment);
router.route("/:commentId").delete(deleteComment).patch(updateComment);

export default router