// backend/middlewares/uploadMiddleware.js

const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Bạn đang dùng memoryStorage để upload stream lên Cloudinary

const fileFilter = (req, file, cb) => {
    // Thêm pdf và docx vào danh sách cho phép
    const allowedFileTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    
    // Kiểm tra extension
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    
    // Kiểm tra mimetype
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        // Thông báo lỗi thân thiện hơn
        cb(new Error('Định dạng file không hỗ trợ! Chỉ chấp nhận ảnh (jpg, png...), PDF hoặc DOCX.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB cho nhẹ nhàng
    fileFilter: fileFilter
});

module.exports = upload;