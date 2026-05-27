// src/app/components/candidate/profile/Settings.tsx
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Eye, Briefcase, MapPin } from 'lucide-react';

interface RecommendedJob {
  id: number;
  title: string;
  company_name: string;
  location_name: string;
  match_score: number;
  // thêm các trường khác nếu cần
}

interface SettingsProps {
  topJob?: RecommendedJob; // job có điểm phù hợp cao nhất
}

export default function Settings({ topJob }: SettingsProps) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Dữ liệu hiển thị preview: ưu tiên topJob nếu có, nếu không thì dùng mock
  const previewJob = topJob || {
    title: 'Senior Frontend Engineer',
    company_name: 'TechCorp Inc.',
    location_name: 'Ho Chi Minh City',
    match_score: 95,
  };

  return (
    <div className="space-y-8">
      {/* Appearance Section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Adjust the appearance to reduce glare and relax your eyes.
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            style={{ backgroundColor: darkMode ? '#7c3aed' : '#9ca3af' }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {darkMode ? <Moon size={16} /> : <Sun size={16} />}
          <span>{darkMode ? 'Dark mode active' : 'Light mode active'}</span>
        </div>
      </div>

      {/* UI Preview Section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">UI Preview</h2>
        <div className="rounded-xl border border-gray-200 dark:border-white/10 p-5 bg-gray-50 dark:bg-black/20">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
              {previewJob.company_name?.charAt(0) || 'TC'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">{previewJob.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{previewJob.company_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {previewJob.match_score}% Match
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} /> {previewJob.location_name || 'Remote'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                We're looking for an experienced developer to join our core team and build the future of our product.
              </p>
              <button className="mt-3 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition">
                Apply Now
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">* This is a preview of how job cards will appear</p>
      </div>
    </div>
  );
}