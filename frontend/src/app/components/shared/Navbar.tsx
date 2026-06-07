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
  CheckCircle2,
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

import * as chatService from "../../../services/chatService";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://web-development-course-y23i.onrender.com";

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
  link_url: string | null;
}

export const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "",
    avatarUrl: "",
    role: "",
    id: "",
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);

  // ======================================================================
  // Handlers & Actions
  // ======================================================================
  const handleLogout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser({ name: "", avatarUrl: "", role: "", id: "" });
    setNotifications([]);
    setChatUnreadCount(0);
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { name: "Home", path: "/" },
        { name: "Jobs", path: "/jobs" },
      ];
    }

    const userRole = user.role?.toLowerCase();

    if (userRole === "employer") {
      return [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/employer/dashboard" },
        { name: "CV Search", path: "/employer/cv-search" },
      ];
    }

    if (userRole === "candidate") {
      return [
        { name: "Home", path: "/" },
        { name: "Jobs", path: "/jobs" },
        { name: "My Applications", path: "/applications" },
      ];
    }

    if (userRole === "admin") {
      return [{ name: "Dashboard", path: "/admin" }];
    }

    return [
      { name: "Home", path: "/" },
      { name: "Jobs", path: "/jobs" },
    ];
  };

  const navLinks = getNavLinks();

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const systemNotifs = response.data.data.filter(
          (n: any) => n.link_url !== "/chat",
        );
        const mappedNotifs = systemNotifs.map((n: any) => ({
          ...n,
          id: n.id || n._id,
        }));
        setNotifications(mappedNotifs);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  const checkUnreadChat = useCallback(async () => {
    if (!isLoggedIn || !user.id) return;

    if (window.location.pathname === "/chat") {
      setChatUnreadCount(0);
      return;
    }

    try {
      const response = await chatService.getconversations();
      const dataList = Array.isArray(response)
        ? response
        : response?.data || [];

      if (dataList && dataList.length > 0) {
        const total = dataList.reduce((sum: number, conv: any) => {
          return sum + Number(conv.unreadCount ?? conv.unread_count ?? 0);
        }, 0);
        setChatUnreadCount(total);
      } else {
        setChatUnreadCount(0);
      }
    } catch (error) {
      console.error("Error checking unread messages:", error);
    }
  }, [isLoggedIn, user.id]);

  const handleChatTrigger = useCallback(() => {
    checkUnreadChat();
  }, [checkUnreadChat]);

  // Listen for Chat update events triggered globally
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleChatCountUpdate = (e: any) => {
      if (e.detail && typeof e.detail.count === "number") {
        setChatUnreadCount(e.detail.count);
      } else {
        checkUnreadChat();
      }
    };

    window.addEventListener("update-chat-count", handleChatCountUpdate);
    window.addEventListener("incoming-chat-msg", handleChatTrigger);

    return () => {
      window.removeEventListener("update-chat-count", handleChatCountUpdate);
      window.removeEventListener("incoming-chat-msg", handleChatTrigger);
    };
  }, [isLoggedIn, checkUnreadChat, handleChatTrigger]);

  // Real-time backend socket listener management
  useEffect(() => {
    if (isLoggedIn && user.id) {
      const socket = io(BASE_URL);
      socketRef.current = socket;

      socket.emit("add_user", user.id);

      // Hàm xử lý chung để ngăn nhân đôi thông báo (Trùng ID sẽ bị loại bỏ)
      const handleNewNotification = (newNotify: any) => {
        if (newNotify.link_url !== "/chat") {
          const formattedNotify: NotificationItem = {
            ...newNotify,
            id: newNotify.id || newNotify._id,
          };
          setNotifications((prev) => {
            // Kiểm tra trùng ID
            if (prev.some((n) => n.id === formattedNotify.id)) {
              return prev;
            }
            return [formattedNotify, ...prev];
          });
        }
      };

      socket.on("receive_notification", handleNewNotification);
      socket.on("new_notification", handleNewNotification);

      socket.on("receive_message", () => checkUnreadChat());

      socket.on("update_unread_total", (data: any) => {
        checkUnreadChat();
        if (window.location.pathname !== "/chat") {
          setChatUnreadCount((prevCount) => prevCount + 1);
        }
      });

      return () => {
        socket.off("receive_notification");
        socket.off("new_notification");
        socket.off("update_unread_total");
        socket.off("receive_message");
        socket.disconnect();
      };
    }
  }, [isLoggedIn, user.id, checkUnreadChat]);

  // Fetch khi thay đổi trạng thái (Gỡ showNotifications ra để nạp ngầm tức thời)
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn, fetchNotifications]);

  useEffect(() => {
    if (!isLoggedIn) return;
    checkUnreadChat();
  }, [location.pathname, isLoggedIn, checkUnreadChat]);

  const handleMarkAsRead = async (
    id: number | string,
    linkUrl: string | null,
  ) => {
    if (isProcessing) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const currentNotif = notifications.find((item) => item.id === id);
    setShowNotifications(false);

    if (currentNotif && !currentNotif.is_read) {
      setIsProcessing(true);
      // UI Update tức thì (Lạc quan)
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
      try {
        await axios.put(
          `${BASE_URL}/api/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (error) {
        console.error("Error updating read status:", error);
      } finally {
        setIsProcessing(false);
      }
    }

    if (linkUrl) {
      navigate(linkUrl);
    } else if (user.role?.toLowerCase() === "employer") {
      navigate("/employer/candidates");
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
      await axios.put(
        `${BASE_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
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
            id: parsedUser.id || parsedUser._id || "",
            name:
              parsedUser.full_name ||
              parsedUser.name ||
              parsedUser.username ||
              "",
            avatarUrl: toFullUrl(parsedUser.avatar_url),
            role: parsedUser.role || "",
          });
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      } else {
        setIsLoggedIn(false);
        setNotifications([]);
        setChatUnreadCount(0);
        setUser({ name: "", avatarUrl: "", role: "", id: "" });
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

  const isEmployer = user.role?.toLowerCase() === "employer";

  // TÍNH TOÁN SỐ LƯỢNG THÔNG BÁO CHƯA ĐỌC LÀM HUY HIỆU (BADGE)
  const unreadCount = notifications.filter(
    (n) => n.is_read === false || n.is_read === 0 || (n.is_read as any) === "0",
  ).length;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80 border-gray-100 dark:border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* LOGO */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 transition-transform active:scale-95"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
                JobPortal
              </span>
            </Link>

            {/* DESKTOP NAVIGATION LINKS */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
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
              className="relative flex items-center justify-center p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all active:scale-95"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {isLoggedIn ? (
              <>
                {/* Chat Message Icon */}
                <Link
                  to="/chat"
                  className={`relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all active:scale-95 ${
                    location.pathname === "/chat"
                      ? "text-blue-600 bg-blue-50/50 dark:text-blue-400"
                      : ""
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  {chatUnreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950 animate-pulse">
                      {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                    </span>
                  )}
                </Link>

                {/* NOTIFICATIONS BELL DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-all active:scale-95 ${
                      showNotifications
                        ? "bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white"
                        : ""
                    }`}
                  >
                    <Bell className="h-5 w-5" />
                    {/* HUY HIỆU SỐ LƯỢNG CHƯA ĐỌC */}
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950 animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[28rem] overflow-hidden rounded-2xl border bg-white shadow-2xl dark:bg-gray-900 border-gray-100 dark:border-white/5 flex flex-col">
                      {/* Header Dropdown */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-white/5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Body Dropdown */}
                      <div className="overflow-y-auto p-2">
                        {notifications.length === 0 ? (
                          <div className="py-10 flex flex-col items-center justify-center text-gray-400">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm font-medium">
                              No notifications yet
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {notifications.map((item) => (
                              <button
                                key={item.id}
                                onClick={() =>
                                  handleMarkAsRead(item.id, item.link_url)
                                }
                                className={`w-full flex flex-col gap-1 rounded-xl p-3 text-left transition-colors ${
                                  !item.is_read
                                    ? "bg-blue-50/50 dark:bg-blue-950/30"
                                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2 w-full">
                                  <span
                                    className={`text-sm ${!item.is_read ? "font-bold text-gray-900 dark:text-white" : "font-semibold text-gray-700 dark:text-gray-200"}`}
                                  >
                                    {item.title || "New Notification"}
                                  </span>
                                  {!item.is_read && (
                                    <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                                  )}
                                </div>
                                <span
                                  className={`text-xs line-clamp-2 ${!item.is_read ? "text-gray-600 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"}`}
                                >
                                  {item.message}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium mt-1">
                                  {new Date(item.created_at).toLocaleString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* USER PROFILE DROPDOWN */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95 text-left">
                      <Avatar className="h-8 w-8 ring-1 ring-gray-100 dark:ring-white/10">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-medium text-xs">
                          {user.name?.substring(0, 2).toUpperCase() || "US"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block max-w-[100px]">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate capitalize">
                          {user.role}
                        </p>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-2xl p-1.5 shadow-xl"
                  >
                    <div className="px-2.5 py-2 sm:hidden border-b border-gray-50 dark:border-white/5 mb-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl px-3 py-2 text-sm focus:bg-gray-50 dark:focus:bg-white/5 cursor-pointer"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 w-full"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="rounded-xl px-3 py-2 text-sm focus:bg-gray-50 dark:focus:bg-white/5 cursor-pointer"
                    >
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 w-full"
                      >
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
            ) : (
              <div className="hidden md:flex items-center gap-2 pl-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/10 active:scale-95"
                >
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
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-1.5 shadow-inner dark:bg-gray-950 border-gray-100 dark:border-white/5">
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
};
