import express from "express";
import { auth } from "../middlewares/auth.js";
import { getAllReunions, createReunion, deleteReunion } from "../controllers/reunion-controller.js";

const router = express.Router();

// GET request to fetch all reunions
router.get("/get-all-reunions", auth, getAllReunions);

// POST request to create a new reunion
router.post("/create-reunion", auth, createReunion);

// DELETE request to delete a reunion by ID
router.delete("/delete-reunion/:id", auth, deleteReunion);

export default router;
