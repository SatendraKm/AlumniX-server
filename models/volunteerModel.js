import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  positionTitle: {
    type: String,
    required: true,
  },
  rolesResponsibility: {
    type: String,
    required: true,
  },
  eligibility: {
    type: String,
    required: true,
  },
  skills: {
    type: String,
    required: true,
  },
  volunteerCount: {
    type: Number,
    required: true,
  },
  availablePositions: {
    type: Number,
    required: true,
  },
  appliedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
});

const Volunteer = mongoose.model("Volunteer", VolunteerSchema);

export default Volunteer;
