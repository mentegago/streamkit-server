import { Router } from "express";
import { getUserInfoController } from "../controllers/twitchController.ts";

const router = Router();

// Define Twitch-related routes
router.get("/user/:username", getUserInfoController);

export default router;
