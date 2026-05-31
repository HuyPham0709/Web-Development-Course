import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: API,
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - bắt token hết hạn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? "";

    const isTokenExpired =
      status === 401 ||
      (status === 403 && (
        message.includes("không hợp lệ") ||
        message.includes("hết hạn") ||
        message.includes("expired") ||
        message.includes("invalid token")
      ));

    if (isTokenExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
        duration: 4000,
      });

      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
    }

    return Promise.reject(error);
  }
);

// Response interceptor - bắt token hết hạn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? "";

    const isTokenExpired =
      status === 401 ||
      (status === 403 && (
        message.includes("không hợp lệ") ||
        message.includes("hết hạn") ||
        message.includes("expired") ||
        message.includes("invalid token")
      ));

    // ✅ THÊM: bắt riêng trường hợp bị ban
    const isBanned =
      status === 403 && message.includes("bị khóa");

    if (isTokenExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
        duration: 4000,
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
    }

    // ✅ THÊM: logout và hiển thị lý do ban
    if (isBanned) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.error(message, { duration: 5000 });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
    }

    return Promise.reject(error);
  }
);