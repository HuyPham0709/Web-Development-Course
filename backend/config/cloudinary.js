// backend/config/cloudinary.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cấu hình Cloudinary từ file môi trường (.env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm helper hỗ trợ upload từ buffer (dùng với Multer memoryStorage)
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: 'auto' }, // 'auto' tự động nhận diện pdf, png, jpg...
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Export hàm helper ra để các controller khác sử dụng
module.exports = {
  cloudinary,
  uploadToCloudinary
};