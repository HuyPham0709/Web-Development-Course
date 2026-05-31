import { useState, useEffect, useRef, useCallback } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  Tags,
  AlertTriangle,
  Search,
  Bell,
  LogOut,
  Sun,
  Moon,
  Trash2 // 1. Bổ sung thêm icon Trash2 để làm nút xóa
} from "lucide-react"
import { cn } from "../../lib/utils"
import axios from "axios"
import { io, Socket } from "socket.io-client"
import { useTheme } from "next-themes"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users & Companies", href: "/users", icon: Users },
  { name: "Jobs", href: "/jobs/management", icon: BriefcaseBusiness },
  { name: "Metadata", href: "/metadata", icon: Tags },
  { name: "Resolution Center", href: "/reports", icon: AlertTriangle },
]

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  link_url: string | null;
}

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // States cho User
  const [user, setUser] = useState<UserProfile | null>(null)

  // States & Refs cho Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  // Dark Mode States
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Hàm tạo avatar chữ dự phòng
  const getInitials = (name: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Tránh lỗi hydration của next-themes
  useEffect(() => {
    setMounted(true)
  }, [])

  // Lấy danh sách Notifications từ API Admin chuyên dụng
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount ?? response.data.data.filter((n: NotificationItem) => !n.is_read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  // Hook gọi API lấy thông tin Profile & khởi tạo Notifications
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const userData = data.data || data.user || data;

          if (userData && (userData.username || userData.email || userData.full_name)) {
            setUser({
              id: userData.id || 0,
              username: userData.username || userData.full_name || userData.name || "Hệ thống Admin",
              email: userData.email || "admin@system.com",
              role: userData.role || "admin",
              avatar_url: userData.avatar_url || null
            });
          } else {
            setUser({
              id: 0,
              username: "Quản trị viên",
              email: "admin@gmail.com",
              role: "admin"
            });
          }

          if (typeof fetchNotifications === "function") {
            fetchNotifications();
          }
        } else {
          console.error("Server trả về lỗi status:", response.status, data?.message);
          localStorage.removeItem("admin_token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Lỗi kết nối API profile:", error);
      }
    };

    fetchProfile();
  }, [navigate, fetchNotifications]);

  // Thiết lập Socket chuẩn hóa kênh Admin để nhận thông báo real-time
  useEffect(() => {
    const socket = io(BASE_URL);
    socketRef.current = socket;

    // Gia nhập phòng Admin chung trên hệ thống Socket
    socket.emit("add_user", "admin");

    // Lắng nghe sự kiện thông báo độc quyền dành cho quản trị
    socket.on("receive_admin_notification", (newNotify: NotificationItem) => {
      setNotifications((prev) => [newNotify, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("receive_admin_notification");
      socket.disconnect();
    };
  }, []);

  // Tắt dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đánh dấu 1 thông báo là đã đọc
  const handleMarkAsRead = async (id: string, linkUrl: string | null) => {
    if (isProcessing) return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const currentNotif = notifications.find((item) => item._id === id);
    setShowNotifications(false);

    if (currentNotif && !currentNotif.is_read) {
      setIsProcessing(true);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, is_read: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      try {
        await axios.put(
          `${BASE_URL}/api/admin/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error updating read status:", error);
      } finally {
        setIsProcessing(false);
      }
    }

    if (linkUrl) {
      navigate(linkUrl);
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      await axios.put(
        `${BASE_URL}/api/admin/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // 2. Hàm xử lý xóa MỘT thông báo cụ thể theo ID
  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra thẻ cha (tránh bị trigger chuyển link)
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    // Tìm thông báo chuẩn bị xóa để cập nhật lại badge số lượng chưa đọc nếu cần
    const targetNotif = notifications.find(n => n._id === id);

    // Cập nhật UI nhanh ngay lập tức (Optimistic UI)
    setNotifications((prev) => prev.filter((item) => item._id !== id));
    if (targetNotif && !targetNotif.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await axios.delete(`${BASE_URL}/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Nếu lỗi thì kéo lại danh sách để đồng bộ lại giao diện
      fetchNotifications();
    }
  };

  // 3. Hàm xử lý xóa TOÀN BỘ thông báo
  const handleClearAllNotifications = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ thông báo hệ thống không?")) {
      return;
    }

    // Xóa sạch trên UI trước
    setNotifications([]);
    setUnreadCount(0);

    try {
      await axios.delete(`${BASE_URL}/api/admin/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      fetchNotifications();
    }
  };

  // Hàm xử lý Đăng xuất
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    localStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-10 border-r border-slate-900 dark:border-slate-800">
        <div className="h-16 flex items-center px-6 bg-slate-950 font-bold text-xl text-white">
          <BriefcaseBusiness className="w-6 h-6 mr-2 text-indigo-500" />
          JobFinder Admin
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5 mr-3 flex-shrink-0", isActive ? "text-indigo-200" : "text-slate-400")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 bg-slate-950">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-400" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-200">
          <div className="max-w-md w-full relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search users, jobs, reports..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-transparent rounded-md text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center space-x-4">

            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Chuyển chế độ giao diện"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50">
                  {/* Header của Dropdown */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </span>

                    {/* Khu vực chứa nút Đọc hết & Xóa hết */}
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <span
                          onClick={handleMarkAllRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline"
                        >
                          Mark all read
                        </span>
                      )}
                      {unreadCount > 0 && notifications.length > 0 && (
                        <span className="text-slate-300 dark:text-slate-700 text-xs">|</span>
                      )}
                      {notifications.length > 0 && (
                        <span
                          onClick={handleClearAllNotifications}
                          className="text-xs text-rose-600 dark:text-rose-400 font-medium cursor-pointer hover:underline"
                        >
                          Clear all
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Danh sách thông báo */}
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
                        <Bell className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-xs">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkAsRead(notif._id, notif.link_url)}
                          className={cn(
                            "group px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3 items-start relative",
                            !notif.is_read && "bg-indigo-50/60 dark:bg-indigo-900/20"
                          )}
                        >
                          <div className="mt-1.5 flex-shrink-0">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              !notif.is_read && "bg-indigo-50/60 dark:bg-indigo-900/20"
                            )} />
                          </div>

                          {/* Thêm pr-6 để nội dung text không đè lấn lên nút xóa góc phải */}
                          <div className="flex-1 min-w-0 pr-6">
                            <p className={cn(
                              "text-sm text-slate-900 dark:text-slate-100 leading-snug",
                              !notif.is_read ? "font-semibold" : "font-normal"
                            )}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              {notif.created_at
                                ? new Date(notif.created_at).toLocaleString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                })
                                : ""}
                            </p>
                          </div>

                          {/* 5. Nút xóa từng item ẩn mặc định (opacity-0) và hiện lên khi hover dòng thông báo (group-hover:opacity-100) */}
                          <button
                            onClick={(e) => handleDeleteNotification(e, notif._id)}
                            className="absolute right-3 top-3 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all duration-150"
                            title="Xóa thông báo này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
                  {user ? getInitials(user.username) : "..."}
                </div>
              )}

              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-white leading-none">
                  {user ? user.username : "Đang tải..."}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  {user ? user.email : "..."}
                </p>
              </div>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  )
}