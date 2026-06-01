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

// In-memory storage for unverified registrations (Both Standard & Google)
const otpStorage = new Map();

// Import admin notification function safely
let createAdminNotification = null;
try {
  const notificationService = require('../notificationController');
  createAdminNotification = notificationService.createAdminNotification;
} catch (e) {
  createAdminNotification = async (data) => { console.log("Mock Notification:", data); };
}

// JWT fallback if .env is missing
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

const emailUser = "txxh1004@gmail.com";
const emailPass = "wrwvarvgrqlkhjwq";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

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
                  Hello <strong style="color: #0F172A;">${fullName}</strong>,<br><br>
                  ${description}
                </p>
                <div style="background: linear-gradient(135deg, #0052FF 0%, #8B5CF6 100%); border-radius: 20px; padding: 28px 24px; margin: 32px 0; text-align: center; box-shadow: 0 8px 25px rgba(0, 82, 255, 0.25);">
                  <span style="display: block; font-size: 12px; font-weight: 700; color: #FFFFFF; opacity: 0.85; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px;">Your Security Verification Code</span>
                  <span style="font-size: 42px; font-weight: 800; color: #FFFFFF; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 8px;">${otp}</span>
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFBEB; border-radius: 12px; border: 1px solid #FEF3C7; margin-bottom: 10px;">
                  <tr>
                    <td style="padding: 12px 16px; text-align: left; font-size: 13px; color: #B45309; line-height: 18px;">
                      ⚠️ This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone under any circumstances, including JobSpot support staff.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color: #F8FAFC; padding: 24px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
                <p style="margin: 0 0 6px 0; color: #64748B; font-size: 13px; font-weight: 600;">JobSpot Authentication System</p>
                <p style="margin: 0; color: #94A3B8; font-size: 11px;">© 2026 JobSpot Inc. All rights reserved.</p>
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

