const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  console.log("=== BẮT ĐẦU KHỞI TẠO DATABASE TRÊN AIVEN ===");
  
  // 1. Lấy thông tin cấu hình từ file .env
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME || 'defaultdb',
  };

  let connection;

  try {
    // 2. Tiến hành kết nối tới Aiven
    console.log(`⏳ Đang kết nối tới ${config.host}:${config.port}...`);
    connection = await mysql.createConnection(config);
    console.log("✅ Kết nối MySQL Aiven thành công!");

    // 3. Câu lệnh SQL tạo bảng profiles
    // Mình đã thiết kế sẵn các trường cơ bản nhất cho một Profile tìm việc.
    // Bạn có thể thêm/bớt cột tùy thuộc vào giao diện Profile của bạn nhé.
    const createProfilesTableSQL = `
      CREATE TABLE IF NOT EXISTS profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL UNIQUE, -- Dùng VARCHAR nếu user_id liên kết với MongoDB String ID
        fullName VARCHAR(255),
        bio TEXT,
        skills TEXT,                          -- Lưu mảng skills dưới dạng chuỗi hoặc JSON
        experience TEXT,
        education VARCHAR(255),
        avatar_url VARCHAR(500),
        cv_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log("⏳ Đang tạo bảng 'profiles'...");
    await connection.execute(createProfilesTableSQL);
    console.log("🚀 TẠO BẢNG 'profiles' THÀNH CÔNG!");

    // 4. (Tùy chọn) Nếu bạn cần thêm bảng 'jobs' hay bảng nào khác, bạn có thể viết tiếp ở đây
    // const createJobsTableSQL = `CREATE TABLE IF NOT EXISTS jobs (...);`;
    // await connection.execute(createJobsTableSQL);

  } catch (error) {
    console.error("❌ LỖI HỆ THỐNG:");
    console.error(error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Đã đóng kết nối an toàn.");
    }
    console.log("=== KẾT THÚC QUÁ TRÌNH ===");
  }
}

initDatabase();