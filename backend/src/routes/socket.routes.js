import { Router } from "express";
import { registerSocket,removeSocket } from "../controllers/socket.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/register").post(registerSocket);
router.route("/remove").post(removeSocket);

export default router;