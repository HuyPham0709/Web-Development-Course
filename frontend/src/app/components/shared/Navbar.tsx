import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Bell, CheckCircle2, LogOut, Settings, ChevronDown, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

// Import các component từ thư mục UI của shadcn
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // Logic quản lý đăng nhập từ dự án cũ (Giữ nguyên 100%)
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [user, setUser] = useState({ 
    name: '', 
    avatarUrl: 'https://github.com/shadcn.png',
    role: '' 
  });

  useEffect(() => {
    // 1. Hàm load data từ LocalStorage
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');
      
      if (token && savedUserStr) {
        setIsLoggedIn(true);
        try {
          const parsedUser = JSON.parse(savedUserStr);
          setUser({
            name: parsedUser.full_name || parsedUser.display_name || parsedUser.username || 'Người dùng',
            avatarUrl: parsedUser.avatar_url || 'https://github.com/shadcn.png',
            role: parsedUser.role || 'candidate'
          });
        } catch (e) {
          console.error("Lỗi parse user từ localStorage:", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // 2. Chạy ngay khi component mount
    loadUserData();

    // 3. Lắng nghe sự kiện custom để cập nhật Navbar ngay lập tức khi đăng nhập thành công
    const handleAuthChange = () => {
      loadUserData();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', loadUserData); // Backup khi đổi tab

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', loadUserData);
    };
  }, []);

  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    
    // Bắn sự kiện thông báo các component khác
    window.dispatchEvent(new Event('auth-change'));
    
    // Điều hướng về trang chủ công cộng
    navigate('/');
  };

  // Mock notifications data công cộng
  const notifications = [
    { id: 1, title: 'Application Viewed', desc: 'NextGen Tech viewed your Senior AI Engineer application.', time: '2 hours ago', unread: true },
    { id: 2, title: 'New Match Found', desc: 'A new Full-Time Remote job matches your React.js skill.', time: '5 hours ago', unread: true },
    { id: 3, title: 'Interview Scheduled', desc: 'Alpha Commerce invited you for an interview.', time: '1 day ago', unread: false },
  ];

  // Xử lý click ngoài để ẩn thông báo công cộng
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-[#0B0F19]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/20">
            <Briefcase size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            CoreCareer <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-4">
          
          {/* NÚT CHUYỂN ĐỔI LIGHT / DARK MODE CÓ HIỆU ỨNG MƯỢT MÀ */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors dark:text-gray-400 dark:hover:bg-white/10 overflow-hidden"
            aria-label="Toggle theme"
          >
            {/* Icon Mặt Trời (Xoay và phóng to khi ở dark mode, thu nhỏ biến mất khi ở light mode) */}
            <Sun 
              size={20} 
              className={`absolute text-amber-400 transition-all duration-500 ease-in-out ${
                theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
              }`} 
            />
            {/* Icon Mặt Trăng (Xoay và phóng to khi ở light mode, thu nhỏ biến mất khi ở dark mode) */}
            <Moon 
              size={20} 
              className={`absolute transition-all duration-500 ease-in-out ${
                theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`} 
            />
          </button>

          {/* NOTIFICATIONS DROPDOWN */}
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

          {/* USER AUTHENTICATION ACTIONS */}
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
                  </div>
                  <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                </div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0B0F19]">
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-0.5">{user.name}</p>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5" />
                
                <DropdownMenuItem className="p-1 cursor-pointer focus:bg-transparent">
                  <Link 
                    to={user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'} 
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-colors">
                      <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="font-medium text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleLogout} className="p-1 cursor-pointer focus:bg-transparent mt-1">
                  <div className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 dark:group-hover:bg-red-500/20 transition-colors">
                      <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                    </div>
                    <span className="font-medium text-[15px] text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">Log Out</span>
                  </div>
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white">
              Sign In
            </Link>
          )}

          {/* NÚT POST A JOB CHUẨN FIGMA */}
          <Link to="/employer/dashboard" className="hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-all hover:opacity-90 md:block">
            Post a Job
          </Link>
          
        </div>
      </div>
    </nav>
  );
};