import { Router } from 'express';
import {
    getSubscriptions,
    getSubscribers,
    toggleSubscription,
} from "../controllers/connection.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getSubscribers)
    .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscriptions);

export default router
