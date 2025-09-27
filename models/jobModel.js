import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "Not specified",
  },
  description: {
    type: String,
    required: true,
  },
  jobphoto: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
    validate: {
      validator: function (skillsArray) {
        return skillsArray.length > 0;
      },
      message: "At least one skill is required.",
    },
  },
  type: {
    type: String,
    enum: ["job", "internship", "apprenticeship"],
    required: true,
  },
  stipendOrSalary: {
    type: String,
    default: "Not specified",
    validate: {
      validator: function (value) {
        // Ensure it's a valid stipend/salary format (e.g., "10,000 INR", "Monthly", etc.)
        return value.trim() !== "";
      },
      message: "Stipend or Salary must not be empty.",
    },
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  applyLink: {
    type: String,
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to users who liked the post
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to users who disliked the post
    },
  ],
  created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
