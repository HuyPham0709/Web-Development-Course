// backend/config/cloudinary.js

const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const cloudinary =
  require("cloudinary").v2;

const streamifier =
  require("streamifier");

// ─────────────────────────────────────────────────────────────
// Cloudinary Config
// ─────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────────────────────────
// Upload Helper
// ─────────────────────────────────────────────────────────────

const uploadToCloudinary = (
  fileBuffer,
  folder
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
          },

          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

      streamifier
        .createReadStream(fileBuffer)
        .pipe(uploadStream);
    }
  );
};

// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────

module.exports = {
  cloudinary,
  uploadToCloudinary,
};