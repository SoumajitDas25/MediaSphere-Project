import { Router } from 'express';
import {
    getAllVideos,
    getPublishedVideos,
    getAllUserVideos,
    getPublishedUserVideos,
    getVideoById,
    publishAVideo,
    generateVideoUploadCredentials,
    togglePublishStatus,
    updateVideo,
    deleteVideo,
} from "../controllers/video.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); //Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnailFile",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/user/:userId").get(getAllUserVideos);

router.route("/published/all").get(getPublishedVideos);

router.route("/published/user/:userId").get(getPublishedUserVideos);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

router.route("/upload/generate-credentials/:mediaType").get(generateVideoUploadCredentials);

export default router;