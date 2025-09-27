import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    projectType: {
      type: String,
      enum: [
        "Software Development",
        "Research-Oriented",
        "Engineering and Technical Projects",
        "AI, Machine Learning, and Data Science",
        "Business and Management Projects",
      ],
      required: true,
    },
    technologyUsed: {
      type: [String], // Array to hold multiple technologies
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length <= 7; // Maximum of 7 technologies
        },
        message: "You can specify up to 7 technologies only.",
      },
    },
    fundingRequired: {
      type: Boolean,
      required: true,
    },
    department: {
      type: String,
      enum: [
        "Computer Science & Engineering",
        "Mechanical Engineering",
        "Information Technology",
        "Civil Engineering",
        "Biotechnology",
        "Business Administration (MBA/BBA)",
      ],
      required: true,
    },
    projectPhase: {
      type: String,
      enum: ["initial", "intermediate", "advance"],
      required: true,
    },
    projectTopic: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    eligibility: {
      type: String,
      required: true,
      trim: true,
    },
    projectLinks: {
      type: Map, // Map to hold key-value pairs
      of: String, // Values will be URLs
      validate: {
        validator: function (links) {
          for (const link of links.values()) {
            if (link && !/^(ftp|http|https):\/\/[^ "]+$/.test(link)) {
              return false;
            }
          }
          return true;
        },
        message: "Please provide valid URLs for all project links.",
      },
    },
    projectPhoto: {
      type: String, // URL or file path for the profile photo
      default: "", // Optional, can be empty initially
      validate: {
        validator: function (v) {
          return !v || /^(ftp|http|https):\/\/[^ "]+$/.test(v); // Optional but must be a valid URL if provided
        },
        message: "Please provide a valid URL for the profile photo.",
      },
    },
    openForMentor: {
      type: Boolean,
      required: true,
    },
    openForStudent: {
      type: Boolean,
      required: true,
    },
    studentContributors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    donations: [
      {
        donator : {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        donationID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Donation"
        },
        donationAmount: {
          type: Number,
        }
      }
    ],
    mentorContributors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
