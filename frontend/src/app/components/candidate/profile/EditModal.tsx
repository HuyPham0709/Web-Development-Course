import React from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface EditModalProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}

export function EditModal({ title, onClose, onSave, saving, children }: EditModalProps) {
  return (
    // Sửa z-40 thành z-[100], thêm dark:bg-black/80
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 transition-colors duration-300">
      
      {/* Container chính của Modal: Sửa dark:bg-gray-900 thành dark:bg-[#0E1422] */}
      <div className="bg-white dark:bg-[#0E1422] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-transparent dark:border-white/10 transition-colors duration-300">
        
        {/* Header của Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#0E1422] z-10 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-white rounded-xl transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung bên trong (Children) */}
        <div className="p-6 space-y-4 text-gray-700 dark:text-gray-300 overflow-y-auto">
          {children}
        </div>

        {/* Footer chứa các nút bấm: Thêm dark:bg-white/5 để phân cách vùng Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 transition-colors duration-300">
          {/* Nút Hủy */}
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300"
          >
            Hủy
          </button>

          {/* Nút Lưu */}
          <button 
            onClick={onSave} 
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 dark:bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-500 disabled:opacity-60 transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        </div>

      </div>
    </div>
  );
}