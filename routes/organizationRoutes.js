import express from "express";
import { auth, organizationAuth } from "../middlewares/auth.js";
import { organizationLogin, organizationSignup, getAllOrganizations, organizationLogout, fetchOrganizationByID, getUnverifiedStudentsByUniversity, verifyUser, rejectUser, organizationDashboard, bulkRegisterUsers } from "../controllers/organization-controller.js";
import { upload } from "../middlewares/excel.js";
import Event from "../models/eventModel.js";
import Job from "../models/jobModel.js";
import Post from "../models/postModel.js";

const router = express.Router();

//post
router.get("/all-posts", async (req, res) => {
    try {
      const posts = await Post.find();
  
      if (posts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Posts Not Found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Posts Fetched Successfully",
        posts,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });

//events
router.get("/all-events", async (req, res) => {
    try {
      const events = await Event.find();
  
      if (events.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Events Not Found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Events Fetched Successfully",
        events,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });

//jobs
router.get("/all-jobs", async (req, res) => {
    try {
      const jobs = await Job.find();
  
      if (jobs.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Jobs Not Found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Jobs Fetched Successfully",
        jobs,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });


router.post("/login", organizationLogin);   
router.post("/signup", organizationSignup);
router.get("/get-all-organizations", getAllOrganizations);
router.post("/logout", organizationLogout);
router.get("/:id", fetchOrganizationByID);
router.post("/unverified-students", getUnverifiedStudentsByUniversity);
router.put("/verify-user/:userId", verifyUser);
router.delete("/reject-user/:userId", rejectUser);
router.get("/dashboard/:id", organizationDashboard);


router.post("/bulk-register", upload, bulkRegisterUsers);


export default router;