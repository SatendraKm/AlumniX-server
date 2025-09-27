import Volunteer from "../models/volunteerModel.js";
import User from "../models/userModel.js";

export const getvolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.find({});
    res.json(volunteer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching volunteer", error: error.message });
  }
};

export const createVolunteer = async (req, res) => {
  try {
    const {
      eventId,
      positionTitle,
      rolesResponsibility,
      eligibility,
      skills,
      volunteerCount,
    } = req.body;
    const createdBy = req.user.id;
    if (!createdBy) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (
      !eventId ||
      !positionTitle ||
      !rolesResponsibility ||
      !eligibility ||
      !skills ||
      !volunteerCount
    ) {
      return res.status(403).json({ error: "Missing required fields" });
    }

    const newVolunteerPosition = new Volunteer({
      createdBy,
      eventId,
      positionTitle,
      rolesResponsibility,
      eligibility,
      skills,
      volunteerCount,
      availablePositions: volunteerCount,
    });

    await newVolunteerPosition.save();

    res.status(201).json({
      success: true,
      message: "Volunteer position created successfully",
      data: newVolunteerPosition,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating volunteer position",
      error: error.message,
    });
  }
};

export const getVolunteerById = async (req, res) => {
  try {
    const volunteerpositionId = req.params.volunteerpositionid;

    // Find the event by ID and populate the `createdBy` field for user details (if necessary)
    const  volunteerposition = await Volunteer.findById(volunteerpositionId);

    if (!volunteerposition) {
      return res.status(404).json({
        success: false,
        message: "Volunteer position not found",
      });
    }

    res.status(200).json({
      success: true,
      volunteerposition,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching Volunteer position",
      error: error.message,
    });
  }
};

export const applyVolunteer = async (req, res) => {
  try {
    const volunteerId = req.params.volunteerId;
    const userId = req.user.id;

    // Check if the volunteer position exists
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer position not found" });
    }

    // Check if the user has already registered for this volunteer position
    const user = await User.findById(userId);
    if (user.registeredEventVolunteer.includes(volunteerId)) {
      return res.status(400).json({
        message: "You have already applied for this volunteer position",
      });
    }

    // Check if positions are still available
    if (volunteer.availablePositions <= 0) {
      return res.status(400).json({
        message: "No positions available for this volunteer opportunity",
      });
    }

    // Add the volunteer position to the user's registeredEventVolunteer field
    user.registeredEventVolunteer.push(volunteerId);
    await user.save();

    // Update the volunteer: reduce availablePositions and add the user to appliedUsers
    volunteer.availablePositions -= 1;
    volunteer.appliedUsers.push(userId);
    await volunteer.save();

    res.status(200).json({
      success: true,
      message: "Successfully applied for the volunteer position",
      registeredVolunteer: volunteer.appliedUsers,
      availablePositions: volunteer.availablePositions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in applying for volunteer position",
      error: error.message,
    });
  }
};
