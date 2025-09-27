import mongoose from "mongoose";

const communtiySchema = new mongoose.Schema(
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
    members: [
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
    communityProfileImage: {
        type: String,
        default: "",
        validate: {
            validator: function (v) {
                return v === "" || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i.test(v);
            },
            message: "Group Icon must be a valid image file",
        },
    },
  },
  {
    timestamps: true,
  }
);

const Community = mongoose.model("Community", communtiySchema);
export default Community;