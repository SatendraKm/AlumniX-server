import Razorpay from "razorpay";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Razorpay instance
export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET, 
});

// Test Razorpay instance (optional)
console.log("Razorpay instance initialized:", {
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: "*****" // Masked for security
});
