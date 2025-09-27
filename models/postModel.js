import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    postPhoto: {
      type: String, // URL
      default: "", // Optional, can be empty initially
      validate: {
        validator: function (v) {
          return !v || /^(ftp|http|https):\/\/[^ "]+$/.test(v); // Optional but must be a valid URL if provided
        },
        message: "Please provide a valid URL for the Post photo.",
      },
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
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
