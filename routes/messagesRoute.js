import express from "express";
import { addMessage, getMessages } from "../controllers/message-controller.js";
import { auth, isAlumniOrFaculty } from "../middlewares/auth.js";

const router = express.Router();


router.post("/addmsg", addMessage);
router.post("/getmsg", getMessages);

export default router;
