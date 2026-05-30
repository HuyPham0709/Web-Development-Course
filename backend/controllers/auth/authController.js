const db = require('../../config/db');
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

// 🔴 CHỐT CHẶN 1: Bảo mật JWT Token dự phòng nếu file .env bị nuốt biến
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "JobFinder_Team7_SecretKey_Moi";
}

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100, // Giới hạn 100 request mỗi IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

const formatToMySQLDateTime = (date) => {
  return date.toISOString().slice(0, 19).replace("T", " ");
};

// Cấu hình Mail cố định chống nạp chồng biến môi trường
const emailUser = "txxh1004@gmail.com";
const emailPass = "wrwvarvgrqlkhjwq";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// --- 1. ĐĂNG KÝ (REGISTER) ---
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  const { name, username, email, password, role, phone } = req.body;
  const finalName = name || username;

  if (!finalName) {
    return res.status(400).json({ success: false, message: "Tên không được để trống!" });
  }
  if (!phone) {
    return res.status(400).json({ success: false, message: "Số điện thoại không được để trống!" });
  }

  try {
    const [rows] = await db.execute(
      "SELECT email, username FROM Users WHERE email = ? OR username = ?", 
      [email, finalName]
    );
    
    if (rows.length > 0) {
      const isEmailTaken = rows.some(user => user.email === email);
      const isUsernameTaken = rows.some(user => user.username === finalName);

      if (isEmailTaken) return res.status(400).json({ success: false, message: "Email này đã tồn tại!" });
      if (isUsernameTaken) return res.status(400).json({ success: false, message: `Tên đăng nhập '${finalName}' đã có người sử dụng!` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = formatToMySQLDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000));

    // 🎯 FIX LỖI: Bỏ hoàn toàn cột phone khỏi bảng Users
    const [userResult] = await db.execute(
      "INSERT INTO Users (username, email, password, role, otp_code, otp_expires, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)",
      [finalName, email, hashedPassword, role || "candidate", otp, otpExpires],
    );

    const userId = userResult.insertId;

    if (role === "employer") {
      const [companyResult] = await db.execute("INSERT INTO Companies (name) VALUES (?)", [`Công ty của ${finalName}`]);
      const companyId = companyResult.insertId;
      await db.execute("UPDATE Users SET company_id = ? WHERE id = ?", [companyId, userId]);
    }
    
    // 🎯 FIX LỖI: Luôn tự động khởi tạo bảng Profiles để lưu trữ thông tin số điện thoại & họ tên đầy đủ
    await db.execute(
      "INSERT INTO Profiles (user_id, full_name, phone) VALUES (?, ?, ?)",
      [userId, finalName, phone]
    );

    await transporter.sendMail({
      from: `"JobSpot" <${emailUser}>`,
      to: email,
      subject: "Xác thực tài khoản mới",
      text: `Chào ${finalName}, mã xác thực của bạn là: ${otp}`,
    });

    console.log("=== Đã gửi mail đăng ký cho: ", email);
    return res.status(201).json({ success: true, message: "Đăng ký thành công! Vui lòng kiểm tra email." });
  } catch (error) {
    console.error("Lỗi Register:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. ĐĂNG NHẬP (LOGIN) ---
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    const [users] = await db.execute(
      `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name 
       FROM Users u LEFT JOIN Profiles p ON p.user_id = u.id WHERE u.email = ?`,
      [email]
    );
    if (users.length === 0) return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });

    const user = users[0];

    if (role && user.role !== role) {
      const roleName = user.role === "employer" ? "Nhà tuyển dụng" : "Ứng viên";
      return res.status(403).json({ success: false, message: `Sai cổng đăng nhập! Tài khoản của ${roleName}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Mật khẩu không chính xác!" });
    if (!user.is_verified) return res.status(401).json({ success: false, message: "Chưa xác thực email!" });

    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET, { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name || user.username,
        role: user.role,
        company_id: user.company_id,
        avatar_url: user.profile_avatar || null, // 🎯 FIX LỖI: Lấy chính xác avatar_url từ bảng Profiles
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ: " + error.message });
  }
};

// --- 3. LẤY THÔNG TIN CÁ NHÂN ---
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.username, u.email, u.role, u.company_id, u.created_at, 
              p.avatar_url, p.full_name, p.phone
       FROM Users u 
       LEFT JOIN Profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
      [req.user.id],
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. QUÊN MẬT KHẨU ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "Email không tồn tại!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = formatToMySQLDateTime(new Date(Date.now() + 10 * 60 * 1000));

    await db.execute("UPDATE Users SET otp_code = ?, otp_expires = ? WHERE email = ?", [otp, otpExpires, email]);
    await transporter.sendMail({
      from: `"JobFinder" <${emailUser}>`, to: email, subject: "Khôi phục mật khẩu", text: `Mã OTP: ${otp}`,
    });

    return res.status(200).json({ success: true, message: "Đã gửi OTP!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 5. ĐẶT LẠI MẬT KHẨU ---
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const currentTime = formatToMySQLDateTime(new Date());
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ? AND otp_code = ? AND otp_expires > ?", [email, otp, currentTime]);
    
    if (users.length === 0) return res.status(400).json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn!" });

    const isSamePassword = await bcrypt.compare(newPassword, users[0].password);
    if (isSamePassword) return res.status(400).json({ success: false, message: "Mật khẩu mới trùng mật khẩu cũ!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE Users SET password = ?, otp_code = NULL, otp_expires = NULL WHERE email = ?", [hashedPassword, email]);

    return res.status(200).json({ success: true, message: "Đặt lại mật khẩu thành công!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. XÁC THỰC EMAIL (VERIFY EMAIL) ---
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const currentTime = formatToMySQLDateTime(new Date());
    // 🎯 TỐI ƯU: Thêm điều kiện kiểm tra thời gian hết hạn otp_expires để tăng độ bảo mật
    const [users] = await db.execute(
      `SELECT * FROM Users WHERE email = ? AND otp_code = ? AND otp_expires > ?`, 
      [email, otp, currentTime]
    );
    if (users.length === 0) return res.status(400).json({ success: false, message: "Mã xác thực không đúng hoặc đã hết hạn!" });

    await db.execute("UPDATE Users SET is_verified = 1, otp_code = NULL, otp_expires = NULL WHERE email = ?", [email]);
    return res.status(200).json({ success: true, message: "Xác thực thành công!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 7. ĐĂNG NHẬP BẰNG GOOGLE ---
exports.googleLogin = async (req, res) => {
  const { accessToken, role } = req.body;
  try {
    const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { email, name, picture } = googleResponse.data;

    const [users] = await db.execute(
      `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name FROM Users u LEFT JOIN Profiles p ON p.user_id = u.id WHERE u.email = ?`,
      [email]
    );
    let user = users[0];

    if (!user) {
      let autoUsername = email.split("@")[0];
      const [checkUser] = await db.execute("SELECT id FROM Users WHERE username = ?", [autoUsername]);
      if (checkUser.length > 0) autoUsername += `_${Math.floor(1000 + Math.random() * 9000)}`;

      const [result] = await db.execute(
        `INSERT INTO Users (username, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)`,
        [autoUsername, email, "LOGIN_BY_GOOGLE", role || "candidate", 1]
      );

      const userId = result.insertId;
      let companyId = null;

      if (role === "employer") {
        const [companyResult] = await db.execute("INSERT INTO Companies (name) VALUES (?)", [`Công ty của ${name}`]);
        companyId = companyResult.insertId;
        await db.execute("UPDATE Users SET company_id = ? WHERE id = ?", [companyId, userId]);
      } 
      
      // 🎯 FIX LỖI: Lưu name và picture vào bảng Profiles thay vì bảng Users
      await db.execute(
        "INSERT INTO Profiles (user_id, full_name, avatar_url) VALUES (?, ?, ?)",
        [userId, name, picture],
      );

      user = { id: userId, username: autoUsername, email, role: role || "candidate", company_id: companyId, full_name: name, profile_avatar: picture };
    } else {
      await db.execute(`UPDATE Users SET is_verified = 1 WHERE id = ?`, [user.id]);
    }

    const token = jwt.sign({ id: user.id, role: user.role, company_id: user.company_id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id, username: user.username, full_name: user.full_name || user.username, role: user.role, company_id: user.company_id, avatar_url: user.profile_avatar || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi kết nối Google: " + error.message });
  }
};

// --- 8. BƯỚC 1: KIỂM TRA MẬT KHẨU VÀ GỬI OTP (ADMIN) ---
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ!" });

  try {
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "Không tồn tại!" });

    const user = users[0];
    if (user.role !== "admin") return res.status(403).json({ success: false, message: "Chỉ dành cho Admin!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Sai mật khẩu!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = formatToMySQLDateTime(new Date(Date.now() + 5 * 60 * 1000));

    await db.execute("UPDATE Users SET otp_code = ?, otp_expires = ? WHERE email = ?", [otp, otpExpires, email]);
    await transporter.sendMail({ from: `"Admin" <${emailUser}>`, to: email, subject: "OTP Admin", text: `OTP: ${otp}` });

    return res.status(200).json({ success: true, message: "Vui lòng check OTP!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 9. BƯỚC 2: XÁC THỰC OTP VÀ CẤP TOKEN (ADMIN) ---
exports.verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const currentTime = formatToMySQLDateTime(new Date());
    const [users] = await db.execute(
      `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name 
       FROM Users u LEFT JOIN Profiles p ON u.id = p.user_id 
       WHERE u.email = ? AND u.otp_code = ? AND u.otp_expires > ?`, 
      [email, otp, currentTime]
    );

    if (users.length === 0) return res.status(400).json({ success: false, message: "OTP sai hoặc hết hạn!" });

    const user = users[0];
    await db.execute("UPDATE Users SET otp_code = NULL, otp_expires = NULL WHERE email = ?", [email]);

    const token = jwt.sign({ id: user.id, role: user.role, company_id: user.company_id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id, username: user.username, full_name: user.full_name || user.username, role: user.role, company_id: user.company_id, avatar_url: user.profile_avatar || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};