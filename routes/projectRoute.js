import express from "express";
import {
  addContributorToProject,
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  getProjectsByUser,
  removeContributorToProject,
  updateProject,
  saveProject,
  allUsersDonation,
  userDonatedPerProject,
  getPopularProjects
} from "../controllers/project-controller.js";
import { auth } from "../middlewares/auth.js";
const router = express.Router();

router.post("/create", auth, createProject);
router.get("/popular-projects", auth, getPopularProjects) 
router.patch("/update/:projectid", auth, updateProject);
router.delete("/delete/:projectid", auth, deleteProject);
router.get("/all", auth, getAllProjects);
router.get("/:projectid", getProjectById);
router.get("/user/:userId", getProjectsByUser);
router.post("/contribute/:projectid", auth, addContributorToProject);
router.delete("/contribute/:projectid", auth, removeContributorToProject);
router.patch("/save-project/:id", auth, saveProject);
router.get("/all-users-donation/:id", auth, allUsersDonation);
router.get("/user-wise-donation/:id", auth, userDonatedPerProject);


export default router;
