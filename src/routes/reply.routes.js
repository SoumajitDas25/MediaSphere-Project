import { Router } from "express";
import {
    addVideoCommentReply,
    addTweetCommentReply,
    getCommentReplies,
    updateReply,
    deleteReply
} from "../controllers/reply.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/video/:commentId/:repliedToId").post(addVideoCommentReply);
router.route("/tweet/:commentId/:repliedToId").post(addTweetCommentReply);
router.route("/:commentId").get(getCommentReplies);
router.route("/:replyId").patch(updateReply).delete(deleteReply);

export default router;