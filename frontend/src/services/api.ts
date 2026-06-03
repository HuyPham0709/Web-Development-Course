import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL ?? "https://web-development-course-y23i.onrender.com";

export const api = axios.create({
  baseURL: API,
});

// Request interceptor - đính kèm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Xử lý tập trung các lỗi Auth & Banned (Đã gộp)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? "";

    // 1. Kiểm tra Token hết hạn / không hợp lệ
    const isTokenExpired =
      status === 401 ||
      (status === 403 && (
        message.includes("không hợp lệ") ||
        message.includes("hết hạn") ||
        message.includes("expired") ||
        message.includes("invalid token")
      ));

    // 2. Kiểm tra tài khoản bị khóa
    const isBanned = status === 403 && message.includes("bị khóa");

    // XỬ LÝ LOGIC
    if (isTokenExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
        duration: 4000,
      });

      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
      
    } else if (isBanned) {
      // Dùng else if để tách biệt rõ ràng với lỗi hết hạn token
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.error(message || "Tài khoản của bạn đã bị khóa.", { 
        duration: 5000 
      });

      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
    }

    return Promise.reject(error);
  }
);