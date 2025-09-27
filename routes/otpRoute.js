import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/otp-controller.js'
const router = express.Router();

// Route to send the otp 
router.post("/send", sendOTP);

// Route to verify the otp 
router.post("/verify", verifyOTP);

export default router;