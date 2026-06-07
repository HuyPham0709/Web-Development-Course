import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Briefcase,
  Bell,
  MessageSquare,
  LogOut,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  User,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import chatService from "../../../services/chatService";
const BASE_URL = import.meta.env.VITE_API_URL || "https://web-development-course-y23i.onrender.com";

const toFullUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${BASE_URL}${url}`;
};

interface NotificationItem {
  id: number | string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type?: string;
  link?: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isEmployer, setIsEmployer] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // States cho Chat & Notifications
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotiCount, setUnreadNotiCount] = useState<number>(0);

  // Trạng thái đóng/mở UI
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const notiRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Hàm lấy danh sách thông báo từ API
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) {
        const list = res.data.data || [];
        setNotifications(list);
        const unread = list.filter((n: NotificationItem) => !n.is_read).length;
        setUnreadNotiCount(unread);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  // Đọc dữ liệu user khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsEmployer(parsedUser.role === "employer");
      setIsAdmin(parsedUser.role === "admin");
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setIsEmployer(false);
      setIsAdmin(false);
    }
  }, [location.pathname]);

  // Lấy dữ liệu đếm số tin nhắn và danh sách thông báo NGAY KHI VÀO TRANG (PRE-FETCH)
  useEffect(() => {
    if (isLoggedIn) {
      // 1. Lấy số lượng tin nhắn chưa đọc
      chatService.getUnreadCount()
        .then((res) => setUnreadChatCount(res.data.unreadCount || 0))
        .catch((err) => console.error(err));

      // 2. Tải sẵn danh sách thông báo ngầm dưới nền giúp chuông hiển thị tức thì
      fetchNotifications();
    }
  }, [isLoggedIn, fetchNotifications]);

  // Khởi tạo kết nối Socket.io kết hợp Real-time cho cả Chat và Notifications
  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;

    const socket = io(BASE_URL);
    socketRef.current = socket;

    // Join vào phòng cá nhân của user
    socket.emit("join_room", user.id);

    // Lắng nghe tin nhắn mới
    socket.on("receive_message", () => {
      if (location.pathname !== "/chat") {
        setUnreadChatCount((prev) => prev + 1);
      }
    });

    // 🌟 BỔ SUNG: Lắng nghe thông báo mới thời gian thực từ Backend
    socket.on("new_notification", (newNoti: NotificationItem) => {
      // Đẩy thông báo mới lên đầu mảng danh sách mà không cần gọi lại API
      setNotifications((prev) => [newNoti, ...prev]);
      // Tự động tăng số lượng thông báo chưa đọc lên 1
      setUnreadNotiCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn, user?.id, location.pathname]);

  // Xử lý đóng mở dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý khi nhấn nút Chuông Thông Báo
  const handleToggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    // Nếu người dùng mở chuông ra và đang có thông báo chưa đọc
    if (nextState && unreadNotiCount > 0) {
      // Chuyển UI đếm về 0 ngay lập tức cho mượt
      setUnreadNotiCount(0);

      // Gọi API đánh dấu đã đọc ngầm dưới nền
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.put(`${BASE_URL}/api/notifications/mark-all-read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Cập nhật lại trạng thái cục bộ của danh sách thông báo
          setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (err) {
          console.error("Error marking notifications as read:", err);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setIsEmployer(false);
    setIsAdmin(false);
    setUnreadChatCount(0);
    setNotifications([]);
    setUnreadNotiCount(0);
    navigate("/login");
  };

  // Cấu hình các đường dẫn Menu chính
  const mainLinks = isAdmin
    ? [{ name: "Dashboard", to: "/admin" }]
    : isEmployer
    ? [
        { name: "Find Candidates", to: "/employer/candidates" },
        { name: "Manage Jobs", to: "/employer/jobs" },
        { name: "Applications", to: "/employer/dashboard" },
      ]
    : [
        { name: "Find Jobs", to: "/jobs" },
        { name: "My Applications", to: "/candidate/applications" },
      ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80 border-gray-100 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* LOGO */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 transition-transform active:scale-95">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                JobPortal
              </span>
            </Link>

            {/* DESKTOP NAVIGATION LINKS */}
            <div className="hidden md:flex items-center gap-1">
              {mainLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? "text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/30 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {isLoggedIn && (
              <>
                {/* Chat Message Icon */}
                <Link
                  to="/chat"
                  className={`relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all active:scale-95 ${
                    location.pathname === "/chat" ? "text-blue-600 bg-blue-50/50 dark:text-blue-400" : ""
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadChatCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950 animate-pulse">
                      {unreadChatCount}
                    </span>
                  )}
                </Link>

                {/* NOTIFICATIONS BELL DROPDOWN */}
                <div className="relative" ref={notiRef}>
                  <button
                    onClick={handleToggleNotifications}
                    className={`relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all active:scale-95 ${
                      showNotifications ? "bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" : ""
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotiCount > 0 && (
                      <span className="absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                        {unreadNotiCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border bg-white p-2 shadow-xl dark:bg-gray-900 border-gray-100 dark:border-white/5">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-50 dark:border-white/5 mb-1">
                        Notifications
                      </div>
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-400">No notifications yet</div>
                      ) : (
                        <div className="space-y-0.5">
                          {notifications.map((item) => (
                            <div
                              key={item.id}
                              className={`w-full rounded-xl p-3 text-left transition-colors ${
                                !item.is_read
                                  ? "bg-blue-50/40 dark:bg-blue-950/20"
                                  : "hover:bg-gray-50 dark:hover:bg-white/5"
                              }`}
                            >
                              <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                {item.title || "Notification"}
                              </div>
                              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {item.message}
                              </div>
                              <div className="mt-1 text-[10px] text-gray-400">
                                {new Date(item.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* USER PROFILE DROPDOWN */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 text-left">
                      <Avatar className="h-8 w-8 ring-1 ring-gray-100 dark:ring-white/10">
                        <AvatarImage src={toFullUrl(user?.avatar_url)} alt={user?.username} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-medium text-xs">
                          {user?.username?.substring(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block max-w-[100px]">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {user?.username}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate capitalize">
                          {user?.role}
                        </p>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl">
                    <div className="px-2.5 py-2 sm:hidden border-b border-gray-50 dark:border-white/5 mb-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.username}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm focus:bg-gray-50 dark:focus:bg-white/5 cursor-pointer">
                      <Link to="/profile" className="flex items-center gap-2 w-full">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-sm focus:bg-gray-50 dark:focus:bg-white/5 cursor-pointer">
                      <Link to="/settings" className="flex items-center gap-2 w-full">
                        <Settings className="h-4 w-4 text-gray-400" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-xl px-3 py-2 text-sm text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 dark:text-red-400 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {!isLoggedIn && (
              <div className="hidden md:flex items-center gap-2 pl-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/10 active:scale-95">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 md:hidden transition-all active:scale-95"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-1.5 shadow-inner dark:bg-gray-950 border-gray-100 dark:border-white/5">
          {mainLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {isLoggedIn && (
            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                location.pathname === "/chat"
                  ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              Messages
            </Link>
          )}

          {isLoggedIn && isEmployer && (
            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
              <Link
                to="/employer/jobs/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/20 rounded-xl"
              >
                + Post a Job
              </Link>
            </div>
          )}

          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 items-center justify-center text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 items-center justify-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/10"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}