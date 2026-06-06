const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateTable() {
  console.log("=== BẮT ĐẦU CẬP NHẬT CẤU TRÚC BẢNG ===");
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME || 'defaultdb',
  });

  try {
    console.log("⏳ Đang chèn bổ sung cột 'title' vào bảng 'profiles' hiện tại...");
    
    // Lệnh này chỉ thêm cột 'title', hoàn toàn giữ nguyên bảng profiles của bạn
    await connection.execute("ALTER TABLE profiles ADD COLUMN title VARCHAR(255) AFTER user_id;");
    
    console.log("🚀 CẬP NHẬT CỘT 'title' THÀNH CÔNG!");
  } catch (error) {
    console.error("❌ Lỗi hệ thống:", error.message);
  } finally {
    await connection.end();
    console.log("🔌 Đã đóng kết nối an toàn.");
  }
}

updateTable();