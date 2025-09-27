import Story from "../models/storyModel.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/imageUploader.js";

// Get Story
export const getStory = async (req, res) => {
  try {
    const { id } = req.params;
    const story = await Story.findById(id).populate("createdBy", "name");

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Check if the current user has liked the story
    const userId = req.user.id;
    const hasLiked = story.likedBy.includes(userId);

    res.status(200).json({
      success: true,
      message: "Story retrieved successfully",
      story: {
        ...story.toObject(),
        isLiked: hasLiked, // Add like status for the current user
      },
    });
  } catch (error) {
    console.error("Error fetching story:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the story",
      error: error.message,
    });
  }
};

// Create Story
export const newStory = async (req, res) => {
  try {
    const { title } = req.body;
    const storyImage = req.files?.storyImage;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !storyImage) {
      return res.status(400).json({
        success: false,
        message: "Title and content type are required",
      });
    }

    // Upload image if provided (optional)
    let imageUrl = "";
    if (storyImage) {
      const image = await uploadImageToCloudinary(
        storyImage,
        process.env.FOLDER_NAME,
        1000,
        1000
      );
      imageUrl = image.secure_url;
    }

    // Create new story
    const newStory = new Story({
      title,
      storyImage: imageUrl,
      createdBy: userId,
    });

    // Save the story to the database
    await newStory.save();

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story: newStory,
    });
  } catch (error) {
    console.error("Error creating story:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the story",
      error: error.message,
    });
  }
};

// Delete Story
export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the story by ID
    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Check if the user is the creator of the story
    if (story.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this story",
      });
    }

    // Delete the image from Cloudinary if it exists
    if (story.content) {
      const publicId = story.content
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await deleteImageFromCloudinary(publicId);
    }

    // Delete the story from the database
    await Story.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting story:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the story",
      error: error.message,
    });
  }
};

//get all story
export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Story retrieved successfully!",
      data: stories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching Story.",
      error: error.message,
    });
  }
};

//get all story for a user
export const getStoryByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ID format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    // Find projects created by the user
    const stories = await Story.find({ createdBy: userId });

    if (stories.length === 0) {
      return res.status(404).json({ message: "No Story found for this user." });
    }

    // Send projects details
    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories by user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//update story
export const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const userId = req.user.id;

    // Find the story to validate ownership
    const story = await Story.findById(id);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    // Check if the logged-in user is the creator of the story
    if (story.createdBy != userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this story.",
      });
    }

    // Check if story content (image or video) is being updated
    if (req.files?.storyContent) {
      const storyContent = req.files.storyContent;
      const uploadedContent = await uploadImageToCloudinary(
        storyContent,
        process.env.FOLDER_NAME,
        1000,
        1000
      );
      updatedData.content = uploadedContent.secure_url; // Update content with URL
    }

    // Update story in the database
    const updatedStory = await Story.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validations
    });

    res.status(200).json({
      success: true,
      message: "Story updated successfully!",
      data: updatedStory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating the Story.",
      error: error.message,
    });
  }
};

//like
export const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);

    if (!story) return res.status(404).json({ message: "story not found" });

    // Remove dislike if exists
    story.dislikes = story.dislikes.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );

    // Add like if not already liked
    if (!story.likes.includes(req.user.id)) {
      story.likes.push(req.user.id);
    }

    await story.save();
    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: "Failed to like story", error });
  }
};

export const dislikeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);

    if (!story) return res.status(404).json({ message: "story not found" });

    // Remove like if exists
    story.likes = story.likes.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );

    // Add dislike if not already disliked
    if (!story.dislikes.includes(req.user.id)) {
      story.dislikes.push(req.user.id);
    }

    await story.save();
    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: "Failed to dislike story", error });
  }
};
