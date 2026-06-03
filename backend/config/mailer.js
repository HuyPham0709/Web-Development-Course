require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,              // Dùng cổng 587 thay vì 465
  secure: false,          // Cổng 587 bắt buộc secure phải là false
  requireTLS: true,       // Bật mã hóa TLS
  auth: {
    user: process.env.EMAIL_USER || "txxh1004@gmail.com",
    pass: process.env.EMAIL_PASS || "wrwvarvgrqlkhjwq"
  },
  tls: {
    rejectUnauthorized: false // Bỏ qua chứng chỉ SSL khắt khe của Render
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