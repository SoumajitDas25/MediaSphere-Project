import { Router } from 'express';
import {
    getAllVideos,
    getPaginatedUserVideos,
    getVideoById,
    publishAVideo,
    generateVideoUploadSignature,
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

router.route("/user/:userId").get(getPaginatedUserVideos);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

router.route("/upload/generate-credentials/:mediaType").get(generateVideoUploadSignature);

export default router;