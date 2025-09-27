import User from "../models/userModel.js";

import Mentorship from "../models/mentorshipModel.js";

// Create a new mentorship group
export const createMentorshipGroup = async (req, res) => {
  try {
    const { name, mentorshipProfileImage } = req.body;
    const userId = req.user.id; // Assuming `auth` middleware sets `req.user`

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Name is required to create a mentorship group." });
    }

    // Create a new mentorship group
    const mentorshipGroup = await Mentorship.create({
      name,
      createdBy: userId,
      mentorshipProfileImage: mentorshipProfileImage || "",
    });

    return res.status(201).json({
      message: "Mentorship group created successfully.",
      mentorshipGroup,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while creating the mentorship group.", error });
  }
};

// Delete an existing mentorship group
export const deleteMentorshipGroup = async (req, res) => {
  try {
    const { id } = req.params; // Extract mentorship group ID from route params
    const userId = req.user.id; // Assuming `auth` middleware sets `req.user`

    // Find the mentorship group and verify the creator
    const mentorshipGroup = await Mentorship.findById(id);

    if (!mentorshipGroup) {
      return res.status(404).json({ message: "Mentorship group not found!" });
    }

    if (mentorshipGroup.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this mentorship group." });
    }

    // Delete the mentorship group
    await mentorshipGroup.remove();

    return res.status(200).json({
      message: "Mentorship group deleted successfully.",
      mentorshipGroup,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while deleting the mentorship group.", error });
  }
};

// Add a mentee to a mentorship group
export const addMentee = async (req, res) => {
  try {
    const { id } = req.params; // Extract mentorship group ID from route params
    const { menteeId } = req.body; // Extract mentee ID from request body

    // Check if the mentee exists in the User collection
    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ message: "Mentee not found!" });
    }

    // Add the mentee to the mentorship group
    const mentorshipGroup = await Mentorship.findByIdAndUpdate(
      id,
      { $addToSet: { mentee: menteeId } }, // Prevent duplicates with $addToSet
      { new: true } // Return the updated document
    );

    if (!mentorshipGroup) {
      return res.status(404).json({ message: "Mentorship group not found!" });
    }

    return res.status(200).json({
      message: "Mentee added successfully to the mentorship group.",
      mentorshipGroup,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};

// Remove a mentee from a mentorship group
export const removeMentee = async (req, res) => {
  try {
    const { id } = req.params; // Extract mentorship group ID from route params
    const { menteeId } = req.body; // Extract mentee ID from request body

    // Check if the mentee exists in the User collection
    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ message: "Mentee not found!" });
    }

    // Remove the mentee from the mentorship group
    const mentorshipGroup = await Mentorship.findByIdAndUpdate(
      id,
      { $pull: { mentee: menteeId } }, // Remove the mentee ID from the array
      { new: true } // Return the updated document
    );

    if (!mentorshipGroup) {
      return res.status(404).json({ message: "Mentorship group not found!" });
    }

    return res.status(200).json({
      message: "Mentee removed successfully from the mentorship group.",
      mentorshipGroup,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};




//add a user from being a mentor
export const makeMentor = async (req, res) => {
  try {
    const { id } = req.params;


    const user = await User.findByIdAndUpdate(
      id,
      { isMentor: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({
      message: "User has been successfully made a mentor.",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};



//remove a user from being a mentor
export const removeMentor = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isMentor: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    return res.status(200).json({
      message: "User has been successfully removed from being a mentor.",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
};
