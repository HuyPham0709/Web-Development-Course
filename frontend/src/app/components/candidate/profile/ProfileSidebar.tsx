import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';

import { SIDEBAR_MENU } from './constants';

import {
  getVisibilityStatus,
  updateVisibility,
} from '../../../../services/candidateVisibilityService';

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  userName?: string;
}

export function ProfileSidebar({
  activeTab,
  setActiveTab,
  userName,
}: ProfileSidebarProps) {

  // Default expanded section
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'group-profile',
  ]);

  const [allowSearch, setAllowSearch] = useState(false);
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
      alert('Update failed. Please try again.');
    }
  };

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id)
        ? prev.filter(menuId => menuId !== id)
        : [...prev, id]
    );
  };

  return (
    <aside className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl flex flex-col sticky top-4 md:top-8 transition-all duration-300">

      <div className="p-5 overflow-y-auto custom-scrollbar h-full">

        {/* ── Sidebar Header ── */}
        <div className="mb-6">

          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
            {userName || 'Unnamed User'}
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center justify-between border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-500/20">

            <div className="flex items-center gap-3">

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  allowSearch
                    ? 'bg-green-100 dark:bg-green-500/10'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {allowSearch ? (
                  <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
              </div>

              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-bold leading-tight">
                  Recruiter Visibility
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Get discovered by recruiters.
                </p>
              </div>
            </div>

            <button
  type="button" // Luôn thêm type="button" để tránh tự động submit form
  onClick={toggleVisibility}
  disabled={loading}
  aria-pressed={allowSearch}
  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
    allowSearch
      ? 'bg-gradient-to-r from-blue-600 to-purple-600'
      : 'bg-gray-300 dark:bg-gray-600'
  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  {/* Screen reader label */}
  <span className="sr-only">Toggle recruiter visibility</span>
  
  <span
    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${
      allowSearch ? 'translate-x-6' : 'translate-x-1'
    }`}
  />
</button>
          </div>
        </div>

        {/* ── Menu Navigation ── */}
        <nav className="space-y-1.5">

          {SIDEBAR_MENU.map((item) => {

            const isExpanded = expandedMenus.includes(item.id);

            const hasSubItems =
              item.subItems && item.subItems.length > 0;

            // Menu with sub items
            if (hasSubItems) {
              return (
                <div key={item.id} className="mb-2">

                  <button
                    onClick={() => toggleMenu(item.id)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">

                      {item.icon && (
                        <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
                      )}

                      {item.label}
                    </div>

                    <div className="transition-transform duration-300">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* Sub Menu */}
                  {isExpanded && (
                    <div className="mt-1 ml-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4 space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">

                      {item.subItems!.map((sub) => (

                        <button
                          key={sub.id}
                          onClick={() => setActiveTab(sub.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                            activeTab === sub.id
                              ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/30 shadow-sm'
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

            // Single Menu Item
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/30 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 hover:translate-x-1'
                }`}
              >

                {item.icon && (
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      activeTab === item.id
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  />
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