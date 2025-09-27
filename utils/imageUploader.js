import { v2 as cloudinary } from "cloudinary";


//upload file
export const uploadImageToCloudinary  = async (file, folder, height, quality) => {
    const options = {folder};
    if(height) {
        options.height = height;
    }
    if(quality) {
        options.quality = quality;
    }
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);
}



//delete file
export const deleteImageFromCloudinary = async (publicId) => {
    try {
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
};
