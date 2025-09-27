import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  login,
  signup,
  logout,
  getUsers,
  deleteAll,
  resetPassword,
  resetPasswordToken,
  followUser,
  unFollowUser,
  getUserById,
  updateUser,
  socialmedia,
} from "../controllers/user-controller.js";

const router = express.Router();

// Public Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected Routes
router.get("/get-all-users", getUsers);
router.delete("/delete-all-users", deleteAll);
router.get("/:userid", getUserById);

//update user profile
router.put("/update/:userid",auth,updateUser);


//router for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

//router for resetting user's password after verification
router.post("/reset-password", resetPassword);

//route for following a user
router.post("/follow-user/:targetuserid",auth, followUser);
router.post("/unfollow-user/:targetuserid",auth, unFollowUser);
router.put('/update-social-media',auth,socialmedia);
export default router;
