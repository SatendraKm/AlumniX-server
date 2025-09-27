import express from "express";
import {
  createFund,
  checkout,
  paymentVerification,
  getFundDetails,
  getAllFunds,
  userFundingPerFund,
  allUsersFunding
} from "../controllers/fund-controller.js";
import { auth } from "../middlewares/auth.js"; // Middleware for authentication

const router = express.Router();

// Route to create a new fund
router.post("/create", createFund);

router.get("/get-key", (req, res) => 
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
)

// Route for Razorpay checkout
router.post("/checkout", checkout); 

// Route for Razorpay payment verification and adding funding
router.post("/payment-verification", paymentVerification);

// Route to get all funds

router.get("/get-all-funds", getAllFunds);

// Route to get details of a single fund by its ID
router.get("/:fundID", auth, getFundDetails);

//for all users
router.get("/all-users-funding/:id", auth, allUsersFunding);

//for specific user
router.get("/user-wise-funding/:id", auth, userFundingPerFund);



export default router;
