const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100, // Giới hạn 100 request mỗi IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
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

  // Bây giờ máy tính đã biết 'name' là gì rồi, nó sẽ không báo lỗi nữa
  const finalName = name || username;

  if (!finalName) {
    return res.status(400).json({
      success: false,
      message: "Tên không được để trống!",
    });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0)
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

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

    // 5. Gửi mail xác thực
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"JobSpot" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Xác thực tài khoản mới",
      text: `Chào ${finalName}, mã xác thực của bạn là: ${otp}`,
    });

    console.log("=== Đã gửi mail cho: ", email);

    // 6. Phản hồi duy nhất
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
  // 1. Nhận dữ liệu từ React gửi lên
  const { email, password, role } = req.body;

  // Kiểm tra xem frontend có gửi đủ email và password không
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ email và mật khẩu!",
    });
  }

  try {
    // 2. Tìm user theo email trong Database
    const [users] = await db.execute(
  `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name 
   FROM Users u 
   LEFT JOIN Profiles p ON p.user_id = u.id 
   WHERE u.email = ?`,
  [email]
);
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại!" });
    }

    const user = users[0];

    // 3. CHẶN ĐĂNG NHẬP SAI CỔNG (Kiểm tra Role)
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

    // 4. So sánh mật khẩu đã mã hóa
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu không chính xác!" });
    }

    // 5. Kiểm tra tài khoản đã xác thực email chưa
    if (user.is_verified === 0 || user.is_verified === false) {
      return res.status(401).json({
        success: false,
        message:
          "Tài khoản của bạn chưa được xác thực email! Vui lòng kiểm tra email để xác thực.",
      });
    }

    // 6. Kiểm tra cấu hình JWT
    if (!process.env.JWT_SECRET) {
      throw new Error("LỖI HỆ THỐNG: Thiếu biến JWT_SECRET trong file .env");
    }

    // 7. Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // 8. Trả về thông tin thành công cho React
    res.status(200).json({
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

    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ: " + error.message,
    });
  }
};

