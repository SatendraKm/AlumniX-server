import Project from "../models/projectModel.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import User from "../models/userModel.js";
import Donation from "../models/donationModel.js";

export const createProject = async (req, res) => {
  try {
    // Extract fields from the request body
    const {
      projectType,
      fundingRequired,
      department,
      projectPhase,
      projectTopic,
      description,
      eligibility,
      openForMentor,
      openForStudent,
    } = req.body;
    const createdBy = req.user.id;

    const user = await User.findById(createdBy)

    const technologyUsed = req.body.technologyUsed
      ? JSON.parse(req.body.technologyUsed)
      : []; 
    const projectLinks = req.body.projectLinks
      ? JSON.parse(req.body.projectLinks)
      : {};
    const projectPhoto = req.files?.projectPhoto;

    if (!projectPhoto) {
      return res.status(400).json({
        success: false,
        message: "No project picture uploaded",
      });
    }
    // Validate required fields
    if (
      !createdBy ||
      !projectType ||
      !technologyUsed ||
      fundingRequired === undefined ||
      !department ||
      !projectPhase ||
      !projectTopic ||
      !description ||
      !eligibility ||
      openForMentor === undefined ||
      openForStudent === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    // Validate technology array length
    if (technologyUsed.length > 7) {
      return res.status(400).json({
        success: false,
        message: "You can specify up to 7 technologies only.",
      });
    }

    // Validate file format (only accept images)
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    if (!validMimeTypes.includes(projectPhoto.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
      });
    }

    // Use the temp file path provided by express-fileupload
    const image = await uploadImageToCloudinary(
      projectPhoto,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    // Create the new project
    const newProject = new Project({
      createdBy,
      projectType,
      technologyUsed,
      fundingRequired,
      department,
      projectPhase,
      projectTopic,
      description,
      eligibility,
      projectLinks,
      projectPhoto: image.secure_url,
      openForMentor,
      openForStudent,
      created_for: user.organization
    });

    await newProject.save();

    // Success response
    res.status(201).json({
      success: true,
      message: `Project created successfully!`,
      data: newProject,
    });
  } catch (error) {
    // Error response
    res.status(500).json({
      success: false,
      message: "Error creating the project. Please try again.",
      error: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const id = req.params.projectid; // Get project ID from URL params
    const updatedData = req.body;

    // Check if profile photo needs to be updated
    if (req.files?.projectPhoto) {
      const projectPhoto = req.files.projectPhoto;
      const image = await uploadImageToCloudinary(
        projectPhoto.tempFilePath,
        process.env.FOLDER_NAME,
        1000,
        1000
      );
      updatedData.projectPhoto = image.secure_url; // Add new profile photo URL to updatedData
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validations
    });

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully!",
      data: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating the project.",
      error: error.message,
    });
  }
};

// Delete a project
export const deleteProject = async (req, res) => {
  try {
    const id = req.params.projectid; // Get project ID from URL params

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting the project.",
      error: error.message,
    });
  }
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the user's details to get their organization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const projects = await Project.find({created_for: user.organization});
    
    res.status(200).json({
      success: true,
      message: "Projects retrieved successfully!",
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching projects.",
      error: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectid } = req.params;

    // Validate ID format
    if (!projectid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid project ID format." });
    }

    // Find project by ID
    const project = await Project.findById(projectid);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Send project details
    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getProjectsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // Find projects created by the user
    const projects = await Project.find({ createdBy: userId });

    // Return an empty array if no projects are found
    res.status(200).json(projects.length > 0 ? projects : []);
  } catch (error) {
    console.error("Error fetching projects by user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//contribute to a project
export const addContributorToProject = async (req, res) => {
  const projectId = req.params.projectid;
  const userId = req.user.id;
  const userrole = req.user.role;

  if (!userId || !userrole) {
    return res.status(400).json({ message: "User must login !!" });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (project.createdBy._id.toString() === userId) {
      return res.status(400).json({
        message:
          "You can't add yourself as contributor as you have created this project",
      });
    }
    if (userrole === "student") {
      if (project.studentContributors.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is already a student contributor." });
      }
      project.studentContributors.push(userId);
    } else {
      if (project.mentorContributors.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is already a mentor contributor." });
      }
      project.mentorContributors.push(userId);
    }

    await project.save();
    res
      .status(200)
      .json({ message: "User added as a contributor successfully.", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to add user as contributor" });
  }
};

export const removeContributorToProject = async (req, res) => {
  const projectId = req.params.projectid;
  const userId = req.user.id;
  const userrole = req.user.role;

  if (!userId || !userrole) {
    return res.status(400).json({ message: "User must login !!" });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (userrole === "student") {
      project.studentContributors = project.studentContributors.filter(
        (id) => id.toString() !== userId
      );
    } else {
      project.mentorContributors = project.mentorContributors.filter(
        (id) => id.toString() !== userId
      );
    }

    await project.save();
    res
      .status(200)
      .json({ message: "Contributor removed successfully.", project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "failed to add user as contributor" });
  }
};

// for project save
export const saveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = await User.findById(userId);

    // Directly push the project ID into savedProject array
    if (!user.savedProject.includes(id)) {
      user.savedProject.push(id);
      await user.save();
    }

    res
      .status(200)
      .json({
        message: "Project saved successfully",
        savedProject: user.savedProject,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving project", error: error.message });
  }
};


//  All users donation in project 
export const allUsersDonation = async (req, res) => {
  try {
    const projectID = req.params.id;
    // Fetch all donations related to the specified project
    const donations = await Donation.find({ projectID });

    if (!donations.length) {
      return res.status(404).json({ message: 'No donations found for this project.' });
    }

    // Aggregate donations by each user and sum their amounts
    const donationSummary = donations.reduce((acc, donation) => {
      const userID = donation.donationFrom.toString(); // Ensure it's a string
      acc[userID] = (acc[userID] || 0) + donation.amount;
      return acc;
    }, {});

    // Convert the aggregated data into an array of objects
    const result = Object.entries(donationSummary).map(([userID, amount]) => ({
      _id: userID,
      amount: amount,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// specific User wise project donation
export const userDonatedPerProject = async (req, res) => {
  try {
    const userID = req.params.id;

    // Fetch all donations made by the specified user
    const donations = await Donation.find({ donationFrom: userID });

    if (!donations.length) {
      return res.status(404).json({ message: 'No donations found for this user.' });
    }

    // Aggregate donations by each project and sum their amounts
    const donationSummary = donations.reduce((acc, donation) => {
      const projectID = donation.projectID.toString(); // Ensure it's a string
      acc[projectID] = (acc[projectID] || 0) + donation.amount;
      return acc;
    }, {});

    // Convert the aggregated data into an array of objects
    const result = Object.entries(donationSummary).map(([projectID, amount]) => ({
      projectID: projectID,
      amount: amount,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


export const getPopularProjects = async (req, res) => {
  try {
    // Aggregate to calculate the total donations for each project
    const popularProjects = await Project.aggregate([
      {
        $addFields: {
          totalDonations: {
            $sum: "$donations.donationAmount", // Sum the donationAmount field in the donations array
          },
        },
      },
      {
        $sort: { totalDonations: -1 }, // Sort projects by totalDonations in descending order
      },
      {
        $limit: 2, // Limit the result to the top 2 projects
      },
    ]);

    // Send the result as a response
    res.status(200).json({
      message: "Top 2 popular projects fetched successfully.",
      data: popularProjects,
    });
  } catch (error) {
    // Error handling
    res.status(500).json({
      message: "An error occurred while fetching popular projects.",
      error: error.message,
    });
  }
};






