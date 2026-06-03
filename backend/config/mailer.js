require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",        // Thêm dòng này để Nodemailer tự định tuyến qua máy chủ Google
  host: "smtp.gmail.com",
  port: 465,
  secure: true,            // Cổng 465 bắt buộc secure phải là true
  auth: {
    user: process.env.EMAIL_USER, // Sẽ tự đọc từ Render Environment
    pass: process.env.EMAIL_PASS  // Sẽ tự đọc từ Render Environment
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Hàm mẫu gửi email đa dụng
const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Human Resources Department" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendMail };