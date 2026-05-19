import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Bell, CheckCircle2, Eye, Calendar, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

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

  // State quản lý đăng nhập thực tế
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
            // Ưu tiên full_name (từ Profile), nếu không có mới lùi về display_name hoặc username
            name: parsedUser.full_name || parsedUser.display_name || parsedUser.username || 'Người dùng',
            // Load luôn avatar nếu có
            avatarUrl: parsedUser.avatar_url || 'https://github.com/shadcn.png',
            role: parsedUser.role === 'candidate' ? 'Ứng viên' : 'Nhà tuyển dụng'
          });
        } catch (e) {
          console.error("Lỗi đọc thông tin user:", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

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

    // Cleanup listener khi unmount
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  // Đóng thông báo khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                  </div>
                </div>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;