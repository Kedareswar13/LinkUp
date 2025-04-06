    const cloudinary = require("cloudinary").v2;

    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Fixed typo
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadToCloudinary = async (fileUri, resourceType = "image") => {
    try {
        const response = await cloudinary.uploader.upload(fileUri, {
        resource_type: resourceType,
        });
        return response;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to upload file to Cloudinary");
    }
    };

    module.exports = { uploadToCloudinary, cloudinary };
