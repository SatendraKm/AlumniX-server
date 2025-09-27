import express from "express";
import { auth, isAdmin } from "../middlewares/auth.js";
import { bulkmail, makeMentor, removeMentor } from "../controllers/admin-controller.js";

const router = express.Router();


router.put("/make-mentor/:userid", auth, isAdmin, makeMentor); // Route to make a user a mentor
router.put("/remove-mentor/:userid", auth, isAdmin, removeMentor); // Route to remove a user's mentor status
router.post("/send-bulk-email",bulkmail); //send bulk emails

export default router;
