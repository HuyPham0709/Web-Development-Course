// backend/config/cloudinary.js

const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// ─────────────────────────────────────────────────────────────
// Cloudinary Config
// ─────────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────────────────────────
// Upload Helper
// ─────────────────────────────────────────────────────────────

const uploadToCloudinary = (fileBuffer, folder, originalName = "") => {
  return new Promise((resolve, reject) => {
    const isPdf = originalName.toLowerCase().endsWith(".pdf");
    const options = {
      folder,
      resource_type: isPdf ? "raw" : "auto",
      // KHÔNG thêm transformation nào ở đây
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// ─────────────────────────────────────────────────────────────
// Helper tạo URL download cho file raw (PDF/DOCX)
// Thay /upload/ thành /upload/fl_attachment/ để trình duyệt tải về
// ─────────────────────────────────────────────────────────────

const getDownloadUrl = (cloudinaryUrl, fileName = "cv") => {
  if (!cloudinaryUrl) return null;
  // Với file raw, dùng fl_attachment để force download
  return cloudinaryUrl.replace("/upload/", `/upload/fl_attachment:${fileName}/`);
};

// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────

module.exports = {
  cloudinary,
  uploadToCloudinary,
  getDownloadUrl,
};