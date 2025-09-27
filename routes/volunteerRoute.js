import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  applyVolunteer,
  createVolunteer,
  getVolunteerById,
  getvolunteer,
} from "../controllers/volunteer-controller.js";

const router = express.Router();

router.get("/get-all-volunteer-position", getvolunteer);
router.post("/create", auth, createVolunteer);
router.get("/:volunteerpositionid", getVolunteerById);
router.post("/apply-volunteer/:volunteerId", auth, applyVolunteer);

export default router;
