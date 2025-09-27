import express from "express";
import { addMessage, getGroupMessages } from "../controllers/groupMessage-controller.js";
import { auth, isAlumniOrFaculty } from "../middlewares/auth.js";

const router = express.Router();


router.post("/addmsg",  addMessage);
router.post("/getmsg",  getGroupMessages);

export default router;
