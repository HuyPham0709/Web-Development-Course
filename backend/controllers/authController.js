const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const db = require("../config/db");
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

// --- ĐĂNG KÝ (REGISTER) ---
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  const { name, username, email, password, role } = req.body;
  const finalName = name || username;

  if (!finalName) {
    return res.status(400).json({
      success: false,
      message: "Tên không được để trống!",
    });
  }

  try {
    // 🎯 ĐÃ SỬA: Bắt lỗi trùng cả Email và Username ngay từ đầu để tránh lỗi 500
    const [rows] = await db.execute(
      "SELECT * FROM Users WHERE email = ? OR username = ?", 
      [email, finalName]
    );
    
    if (rows.length > 0) {
      const isEmailTaken = rows.some(user => user.email === email);
      const isUsernameTaken = rows.some(user => user.username === finalName);

      if (isEmailTaken) {
        return res.status(400).json({ success: false, message: "Email này đã tồn tại!" });
      }
      if (isUsernameTaken) {
        return res.status(400).json({ 
          success: false, 
          message: `Tên đăng nhập '${finalName}' đã có người sử dụng. Vui lòng chọn tên khác!` 
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiresRaw = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const otpExpires = formatToMySQLDateTime(otpExpiresRaw);

    const [userResult] = await db.execute(
      "INSERT INTO Users (username, email, password, role, otp_code, otp_expires, is_verified) VALUES (?, ?, ?, ?, ?, ?, 0)",
      [finalName, email, hashedPassword, role || "candidate", otp, otpExpires],
    );

    const userId = userResult.insertId;

    if (role === "employer") {
      await db.execute("INSERT INTO Companies (name) VALUES (?)", [
        `Công ty của ${finalName}`,
      ]);
    } else {
      await db.execute(
        "INSERT INTO Profiles (user_id, full_name) VALUES (?, ?)",
        [userId, finalName],
      );
    }

    await transporter.sendMail({
      from: `"JobSpot" <${emailUser}>`,
      to: email,
      subject: "Xác thực tài khoản mới",
      text: `Chào ${finalName}, mã xác thực của bạn là: ${otp}`,
    });

    console.log("=== Đã gửi mail đăng ký cho: ", email);

    return res.status(201).json({
      success: true,
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.",
    });
  } catch (error) {
    console.error("Lỗi Register:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// --- ĐĂNG NHẬP (LOGIN) ---
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ email và mật khẩu!",
    });
  }

  try {
    const [users] = await db.execute(
      `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name 
       FROM Users u 
       LEFT JOIN Profiles p ON p.user_id = u.id 
       WHERE u.email = ?`,
      [email],
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại!" });
    }

    const user = users[0];

    if (role && user.role !== role) {
      const roleName =
        user.role === "employer"
          ? "Nhà tuyển dụng (Employer)"
          : "Ứng viên (Candidate)";
      return res.status(403).json({
        success: false,
        message: `Sai cổng đăng nhập! Tài khoản này là của ${roleName}. Vui lòng chuyển tab.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu không chính xác!" });
    }

    if (user.is_verified === 0 || user.is_verified === false) {
      return res.status(401).json({
        success: false,
        message:
          "Tài khoản của bạn chưa được xác thực email! Vui lòng kiểm tra email để xác thực.",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name || user.username,
        role: user.role,
        avatar_url: user.profile_avatar || user.avatar_url || null,
      },
    });
  } catch (error) {
    console.error("=== LỖI TẠI HÀM LOGIN ===", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ: " + error.message,
    });
  }
};

// --- Lấy thông tin cá nhân ---
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, username, email, role, avatar_url, created_at FROM Users WHERE id = ?",
      [req.user.id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- Quên mật khẩu ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống!",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresRaw = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    const otpExpires = formatToMySQLDateTime(expiresRaw);

    await db.execute(
      "UPDATE Users SET otp_code = ?, otp_expires = ? WHERE email = ?",
      [otp, otpExpires, email],
    );

    await transporter.sendMail({
      from: `"JobFinder" <${emailUser}>`,
      to: email,
      subject: "Mã xác thực khôi phục mật khẩu",
      text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`,
    });

    console.log("=== Đã gửi mail khôi phục mật khẩu cho: ", email);

    return res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi về email của bạn!",
    });
  } catch (error) {
    console.error("Lỗi ForgotPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi gửi mail: " + error.message,
    });
  }
};

