import Otp from '../models/otpModel.js';
import transporter from "../config/nodemailerConfig.js";

const user = process.env.user;


function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send the otp   
export const sendOTP = async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
  
    const otp = generateOTP();
  
    // Mail options templete
    const mailOptions = {
      from: user,
      to: email,
      subject: 'N-Sqaure | Your OTP Code for Verification',
      text: `Your OTP code is ${otp}. Please use this code to verify your account. The code is valid for 10 minutes.`,
    };
  
    try {
      const existingOtp = await Otp.findOne({ email });
  
      if (existingOtp) {
        existingOtp.otp = otp;
        existingOtp.expiresAt = new Date(new Date().getTime() + 10 * 60000); // 10 minutes from now
        await existingOtp.save();
      } else {
        const newOtp = new Otp({
          email,
          otp,
          expiresAt: new Date(new Date().getTime() + 10 * 60000),
        });
        await newOtp.save();
      }
  
      // Send OTP by email
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({ error: "Failed to send OTP. Please try again later" });
    }
  };



// Function to verify the otp 
export const verifyOTP = async (req, res)=>{
    const { email, otp } = req.body;
  
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
  
    try {
      const otpEntry = await Otp.findOne({ email, otp });
  
      if (!otpEntry) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
  
      // OTP is valid; 
      res.status(200).json({ message: "OTP verified successfully" });
  
      //delete the OTP entry after successful verification
      await Otp.deleteMany({ email });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  }

