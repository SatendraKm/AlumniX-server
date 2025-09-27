import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupProfileImage: {
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

const Group = mongoose.model("Group", groupSchema);
export default Group;