// --- Lấy thông tin cá nhân ---
exports.getProfile = async (req, res) => {
  try {
    // req.user.id lấy từ Middleware verifyToken
    const [rows] = await db.execute(
      "SELECT id, username, email, role, avatar_url, created_at FROM Users WHERE id = ?",
      [req.user.id],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      return res
        .status(404)
        .json({
          success: false,
          message: "Email không tồn tại trong hệ thống!",
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
      "UPDATE Users SET otp_code = ?, otp_expires = ? WHERE email = ?",
      [otp, expires, email],
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"JobFinder" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã xác thực khôi phục mật khẩu",
      text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`,
    });

    // 6. Phản hồi cho Client
    res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi về email của bạn!",
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Có lỗi xảy ra, vui lòng thử lại sau!",
      });
  }
};

// --- Đặt lại mật khẩu ---
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const [users] = await db.execute(
  "SELECT * FROM Users WHERE email = ? AND otp_code = ?",
  [email, otp]
);

    if (users.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Mã OTP không chính xác!" });
    }

    const user = users[0];
    const now = new Date();
    if (now > new Date(user.otp_expires)) {
      return res
        .status(400)
        .json({ success: false, message: "Mã OTP đã hết hạn!" });
    }

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

    res
      .status(200)
      .json({
        success: true,
        message:
          "Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  [email, otp]
);

    if (users.length === 0) {
      return res.status(400).json({ message: "Mã xác thực không đúng!" });
    }

    await db.execute(
      "UPDATE Users SET is_verified = 1, otp_code = NULL, otp_expires = NULL WHERE email = ?",
      [email],
    );

    res
      .status(200)
      .json({
        success: true,
        message: "Xác thực tài khoản thành công! Giờ bạn có thể đăng nhập.",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- ĐĂNG NHẬP BẰNG GOOGLE ---
exports.googleLogin = async (req, res) => {
  const { accessToken, role } = req.body;

  try {
    // 1. Lấy thông tin từ Google
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const { email, name, picture } = googleResponse.data;

    // 2. Kiểm tra xem Email này đã có trong hệ thống chưa
    const [users] = await db.execute(
  `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name
   FROM Users u
   LEFT JOIN Profiles p ON p.user_id = u.id
   WHERE u.email = ?`,
  [email]
);
    let user = users[0];

    if (!user) {
      // TRƯỜNG HỢP 1: Email chưa tồn tại -> Tạo tài khoản mới hoàn toàn
      const autoUsername = email.split('@')[0];
      const [result] = await db.execute(
        'INSERT INTO Users (username, email, password, role, is_verified, avatar_url, display_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [autoUsername, email, 'LOGIN_BY_GOOGLE', role || 'candidate', 1, picture, name]
      );

      const userId = result.insertId;
      // Tạo Profile đi kèm
      if (role === 'employer') {
        await db.execute('INSERT INTO Companies (name) VALUES (?)', [`Công ty của ${name}`]);
      } else {
        await db.execute('INSERT INTO Profiles (user_id, full_name) VALUES (?, ?)', [userId, name]);
      }

      user = { id: userId, email, role: role || 'candidate', username: autoUsername, profile_avatar: null, full_name: name, avatar_url: picture };
    } else {
      // TRƯỜNG HỢP 2: Email đã tồn tại (Họ từng đăng ký bằng mật khẩu hoặc Google trước đó)
      // Cập nhật Avatar và Display Name mới nhất từ Google (nếu cần)
      await db.execute(
        'UPDATE Users SET avatar_url = ?, is_verified = 1 WHERE id = ?',
        [picture || user.avatar_url, user.id]
      );
      // Cập nhật lại đối tượng user để trả về frontend
      user.avatar_url = picture || user.avatar_url;
    }

    // 3. Tạo Token JWT (Dùng chung cho cả 2 cách đăng nhập)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token: token,
      user: {
  id: user.id,
  username: user.username,
  full_name: user.full_name || user.username,
  role: user.role,
  avatar_url: user.profile_avatar || user.avatar_url || null,
}
    });

  } catch (error) {
    console.error("Lỗi Google Login:", error);
    res.status(500).json({ success: false, message: "Lỗi kết nối Google: " + error.message });
  }
};

// =========================================================================
// CÁC CHỨC NĂNG MỚI THÊM: ĐĂNG NHẬP 2 LỚP (2FA) DÀNH RIÊNG CHO ADMIN
// =========================================================================

// --- BƯỚC 1: KIỂM TRA MẬT KHẨU VÀ GỬI OTP (Thay thế API Login cũ ở trang Admin) ---
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({
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

    // Chặn cứng: Chỉ cho phép tài khoản Admin
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

    // Tạo mã OTP 6 số và thời gian hết hạn (5 phút)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    // Lưu OTP vào Database
    await db.execute(
      "UPDATE Users SET otp_code = ?, otp_expires = ? WHERE email = ?",
      [otp, expires, email],
    );

    // Gửi OTP qua Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"JobFinder Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã OTP Đăng nhập Quản trị",
      text: `Mã OTP xác thực đăng nhập Admin của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`,
    });

    // Trả về Frontend để nó chuyển sang màn hình nhập OTP
    res.status(200).json({
      success: true,
      message: "Mật khẩu hợp lệ. Vui lòng kiểm tra email để lấy mã OTP!",
    });
  } catch (error) {
    console.error("Lỗi tại adminLogin:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ: " + error.message });
  }
};

// --- BƯỚC 2: XÁC THỰC OTP VÀ CẤP TOKEN ---
exports.verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const [users] = await db.execute(
      "SELECT * FROM Users WHERE email = ? AND otp_code = ?",
      [email, otp],
    );

    if (users.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Mã OTP không chính xác!" });
    }

    const user = users[0];

    // Kiểm tra xem OTP đã hết hạn chưa
    const now = new Date();
    if (now > new Date(user.otp_expires)) {
      return res
        .status(400)
        .json({ success: false, message: "Mã OTP đã hết hạn!" });
    }

    // OTP đúng -> Xóa OTP khỏi Database để bảo mật
    await db.execute(
      "UPDATE Users SET otp_code = NULL, otp_expires = NULL WHERE email = ?",
      [email],
    );

    // Tạo Token Đăng nhập
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
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
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi server khi xác thực OTP: " + error.message,
      });
  }
};