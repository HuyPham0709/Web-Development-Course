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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Container chính của Modal */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-transparent dark:border-gray-800 transition-colors duration-200">
        
        {/* Header của Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 rounded-t-2xl z-10 transition-colors duration-200">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Nội dung bên trong (Children) */}
        <div className="p-6 space-y-4 text-gray-700 dark:text-gray-300">
          {children}
        </div>

        {/* Footer chứa các nút bấm */}
        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 rounded-b-2xl transition-colors duration-200">
          {/* Nút Hủy */}
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Hủy
          </button>

          {/* Nút Lưu */}
          <button 
            onClick={onSave} 
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        </div>

      </div>
    </div>
  );
}