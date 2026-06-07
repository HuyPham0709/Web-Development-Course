import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Đã thêm import này
import { TrendingUp, Briefcase } from "lucide-react";
// Import toàn bộ icon từ thư viện lucide để làm bộ tra cứu động
import * as LucideIcons from "lucide-react"; 
import { getCategories, getSkills } from "../../../../services/jobService";

// Bản đồ dải màu sắc cố định theo vị trí
const cardGradients = [
  { color: "from-blue-500 to-blue-600", glowColor: "group-hover:shadow-blue-500/10" },
  { color: "from-purple-500 to-purple-600", glowColor: "group-hover:shadow-purple-500/10" },
  { color: "from-pink-500 to-rose-500", glowColor: "group-hover:shadow-pink-500/10" },
  { color: "from-emerald-500 to-emerald-600", glowColor: "group-hover:shadow-emerald-500/10" },
  { color: "from-amber-500 to-orange-500", glowColor: "group-hover:shadow-amber-500/10" }
];

// BỘ TỪ ĐIỂN DỊCH DATABASE SANG TIẾNG ANH CHO FRONTEND
const categoryTranslations: Record<string, string> = {
  "Công nghệ thông tin": "Information Technology",
  "Marketing": "Marketing",
  "Kế toán": "Accounting",
  "Thiết kế": "Design",
  "Nhân sự": "Human Resources",
  "Kinh doanh": "Business",
  "Kỹ thuật": "Engineering",
  "Y tế": "Healthcare",
  "Giáo dục": "Education",
  "Logistics": "Logistics"
};

export function CategoriesAndSkills() {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  
  // Khởi tạo hook điều hướng
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };

    const fetchSkills = async () => {
      try {
        const data = await getSkills();
        setSkills(data);
      } catch (error) {
        console.error("Lỗi lấy kỹ năng:", error);
      }
    };

    fetchCategories();
    fetchSkills();
  }, []);

  return (
    <section className="w-full py-24 bg-white dark:bg-[#0E1422] transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Tiêu đề */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Browse by Category</h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400">Explore open roles across high-demand tech and business sectors.</p>
        </div>

        {/* Lưới danh mục hiển thị */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat: any, idx: number) => {
            const gradient = cardGradients[idx % cardGradients.length];

            let IconComponent = Briefcase; 
            if (cat.icon_url && (LucideIcons as any)[cat.icon_url]) {
              IconComponent = (LucideIcons as any)[cat.icon_url];
            }

            // ÁP DỤNG DỊCH TÊN DANH MỤC Ở ĐÂY
            const displayCategoryName = categoryTranslations[cat.name] || cat.name;

            return (
              <div
                key={cat.id || idx}
                onClick={() => navigate(`/jobs?category_id=${cat.id}`)} // Bắt sự kiện click
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl cursor-pointer ${gradient.glowColor} dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20`}
              >
                <div>
                  {/* Khối chứa Icon động */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient.color} text-white shadow-md`}>
                    <IconComponent size={22} />
                  </div>
                  
                  {/* Tên danh mục (Đã dịch sang tiếng Anh) */}
                  <h3 className="mt-6 text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {displayCategoryName}
                  </h3>
                </div>

                {/* Số lượng công việc */}
                <p className="mt-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                  {cat.job_count || 0} jobs
                </p>

                {/* Hiệu ứng đốm sáng */}
                <div 
                  className={`absolute -right-8 top-1/2 -translate-y-1/2 w-24 h-32 rounded-full bg-gradient-to-br ${gradient.color} opacity-0 blur-[35px] transition-opacity duration-300 group-hover:opacity-20 dark:group-hover:opacity-25 -z-10`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Khu vực Trending Skills */}
        <div className="mt-20 rounded-3xl border border-gray-200 bg-white p-8 lg:p-12 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trending AI & Tech Skills</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {skills.map((skill: string, idx: number) => (
              <button
                key={idx}
                onClick={() => navigate(`/jobs?title=${encodeURIComponent(skill)}`)} // Bắt sự kiện click
                className="rounded-full border border-gray-200 bg-gray-50 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-purple-500/50 dark:hover:text-purple-400"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}