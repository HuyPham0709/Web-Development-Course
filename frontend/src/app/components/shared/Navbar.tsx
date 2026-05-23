import React, { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  Bell,
  MessageSquare,
  CheckCircle2,
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const BASE_URL = "http://localhost:5000";

const toFullUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
};

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  linkUrl: string | null;
}

export const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "",
    avatarUrl: "",
    role: "",
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // 🔒 Khóa trạng thái chống spam click

  const getNavLinks = () => {
    const baseLinks = [{ name: "Home", path: "/" }];
    if (!isLoggedIn) return baseLinks;
    const userRole = user.role?.toLowerCase();

    if (userRole === "employer") {
      return [
        ...baseLinks,
        { name: "Dashboard", path: "/employer/dashboard" },
        { name: "CV Sreach", path: "/employer/cv-search" },
      ];
    }

    if (userRole === "candidate") {
      return [
        ...baseLinks,
        { name: "My Applications", path: "/applications" },
        { name: "Settings", path: "/settings" },
      ];
    }
    return baseLinks;
  };

  const navLinks = getNavLinks();

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    }
  };

  // 🛠️ ĐÃ CẬP NHẬT: Xử lý chống spam, mất chấm lập tức và chuyển hướng trang
  const handleMarkAsRead = async (id: number, linkUrl: string | null) => {
    // 1. CHỐNG SPAM: Nếu đang xử lý một click trước đó, chặn không cho chạy tiếp
    if (isProcessing) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const currentNotif = notifications.find((item) => item.id === id);
    
    // Tự động đóng menu thông báo lại sau khi click để tối ưu trải nghiệm
    setShowNotifications(false);

    // Kiểm tra xem thông báo này thực sự CHƯA ĐỌC thì mới gọi API
    if (currentNotif && currentNotif.unread) {
      setIsProcessing(true); // Bật khóa chống spam

      // Tối ưu hóa UI: Biến mất chấm tròn xanh lập tức trên giao diện trước khi API phản hồi
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, unread: false } : item
        )
      );

      try {
        await axios.put(
          `${BASE_URL}/api/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái đọc:", error);
      } finally {
        setIsProcessing(false); // Mở khóa sau khi API thực thi xong
      }
    }

    // 2. ĐIỀU HƯỚNG TRANG: Nhảy ngay tới đường dẫn được lưu (Post hoặc Profile)
    if (linkUrl) {
      navigate(linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        `${BASE_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, unread: false }))
      );
    } catch (error) {
      console.error("Lỗi cập nhật đọc tất cả:", error);
    }
  };

  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem("token");
      const savedUserStr = localStorage.getItem("user");

      if (token && savedUserStr) {
        setIsLoggedIn(true);
        try {
          const parsedUser = JSON.parse(savedUserStr);
          setUser({
            name: parsedUser.full_name || parsedUser.name || "",
            avatarUrl: toFullUrl(parsedUser.avatar_url),
            role: parsedUser.role || "",
          });
          fetchNotifications();
        } catch (e) {
          console.error("Lỗi parse user từ localStorage:", e);
        }
      } else {
        setIsLoggedIn(false);
        setNotifications([]);
      }
    };

    loadUserData();

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { full_name, avatar_url, role } = customEvent.detail;
      setUser((prev) => ({
        ...prev,
        name: full_name || prev.name,
        avatarUrl: avatar_url ? toFullUrl(avatar_url) : prev.avatarUrl,
        role: role || prev.role,
      }));
    };

    const handleAuthChange = () => loadUserData();

    window.addEventListener("user-profile-updated", handleProfileUpdate);
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", loadUserData);

    return () => {
      window.removeEventListener("user-profile-updated", handleProfileUpdate);
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", loadUserData);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser({ name: "", avatarUrl: "", role: "" });
    setNotifications([]);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const isEmployer = user.role?.toLowerCase() === "employer";
  const hasUnread = notifications.some((n) => n.unread);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#0B0F19]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* LEFT: LOGO + NAV LINKS */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
              <Briefcase size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Job
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Spot
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT: CONTROLS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-white/10 overflow-hidden"
            aria-label="Toggle theme"
          >
            <Sun
              size={20}
              className={`absolute text-amber-400 transition-all duration-500 ease-in-out ${
                theme === "dark"
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              }`}
            />
            <Moon
              size={20}
              className={`absolute transition-all duration-500 ease-in-out ${
                theme === "dark"
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              }`}
            />
          </button>

          {/* BỔ SUNG: CHAT ICON TRÊN DESKTOP */}
          {isLoggedIn && (
            <Link
              to="/chat"
              className={`relative rounded-full p-2 transition-colors ${
                location.pathname === '/chat'
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
              }`}
              title="Messages"
            >
              <MessageSquare size={20} />
            </Link>
          )}

          {/* NOTIFICATIONS */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-white/10"
            >
              <Bell size={20} />
              {isLoggedIn && hasUnread && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#0B0F19]">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    Notifications
                  </span>
                  <span
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline"
                  >
                    Mark all read
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto pt-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">
                      No notifications.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        // 🛠️ ĐÃ CẬP NHẬT: Truyền thêm tham số notif.linkUrl vào hàm khi click
                        onClick={() => handleMarkAsRead(notif.id, notif.linkUrl)}
                        className={`p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex gap-3 items-start ${notif.unread ? "bg-blue-50/40 dark:bg-blue-950/10" : ""}`}
                      >
                        {notif.unread && (
                          <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-blue-600"></div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                            {notif.desc}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* USER AUTH */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer pr-3">
                  <Avatar className="w-8 h-8 border border-gray-200 dark:border-white/10">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start text-left md:flex">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className="text-gray-400 hidden md:block"
                  />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl p-1.5 border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0B0F19]"
              >
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-0.5">
                    {user.name}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5" />

                {!isEmployer && (
                  <DropdownMenuItem className="p-1 cursor-pointer focus:bg-transparent">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-green-500/10 dark:group-hover:bg-green-500/20 transition-colors">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                      </div>
                      <span className="font-medium text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        Hồ sơ cá nhân
                      </span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="p-1 cursor-pointer focus:bg-transparent">
                  <Link
                    to={isEmployer ? "/employer/dashboard" : "/settings"}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-colors">
                      <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="font-medium text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {isEmployer ? "Dashboard" : "Cài đặt"}
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="p-1 cursor-pointer focus:bg-transparent mt-1"
                >
                  <div className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 dark:group-hover:bg-red-500/20 transition-colors">
                      <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    </div>
                    <span className="font-medium text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                      Đăng xuất
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white px-2"
            >
              Sign In
            </Link>
          )}

          {/* POST A JOB */}
          {isLoggedIn && isEmployer && (
            <Link
              to="/employer/jobs/new"
              className="hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 md:block"
            >
              Post a Job
            </Link>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-white/10 md:hidden"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 space-y-3 md:hidden shadow-inner dark:border-white/5 dark:bg-[#0B0F19]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isActive
                    ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* BỔ SUNG: LINK CHAT TRÊN MOBILE MENU */}
          {isLoggedIn && (
            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                location.pathname === '/chat'
                  ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
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
                className="block w-full text-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-sm font-medium text-white shadow-sm"
              >
                Post a Job
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};