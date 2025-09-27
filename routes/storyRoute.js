import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  getStory,
  newStory,
  deleteStory,
  getAllStories,
  getStoryByUser,
  updateStory,
  likeStory,
  dislikeStory,
} from "../controllers/story-controller.js";

const router = express.Router();

router.get("/get-story/:id", auth, getStory);
router.get("/all", auth, getAllStories);
router.get("/user/:userId", auth, getStoryByUser);
router.post("/new-story", auth, newStory);
router.delete("/delete-story/:id", auth, deleteStory);
router.patch("/update-story/:id", auth, updateStory);
router.post("/like/:storyId", auth, likeStory); // Like a story
router.post("/dislike/:storyId", auth, dislikeStory); // Dislike a story

export default router;
