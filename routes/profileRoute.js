import express from "express";
import {
  updateBackgroundImage,
  updateProfileImage,
} from "../controllers/profile-controller.js";
import { auth } from "../middlewares/auth.js";
const router = express.Router();

//Profile photo update
router.patch("/updateProfileImage/:id", auth, updateProfileImage);

// background photo update
router.patch("/updateBackgroundImage/:id",auth,updateBackgroundImage);
export default router;
