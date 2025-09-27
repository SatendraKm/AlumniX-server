import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { mailSender } from "../utils/mailSender.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

dotenv.config();

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

//get user by id
export const getUserById = async (req, res) => {
  const { userid } = req.params; // Extract ID from params

  try {
    // Find user by ID and exclude the password field
    const user = await User.findById(userid).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found!" }); // Handle user not found
    }

    res.status(200).json({ success: true, data: user }); // Send user data as response
  } catch (err) {
    res.status(400).json({
      error: "Invalid ID format or server error!",
      details: err.message,
    }); // Handle errors
  }
};

// Delete all users
export const deleteAll = async (req, res) => {
  try {
    const deleteResult = await User.deleteMany({});
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found to delete.",
      });
    }
    res.status(200).json({
      success: true,
      message: `${deleteResult.deletedCount} users have been deleted.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting users.",
      error: error.message,
    });
  }
};

// Signup
export const signup = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      address,
      gender,
      dob,
      organization,
      state,
      city,
      zipCode,
      batch,
      enrollmentnumber,
    } = req.body;

    const profileimageUrlArray = req.files?.profileimageUrl; // Array of files
    const profileimageUrl = Array.isArray(profileimageUrlArray)
      ? profileimageUrlArray[0] // Use the first file if multiple are uploaded
      : profileimageUrlArray;

    if (
      !email ||
      !password ||
      !role ||
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !gender ||
      !dob ||
      !state ||
      !city ||
      !zipCode ||
      !organization ||
      !batch

    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields!",
      });
    }

    let finalImageUrl;

    if (!profileimageUrl) {
      // Generate default avatar URL if no image is provided
      finalImageUrl = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`;
    } else {
      const validMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
        "image/pjpeg",
      ];

      if (
        !profileimageUrl.mimetype ||
        !validMimeTypes.includes(profileimageUrl.mimetype)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
        });
      }

      try {
        // Upload to Cloudinary
        const cloudinaryResponse = await uploadImageToCloudinary(
          profileimageUrl, // Use the temporary file path
          process.env.FOLDER_NAME, // Folder name for organization in Cloudinary
          1000, // Max width
          1000 // Max height
        );

        if (cloudinaryResponse && cloudinaryResponse.secure_url) {
          finalImageUrl = cloudinaryResponse.secure_url; // Extract secure URL
        } else {
          throw new Error("Cloudinary response does not contain a secure URL.");
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary.",
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email is already registered!",
      });
    }

    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      address,
      gender,
      dob,
      organization,
      state,
      city,
      zipCode,
      batch,
      enrollmentnumber,
      profileimageUrl: finalImageUrl,
    });

    res.status(201).json({
      success: true,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      message: "Signup successful!",
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered",
      });
    }

    if(user.is_verified === false){
      return res.status(401).json({
        success : false,
        message : "User Registration Under Process. wait for approval"
      })
    }

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      res.cookie("token", token, options);
      res.status(200).json({
        success: true,
        token,
        user: { ...user._doc, password: undefined },
        message: "User logged in successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Logout
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateUser = async (req, res) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "phone",
    "address",
    "gender",
    "dob",
    "state",
    "city",
    "zipCode",
    "about",
    "tagLine",
    "socialMediaLinks",
    "experience",
    "education",
    "skills",
    "certificationsAndLicenses",
    "publicationsAndResearch",
  ];

  const { userid } = req.params;
  const updateData = req.body;

  // Filter the update data to include only allowed fields
  const filteredData = Object.keys(updateData).reduce((acc, key) => {
    if (allowedFields.includes(key)) {
      acc[key] = updateData[key];
    }
    return acc;
  }, {});

  if (Object.keys(filteredData).length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userid,
      { $set: filteredData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", error: error.message });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//generate link to reset the password
export const resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us Enter a Valid Email`,
      });
    }

    const token = crypto.randomBytes(20).toString("hex");

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        forgetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 1000 * 60 * 10),
      },
      { new: true }
    );

    // const url = `https://n-square-backend.onrender.com/forget-password/${token}`;
    const url = `https://n-square.vercel.app/reset-password/${token}`;

    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click the url to reset your Password`
    )
      .then(() => {
        res.json({
          success: true,
          message:
            "Email Send Successfully, Please check your Email to Continue Furter",
        });
      })
      .catch(() => {
        res.json({
          error: error.message,
          success: false,
          message: `Some Error while Sending Reset Link`,
        });
      });
  } catch (error) {
    res.json({
      error: error.message,
      success: false,
      message: `Some Error while Sending Reset Link`,
    });
  }
};

//forget password
export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;
    console.log(password, confirmPassword);

    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      });
    }

    const userDetails = await User.findOne({ forgetPasswordToken: token });

    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      });
    }

    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate(
      { forgetPasswordToken: token },
      { password: encryptedPassword },
      { new: true }
    );

    res.json({
      success: true,
      message: `Password Reset Successful`,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Passoword`,
    });
  }
};

//follow a user
export const followUser = async (req, res) => {
  const targetUserId = req.params.targetuserid;
  const currentUserId = req.user.id;
  try {
    if (targetUserId === currentUserId) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot follow yourself." });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!currentUser.following.includes(targetUserId)) {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      await currentUser.save();
      await targetUser.save();

      res.status(200).json({
        success: true,
        message: "Followed successfully!",
        followerCount: targetUser.followers.length,
        followingCount: currentUser.following.length,
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Already following this user." });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error following user.",
      error: error.message,
    });
  }
};

//UNfollow a user
export const unFollowUser = async (req, res) => {
  const targetUserId = req.params.targetuserid;
  const currentUserId = req.user.id;

  try {
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (currentUser.following.includes(targetUserId)) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId
      );

      await currentUser.save();
      await targetUser.save();

      res.status(200).json({
        success: true,
        message: "Unfollowed successfully!",
        followerCount: targetUser.followers.length,
        followingCount: currentUser.following.length,
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "You are not following this user." });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unfollowing user.",
      error: error.message,
    });
  }
};


export const socialmedia = async (req, res) => {
  const {linkedin} = req.body; // Receive social media links from the request body

  try {
    // Find the logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the social media links
    user.socialMediaLinks.linkedin = linkedin || user.socialMediaLinks.linkedin;
    

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Social media links updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};