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
  Moon
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

  // Lấy danh sách Notifications từ API
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setNotifications(response.data.data);
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

        if (response.ok && data) {
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
          console.error("Server trả về lỗi status:", response.status, data.message);
          localStorage.removeItem("admin_token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Lỗi kết nối API profile:", error);
      }
    };

    fetchProfile();
  }, [navigate, fetchNotifications]);

  // Thiết lập Socket để nhận thông báo real-time
  useEffect(() => {
    if (user?.id) {
      const socket = io(BASE_URL);
      socketRef.current = socket;

      socket.emit("add_user", user.id);

      socket.on("receive_notification", (newNotify: NotificationItem) => {
        setNotifications((prev) => [newNotify, ...prev]);
      });

      return () => {
        socket.off("receive_notification");
        socket.disconnect();
      };
    }
  }, [user?.id]);

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
      try {
        await axios.put(
          `${BASE_URL}/api/notifications/${id}/read`,
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
        `${BASE_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
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

  const hasUnread = notifications.some((n) => !n.is_read);

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
            
            {/* ---------------- Dark Mode Toggle ---------------- */}
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

            {/* ---------------- Notifications Dropdown ---------------- */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                    <span onClick={handleMarkAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline">
                      Mark all read
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-1 bg-white dark:bg-slate-900">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No notifications.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkAsRead(notif._id, notif.link_url)}
                          className={`p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex gap-3 items-start ${
                            !notif.is_read ? "bg-indigo-50/50 dark:bg-indigo-900/20" : ""
                          }`}
                        >
                          {!notif.is_read && <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-500"></div>}
                          <div className="flex-1">
                            <p className={`text-sm text-slate-900 dark:text-slate-100 ${notif.is_read ? "font-normal" : "font-semibold"}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              {notif.created_at
                                ? new Date(notif.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* ---------------- End Notifications Dropdown ---------------- */}

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