import express from "express";
import {
  createCommunity,
  deleteCommunity,
  addMember,
  removeMember,
} from "../controllers/community-controller.js"; 
import { auth } from "../middlewares/auth.js"; 

const router = express.Router();


router.post("/create", auth, createCommunity);
router.delete("/delete/:id", auth, deleteCommunity);
router.post("/add-member/:id", auth, addMember);
router.delete("/remove-member/:id", auth, removeMember);

export default router;
