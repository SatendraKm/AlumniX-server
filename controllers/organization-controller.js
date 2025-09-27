import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Organization from "../models/organizationModel.js";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import xlsx from "xlsx";
import mongoose from 'mongoose';import Event from "../models/eventModel.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

dotenv.config();

// Signup Controller
export const organizationSignup = async (req, res) => {
  try {
    const { name, email, college_address, courses, role, password, university_id } = req.body;


    
    // Check if organization already exists
    const existingOrganization = await Organization.findOne({ email });
    if (existingOrganization) {
      return res.status(400).json({ message: "Organization already exists." });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    

    

    // Create new organization
    const organization = new Organization({
      name,
      email,
      college_address,
      courses,
      role,
      university_id,
      password: hashedPassword,
    });

    await organization.save();

    res.status(201).json({ message: "Organization registered successfully." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
};

// Login Controller
export const organizationLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if organization exists
      const organization = await Organization.findOne({ email });
      if (!organization) {
        return res.status(400).json({ message: "Invalid email or password." });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, organization.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password." });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: organization._id, role: organization.role },
        process.env.JWT_SECRET,
        { expiresIn: "3d" } // Token valid for 3 days
      );
  
      // Cookie options
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        httpOnly: true, // Cookie can't be accessed by client-side scripts
        secure: process.env.NODE_ENV === "production", // Set to true in production
        sameSite: "strict", // Helps prevent CSRF attacks
      };
  
      // Set token in a cookie with a custom name (e.g., "organization_token")
      res.cookie("organization_token", token, options);
  
      res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        role: organization.role,
        id: organization._id,
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Server error during login." });
    }
};


//get all university
export const getAllOrganizations = async(req, res) => {
    try {
        const organizations = await Organization.find({}).select("-password");
        res.json(organizations)
      } catch (error) {
        res
          .status(500)
          .json({ message: "Error fetching users", error: error.message });
      }
}


//logout organization
export const organizationLogout = async(req, res) => {
    try {
      // Clear the cookie by its name ("organization_token")
      res.clearCookie("organization_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
  
      res.status(200).json({ message: "Logout successful." });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ message: "Server error during logout." });
    }
};

//get organization by id
export const fetchOrganizationByID = async (req, res) => {
  try {
    // Get the organization ID from the URL parameters
    const organizationId = req.params.id;

    // Validate the organization ID
    if (!organizationId) {
      return res.status(400).json({
        message: "Organization ID is required.",
      });
    }

    // Find the organization by ID and exclude the password field
    const organization = await Organization.findById(organizationId).select("-password");

    // Check if the organization exists
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found.",
      });
    }

    // Return the organization details
    return res.status(200).json({
      message: "Organization fetched successfully.",
      organization,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return res.status(500).json({
      message: "Server error while fetching organization.",
      error: error.message,
    });
  }
};


export const getUnverifiedStudentsByUniversity = async (req, res) => {
  try {
    const { university_id } = req.body;

    // Validate that university_id is provided
    if (!university_id) {
      return res.status(400).json({ message: "University ID is required." });
    }

    // Fetch students who are unverified and match the university_id
    const unverifiedStudents = await User.find({
      is_verified: false,
      organization: university_id,
    });

    // Check if any unverified students are found
    if (unverifiedStudents.length === 0) {
      return res.status(404).json({ message: "No unverified students found for the provided university ID." });
    }

    res.status(200).json({ students: unverifiedStudents });
  } catch (error) {
    console.error("Error fetching unverified students:", error);
    res.status(500).json({ message: "Server error while fetching unverified students." });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update the user's is_verified field to true
    user.is_verified = true;
    await user.save();

    res.status(200).json({ message: "User verified successfully.", user });
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).json({ message: "Server error while verifying user." });
  }
};


export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User rejected and deleted successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server error while rejecting user." });
  }
};


//export dashboard of organization
export const organizationDashboard = async (req, res) => {
  try {
    const organizationId = req.params.id;

    // Validate the organization ID
    if (!organizationId) {
      return res.status(400).json({
        message: "Organization ID is required.",
      });
    }

    // Check if the organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        message: "Organization not found.",
      });
    }

    // Fetch all users belonging to the specified organization and exclude the password field
    const users = await User.find({ organization: organizationId }).select("-password");

    // Group users by their roles within the same organization
    const dashboardData = {
      faculty: users.filter((user) => user.role === "faculty"),
      student: users.filter((user) => user.role === "student"),
      alumni: users.filter((user) => user.role === "alumni"),
    };

    // Fetch events created for the organization
    const events = await Event.find({ created_for: organizationId });

    // Split events into upcoming and past based on current date
    const currentDate = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) > currentDate);
    const pastEvents = events.filter(event => new Date(event.date) <= currentDate);

    // Return the grouped data with the events
    return res.status(200).json({
      message: "Organization dashboard fetched successfully.",
      data: {
        ...dashboardData,
        upcomingEvents,
        pastEvents,
      },
    });
  } catch (error) {
    console.error("Error fetching organization dashboard:", error);
    return res.status(500).json({
      message: "Server error while fetching organization dashboard.",
      error: error.message,
    });
  }
};


export const bulkRegisterUsers = async (req, res) => {
  try {
    // Ensure the file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Read the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheet_name_list = workbook.SheetNames;
    const usersData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    // Loop through the users data from the Excel sheet
    const usersToCreate = [];
    for (const user of usersData) {
      // Ensure password is hashed
      const hashedPassword = await bcrypt.hash(user.password, 10);
      usersToCreate.push({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: new Date(user.dob), // Convert to Date type
        state: user.state,
        city: user.city,
        zipCode: user.zipCode,
        organization: new mongoose.Types.ObjectId(user.organization),
        is_verified: true, // Set as verified
      });
    }

    // Bulk insert users into the database
    await User.insertMany(usersToCreate);

    res.status(201).json({ message: `${usersToCreate.length} users registered successfully.` });
  } catch (error) {
    console.error("Error during bulk user registration:", error);
    res.status(500).json({ message: "Server error during bulk registration." });
  }
};