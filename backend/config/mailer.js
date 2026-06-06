require('dotenv').config();
const { Resend } = require("resend");

// Khởi tạo Resend (Ưu tiên đọc từ .env, nếu không có thì dán mã thô vào đây)
const resend = new Resend(process.env.RESEND_API_KEY);

// Hàm mẫu gửi email đa dụng
const sendMail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      // LƯU Ý: Nếu dùng tài khoản Resend miễn phí (chưa xác thực tên miền riêng),
      // bạn BẮT BUỘC phải giữ nguyên đuôi <onboarding@resend.dev>. 
      // Bạn chỉ có thể đổi tên hiển thị phía trước (ví dụ: "Human Resources Department")
      from: "Human Resources Department <onboarding@resend.dev>",
      to: to,       // Email nhận (ở chế độ test phải là chính email đăng ký Resend của bạn)
      subject: subject,
      html: html
    });
    
    return data;
  } catch (error) {
    console.error("❌ Error in the sendMail function (Resend):", error.message);
    // In ra log để bạn dễ theo dõi nếu có lỗi phát sinh
    return null; 
  }
};

module.exports = { sendMail };