require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Nếu dùng Gmail
  auth: {
    user: process.env.EMAIL_USER, // SỬA THÀNH EMAIL_USER ĐỂ KHỚP VỚI .ENV
    pass: process.env.EMAIL_PASS  // SỬA THÀNH EMAIL_PASS ĐỂ KHỚP VỚI .ENV
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