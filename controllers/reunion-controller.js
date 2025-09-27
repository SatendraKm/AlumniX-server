import Reunion from "../models/reunionModel.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../utils/imageUploader.js";

// Get all reunions
export const getAllReunions = async (req, res) => {
  try {
    const reunions = await Reunion.find();
    res.status(200).json({
      success: true,
      message: "Reunions fetched successfully",
      data: reunions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reunions",
      error: error.message,
    });
  }
};

// Create a new reunion
export const createReunion = async (req, res) => {
  try {
    const { typeOfEvent, batch, date, time, venue,organizedBy, contact, eligibility } =
      req.body;
    const createdBy = req.user.id;

    const reunionphoto = req.files?.reunionphoto;
    

    // Validate required fields
    if (!typeOfEvent || !batch || !date || !time || !venue || !contact ||!organizedBy||!createdBy) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }
    if (!reunionphoto) {
      return res.status(400).json({
        success: false,
        message: "No picture uploaded",
      });
    }

    // Validate file format (only accept images)
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
    ];
    if (!validMimeTypes.includes(reunionphoto.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. Only JPEG, PNG, and GIF are allowed.",
      });
    }

    const image = await uploadImageToCloudinary(
      reunionphoto,
      process.env.CLOUDINARY_FOLDER_NAME,
      1000,
      1000
    );

    const newReunion = new Reunion({
      typeOfEvent,
      batch,
      date,
      time,
      venue,
      contact,
      createdBy,
      organizedBy,
      reunionphoto: image.secure_url,
      eligibility,
    });

    await newReunion.save();
    res.status(201).json({
      success: true,
      message: "Reunion created successfully",
      data: newReunion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create reunion",
      error: error.message,
    });
  }
};

// Delete a reunion
export const deleteReunion = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Reunion ID must be provided",
        });
      }
  
      const deletedReunion = await Reunion.findByIdAndDelete(id);
  
      if (!deletedReunion) {
        return res.status(404).json({
          success: false,
          message: "Reunion not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Reunion deleted successfully",
        data: deletedReunion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete reunion",
        error: error.message,
      });
    }
  };
  
