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

// 🌟 BỘ NHỚ TẠM (RAM) LƯU TRỮ THÔNG TIN ĐĂNG KÝ CHƯA XÁC THỰC
const tempRegisterData = new Map();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "JobFinder_Team7_SecretKey_Moi";
}

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

const formatToMySQLDateTime = (date) => {
  return date.toISOString().slice(0, 19).replace("T", " ");
};

// Cấu hình Mail cố định
const emailUser = "txxh1004@gmail.com";
const emailPass = "wrwvarvgrqlkhjwq";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// 🔥 TEMPLATE HTML GỬI MAIL VỚI HỘP OTP NỀN GRADIENT CHỮ TRẮNG SIÊU ĐẸP & DỄ NHÌN
const generateEmailHTML = (fullName, otp, title, description) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 45px 15px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="500px" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); border: 1px solid #E2E8F0;">
            
            <tr>
              <td style="background: linear-gradient(135deg, #0052FF 0%, #8B5CF6 100%); height: 6px;"></td>
            </tr>
            
            <tr>
              <td style="padding: 40px 32px; text-align: center;">
                
                <div style="margin-bottom: 28px; display: inline-block;">
                  <span style="font-size: 26px; font-weight: 800; tracking: -0.5px; color: #0F172A;">
                    <span style="color: #0052FF;">Job</span><span style="color: #8B5CF6;">Spot</span>
                  </span>
                </div>
                
                <h2 style="margin: 0 0 16px 0; color: #0F172A; font-size: 22px; font-weight: 700; line-height: 30px;">${title}</h2>
                
                <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 24px; text-align: left;">
                  Xin chào <strong style="color: #0F172A;">${fullName}</strong>,<br><br>
                  ${description}
                </p>
                
                <div style="background: linear-gradient(135deg, #0052FF 0%, #8B5CF6 100%); border-radius: 20px; padding: 28px 24px; margin: 32px 0; text-align: center; box-shadow: 0 8px 25px rgba(0, 82, 255, 0.25);">
                  <span style="display: block; font-size: 12px; font-weight: 700; color: #FFFFFF; opacity: 0.85; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Mã xác thực bảo mật của bạn</span>
                  <span style="font-size: 42px; font-weight: 800; color: #FFFFFF; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 8px;">${otp}</span>
                </div>
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFBEB; border-radius: 12px; border: 1px solid #FEF3C7; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 12px 16px; text-align: left; font-size: 13px; color: #B45309; line-height: 18px;">
                      ⚠️ Mã OTP này có hiệu lực trong vòng <strong>10 phút</strong>. Tuyệt đối không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ JobSpot.
                    </td>
                  </tr>
                </table>
                
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #F8FAFC; padding: 24px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
                <p style="margin: 0 0 6px 0; color: #64748B; font-size: 13px; font-weight: 600;">Hệ thống xác thực tuyển dụng JobSpot</p>
                <p style="margin: 0; color: #94A3B8; font-size: 11px;">© 2026 JobSpot Inc. Toàn bộ quyền sở hữu được bảo lưu.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};


