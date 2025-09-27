import Job from "../models/jobModel.js";
import User from "../models/userModel.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/imageUploader.js";

// Create Job
export const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      skills,
      applyLink,
      type,
      stipendOrSalary,
    } = req.body;
    const createdBy = req.user.id;

    const jobphoto = req.files?.jobphoto;
    const userRole = req.user.role;

    // Validate role for category
    const allowedRoles = ["faculty", "alumni"];
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to create a job.",
      });
    }
    if (!jobphoto) {
      return res.status(400).json({
        success: false,
        message: "No job picture uploaded",
      });
    }

    // Check if required fields are missing
    if (
      !title ||
      !company ||
      !location ||
      !description ||
      !skills ||
      !applyLink ||
      !stipendOrSalary ||
      !type
    ) {
      return res.status(403).send({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    // Validate file format (only accept images)
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    if (!validMimeTypes.includes(jobphoto.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
      });
    }

    // Use the temp file path provided by express-fileupload
    const image = await uploadImageToCloudinary(
      jobphoto,
      process.env.CLOUDINARY_FOLDER_NAME,
      1000,
      1000
    );

    // Create new job instance
    const newJob = new Job({
      title,
      company,
      location,
      description,
      skills,
      applyLink,
      createdBy,
      type,
      stipendOrSalary,
      jobphoto: image.secure_url,
    });

    // Save the job to the database
    await newJob.save();

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating job",
      error: error.message,
    });
  }
};

// Get All Jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });

    res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      jobs,
    });
  } catch (error) {
    console.error("Error retrieving jobs:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving jobs",
      error: error.message,
    });
  }
};

export const getbyId = async (req, res) => {
  const { jobid } = req.params;

  try {
    // Find the job by its ID
    const job = await Job.findById(jobid);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (error) {
    console.error("Error retrieving job:", error);

    if (error.kind === "ObjectId") {
      // Handle invalid ObjectId
      return res.status(400).json({ message: "Invalid job ID" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// Update Job
export const updateJob = async (req, res) => {
  try {
    const { jobid } = req.params;
    const user = req.user.id;

    // Find the job by ID
    const job = await Job.findById(jobid);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.createdBy.toString() !== user) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this job",
      });
    }

    // Prepare the update data
    const updateData = {
      title: req.body.title || job.title,
      company: req.body.company || job.company,
      location: req.body.location || job.location,
      description: req.body.description || job.description,
      skills: req.body.skills || job.skills,
      stipendOrSalary: req.body.stipendOrSalary || job.stipendOrSalary,
      applyLink: req.body.applyLink || job.applyLink,
    };

    // Handle jobphoto update
    if (req.files?.jobphoto) {
      // Delete the previous image from Cloudinary if it exists
      if (job.jobphoto) {
        const publicId = job.jobphoto
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await deleteImageFromCloudinary(publicId);
      }

      // Upload the new image to Cloudinary
      const image = await uploadImageToCloudinary(
        req.files.jobphoto,
        "job_photos",
        1000,
        1000
      );
      updateData.jobphoto = image.secure_url;
    }

    // Update the job in the database
    const updatedJob = await Job.findByIdAndUpdate(jobid, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating job",
      error: error.message,
    });
  }
};

// Delete Job
export const deleteJob = async (req, res) => {
  try {
    const { jobid } = req.params;
    const userId = req.user.id; // Assuming `req.user` contains authenticated user details

    // Find the job by ID
    const job = await Job.findById(jobid);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if the authenticated user is the creator of the job
    if (job.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this job",
      });
    }

    // Delete the job photo from Cloudinary if it exists
    if (job.jobphoto) {
      const publicId = job.jobphoto
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await deleteImageFromCloudinary(publicId);
    }

    // Delete the job from the database
    await Job.findByIdAndDelete(jobid);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting job",
      error: error.message,
    });
  }
};

//get the job created by the perticular user
export const getJobsByUser = async (req, res) => {
  try {
    const userId = req.params.userid; // Extract user ID from request parameters

    // Find all jobs created by the specified user
    const jobs = await Job.find({ createdBy: userId });

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No jobs found for this user",
      });
    }

    res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully",
      jobs,
    });
  } catch (error) {
    console.error("Error retrieving jobs by user:", error.message);
    res.status(500).json({
      success: false,
      message: "Error retrieving jobs",
      error: error.message,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user.id; // Assuming the authenticated user ID is available in `req.user`

    // Validate job existence
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if the job is already applied
    if (user.appliedJobs.includes(jobId)) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Add job ID to the user's appliedJobs array
    user.appliedJobs.push(jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Job application successful",
      appliedJobs: user.appliedJobs,
    });
  } catch (error) {
    console.error("Error applying for job:", error.message);
    res.status(500).json({
      success: false,
      message: "Error applying for job",
      error: error.message,
    });
  }
};


// for job save
export const saveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if the job exists
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const user = await User.findById(userId);

    if (!user.savedJob.includes(id)) {
      user.savedJob.push(id);
      await user.save();
    }

    res.status(200).json({ message: "Job saved successfully", savedJob: user.savedJob });
  } catch (error) {
    res.status(500).json({ message: "Error saving job", error: error.message });
  }
};

export const likeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) return res.status(404).json({ message: "job not found" });

    // Remove dislike if exists
    job.dislikes = job.dislikes.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );

    // Add like if not already liked
    if (!job.likes.includes(req.user.id)) {
      job.likes.push(req.user.id);
    }

    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to like job", error });
  }
};

export const dislikeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) return res.status(404).json({ message: "job not found" });

    // Remove like if exists
    job.likes = job.likes.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );

    // Add dislike if not already disliked
    if (!job.dislikes.includes(req.user.id)) {
      job.dislikes.push(req.user.id);
    }

    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Failed to dislike job", error });
  }
};

