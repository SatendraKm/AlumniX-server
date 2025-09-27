import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for sign-up"],
      validate: [validator.isEmail, "Please provide a valid email!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["student", "alumni", "faculty", "admin"],
      required: [true, "Role is required"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v); // Ensures a 10-digit phone number
        },
        message: "Phone must contain exactly 10 digits!",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is required"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    zipCode: {
      type: String,
      required: [true, "Zipcode is required"],
      validate: {
        validator: function (v) {
          return /\d{5,6}/.test(v); // Supports 5 or 6-digit postal codes
        },
        message: "Zip code must contain 5 or 6 digits!",
      },
    },
    forgetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    about: {
      type: String,
      default: "",
    },
    tagLine: {
      type: String,
      default: "",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    batch: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    socialMediaLinks: [
      {
        linkedin: { type: String, default: "" },
      },
    ],
    groups: [
      {
        groupId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Group",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "notAdmin"],
          required: true,
        },
      },
    ],
    savedJob: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    savedPost: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    savedProject: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    profileimageUrl: {
      type: String,
      default: "",
    },
    backgroundimageUrl: {
      type: String,
      default: "",
    },
    isMentor: {
      type: Boolean,
      default: false,
    },
    appliedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    stories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story",
      },
    ],
    customerID: {
      type: String,
      default: null,
    },
    registeredEvent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    registeredEventVolunteer: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volunteer",
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        grade: { type: String, default: "" },
      },
    ],
    skills: {
      type: [
        {
          skillName: { type: String, required: true },
        },
      ],
      validate: {
        validator: function (skills) {
          return skills.length <= 7;
        },
        message: "A user can have a maximum of 7 skills!",
      },
    },
    certificationsAndLicenses: [
      {
        name: { type: String, required: true },
        issuingOrganization: { type: String, required: true },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        credentialId: { type: String, default: "" },
        credentialUrl: { type: String, default: "" },
      },
    ],
    publicationsAndResearch: [
      {
        title: { type: String, required: true },
        publicationDate: { type: Date, required: true },
        publisher: { type: String },
        description: { type: String, default: "" },
        link: { type: String, default: "" },
      },
    ],
    is_verified: {
      type: Boolean,
      default: false,
    },
    enrollmentnumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
