const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const cvTypes = /pdf|docx/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (imageTypes.test(ext) || cvTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh (jpg, png) hoặc CV (pdf, docx)"), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;