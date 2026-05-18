import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getAllUserTweets,
    getPublishedUserTweets,
    updateTweet,
    getTweetById,
    togglePublishStatus
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getAllUserTweets);
router.route("/published/user/:userId").get(getPublishedUserTweets);
router.route("/:tweetId").get(getTweetById).patch(updateTweet).delete(deleteTweet);

router.route("/toggle/publish/:tweetId").patch(togglePublishStatus);

export default router
