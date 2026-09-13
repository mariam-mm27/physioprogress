const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");

const uploadBufferToCloudinary = async (buffer, folder = "physioprogress/profiles") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"]
      },
      (error, result) => {
        if (error) {
          reject(new AppError(500, `Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            size: result.bytes,
            format: result.format
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      return true;
    }
    return false;
  } catch (error) {
    throw new AppError(500, `Failed to delete image from Cloudinary: ${error.message}`);
  }
};

module.exports = {
  uploadBufferToCloudinary,
  deleteFromCloudinary
};
