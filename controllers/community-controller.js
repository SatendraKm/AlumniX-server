import Community from "../models/communityModel.js";
import User from "../models/userModel.js";

// Create a new community
export const createCommunity = async (req, res) => {
  try {
    const { name, communityProfileImage } = req.body;
    const userId = req.user.id; // Assuming `auth` middleware sets `req.user`

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Community name is required." });
    }

    // Create the community
    const community = await Community.create({
      name,
      createdBy: userId,
      communityProfileImage: communityProfileImage || "",
    });

    return res.status(201).json({
      message: "Community created successfully.",
      community,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while creating the community.", error });
  }
};

// Delete an existing community
export const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params; // Community ID
    const userId = req.user.id; // Assuming `auth` middleware sets `req.user`

    // Find the community and verify the creator
    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({ message: "Community not found!" });
    }

    if (community.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this community." });
    }

    // Delete the community
    await community.remove();

    return res.status(200).json({
      message: "Community deleted successfully.",
      community,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while deleting the community.", error });
  }
};

// Add a member to a community
export const addMember = async (req, res) => {
  try {
    const { id } = req.params; // Community ID
    const { userId } = req.body; // Member's user ID

    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Add the user to the community members
    const community = await Community.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } }, // Prevent duplicates with $addToSet
      { new: true } // Return the updated document
    );

    if (!community) {
      return res.status(404).json({ message: "Community not found!" });
    }

    return res.status(200).json({
      message: "Member added successfully to the community.",
      community,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while adding the member.", error });
  }
};

// Remove a member from a community
export const removeMember = async (req, res) => {
  try {
    const { id } = req.params; // Community ID
    const { userId } = req.body; // Member's user ID

    // Verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Remove the user from the community members
    const community = await Community.findByIdAndUpdate(
      id,
      { $pull: { members: userId } }, // Remove the user ID from the array
      { new: true } // Return the updated document
    );

    if (!community) {
      return res.status(404).json({ message: "Community not found!" });
    }

    return res.status(200).json({
      message: "Member removed successfully from the community.",
      community,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred while removing the member.", error });
  }
};
