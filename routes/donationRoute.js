import express from "express";
import { checkout, paymentVerification } from "../controllers/donation-controller.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();


router.get("/get-key", (req, res) => 
    res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
)

router.post("/checkout", checkout);

router.get("/payment", (req, res)=>{
    res.status(200).json({ "msg" : "payment" })
})


router.post("/payment-verification", paymentVerification);



export default router;

