import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Story title is required"],
  },
  storyImage: {
    type: String, // URL of the story (image or video)
    default: "",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to users who liked the story
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to users who disliked the story
    },
  ],
  created_for: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
});

const Story = mongoose.model("Story", StorySchema);

export default Story;
