import axios from "axios";
import toast from "react-hot-toast";

const API = "https://web-development-course-y23i.onrender.com";

export const api = axios.create({
  baseURL: API,
});

// 🛡️ Request interceptor - Bản nâng cấp tự bóc tách và sửa lỗi định dạng chuỗi token
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");
    
    if (token) {
      // BẪY TỰ ĐỘNG: Nếu token bị bọc trong dấu ngoặc kép "" do lỗi lưu trữ, tự cắt bỏ nó luôn!
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
      
      // Kiểm tra token hợp lệ, tránh truyền chuỗi rỗng hoặc từ khóa "undefined"/"null"
      if (token !== "undefined" && token !== "null" && token.trim() !== "") {
        // Tự động kiểm tra: Nếu token đã có sẵn chữ "Bearer " thì giữ nguyên, chưa có thì mới thêm vào
        const authorizationHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        config.headers.Authorization = authorizationHeader;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🛑 Response interceptor - Xử lý tập trung các lỗi Auth & Banned
// Response interceptor - Bản gia cố miễn nhiễm lỗi profile ngầm
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? "";
    const url = error.config?.url ?? "";

    console.warn(`[Axios Interceptor] Phát hiện lỗi API: URL="${url}" | Status=${status} | Message="${message}"`);

    // 🛑 PHANH AN TOÀN 1: Nếu ở trang Auth thì không văng
    if (window.location.pathname.includes("/auth")) {
      return Promise.reject(error);
    }

    // 🛑 PHANH AN TOÀN 2: Nếu lỗi 403 từ API lấy thông tin profile cá nhân, TUYỆT ĐỐI không xóa token, không ép văng!
    if (url.includes("/users/profile") || url.includes("/profile")) {
      console.error("🛑 Chặn hành vi văng tài khoản: Lỗi phát sinh từ API lấy Profile.");
      return Promise.reject(error);
    }

    // 1. Kiểm tra Token thực sự hết hạn / không hợp lệ từ các API chức năng khác
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

    // XỬ LÝ LOGIC ÉP ĐĂNG XUẤT
    if (isTokenExpired) {
      if (localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
          duration: 4000,
        });

        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      }
    } else if (isBanned) {
      if (localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        toast.error(message || "Tài khoản của bạn đã bị khóa.", { 
          duration: 5000 
        });

        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      }
    }

    return Promise.reject(error);
  }
);