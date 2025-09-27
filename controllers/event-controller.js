import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/imageUploader.js";

//get all event
export const getEvents = async (req, res) => {
  try {
    // Get the logged-in user's ID
    const userId = req.user.id;

    // Fetch the user's details to get their organization
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Filter events where the 'created_for' field matches the user's organization
    const events = await Event.find({ created_for: user.organization });

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      message: "Error in fetching events.",
      error: error.message || "Unknown error",
    });
  }
};

// Create Event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      type,
      mode,
      venue,
      link,
      date,
      time,
      eventDescription,
      eventCoordinator,
      coordinatorphone,
      tagsTopic,
      eligibility,
      speaker,
      organizedBy,
      reminder,
    } = req.body;

    const eventphoto = req.files?.eventphoto;
    const createdBy = req.user.id;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }



    // Validate required fields
    if (
      !title ||
      !type ||
      !mode ||
      !date ||
      !time ||
      !eventDescription ||
      !tagsTopic ||
      tagsTopic.length === 0 ||
      !speaker ||
      !organizedBy ||
      !eligibility ||
      !reminder ||
      !eventCoordinator ||
      !coordinatorphone
    ) {
      return res.status(403).json({ error: "Missing required fields" });
    }

    if (!eventphoto) {
      return res.status(400).json({
        success: false,
        message: "No job picture uploaded",
      });
    }

    const tagsArray = tagsTopic.split(","); // Convert tagsTopic string to an array

    // Validate file format (only accept images)
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    if (!validMimeTypes.includes(eventphoto.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
      });
    }

    // Upload image if provided
    const image = await uploadImageToCloudinary(
      eventphoto,
      process.env.CLOUDINARY_FOLDER_NAME,
      1000,
      1000
    );

    const user = await User.findById(createdBy);
    const userCollegeID = user.organization;

    // Create new event instance
    const newEvent = new Event({
      createdBy,
      title,
      eventphoto: image.secure_url,
      type,
      mode,
      venue,
      link,
      date,
      time,
      eventDescription,
      eventCoordinator,
      coordinatorphone,
      tagsTopic: tagsArray,
      eligibility,
      speaker,
      organizedBy,
      created_for : userCollegeID,
      reminder,
    });

    // Save the event to the database
    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.eventid;
    const {
      title,
      type,
      mode,
      venue,
      link,
      date,
      time,
      eventDescription,
      eventCoordinator,
      coordinatorphone,
      tagsTopic,
      eligibility,
      speaker,
      organizedBy,
      reminder,
    } = req.body;

    const eventphoto = req.files?.eventphoto;

    // Fetch the event to be updated
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ensure the user is authorized to update the event
    if (req.user.id !== event.createdBy.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
      });
    }

    // Update fields if provided
    if (title) event.title = title;
    if (type) event.type = type;
    if (mode) event.mode = mode;
    if (venue) event.venue = venue;
    if (link) event.link = link;
    if (date) event.date = date;
    if (time) event.time = time;
    if (eventDescription) event.eventDescription = eventDescription;
    if (eventCoordinator) event.eventCoordinator = eventCoordinator;
    if (coordinatorphone) event.coordinatorphone = coordinatorphone;
    if (tagsTopic) event.tagsTopic = tagsTopic.split(",");
    if (eligibility) event.eligibility = eligibility;
    if (speaker) event.speaker = speaker;
    if (organizedBy) event.organizedBy = organizedBy;
    if (reminder) event.reminder = reminder;

    // Handle image update
    if (eventphoto) {
      // Validate file format
      const validMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
      ];
      if (!validMimeTypes.includes(eventphoto.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
        });
      }

      // Delete the old image from Cloudinary
      if (event.eventphoto) {
        await deleteImageFromCloudinary(event.eventphoto);
      }

      // Upload the new image
      const image = await uploadImageToCloudinary(
        eventphoto,
        process.env.CLOUDINARY_FOLDER_NAME,
        1000,
        1000
      );
      event.eventphoto = image.secure_url;
    }

    // Save the updated event
    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};
// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventid;

    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if the logged-in user is authorized to delete the event
    if (req.user.id !== event.createdBy.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }

    // Delete the event image from Cloudinary if it exists
    if (event.eventphoto) {
      await deleteImageFromCloudinary(event.eventphoto);
    }

    // Delete the event from the database
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const eventId = req.params.eventid;

    // Find the event by ID and populate the `createdBy` field for user details (if necessary)
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};

export const getEventsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find events created by the specific user
    const events = await Event.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    if (!events || events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No events found for this user",
      });
    }

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

export const likeEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) return res.status(404).json({ message: "event not found" });

    // Remove dislike if exists
    event.dislikes = event.dislikes.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );

    // Add like if not already liked
    if (!event.likes.includes(req.user.id)) {
      event.likes.push(req.user.id);
    }

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to like event", error });
  }
};

export const dislikeEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) return res.status(404).json({ message: "event not found" });

    // Remove like if exists
    event.likes = event.likes.filter(
      (userId) => userId.toString() !== req.user.id.toString()
    );

    // Add dislike if not already disliked
    if (!event.dislikes.includes(req.user.id)) {
      event.dislikes.push(req.user.id);
    }

    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to dislike event", error });
  }
};

// Register User for Event
export const registerForEvent = async (req, res) => {
  try {
    // Extract event ID and user ID from request
    const eventId = req.params.eventid;
    const userId = req.user.id; // The user ID is taken from the JWT or session

    // Find the event by its ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has already registered for this event
    if (user.registeredEvent.includes(eventId)) {
      return res
        .status(400)
        .json({ message: "User is already registered for this event" });
    }

    // Add the event ID to the user's registered events
    user.registeredEvent.push(eventId);

    // Add the user ID to the event's registered users
    event.registeredUser.push(userId);

    // Save the user and event
    await user.save();
    await event.save();

    // Respond with success message
    res.status(200).json({
      message: "Event Registration successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
