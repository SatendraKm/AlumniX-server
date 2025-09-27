import User from "../models/userModel.js";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "../utils/imageUploader.js";

export const updateProfileImage = async (req, res) => {
    try {
        // Retrieve the display picture from the request using express-fileupload
        const displayPicture = req.files?.displayPicture;
        

        // Check if the display picture is uploaded
        if (!displayPicture) {
            return res.status(400).json({
                success: false,
                message: "No display picture uploaded"
            });
        }

        // Validate file format (only accept images)
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!validMimeTypes.includes(displayPicture.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file format. Only JPEG, PNG, and GIF are allowed."
            });
        }

        const {id} =  req.params;
        if(!id){
            return res.status(400).json({
              success: false,
              message: "USER ID must be filled.",
            });
          }
        // Retrieve the user's current profile image URL from the database
        const user = await User.findById(id);
        const currentImageUrl = user.profileimageUrl;

        // If there's an existing image, delete it from Cloudinary
        if (currentImageUrl) {
            // Extract the public ID from the Cloudinary URL (supports folders)
            const publicId = currentImageUrl.split('/').slice(-2).join('/').split('.')[0]; // Get last two segments and remove file extension
            await deleteImageFromCloudinary(publicId);
        }

        // Upload the new image to Cloudinary
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        // Update the user's profile image in the database
        const updatedProfile = await User.findByIdAndUpdate(
            id,
            { profileimageUrl: image.secure_url },
            { new: true }
        );

        // Send response with updated profile information
        res.status(200).json({
            success: true,
            message: "Image updated successfully",
            data: updatedProfile
        });
    } catch (error) {
        console.error("Error updating profile image:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};




export const updateBackgroundImage = async (req, res) => {
    try {
        // Retrieve the display picture from the request using express-fileupload
        const displayPicture = req.files?.displayPicture;
        

        // Check if the display picture is uploaded
        if (!displayPicture) {
            return res.status(400).json({
                success: false,
                message: "No display picture uploaded"
            });
        }

        // Validate file format (only accept images)
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!validMimeTypes.includes(displayPicture.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file format. Only JPEG, PNG, and GIF are allowed."
            });
        }

        const {id} =  req.params;
        if(!id){
            return res.status(400).json({
              success: false,
              message: "USER ID must be filled.",
            });
          }
        // Retrieve the user's current profile image URL from the database
        const user = await User.findById(id);
        const currentImageUrl = user.backgroundimageUrl;

        // If there's an existing image, delete it from Cloudinary
        if (currentImageUrl) {
            // Extract the public ID from the Cloudinary URL (supports folders)
            const publicId = currentImageUrl.split('/').slice(-2).join('/').split('.')[0]; // Get last two segments and remove file extension
            await deleteImageFromCloudinary(publicId);
        }

        // Upload the new image to Cloudinary
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        );

        // Update the user's profile image in the database
        const updatedProfile = await User.findByIdAndUpdate(
            id,
            { backgroundimageUrl: image.secure_url },
            { new: true }
        );

        // Send response with updated profile information
        res.status(200).json({
            success: true,
            message: "Image updated successfully",
            data: updatedProfile
        });
    } catch (error) {
        console.error("Error updating profile image:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
