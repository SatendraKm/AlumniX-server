import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  getSuggestedUsers,
  getUpcomingEvents,
} from "../controllers/recommandation-controller.js";
const router = express.Router();

router.get("/suggested-users/:userId", getSuggestedUsers);
router.get("/upcoming-events", getUpcomingEvents);

export default router;
