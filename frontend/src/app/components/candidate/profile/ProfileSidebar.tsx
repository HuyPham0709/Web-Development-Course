import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { SIDEBAR_MENU } from './constants';
import { getVisibilityStatus, updateVisibility } from '../../../../services/candidateVisibilityService';

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  userName?: string;
}

export function ProfileSidebar({ activeTab, setActiveTab, userName }: ProfileSidebarProps) {
  // Mặc định mở tab Hồ sơ
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['group-profile']);
  const [allowSearch, setAllowSearch] = useState(false); // CHỈ MỘT DÒNG NÀY
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisibilityStatus()
      .then(setAllowSearch)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleVisibility = async () => {
    if (loading) return;
    const newValue = !allowSearch;
    setAllowSearch(newValue);
    try {
      await updateVisibility(newValue);
    } catch (error) {
      setAllowSearch(!newValue);
      alert('Cập nhật thất bại, vui lòng thử lại.');
    }
  };

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(menuId => menuId !== id) : [...prev, id]
    );
  };

  return (
    <aside className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] sticky top-4 md:top-8 z-10 transition-colors duration-200">
      <div className="p-5 overflow-y-auto custom-scrollbar h-full">

        {/* ── Header Sidebar ── */}
        <div className="mb-6">
  <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
    {userName || 'Chưa cập nhật tên'}
  </h2>

  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
    <div className="flex items-center gap-2">
      {allowSearch ? (
        <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
      ) : (
        <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      )}
      <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold leading-tight">
        Cho phép Nhà tuyển dụng tìm bạn
      </span>
    </div>
    <button
      onClick={toggleVisibility}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        allowSearch ? 'bg-blue-600' : 'bg-gray-400 dark:bg-gray-600'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          allowSearch ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
</div>

        {/* ── Menu Navigation ── */}
        <nav className="space-y-1">
          {SIDEBAR_MENU.map((item) => {
            const isExpanded = expandedMenus.includes(item.id);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            // Nếu mục đó có menu con
            if (hasSubItems) {
              return (
                <div key={item.id} className="mb-2">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                      {item.label}
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                  </button>

                  {/* Render Menu Con */}
                  {isExpanded && (
                    <div className="mt-1 ml-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4 space-y-1">
                      {item.subItems!.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveTab(sub.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                            activeTab === sub.id
                              ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/30'
                              : 'text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Nếu mục đó là mục đơn (VD: Trang trí CV, Quản lý tài khoản)
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeTab === item.id
                    ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/30'
                    : 'text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                {item.icon && (
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}