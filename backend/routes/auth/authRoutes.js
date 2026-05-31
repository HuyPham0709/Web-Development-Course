const express = require('express');
const router = express.Router();
const authController = require("../../controllers/auth/authController");
const profileController = require("../../controllers/auth/ProfileController");
const { verifyToken } = require('../../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const upload = require('../../middlewares/uploadMiddleware');

// ─── RATE LIMITERS ─────────────────────────────────────────────

// Giới hạn login
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    validate: { xForwardedForHeader: false, default: false },
    keyGenerator: (req) => req.body.email || req.ip,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: `Tài khoản ${req.body.email} đã bị tạm khóa 1 phút do nhập sai nhiều lần.`
        });
    }
});

// Giới hạn chung API
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: false },
});

// ─── VALIDATION ────────────────────────────────────────────────

const registerValidation = [
    body('email').isEmail().withMessage('Định dạng email không hợp lệ!'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự!'),
    body('username').notEmpty().withMessage('Tên không được để trống!')
];

// ─── AUTH ROUTES ───────────────────────────────────────────────

router.post('/register', registerValidation, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/google', authController.googleLogin);
router.post('/admin-login', authController.adminLogin);
router.post('/verify-login-otp', authController.verifyLoginOTP);
router.post('/resend-otp', authController.resendOtp);
// ─── PROFILE ROUTES ────────────────────────────────────────────

router.get('/profile', verifyToken, profileController.getMyProfile);
router.put(
    '/profile',
    verifyToken,
    upload.single('cv_file'),
    profileController.updateMyProfile
);

module.exports = router;