// --- 1. STANDARD REGISTER ---
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, username, email, password, role, phone } = req.body;
  const finalName = name || username;

  if (!finalName) return res.status(400).json({ success: false, message: "Name cannot be empty!" });
  if (!phone) return res.status(400).json({ success: false, message: "Phone number cannot be empty!" });

  try {
    const [rows] = await db.execute(
      "SELECT email, username FROM Users WHERE email = ? OR username = ?",
      [email, finalName]
    );

    if (rows.length > 0) {
      const isEmailTaken = rows.some(user => user.email === email);
      const isUsernameTaken = rows.some(user => user.username === finalName);
      if (isEmailTaken) return res.status(400).json({ success: false, message: "This email already exists!" });
      if (isUsernameTaken) return res.status(400).json({ success: false, message: `The username '${finalName}' is already taken!` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    otpStorage.set(email, {
      type: 'REGISTER',
      username: finalName, full_name: finalName, email, phone,
      password: hashedPassword, role: role || "candidate", avatar_url: null, otp, otpExpires
    });

    const emailHTML = generateEmailHTML(
      finalName,
      otp,
      "Verify Your New Account",
      "Thank you for choosing to register with JobSpot tech job marketplace ecosystem. Please use the verification code below to activate your account:"
    );

    if (role === "employer" && createAdminNotification) {
      await createAdminNotification({
        title: "🏢 New Employer Registered",
        message: `${finalName} (${email}) just created an employer account and is awaiting company verification.`,
        link_url: `/users`
      });
    }

    await transporter.sendMail({
      from: `"JobSpot" <${emailUser}>`,
      to: email,
      subject: "🔒 Activate Your JobSpot Account",
      html: emailHTML,
    });

    return res.status(201).json({ success: true, message: "Registration successful! Please check your email for the verification code." });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 2. VERIFY EMAIL (VERIFY OTP) ---
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const tempData = otpStorage.get(email);

    if (!tempData) return res.status(400).json({ success: false, message: "Registration session does not exist or has expired!" });
    if (tempData.otp !== otp) return res.status(400).json({ success: false, message: "Incorrect OTP code!" });

    if (Date.now() > tempData.otpExpires) {
      otpStorage.delete(email);
      return res.status(400).json({ success: false, message: "OTP code has expired! Please try registering again." });
    }

    const [userResult] = await db.execute(
      "INSERT INTO Users (username, email, password, role, is_verified, is_active) VALUES (?, ?, ?, ?, 1, 1)",
      [tempData.username, tempData.email, tempData.password, tempData.role]
    );

    const userId = userResult.insertId;
    let companyId = null;

    if (tempData.role === "employer") {
      const [companyResult] = await db.execute("INSERT INTO Companies (name) VALUES (?)", [`Company of ${tempData.full_name}`]);
      companyId = companyResult.insertId;
      await db.execute("UPDATE Users SET company_id = ? WHERE id = ?", [companyId, userId]);
    }

    await db.execute(
      "INSERT INTO Profiles (user_id, full_name, phone, avatar_url) VALUES (?, ?, ?, ?)",
      [userId, tempData.full_name, tempData.phone, tempData.avatar_url]
    );

    otpStorage.delete(email);

    const token = jwt.sign(
      { id: userId, role: tempData.role, company_id: companyId },
      process.env.JWT_SECRET, { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true, message: "Verification successful!", token,
      user: { id: userId, username: tempData.username, full_name: tempData.full_name, role: tempData.role, company_id: companyId, avatar_url: tempData.avatar_url }
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 3. RESEND OTP ---
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Please provide an email address!" });

  try {
    const tempData = otpStorage.get(email);

    if (!tempData) return res.status(400).json({ success: false, message: "Session not found! Please restart the registration process." });

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    tempData.otp = newOtp;
    tempData.otpExpires = Date.now() + 10 * 60 * 1000;

    otpStorage.set(email, tempData);

    const emailHTML = generateEmailHTML(
      tempData.full_name,
      newOtp,
      "Resend Verification Code Request",
      "You have requested to resend your OTP code. Please use this new security verification code to continue your verification process:"
    );

    await transporter.sendMail({
      from: `"JobSpot" <${emailUser}>`,
      to: email,
      subject: "🔄 [Resend Code] Verify Your JobSpot Account",
      html: emailHTML,
    });

    return res.status(200).json({ success: true, message: "New OTP code has been sent successfully!" });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 4. STANDARD LOGIN ---
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Please enter all required information!" });

  try {
    const [users] = await db.execute(
      `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name FROM Users u LEFT JOIN Profiles p ON p.user_id = u.id WHERE u.email = ?`,
      [email]
    );
    if (users.length === 0) return res.status(404).json({ success: false, message: "User does not exist!" });

    const user = users[0];

    if (!user.is_active) {
      const banMsg = user.ban_reason
        ? `Your account has been suspended. Reason: ${user.ban_reason}`
        : "Your account has been suspended. Please contact support.";
      return res.status(403).json({ success: false, message: banMsg });
    }

    if (role && user.role !== role) {
      const roleName = user.role === "employer" ? "Employer" : "Candidate";
      return res.status(403).json({ success: false, message: `Incorrect login portal! This account is registered as a ${roleName}.` });
    }

    if (user.password === "LOGIN_BY_GOOGLE") {
      return res.status(400).json({ success: false, message: "This account uses Google Login. Please sign in via Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect password!" });
    if (!user.is_verified) return res.status(401).json({ success: false, message: "Email has not been verified yet!" });

    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET, { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true, token,
      user: { id: user.id, username: user.username, full_name: user.full_name || user.username, role: user.role, company_id: user.company_id, avatar_url: user.profile_avatar || null }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// --- 5. GET PROFILE ---
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.username, u.email, u.role, u.company_id, u.created_at, p.avatar_url, p.full_name, p.phone FROM Users u LEFT JOIN Profiles p ON u.id = p.user_id WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "User not found!" });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 6. FORGOT PASSWORD ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "Email address does not exist!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // ĐÃ SỬA CONFLICT: Đồng bộ hóa lưu OTP RAM sạch sẽ
    otpStorage.set(email, { type: 'FORGOT_PASSWORD', otp, otpExpires });

    const emailHTML = generateEmailHTML(
      email.split("@")[0],
      otp,
      "Password Reset Request",
      "We received a request to recover your password. If this was you, please complete this verification code in the password reset window:"
    );

    await transporter.sendMail({
      from: `"JobSpot" <${emailUser}>`, to: email, subject: "🔑 Recover Your JobSpot Password", html: emailHTML,
    });

    return res.status(200).json({ success: true, message: "OTP code has been sent!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 7. RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // ĐÃ SỬA CONFLICT: Lấy dữ liệu OTP từ RAM
    const otpData = otpStorage.get(email);

    if (!otpData || otpData.type !== 'FORGOT_PASSWORD') {
      return res.status(400).json({ success: false, message: "Session does not exist or has expired!" });
    }
    if (otpData.otp !== otp) return res.status(400).json({ success: false, message: "Incorrect OTP code!" });
    if (Date.now() > otpData.otpExpires) {
      otpStorage.delete(email);
      return res.status(400).json({ success: false, message: "OTP code has expired!" });
    }

    const [users] = await db.execute("SELECT password FROM Users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "User not found!" });

    const isSamePassword = await bcrypt.compare(newPassword, users[0].password);
    if (isSamePassword) return res.status(400).json({ success: false, message: "New password cannot be identical to the old password!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute("UPDATE Users SET password = ? WHERE email = ?", [hashedPassword, email]);

    otpStorage.delete(email);

    return res.status(200).json({ success: true, message: "Password has been reset successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 8. GOOGLE LOGIN ---
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

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;

      otpStorage.set(email, {
        type: 'REGISTER',
        username: autoUsername, full_name: name, email, phone: "Not provided",
        password: "LOGIN_BY_GOOGLE", role: role || "candidate", avatar_url: picture, otp, otpExpires
      });

      const emailHTML = generateEmailHTML(
        name,
        otp,
        "Google Login Verification",
        "You are connecting to our application using a new Google account. To ensure maximum security for this initial login process, please enter the following verification code:"
      );

      await transporter.sendMail({
        from: `"JobSpot" <${emailUser}>`,
        to: email,
        subject: "🛡️ Google Account Security Verification - JobSpot",
        html: emailHTML,
      });

      return res.status(200).json({
        success: true, requireOtp: true, email,
        message: "New Google account detected! Please enter the OTP code sent to your Gmail to activate the account."
      });
    }

    if (!user.is_active) {
      const banMsg = user.ban_reason
        ? `Your account has been suspended. Reason: ${user.ban_reason}`
        : "Your account has been suspended. Please contact support.";
      return res.status(403).json({ success: false, message: banMsg });
    }

    await db.execute(`UPDATE Users SET is_verified = 1 WHERE id = ?`, [user.id]);
    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET, { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true, token,
      user: { id: user.id, username: user.username, full_name: user.full_name || user.username, role: user.role, company_id: user.company_id, avatar_url: user.profile_avatar || null }
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({ success: false, message: "Google connection error: " + error.message });
  }
};

// --- 9. ADMIN LOGIN ---
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Please fill in all fields!" });

  try {
    const [users] = await db.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "User does not exist!" });

    const user = users[0];
    if (user.role !== "admin") return res.status(403).json({ success: false, message: "Access denied. Admin only!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect password!" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 phút

    // ĐÃ SỬA CONFLICT: Lưu hoàn toàn vào RAM, xóa bỏ cú pháp DB thừa
    otpStorage.set(email, { type: 'ADMIN_LOGIN', otp, otpExpires });

    const emailHTML = generateEmailHTML(
      "Admin", otp, "Administrator Login Verification",
      "Login activity detected from a system admin account. Enter this OTP code immediately to gain access and open the Dashboard:"
    );

    await transporter.sendMail({
      from: `"JobSpot Admin" <${emailUser}>`, to: email,
      subject: "🚨 High-Level Admin Verification Code - JobSpot", html: emailHTML
    });

    return res.status(200).json({ success: true, message: "Please check your email for the OTP code!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- 10. VERIFY ADMIN OTP ---
exports.verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    // ĐÃ SỬA CONFLICT: Đọc và check OTP sạch sẽ từ bộ nhớ RAM
    const otpData = otpStorage.get(email);

    if (!otpData || otpData.type !== 'ADMIN_LOGIN') {
      return res.status(400).json({ success: false, message: "Invalid or expired session!" });
    }
    if (otpData.otp !== otp) return res.status(400).json({ success: false, message: "Incorrect OTP code!" });
    if (Date.now() > otpData.otpExpires) {
      otpStorage.delete(email);
      return res.status(400).json({ success: false, message: "OTP code has expired!" });
    }

    const [users] = await db.execute(
      `SELECT u.*, p.avatar_url AS profile_avatar, p.full_name FROM Users u LEFT JOIN Profiles p ON u.id = p.user_id WHERE u.email = ?`,
      [email]
    );

    const user = users[0];
    otpStorage.delete(email); // Giải phóng RAM

    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET, { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true, token,
      user: { id: user.id, username: user.username, full_name: user.full_name || user.username, role: user.role, company_id: user.company_id, avatar_url: user.profile_avatar || null }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};