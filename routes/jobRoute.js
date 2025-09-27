import express from "express";
import { auth } from "../middlewares/auth.js";
import {createJob, updateJob, deleteJob, getAllJobs, getbyId, getJobsByUser, applyJob, saveJob, likeJob, dislikeJob  } from "../controllers/job-controller.js";

const router = express.Router();

//Event Create
router.post("/create", auth, createJob);
router.get("/all",getAllJobs);
router.get("/:jobid",getbyId);
router.patch("/update/:jobid", auth, updateJob);
router.delete("/delete/:jobid", auth, deleteJob);
router.get("/user/:userid",getJobsByUser);
router.post("/apply/:jobId", auth, applyJob);
router.patch("/save-job/:id", auth, saveJob);
router.post("/like/:jobId", auth, likeJob); // Like a post
router.post("/dislike/:jobId", auth, dislikeJob); // Dislike a post

export default router;


