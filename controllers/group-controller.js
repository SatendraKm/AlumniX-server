import Group from "../models/groupModel.js";
import User from "../models/userModel.js";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../utils/imageUploader.js";

export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const groupProfileImage = req.files?.groupProfileImage;
        const userId = req.user.id;


        if (!name) {
            return res.status(403).send({
                success: false,
                message: "Name of group required!",
            });
        }

        let posterUrl = "";
        if (groupProfileImage) {
            const image = await uploadImageToCloudinary(groupProfileImage, process.env.FOLDER_NAME, 1000, 1000);
            posterUrl = image.secure_url;
        }

        // Create a new group
        const newGroup = new Group({
            name,
            groupProfileImage: posterUrl,
            createdBy: userId,
            members: [userId],
        });

        await newGroup.save();


        try {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        groups: {
                            groupId: newGroup._id,
                            role: 'admin',
                        },
                    },
                },
                { new: true, useFindAndModify: false }
            );
        
            if (!updatedUser) {
                console.error(`No user found with ID: ${userId}`);
                return;
              }
        } catch (error) {
            console.error('Error updating user groups:', error);
        }
        

        res.status(201).json({
            success: true,
            message: "Group created successfully",
            group: newGroup,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error creating group",
            error: error.message,
        });
    }
};

// Update Group
export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name } = req.body;

        // Find the group by ID
        let group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        // Check if the user is the creator of the group
        if (group.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to update this group",
            });
        }

        // Update fields
        const updateData = {
            name: name || group.name,
        };

        // Handle group profile image if provided
        if (req.files?.groupProfileImage) {
            // Delete previous image if it exists
            if (group.groupProfileImage) {
                const publicId = group.groupProfileImage.split("/").slice(-2).join("/").split(".")[0];
                await deleteImageFromCloudinary(publicId);
            }

            // Upload new image
            const image = await uploadImageToCloudinary(req.files.groupProfileImage, "group_profile_images", 1000, 1000);
            updateData.groupProfileImage = image.secure_url;
        }

        // Update the group in the database
        const updatedGroup = await Group.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: "Group updated successfully",
            group: updatedGroup,
        });
    } catch (error) {
        console.error("Error updating group:", error.message);
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the group. Please try again later.",
            error: error.message,
        });
    }
};

// Delete Group
export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find the group by ID
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        // Check if the user is the creator of the group
        if (group.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to delete this group",
            });
        }

        // Delete the group profile image from Cloudinary if it exists
        if (group.groupProfileImage) {
            const publicId = group.groupProfileImage.split("/").slice(-2).join("/").split(".")[0];
            await deleteImageFromCloudinary(publicId);
        }

        // Remove the group from all members' group lists
        await User.updateMany(
            { _id: { $in: group.members } }, // Find all users who are members of this group
            { $pull: { groups: { groupId: group._id } } } // Remove the groupId from their 'groups' array
        );

        // Delete the group from the database
        await Group.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Group deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error deleting group",
            error: error.message,
        });
    }
};

// Add Member to Group
export const addMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberId } = req.body;

        // Find the group by ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        // Check if the user is already a member
        else if (group.members.includes(memberId)) {
            return res.status(400).json({
                success: false,
                message: "User is already a member of the group",
            });
        }

        // Add the member to the group's member list
        else {
            group.members.push(memberId);
            await group.save();

            // Update the user's group information to reflect new group membership
            await User.findByIdAndUpdate(
                memberId,
                {
                    $push: {
                        groups: {
                            groupId: group._id,
                            role: 'notAdmin',
                        },
                    },
                },
                { new: true, useFindAndModify: false }
            );

            res.status(200).json({
                success: true,
                message: "Member added successfully",
                group,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error adding member to group",
            error: error.message,
        });
    }
};

// Remove Member from Group
export const removeMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberId } = req.body;

        // Find the group by ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        // Check if the user is a member of the group
        if (!group.members.includes(memberId)) {
            return res.status(400).json({
                success: false,
                message: "User is not a member of the group",
            });
        }

        // Remove the member from the group's member list
        group.members = group.members.filter((member) => member.toString() !== memberId);
        await group.save();

        // Remove the group from the user's group list
        await User.findByIdAndUpdate(
            memberId,
            {
                $pull: {
                    groups: { groupId: group._id },
                },
            },
            { new: true, useFindAndModify: false }
        );

        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            group,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error removing member from group",
            error: error.message,
        });
    }
};

// Get All Groups
export const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json({
            success: true,
            message: "Groups retrieved successfully",
            groups,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error retrieving groups",
            error: error.message,
        });
    }
};

// Get All Members in Group
export const getAllMembersInGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId).populate('members', 'name email');
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Members retrieved successfully",
            members: group.members,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error retrieving members",
            error: error.message,
        });
    }
};
