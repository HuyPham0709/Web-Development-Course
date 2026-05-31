import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import axios from 'axios';
import {
  Eye,
  Search,
  ArrowUpRight,
  Clock,
  FilterX
} from 'lucide-react';

interface Viewer {
  company_name: string;
  employer_name: string;
  company_logo: string | null;
  viewed_at: string;
  employer_id: number;
  company_id: number; // 2. Đảm bảo Backend trả về company_id hoặc slug
}

const ViewedByEmployers: React.FC = () => {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate(); // 3. Khởi tạo navigate

  useEffect(() => {
    const fetchViewers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        const res = await axios.get(`${apiUrl}/api/candidate/viewed-by-employers`, {
          headers: { Authorization: `Bearer ${token}` }
          
        });
        console.log('Viewers data:', res.data.data);
        if (res.data.success) {
          setViewers(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching viewers data:", err);
        setError("Unable to load list. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchViewers();
  }, []);

  const filteredViewers = useMemo(() => {
    return viewers.filter(v =>
      v.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.employer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, viewers]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header & Search giữ nguyên ... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <Eye className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Profile Views
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You have <span className="font-bold text-blue-600 dark:text-blue-400">{viewers.length}</span> interested employers
          </p>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search company..."
            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse border border-transparent" />
          ))
        ) : error ? (
          <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : filteredViewers.length > 0 ? (
          filteredViewers.map((v, i) => (
            <div
              key={i}
              // 4. Cho phép click vào toàn bộ card để chuyển trang (tùy chọn)
              // Hoặc bạn có thể chỉ để click vào nút mũi tên bên dưới
              className="group flex items-center justify-between p-4 bg-white dark:bg-[#0E1422] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              onClick={() => navigate(`/company/${v.company_id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <img
                      src={v.company_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.company_name)}&background=random`}
                      className="w-full h-full object-cover"
                      alt="company logo"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-[#0E1422] rounded-full shadow-sm" title="Active"></div>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {v.company_name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-0.5">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      Viewer: <span className="text-gray-700 dark:text-gray-200">{v.employer_name}</span>
                    </span>
                    <span className="hidden sm:block text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(v.viewed_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* 5. Nút mũi tên có logic chuyển trang */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/company/${v.company_id}`);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-all group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600"
                >
                  <ArrowUpRight size={20} />
                </button>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 dark:text-gray-600 hidden sm:block">
                  {new Date(v.viewed_at).getFullYear()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10">
            <div className="p-4 bg-white dark:bg-white/5 rounded-full shadow-sm mb-4">
              <FilterX className="text-gray-300 dark:text-gray-600" size={40} />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-[250px] text-center">
              {searchTerm ? `No company matching "${searchTerm}" found in your list.` : 'No one has viewed your profile yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewedByEmployers;