import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

export const createPost = async (req, res) => {
  try {
    const { description } = req.body;
    const postPhoto = req.files?.postPhoto;
    const createdBy = req.user.id; //Assuming req.user contains the logged-in user's data

    if (!postPhoto || !description) {
      return res.status(400).json({
        success: false,
        message: "No post picture uploaded",
      });
    }

    // Validate file format (only accept images)
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    if (!validMimeTypes.includes(postPhoto.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
      });
    }

    const image = await uploadImageToCloudinary(
      postPhoto,
      process.env.FOLDER_NAME,
      1000,
      1000
    );

    const user = await User.findById(createdBy);

    if(!user){
      return res.json({
        message : "User Not Found"
      })
    }

    const newPost = new Post({
      createdBy,
      description,
      postPhoto: image.secure_url,
      created_for: user.organization
    });
    await newPost.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      data: newPost,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create post", error: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {

    const userID = req.user.id;
    const user = await User.findById(userID);

    console.log(userID);


    const posts = await Post.find({created_for: user.organization});
    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch post", error });
  }
};  

export const updatePost = async (req, res) => {
  try {
    const { description } = req.body;
    const postPhoto = req.files?.postPhoto;
    let image;

    if (postPhoto) {
      const validMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
      ];

      if (!validMimeTypes.includes(postPhoto.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
        });
      }

      // Ensure uploadImageToCloudinary is handling exceptions properly
      image = await uploadImageToCloudinary(
        postPhoto,
        process.env.FOLDER_NAME,
        1000,
        1000
      );

      if (!image || !image.secure_url) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to cloud storage.",
        });
      }
    }

    const updateData = { description };
    if (image?.secure_url) {
      updateData.postPhoto = image.secure_url;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error); // Improved error logging
    res
      .status(500)
      .json({ message: "Failed to update post", error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);

    if (!deletedPost)
      return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Remove dislike if exists
    post.dislikes = post.dislikes.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );

    // Add like if not already liked
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to like post", error });
  }
};

export const dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Remove like if exists
    post.likes = post.likes.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );

    // Add dislike if not already disliked
    if (!post.dislikes.includes(req.user.id)) {
      post.dislikes.push(req.user.id);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to dislike post", error });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.params.userId });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts by user", error });
  }
};

// for post save
export const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if the post exists
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = await User.findById(userId);
    
    if (!user.savedPost.includes(id)) {
      user.savedPost.push(id);
      await user.save();
    }

    res.status(200).json({ message: "Post saved successfully", savedPost: user.savedPost });
  } catch (error) {
    res.status(500).json({ message: "Error saving post", error: error.message });
  }
};