// --- Đặt lại mật khẩu (ĐÃ FIX LỖI HẾT HẠN OTP SỚM) ---
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // 💡 GIẢI PHÁP: Sử dụng thời gian thực từ Node.js thay vì NOW() của MySQL
    const currentTime = formatToMySQLDateTime(new Date());

    const [users] = await db.execute(
      "SELECT * FROM Users WHERE email = ? AND otp_code = ? AND otp_expires > ?",
      [email, otp, currentTime],
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP không chính xác hoặc đã hết hạn!",
      });
    }

    const user = users[0];

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không được trùng với mật khẩu hiện tại!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.execute(
      "UPDATE Users SET password = ?, otp_code = NULL, otp_expires = NULL WHERE email = ?",
      [hashedPassword, email],
    );

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- Xác thực Email ---
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const [users] = await db.execute(
      `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name
       FROM Users u
       LEFT JOIN Profiles p ON p.user_id = u.id
       WHERE u.email = ? AND u.otp_code = ?`,
      [email, otp],
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Mã xác thực không đúng!" });
    }

    await db.execute(
      "UPDATE Users SET is_verified = 1, otp_code = NULL, otp_expires = NULL WHERE email = ?",
      [email],
    );

    return res.status(200).json({
      success: true,
      message: "Xác thực tài khoản thành công! Giờ bạn có thể đăng nhập.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// --- ĐĂNG NHẬP BẰNG GOOGLE ---
exports.googleLogin = async (req, res) => {
  const { accessToken, role } = req.body;

  try {
    const googleResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const { email, name, picture } = googleResponse.data;

    const [users] = await db.execute(
      `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name
       FROM Users u
       LEFT JOIN Profiles p ON p.user_id = u.id
       WHERE u.email = ?`,
      [email],
    );
    let user = users[0];

    if (!user) {
      let autoUsername = email.split("@")[0];

      const [checkUser] = await db.execute(
        "SELECT id FROM Users WHERE username = ?",
        [autoUsername],
      );
      if (checkUser.length > 0) {
        autoUsername = `${autoUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const [result] = await db.execute(
        "INSERT INTO Users (username, email, password, role, is_verified, avatar_url, display_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          autoUsername,
          email,
          "LOGIN_BY_GOOGLE",
          role || "candidate",
          1,
          picture,
          name,
        ],
      );

      const userId = result.insertId;

      try {
        if (role === "employer") {
          await db.execute("INSERT INTO Companies (name) VALUES (?)", [
            `Công ty của ${name}`,
          ]);
        } else {
          await db.execute(
            "INSERT INTO Profiles (user_id, full_name, avatar_url) VALUES (?, ?, ?)",
            [userId, name, picture],
          );
        }
      } catch (subError) {
        console.error(
          "Lỗi tạo Profile phụ (Tài khoản gốc vẫn an toàn):",
          subError.message,
        );
      }

      user = {
        id: userId,
        email,
        role: role || "candidate",
        username: autoUsername,
        avatar_url: picture,
        full_name: name,
        profile_avatar: picture,
      };
    } else {
      await db.execute(
        "UPDATE Users SET avatar_url = ?, display_name = ?, is_verified = 1 WHERE id = ?",
        [picture || user.avatar_url, name || user.display_name, user.id],
      );

      try {
        if (user.role !== "employer") {
          await db.execute(
            "UPDATE Profiles SET avatar_url = ?, full_name = ? WHERE user_id = ?",
            [picture || user.profile_avatar, name || user.full_name, user.id],
          );
        }
      } catch (subError) {
        console.error("Lỗi đồng bộ bảng Profiles phụ:", subError.message);
      }

      user.avatar_url = picture || user.avatar_url;
      user.full_name = name || user.full_name;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name || user.username,
        role: user.role,
        avatar_url: user.avatar_url || user.profile_avatar || null,
      },
    });
  } catch (error) {
    console.error("LỖI GOOGLE LOGIN CHI TIẾT TẠI BACKEND:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi kết nối Google hoặc DB: " + error.message,
    });
  }
};

// --- BƯỚC 1: KIỂM TRA MẬT KHẨU VÀ GỬI OTP (ADMIN) ---
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ email và mật khẩu!",
    });
  }

  try {
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại!" });
    }

    const user = users[0];

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Khu vực này chỉ dành cho Admin!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu không chính xác!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresRaw = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
    const otpExpires = formatToMySQLDateTime(expiresRaw);

    await db.execute(
      "UPDATE Users SET otp_code = ?, otp_expires = ? WHERE email = ?",
      [otp, otpExpires, email],
    );

    await transporter.sendMail({
      from: `"JobFinder Admin" <${emailUser}>`,
      to: email,
      subject: "Mã OTP Đăng nhập Quản trị",
      text: `Mã OTP xác thực đăng nhập Admin của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
    });

    return res.status(200).json({
      success: true,
      message: "Mật khẩu hợp lệ. Vui lòng kiểm tra email để lấy mã OTP!",
    });
  } catch (error) {
    console.error("Lỗi tại adminLogin:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ gửi OTP Admin: " + error.message,
    });
  }
};

// --- BƯỚC 2: XÁC THỰC OTP VÀ CẤP TOKEN (ADMIN - ĐÃ FIX LỖI HẾT HẠN OTP SỚM) ---
exports.verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // 💡 GIẢI PHÁP: Sử dụng thời gian thực từ Node.js thay vì NOW() của MySQL
    const currentTime = formatToMySQLDateTime(new Date());

    const [users] = await db.execute(
      "SELECT * FROM Users WHERE email = ? AND otp_code = ? AND otp_expires > ?",
      [email, otp, currentTime],
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP không chính xác hoặc đã hết hạn!",
      });
    }

    const user = users[0];

    await db.execute(
      "UPDATE Users SET otp_code = NULL, otp_expires = NULL WHERE email = ?",
      [email],
    );

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name || user.username,
        role: user.role,
        avatar_url: user.profile_avatar || user.avatar_url || null,
      },
    });
  } catch (error) {
    console.error("Lỗi tại verifyLoginOTP:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xác thực OTP: " + error.message,
    });
  }
};
