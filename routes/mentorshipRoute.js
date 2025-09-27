import express from "express";
import { makeMentor, removeMentor, createMentorshipGroup, deleteMentorshipGroup, addMentee,  removeMentee} from "../controllers/mentorship-controller.js";
import { auth, isAlumni, isAlumniOrFaculty } from "../middlewares/auth.js";

const router = express.Router();

//for admin
router.post("/make-mentor/:id", auth, makeMentor);
router.post("/remove-mentor/:id", auth, removeMentor);


//for alumni
router.post("/create-mentorship-group", auth, isAlumni, createMentorshipGroup);
router.delete("/delete-mentorship-group/:id", auth, isAlumniOrFaculty, deleteMentorshipGroup);
router.post("/add-mentee/:id", auth, isAlumniOrFaculty, addMentee);
router.delete("/remove-mentee/:id", auth, isAlumniOrFaculty, removeMentee);



export default router;
