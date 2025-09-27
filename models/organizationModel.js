import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  college_address: {
    type: String,
    default: "Not specified",
  },
  courses: [
    {
      type: String,
      enum: [
        "Computer Science and Engineering",
        "Business Administration",
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical Engineering",
        "Psychology",
        "Nursing and Healthcare",
        "Law and Legal Studies",
        "Media and Communication",
        "Biotechnology",
        "Economics",
        "Fine Arts and Design",
      ],
      required: true,
    },
  ],
  university_id: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin"
  },
  created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
      imageUrl: {
        type: String,
        default: "",
      },
});

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
