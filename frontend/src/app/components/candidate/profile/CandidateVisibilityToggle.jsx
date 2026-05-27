// components/candidate/CandidateVisibilityToggle.tsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getVisibilityStatus, updateVisibility } from '../../services/candidateService';

export const CandidateVisibilityToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getVisibilityStatus()
      .then(setIsOpen)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      const newValue = !isOpen;
      await updateVisibility(newValue);
      setIsOpen(newValue);
    } catch (error) {
      console.error('Failed to update visibility:', error);
      alert('Cập nhật thất bại, vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="animate-pulse h-20 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>;

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {isOpen ? (
            <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <EyeOff className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          )}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-md">
              Cho phép Nhà tuyển dụng tìm bạn
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isOpen 
                ? 'Hồ sơ của bạn đang hiển thị với nhà tuyển dụng. Họ có thể tìm thấy bạn qua bộ lọc.'
                : 'Hồ sơ của bạn đang ẩn. Nhà tuyển dụng sẽ không nhìn thấy bạn.'}
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={updating}
          className={`
            relative inline-flex h-7 w-12 items-center rounded-full transition-colors
            ${isOpen ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
            ${updating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform
            ${isOpen ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
    </div>
  );
};