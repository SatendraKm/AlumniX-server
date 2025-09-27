import express from "express";
import { createGroup, updateGroup, deleteGroup, addMember, removeMember, getAllGroups, getAllMembersInGroup } from "../controllers/group-controller.js";
import { auth, isAlumniOrFaculty } from "../middlewares/auth.js";

const router = express.Router();

// Group Routes
router.post("/create-group", auth, isAlumniOrFaculty, createGroup);
router.patch("/update-group/:id", auth, isAlumniOrFaculty, updateGroup);
router.delete("/delete-group/:id", auth, isAlumniOrFaculty, deleteGroup);
router.get("/get-all-groups", getAllGroups);

// Member Management Routes
router.post("/add-member/:groupId", auth, addMember);
router.delete("/remove-member/:groupId", auth, removeMember);
router.get("/members-in-group/:groupId", auth, getAllMembersInGroup);

export default router;
