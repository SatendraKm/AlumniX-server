import mongoose from "mongoose";

const mentorshipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    mentee: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mentorshipProfileImage: {
        type: String,
        default: "",
        validate: {
            validator: function (v) {
                return v === "" || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v);
            },
            message: "Group Icon must be a valid image file",
        },
    },
    created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
  },
  {
    timestamps: true,
  }
);

const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
export default Mentorship;