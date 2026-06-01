import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  ArrowLeft,
  Loader2,
  Sun,
  Moon,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useGoogleLogin } from "@react-oauth/google";

// Google SVG Icon Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthPage() {
  const navigate = useNavigate();

  // --- THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // --- STATES & UI CONTROLS ---
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [view, setView] = useState<"auth" | "forgot" | "reset">("auth");
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- DATA STATES ---
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "", newPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setError("");
    setFormData({ fullName: "", email: "", phone: "", password: "", confirmPassword: "", newPassword: "" });
    setShowOTP(false);
    setView("auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeTab === "register") {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
        return setError("Please fill in all required information..");
      }
      if (formData.password !== formData.confirmPassword) {
        return setError("Confirm password does not match.");
      }
    } else {
      if (!formData.email || !formData.password) {
        return setError("Please fill in Email and Password.");
      }
    }

    setIsLoading(true);
    try {
      if (activeTab === "login") {
        const response = await axios.post("http://localhost:5000/api/auth/login", {
          email: formData.email, password: formData.password, role: role,
        });

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          await Swal.fire({ title: "Success!", text: "Welcome back!", icon: "success", timer: 1500, showConfirmButton: false });
          navigate("/");
          window.location.reload();
        }
      } else {
        const response = await axios.post("http://localhost:5000/api/auth/register", {
          username: formData.fullName, name: formData.fullName, email: formData.email, phone: formData.phone, password: formData.password, role: role,
        });

        if (response.data.success) {
          Swal.fire({ title: "Registration successful!", text: "OTP code has been sent to your email!", icon: "success" });
          setShowOTP(true);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra!";
      setError(msg);
      Swal.fire({ title: "Lỗi", text: msg, icon: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otpCode.length < 6) return setError("Please enter the complete 6-digit OTP!");

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/verify-email", {
        email: formData.email, otp: otpCode,
      });

      if (response.data.success) {
        // ✨ MỚI: Backend đã trả về token trực tiếp, lưu vào local và chuyển hướng
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          
          await Swal.fire({ title: "Success!", text: "Verification and login successful!", icon: "success", timer: 1500, showConfirmButton: false });
          navigate("/");
          window.location.reload();
        } else {
          // Fallback an toàn
          await Swal.fire({ title: "Verification successful!", text: "Please login now!", icon: "success" });
          setOtpCode("");
          setShowOTP(false);
          setActiveTab("login");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP is invalid!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return; 
    
    setError("");
    setIsLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/api/auth/resend-otp", { email: formData.email });

      if (response.data.success) {
        Swal.fire({ title: "Resent!", text: "The new OTP code has been sent to your email.", icon: "success", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
        setResendCooldown(300); // 300 giây = 5 phút
        setOtpCode("");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error resending OTP. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await axios.post("http://localhost:5000/api/auth/google", {
          accessToken: tokenResponse.access_token, role: role,
        });

        // ✨ MỚI: Xử lý luồng OTP cho tài khoản Google mới
        if (response.data.requireOtp) {
          setFormData({ ...formData, email: response.data.email }); // Lưu lại email để dùng cho API verify
          setShowOTP(true); // Bật giao diện nhập OTP
          Swal.fire({
            title: "Security Verification",
            text: response.data.message,
            icon: "info"
          });
        } else if (response.data.token) {
          // Luồng bình thường: Đã có sẵn tài khoản
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          await Swal.fire({ title: "Success!", text: "Google login successful!", icon: "success", timer: 1500, showConfirmButton: false });
          navigate("/");
          window.location.reload();
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Error logging in with Google!");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("Google login failed!"),
  });

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.email) return setError("Please enter your email to receive the code!");

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email: formData.email });
      if (response.data.success) {
        Swal.fire({ title: "Success!", text: response.data.message, icon: "success" });
        setOtpCode("");
        setView("reset");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otpCode || !formData.newPassword) return setError("Please enter the OTP and new password!");
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email: formData.email, otp: otpCode, newPassword: formData.newPassword,
      });
      if (response.data.success) {
        await Swal.fire({ title: "Success!", text: response.data.message, icon: "success" });
        setOtpCode("");
        setFormData({ ...formData, password: "", newPassword: "" });
        setView("auth");
        setActiveTab("login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B0F19] text-gray-900 dark:text-white font-sans transition-colors duration-300 selection:bg-[#8B5CF6]/30 selection:text-white">
      {/* Left Column - Branding & Visuals */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19] p-12 transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-[20%] -top-[10%] h-[600px] w-[600px] rounded-full bg-[#0052FF]/10 dark:bg-[#0052FF]/20 blur-[150px] transition-colors duration-300"></div>
          <div className="absolute -bottom-[10%] -right-[20%] h-[600px] w-[600px] rounded-full bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/20 blur-[150px] transition-colors duration-300"></div>
        </div>

        {/* Center Image Container */}
        <div className="relative z-10 flex flex-1 items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative h-80 w-80 lg:h-96 lg:w-96 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 p-4 backdrop-blur-2xl shadow-xl dark:shadow-[0_0_50px_rgba(139,92,246,0.15)] transition-colors duration-300"
          >
            <img
              src="https://images.unsplash.com/photo-1625014618427-fbc980b974f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMDNkJTIwdGVjaCUyMHNwaGVyZSUyMG5lb258ZW58MXx8fHwxNzc5MTkxNTMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="3D Tech Sphere"
              className="h-full w-full rounded-full object-cover opacity-90 dark:opacity-80 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-300"
            />
            <div className="absolute inset-0 rounded-full border border-gray-300/50 dark:border-white/20 transition-colors duration-300"></div>
          </motion.div>
        </div>

        {/* Quote Text */}
        <div className="relative z-10 max-w-md">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug transition-colors duration-300">
            {view === "forgot" ? (
              "\"Don't worry. We will help you securely recover your password and secure your job account.\""
            ) : view === "reset" ? (
              "\"Create a strong new password to continue accessing our tech job ecosystem smoothly.\""
            ) : (
              "\"Your future starts here. Join thousands of professionals and top tech companies.\""
            )}
          </h2>
        </div>
      </div>

      {/* Right Column - Interactive Auth Module */}
      <div className="relative flex w-full lg:w-1/2 flex-col items-center justify-center overflow-y-auto bg-white dark:bg-[#0a0d14] px-6 py-12 lg:px-12 transition-colors duration-300">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <Link
            to="/"
            className="mb-4 flex items-center gap-2 lg:hidden w-max transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0052FF] to-[#8B5CF6] text-white">
              <Briefcase size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300">
              JobSpot
            </span>
          </Link>

          {/* Cảnh báo lỗi */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20 shadow-sm dark:shadow-lg text-center animate-shake animate-duration-300 transition-colors duration-300">
              {error}
            </div>
          )}

          {/* RENDERING DỰA TRÊN TRẠNG THÁI VIEW VÀ OTP */}
          {showOTP ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-300"
            >
              <div className="mb-8 flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Verify Your Identity
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                    We've sent a 6-digit verification code to{" "}
                    <span className="text-[#0052FF] font-semibold">
                      {formData.email}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyOTP}>
                <div className="relative mb-8 flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 tracking-[2em] text-center"
                    autoFocus
                  />

                  <div className="flex justify-between gap-2 sm:gap-3 w-full">
                    {[...Array(6)].map((_, index) => {
                      const char = otpCode[index];
                      const isActive = index === otpCode.length;
                      return (
                        <div
                          key={index}
                          className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border text-xl font-bold backdrop-blur-md transition-all duration-300 ${
                            char
                              ? "border-[#8B5CF6] text-gray-900 dark:text-white bg-white dark:bg-[#0B0F19]"
                              : isActive
                                ? "border-[#0052FF] bg-blue-50/50 dark:bg-[#0B0F19]/80 shadow-[0_0_15px_rgba(0,82,255,0.1)] dark:shadow-[0_0_15px_rgba(0,82,255,0.3)]"
                                : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {char || "-"}
                          {isActive && (
                            <div className="ml-1 h-5 w-0.5 animate-pulse bg-[#0052FF]"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-8 text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendCooldown > 0 || isLoading}
                      className={`ml-1 transition-colors ${
                        resendCooldown > 0 || isLoading
                          ? "text-gray-400 cursor-not-allowed opacity-70"
                          : "text-[#0052FF] hover:text-[#0040CC] dark:hover:text-[#8B5CF6]"
                      }`}
                    >
                      {resendCooldown > 0
                        ? `Resend in ${Math.floor(resendCooldown / 60)}:${(resendCooldown % 60).toString().padStart(2, '0')}`
                        : "Resend code"}
                    </button>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/20 dark:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mx-auto w-5 h-5" />
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </form>
            </motion.div>
          ) : view === "forgot" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-300"
            >
              <div className="mb-6 flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => setView("auth")}
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Forgot Password
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                    Enter your email address and we'll send you an OTP code to reset your password.
                  </p>
                </div>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 dark:shadow-[0_0_20px_rgba(0,82,255,0.3)] transition-all hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-[0_0_30px_rgba(0,82,255,0.5)] hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mx-auto w-5 h-5" />
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>
            </motion.div>
          ) : view === "reset" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-300"
            >
              <div className="mb-6 flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    Reset Password
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors duration-300">
                    Verify the OTP code from your email and type your new password.
                  </p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter 6-digit OTP Code"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="New Password"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 py-3.5 pl-11 pr-11 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length < 6 || !formData.newPassword}
                  className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/20 dark:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mx-auto w-5 h-5" />
                  ) : (
                    "Reset Password Now"
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            /* CASE 4: Form Đăng nhập & Đăng ký mặc định */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-300"
            >
              {/* Tabs */}
              <div className="mb-8 flex rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 p-1 backdrop-blur-md transition-colors duration-300">
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "login"
                      ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "register"
                      ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Social Auth */}
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={isLoading}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 py-3.5 text-sm font-medium text-gray-700 dark:text-white transition-all hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 disabled:opacity-50"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 transition-colors duration-300"></div>
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors duration-300">
                  Or continue with email
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10 transition-colors duration-300"></div>
              </div>

              {/* Role Selection */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all ${
                    role === "candidate"
                      ? "border-[#0052FF] bg-[#0052FF]/5 dark:bg-[#0052FF]/10 text-[#0052FF] dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(0,82,255,0.15)]"
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <User size={24} className={role === "candidate" ? "text-[#0052FF]" : ""} />
                  <span className="text-sm font-semibold">I'm a Candidate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all ${
                    role === "employer"
                      ? "border-[#8B5CF6] bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 text-[#8B5CF6] dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                      : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Building size={24} className={role === "employer" ? "text-[#8B5CF6]" : ""} />
                  <span className="text-sm font-semibold">I'm an Employer</span>
                </button>
              </div>

              {/* Main Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "register" && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50"
                      />
                    </div>
                  </>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 py-3.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 py-3.5 pl-11 pr-11 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {activeTab === "register" && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0B0F19]/50 py-3.5 pl-11 pr-11 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}

                {/* Utilities */}
                <div className="mt-5 mb-8 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-300 dark:border-white/20 bg-white dark:bg-[#0B0F19] group-hover:border-[#0052FF] transition-colors">
                      <input type="checkbox" className="peer sr-opacity absolute opacity-0 w-full h-full cursor-pointer" />
                      <div className="pointer-events-none peer-checked:bg-[#0052FF] absolute inset-0 rounded-[3px] transition-colors"></div>
                      <svg
                        className="pointer-events-none absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setError(""); }}
                    className="text-sm font-medium text-[#0052FF] dark:text-[#8B5CF6] hover:text-[#0040CC] dark:hover:text-[#a78bfa] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* CTA Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 dark:shadow-[0_0_20px_rgba(0,82,255,0.3)] transition-all hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-[0_0_30px_rgba(0,82,255,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin mx-auto w-5 h-5" />
                  ) : activeTab === "login" ? (
                    "Sign In"
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}