const mysql = require("mysql2");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",

  user: process.env.DB_USER || "root",

  password: process.env.DB_PASSWORD || "",

  database: process.env.DB_NAME || "job_finder_db",

  port: process.env.DB_PORT || 3306, // Thêm cổng kết nối từ biến môi trường

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0,

  dateStrings: true,

  // BẮT BUỘC PHẢI THÊM ĐOẠN NÀY ĐỂ KẾT NỐI ĐƯỢC VỚI CLOUD AIVEN
  ssl: {
    rejectUnauthorized: false,
  },
});

const promisePool = pool.promise();

module.exports = promisePool;