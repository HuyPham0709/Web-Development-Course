import React from 'react';
import { Check } from 'lucide-react';

const CV_TEMPLATES = [
  { id: '1', name: 'Đào Phú Quý', tags: ['Đơn giản', 'Chuyên nghiệp'], isNew: true, image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=280&fit=crop' },
  { id: '2', name: 'Đào Phú Quốc', tags: ['Đơn giản', 'Chuyên nghiệp'], isNew: false, image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=280&fit=crop' },
  { id: '3', name: 'Đào Nam Du', tags: ['Đơn giản', 'Chuyên nghiệp'], isNew: true, image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=280&fit=crop' },
  { id: '4', name: 'Đào Bình Ba', tags: ['Đơn giản', 'Sáng tạo'], isNew: false, image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=200&h=280&fit=crop' },
  { id: '5', name: 'Đào Phú Quý (S)', tags: ['Đơn giản', 'Sáng tạo'], isNew: true, image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=280&fit=crop' },
  { id: '6', name: 'Nguyễn Trúc Quỳnh', tags: ['Hiện đại', 'Sáng tạo'], isNew: true, image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=200&h=280&fit=crop' },
  { id: '7', name: 'Nguyễn Trúc Quỳnh (P)', tags: ['Chuyên nghiệp', 'Hiện đại'], isNew: false, image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=200&h=280&fit=crop' },
  { id: '8', name: 'Nguyễn Trúc Quỳnh (M)', tags: ['Sáng tạo', 'Đơn giản'], isNew: false, image: 'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=200&h=280&fit=crop' },
];

const TEMPLATE_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Đơn giản', label: 'Đơn giản' },
  { id: 'Hiện đại', label: 'Hiện đại' },
  { id: 'Sáng tạo', label: 'Sáng tạo' },
  { id: 'Chuyên nghiệp', label: 'Chuyên nghiệp' }
];

interface CvLibraryTabProps {
  templateFilter: string;
  setTemplateFilter: (id: string) => void;
  setShowFullCVBuilder: (show: boolean) => void;
}

export function CvLibraryTab({ templateFilter, setTemplateFilter, setShowFullCVBuilder }: CvLibraryTabProps) {
  const getTagColor = (tag: string) => {
    if (tag === 'Đơn giản') return 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400';
    if (tag === 'Chuyên nghiệp') return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400';
    if (tag === 'Sáng tạo') return 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400';
    if (tag === 'Hiện đại') return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400';
    return 'text-gray-500 bg-gray-50 dark:bg-white/5 dark:text-gray-400';
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Danh sách các mẫu CV được Top nhà tuyển dụng ưa thích
      </h2>

      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Lọc theo chủ đề:</span>
        <div className="flex gap-2">
          {TEMPLATE_FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => setTemplateFilter(filter.id)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all border flex items-center gap-1.5 ${
                templateFilter === filter.id
                  ? 'bg-gray-800 text-white border-gray-800 shadow-sm dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:border-white/20'
              }`}
            >
              {templateFilter === filter.id && <Check className="w-3 h-3" />}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {CV_TEMPLATES.filter(t => templateFilter === 'all' || t.tags.includes(templateFilter)).map(t => (
          <div key={t.id} className="group flex flex-col">
            <div className="relative aspect-[1/1.4] rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-purple-200 dark:group-hover:border-purple-500/30 bg-white dark:bg-white/5">
              <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
              {t.isNew && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                  NEW
                </div>
              )}
              <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <button
                  onClick={() => setShowFullCVBuilder(true)}
                  className="bg-[#6b46c1] text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#553c9a] dark:bg-purple-600 dark:hover:bg-purple-500"
                >
                  Dùng mẫu này
                </button>
              </div>
            </div>
            <div className="mt-4 px-1">
              <h3 className="text-[14px] font-bold text-gray-800 dark:text-white mb-2 truncate group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                {t.name}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {t.tags.map(tag => (
                  <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTagColor(tag)}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}