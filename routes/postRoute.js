import express from "express";
import { auth } from "../middlewares/auth.js";

import {
  createPost, deletePost, dislikePost, getAllPosts, getPostById, getPostsByUser, likePost, updatePost, savePost
  
} from "../controllers/post-controller.js"; // Adjust path if necessary


const router = express.Router();

// Post routes
router.post("/create", auth, createPost); // Create a post
router.get("/", auth, getAllPosts); // Get all posts
router.get("/:postId", auth, getPostById); // Get a specific post
router.put("/:postId", auth, updatePost); // Update a post
router.delete("/:postId", auth, deletePost); // Delete a post

 // Like/Dislike routes
router.post("/:postId/like", auth, likePost); // Like a post
router.post("/:postId/dislike", auth, dislikePost); // Dislike a post


// Get posts by user
router.get("/user/:userId",getPostsByUser); // Get posts by a specific user

//Update
router.patch("/save-post/:id", auth, savePost);

export default router;