// --- 1. ĐĂNG KÝ THƯỜNG ---
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, username, email, password, role, phone } = req.body;
  const finalName = name || username;

  if (!finalName) return res.status(400).json({ success: false, message: "Tên không được để trống!" });
  if (!phone) return res.status(400).json({ success: false, message: "Số điện thoại không được để trống!" });

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
    const otpExpires = Date.now() + 10 * 60 * 1000;

    tempRegisterData.set(email, {
      username: finalName, full_name: finalName, email, phone, password: hashedPassword, role: role || "candidate", avatar_url: null, otp, otpExpires
    });

    const emailHTML = generateEmailHTML(
      finalName, 
      otp, 
      "Xác thực tài khoản mới", 
      "Cảm ơn bạn đã lựa chọn đăng ký tham gia vào hệ sinh thái tìm kiếm việc làm công nghệ JobSpot. Vui lòng sử dụng mã bên dưới để kích hoạt tài khoản của bạn:"
    );

    await transporter.sendMail({
      from: `"JobSpot" <${emailUser}>`,
      to: email,
      subject: "🔒 Kích hoạt tài khoản JobSpot của bạn",
      html: emailHTML,
    });

    return res.status(201).json({ success: true, message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. XÁC THỰC EMAIL (VERIFY OTP) ---
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const tempData = tempRegisterData.get(email);
    if (!tempData) return res.status(400).json({ success: false, message: "Phiên đăng ký không tồn tại hoặc đã hết hạn!" });
    if (tempData.otp !== otp) return res.status(400).json({ success: false, message: "Mã OTP không chính xác!" });
    if (Date.now() > tempData.otpExpires) {
      tempRegisterData.delete(email); 
      return res.status(400).json({ success: false, message: "Mã OTP đã hết hạn! Vui lòng thực hiện lại." });
    }

    const [userResult] = await db.execute(
      "INSERT INTO Users (username, email, password, role, is_verified) VALUES (?, ?, ?, ?, 1)",
      [tempData.username, tempData.email, tempData.password, tempData.role],
    );

    const userId = userResult.insertId;
    let companyId = null;

    if (tempData.role === "employer") {
      const [companyResult] = await db.execute("INSERT INTO Companies (name) VALUES (?)", [`Công ty của ${tempData.full_name}`]);
      companyId = companyResult.insertId;
      await db.execute("UPDATE Users SET company_id = ? WHERE id = ?", [companyId, userId]);
    }
    
    await db.execute(
      "INSERT INTO Profiles (user_id, full_name, phone, avatar_url) VALUES (?, ?, ?, ?)",
      [userId, tempData.full_name, tempData.phone, tempData.avatar_url]
    );

    tempRegisterData.delete(email);

    const token = jwt.sign({ id: userId, role: tempData.role, company_id: companyId }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({ 
      success: true, message: "Xác thực thành công!", token,
      user: { id: userId, username: tempData.username, full_name: tempData.full_name, role: tempData.role, company_id: companyId, avatar_url: tempData.avatar_url }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. GỬI LẠI MÃ OTP ---
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Vui lòng cung cấp email!" });

  try {
    const tempData = tempRegisterData.get(email);
    if (!tempData) return res.status(400).json({ success: false, message: "Không tìm thấy phiên làm việc! Vui lòng thử lại từ đầu." });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    tempData.otp = newOtp;
    tempData.otpExpires = Date.now() + 10 * 60 * 1000;
    tempRegisterData.set(email, tempData);

    const emailHTML = generateEmailHTML(
      tempData.full_name, 
      newOtp, 
      "Yêu cầu gửi lại mã xác thực", 
      "Bạn vừa bấm nút gửi lại mã OTP. Hãy dùng chuỗi số bảo mật mới này để tiếp tục quá trình xác minh:"
    );

    await transporter.sendMail({
      from: `"JobSpot" <${emailUser}>`,
      to: email,
      subject: "🔄 [Gửi lại mã] Xác thực tài khoản JobSpot",
      html: emailHTML,
    });

    return res.status(200).json({ success: true, message: "Mã OTP mới đã được gửi thành công!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. ĐĂNG NHẬP THƯỜNG ---
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });

  try {
    const [users] = await db.execute(`SELECT u.*, p.avatar_url AS profile_avatar, p.full_name FROM Users u LEFT JOIN Profiles p ON p.user_id = u.id WHERE u.email = ?`, [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });

    const user = users[0];
    if (role && user.role !== role) {
      const roleName = user.role === "employer" ? "Nhà tuyển dụng" : "Ứng viên";
      return res.status(403).json({ success: false, message: `Sai cổng đăng nhập! Tài khoản của ${roleName}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Mật khẩu không chính xác!" });
    if (!user.is_verified) return res.status(401).json({ success: false, message: "Chưa xác thực email!" });

    const token = jwt.sign({ id: user.id, role: user.role, company_id: user.company_id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      success: true, token,
      user: { id: user.id, username: user.username, full_name: user.full_name || user.username, role: user.role, company_id: user.company_id, avatar_url: user.profile_avatar || null }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi máy chủ: " + error.message });
  }
};

// --- 5. LẤY PROFILE ---
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT u.id, u.username, u.email, u.role, u.company_id, u.created_at, p.avatar_url, p.full_name, p.phone FROM Users u LEFT JOIN Profiles p ON u.id = p.user_id WHERE u.id = ?`, [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. QUÊN MẬT KHẨU ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "Email không tồn tại!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = formatToMySQLDateTime(new Date(Date.now() + 10 * 60 * 1000));

    await db.execute("UPDATE Users SET otp_code = ?, otp_expires = ? WHERE email = ?", [otp, otpExpires, email]);
    
    const emailHTML = generateEmailHTML(
      email.split("@")[0],
      otp,
      "Yêu cầu cấp lại mật khẩu",
      "Hệ thống nhận được yêu cầu khôi phục mật khẩu từ bạn. Nếu đúng là bạn, hãy hoàn thành mã này trong khung đặt lại mật khẩu:"
    );

    await transporter.sendMail({
      from: `"JobSpot" <${emailUser}>`, to: email, subject: "🔑 Khôi phục mật khẩu tài khoản JobSpot", html: emailHTML,
    });

    return res.status(200).json({ success: true, message: "Đã gửi OTP!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 7. ĐẶT LẠI MẬT KHẨU ---
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

// --- 8. ĐĂNG NHẬP BẰNG GOOGLE ---
exports.googleLogin = async (req, res) => {
  const { accessToken, role } = req.body;
  try {
    const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { email, name, picture } = googleResponse.data;

    const [users] = await db.execute(`SELECT u.*, p.avatar_url AS profile_avatar, p.full_name FROM Users u LEFT JOIN Profiles p ON p.user_id = u.id WHERE u.email = ?`, [email]);
    let user = users[0];

    if (!user) {
      let autoUsername = email.split("@")[0];
      const [checkUser] = await db.execute("SELECT id FROM Users WHERE username = ?", [autoUsername]);
      if (checkUser.length > 0) autoUsername += `_${Math.floor(1000 + Math.random() * 9000)}`;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;

      tempRegisterData.set(email, {
        username: autoUsername, full_name: name, email, phone: "Chưa cập nhật", password: "LOGIN_BY_GOOGLE", role: role || "candidate", avatar_url: picture, otp, otpExpires
      });

      const emailHTML = generateEmailHTML(
        name, 
        otp, 
        "Xác minh đăng nhập Google", 
        "Bạn vừa thực hiện kết nối ứng dụng bằng tài khoản Google mới. Để bảo mật tối đa cho tiến trình đăng nhập lần đầu tiên này, vui lòng nhập mã số xác thực dưới đây:"
      );

      await transporter.sendMail({
        from: `"JobSpot" <${emailUser}>`,
        to: email,
        subject: "🛡️ Xác thực bảo mật tài khoản Google - JobSpot",
        html: emailHTML,
      });

      return res.status(200).json({ success: true, requireOtp: true, email, message: "Tài khoản Google mới! Vui lòng nhập mã OTP đã gửi về Gmail để kích hoạt tài khoản." });
    }

    await db.execute(`UPDATE Users SET is_verified = 1 WHERE id = ?`, [user.id]);
    const token = jwt.sign({ id: user.id, role: user.role, company_id: user.company_id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      success: true, token,
      user: { id: user.id, username: user.username, full_name: user.full_name || user.username, role: user.role, company_id: user.company_id, avatar_url: user.profile_avatar || null }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Lỗi kết nối Google: " + error.message });
  }
};

// --- 9. ADMIN LOGIN ---
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
    
    const emailHTML = generateEmailHTML(
      "Admin",
      otp,
      "Xác thực Đăng nhập Quản trị viên",
      "Phát hiện hành động đăng nhập từ tài khoản quản trị hệ thống. Nhập mã OTP này ngay lập tức để cấp quyền mở bảng điều khiển (Dashboard):"
    );

    await transporter.sendMail({ from: `"JobSpot Admin" <${emailUser}>`, to: email, subject: "🚨 Mã xác thực cấp cao Admin - JobSpot", html: emailHTML });

    return res.status(200).json({ success: true, message: "Vui lòng check OTP!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 10. VERIFY ADMIN OTP ---
exports.verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const currentTime = formatToMySQLDateTime(new Date());
    const [users] = await db.execute(`SELECT u.*, p.avatar_url AS profile_avatar, p.full_name FROM Users u LEFT JOIN Profiles p ON u.id = p.user_id WHERE u.email = ? AND u.otp_code = ? AND u.otp_expires > ?`, [email, otp, currentTime]);
    if (users.length === 0) return res.status(400).json({ success: false, message: "OTP sai hoặc hết hạn!" });

    const user = users[0];
    await db.execute("UPDATE Users SET otp_code = NULL, otp_expires = NULL WHERE email = ?", [email]);

    const token = jwt.sign({ id: user.id, role: user.role, company_id: user.company_id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      success: true, token,
      user: { id: user.id, username: user.username, full_name: user.full_name || user.username, role: user.role, company_id: user.company_id, avatar_url: user.profile_avatar || null }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};