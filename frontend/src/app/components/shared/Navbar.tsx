import React, { useState, useRef, useEffect } from 'react';
<<<<<<< HEAD
import { Briefcase, Bell, CheckCircle2, Eye, Calendar, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
=======
import { Briefcase, Bell, CheckCircle2, LogOut, Settings, ChevronDown, Moon, Sun, Menu, X, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const BASE_URL = 'http://localhost:5000';

const toFullUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

export const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
<<<<<<< HEAD

  // State quản lý đăng nhập thực tế
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [user, setUser] = useState({ 
    name: '', 
    avatarUrl: 'https://github.com/shadcn.png',
    role: '' 
  });

 useEffect(() => {
    // 1. Hàm load data từ LocalStorage
=======
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // BỔ SUNG: Khởi tạo đầy đủ các field cần thiết cho user state
  const [user, setUser] = useState({
    name: '',
    avatarUrl: '',
    role: ''
  });

  // BỔ SUNG: Logic lấy NavLinks tùy theo role
  const getNavLinks = () => {
    const baseLinks = [{ name: "Home", path: "/" }];

    if (!isLoggedIn) return baseLinks;

    const userRole = user.role?.toLowerCase();

    if (userRole === 'employer') {
      return [
        ...baseLinks,
        { name: "Dashboard", path: "/employer/dashboard" },
        { name: "CV Sreach", path: "/employer/cv-search" },
      ];
    }

    if (userRole === 'candidate') {
      return [
        ...baseLinks,
        { name: "My Applications", path: "/applications" },
        { name: "Settings", path: "/settings" },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  const notifications = [
    { id: 1, title: 'Application Viewed', desc: 'NextGen Tech viewed your Senior AI Engineer application.', time: '2 hours ago', unread: true },
    { id: 2, title: 'New Match Found', desc: 'A new Full-Time Remote job matches your React.js skill.', time: '5 hours ago', unread: true },
    { id: 3, title: 'Interview Scheduled', desc: 'Alpha Commerce invited you for an interview.', time: '1 day ago', unread: false },
  ];

  useEffect(() => {
>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');

      if (token && savedUserStr) {
        setIsLoggedIn(true);
        try {
          const parsedUser = JSON.parse(savedUserStr);
          // BỔ SUNG: Lấy thêm role và name từ localStorage
          setUser({
<<<<<<< HEAD
            // Ưu tiên full_name (từ Profile), nếu không có mới lùi về display_name hoặc username
            name: parsedUser.full_name || parsedUser.display_name || parsedUser.username || 'Người dùng',
            // Load luôn avatar nếu có
            avatarUrl: parsedUser.avatar_url || 'https://github.com/shadcn.png',
            role: parsedUser.role === 'candidate' ? 'Ứng viên' : 'Nhà tuyển dụng'
=======
            name: parsedUser.full_name || parsedUser.name || '',
            avatarUrl: toFullUrl(parsedUser.avatar_url),
            role: parsedUser.role || ''
>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81
          });
        } catch (e) {
          console.error("Lỗi đọc thông tin user:", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

<<<<<<< HEAD
    // Chạy lần đầu khi load trang
    loadUserData();

    // 2. Lắng nghe sự kiện cập nhật Profile từ mọi nơi trong App (Kiểu Facebook)
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { full_name, avatar_url } = customEvent.detail;

      setUser(prev => ({
        ...prev,
        // Cập nhật ngay lập tức UI trên Navbar
        name: full_name || prev.name,
        avatarUrl: avatar_url || prev.avatarUrl
      }));
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);
=======
    loadUserData();

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { full_name, avatar_url, role } = customEvent.detail;
      setUser(prev => ({
        ...prev,
        name: full_name || prev.name,
        avatarUrl: avatar_url ? toFullUrl(avatar_url) : prev.avatarUrl,
        role: role || prev.role
      }));
    };

    const handleAuthChange = () => loadUserData();

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', loadUserData);
>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81

    // Cleanup listener khi unmount
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
<<<<<<< HEAD
    };
  }, []);

  // Đóng thông báo khi click ra ngoài
=======
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', loadUserData);
    };
  }, []);

>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

<<<<<<< HEAD
  // XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    // Xóa token và user khỏi trình duyệt
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/auth'); 
  };

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight">JobSpot</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Find Jobs</Link>
            <Link to="/applications" className="text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Applications</Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/employer/dashboard" className="hidden md:inline-flex text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-5 py-2.5 rounded-full font-semibold transition-colors">
              Post a Job
            </Link>
            
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
              </button>

              {/* Dropdown Notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 origin-top-right">
                  <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                    <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">Mark all read</button>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-slate-700/50 max-h-96 overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New job match found</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">A Senior Frontend Engineer role matches your profile.</p>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1.5">2 hours ago</p>
                      </div>
                    </div>
=======
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser({ name: '', avatarUrl: '', role: '' }); // Clear state
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const isEmployer = user.role?.toLowerCase() === 'employer';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#0B0F19]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* LEFT: LOGO + NAV LINKS */}
        <div className="flex items-center gap-10">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
              <Briefcase size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Job<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Spot</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
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

          {/* LIGHT / DARK TOGGLE */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-white/10 overflow-hidden"
            aria-label="Toggle theme"
          >
            <Sun
              size={20}
              className={`absolute text-amber-400 transition-all duration-500 ease-in-out ${
                theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
              }`}
            />
            <Moon
              size={20}
              className={`absolute transition-all duration-500 ease-in-out ${
                theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`}
            />
          </button>

          {/* NOTIFICATIONS */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-white/10"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#0B0F19]">
                <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto pt-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors flex gap-3 items-start ${notif.unread ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''}`}
                    >
                      <div className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-blue-600"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.desc}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
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
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start text-left md:flex">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none max-w-[100px] truncate">{user.name}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 capitalize">{user.role}</span>
>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81
                  </div>
                </div>
<<<<<<< HEAD
              )}
            </div>

            {/* VÙNG AVATAR & DROPDOWN (KIỂU FACEBOOK) */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* Container có relative để đặt icon mũi tên góc dưới */}
                  <button className="relative flex items-center focus:outline-none group">
                    <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-slate-700 transition-all">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Icon mũi tên (ChevronDown) bo tròn giống FB */}
                    <div className="absolute -bottom-1 -right-1 bg-gray-100 dark:bg-slate-700 rounded-full p-0.5 border-2 border-white dark:border-slate-900 shadow-sm group-hover:bg-gray-200 dark:group-hover:bg-slate-600 transition-colors">
                      <ChevronDown className="w-3 h-3 text-gray-700 dark:text-gray-300 stroke-[3px]" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                
                {/* Khung Dropdown được thiết kế lại to và đẹp hơn */}
                <DropdownMenuContent align="end" className="w-80 p-3 mt-2 rounded-xl shadow-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                  
                  {/* Khu vực Profile Header */}
                  <div className="p-1 mb-2">
                    <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-gray-50 dark:border-slate-700/50">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-gray-900 dark:text-white leading-tight">{user.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.role}</span>
                      </div>
                    </Link>
                  </div>

                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-700 my-1 mx-2" />
                  
                  {/* Cài đặt */}
                  <DropdownMenuItem asChild className="p-1 cursor-pointer focus:bg-transparent">
                    <Link to="/settings" className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <span className="font-medium text-[15px] text-gray-900 dark:text-white">Settings & Privacy</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Đăng xuất */}
                  <DropdownMenuItem onClick={handleLogout} className="p-1 cursor-pointer focus:bg-transparent mt-1">
                    <div className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                        <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400" />
                      </div>
                      <span className="font-medium text-[15px] text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">Log Out</span>
                    </div>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="hidden sm:block text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors">
                Sign In
              </Link>
            )}
            
          </div>
=======
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0B0F19]">
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-0.5">{user.name}</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5" />

                {/* Giữ Link Profile dành cho candidate hoặc dùng chung tùy nhu cầu */}
                {(!isEmployer) && (
                  <DropdownMenuItem className="p-1 cursor-pointer focus:bg-transparent">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-green-500/10 dark:group-hover:bg-green-500/20 transition-colors">
                        <User className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                      </div>
                      <span className="font-medium text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Hồ sơ cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="p-1 cursor-pointer focus:bg-transparent">
                  <Link
                    to={isEmployer ? '/employer/dashboard' : '/settings'}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-colors">
                      <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="font-medium text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {isEmployer ? 'Dashboard' : 'Cài đặt'}
                    </span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleLogout} className="p-1 cursor-pointer focus:bg-transparent mt-1">
                  <div className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 dark:group-hover:bg-red-500/20 transition-colors">
                      <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    </div>
                    <span className="font-medium text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">Đăng xuất</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white px-2">
              Sign In
            </Link>
          )}

          {/* BỔ SUNG: POST A JOB - Chỉ hiển thị cho Employer */}
          {isLoggedIn && isEmployer && (
            <Link to="/employer/jobs/new" className="hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 md:block">
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
>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81
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
          
          {/* BỔ SUNG: POST A JOB TRÊN MOBILE - Chỉ hiển thị cho Employer */}
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

export default Navbar;