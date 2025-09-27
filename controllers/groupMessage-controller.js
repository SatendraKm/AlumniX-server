import { groupCollapsed } from "console";
import GroupMessage from "../models/groupMessageModel.js";
import Group from "../models/groupModel.js";

// Add Group Message
export const addMessage = async (req, res) => {
    try {
        const { groupId, message, sender } = req.body;
        console.log(groupId, message, sender);
        
        if (!message || !sender || !groupId) {
            return res.status(400).json({
                success: false,
                message: "Message, sender, and groupId are required",
            });
        }

        // Retrieve all members of the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found",
            });
        }

        const newMessage = new GroupMessage({
            message: { text: message },
            users: group.members, // All members of the group
            sender,
            groupId,
        });

        await newMessage.save();

        res.status(201).json({
            success: true,
            message: "Message added successfully",
            newMessage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error adding message",
            error: error.message,
        });
    }
};

// Get Group Messages
export const getGroupMessages = async (req, res) => {
    try {
      const { groupId } = req.body;
      
      // Log for debugging purposes
      // console.log("Group ID received: ", groupId);
  
      // Fetch messages for the group and populate sender's name and email
      const messages = await GroupMessage.find({ groupId })
        .populate('sender', 'name email')
        .sort({ updatedAt: 1 });

      
      const userID = req.user.id;

      // Format the messages similar to one-to-one message projection
      const projectedMessages = messages?.map((msg) => {
        return {
          fromSelf: msg.sender.toString() == userID,  
          message: msg.message.text,
        };
      });
  
      // Respond with formatted messages
      res.status(200).json({
        success: true,
        messages: projectedMessages,
      });
    } catch (error) {
      console.error("Error retrieving group messages:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving group messages",
        error: error.message,
      });
    }
  };
  
