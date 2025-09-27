import express from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById,
  getEventsByUser,
  likeEvent,
  dislikeEvent,
  registerForEvent,
} from "../controllers/event-controller.js";
import { auth } from "../middlewares/auth.js";
const router = express.Router();

//Event Create
router.post("/create-event", auth, createEvent);
router.put("/update-event/:eventid", auth, updateEvent);
router.delete("/delete-event/:eventid", auth, deleteEvent);
router.get("/all", auth, getEvents);
router.get("/:eventid", getEventById);
router.get("/user/:userId", getEventsByUser);
router.post("/register-event/:eventid", auth, registerForEvent);

// Like/Dislike routes
router.post("/like/:eventId", auth, likeEvent); // Like a event
router.post("/dislike/:eventId", auth, dislikeEvent); // Dislike a event

export default router;
