import React, { useState, useEffect } from "react";
import { ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom"; // Hook điều hướng trang
import { getTopCompanies } from "../../../../services/jobService";

// Dải màu nền Banner ngẫu nhiên xoay vòng cho các công ty nếu DB không có banner_url
const bannerGradients = [
  "from-blue-600 to-blue-800",
  "from-purple-600 to-purple-900",
  "from-emerald-500 to-emerald-800"
];

export function TopEmployers() {
  const [employers, setEmployers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployersData = async () => {
      try {
        const data = await getTopCompanies();
        setEmployers(data.slice(0, 3)); // Lấy top 3 nhà tuyển dụng xuất sắc nhất
      } catch (error) {
        console.error("Lỗi nạp danh sách Top Employers:", error);
      }
    };
    fetchEmployersData();
  }, []);

  return (
    <section className="w-full py-24 overflow-hidden relative bg-gray-50 transition-colors duration-300 dark:bg-[#0B0F19]">
      {/* Đốm sáng tím mờ background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-purple-200 blur-[120px] rounded-full pointer-events-none opacity-50 dark:bg-purple-900/20 dark:opacity-20"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Top Verified Employers Showcase</h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400">Discover premium hubs from the world's most innovative tech giants.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {employers.map((emp: any, idx: number) => {
            const chosenBg = emp.banner_url 
              ? "" 
              : bannerGradients[idx % bannerGradients.length];
            
            // XỬ LÝ TECH STACK ĐỔ TỪ SQL:
            // Tách chuỗi "React,Node.js" từ SQL thành mảng, nếu không có thì dùng mảng mặc định
            const techStack = emp.tech_stack
              ? emp.tech_stack.split(",").map((s: string) => s.trim()).filter(Boolean)
              : ["Tech Hub"];

            // Thay thế link ảnh lỗi bằng placeholder chất lượng cao ổn định
            const logoUrl = emp.logo_url || `https://placehold.co/150?text=${encodeURIComponent(emp.name || 'Company')}`;

            return (
              <motion.div
                key={emp.id || idx}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:border-gray-300 hover:shadow-2xl dark:border-white/10 dark:bg-white/5"
              >
                {/* Sử dụng banner_url nếu có trong database, ngược lại dùng gradient mặc định */}
                {emp.banner_url ? (
                  <img src={emp.banner_url} alt="Banner" className="h-32 w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                ) : (
                  <div className={`h-32 w-full bg-gradient-to-br ${chosenBg} opacity-90 transition-opacity group-hover:opacity-100`}></div>
                )}
                
                <div className="relative px-6 pb-8 pt-12">
                  {/* Khung chứa Logo đã sửa link fallback */}
                  <div className="absolute -top-10 left-6 h-20 w-20 rounded-2xl border-4 border-white bg-white p-1 shadow-lg dark:border-4 dark:border-[#161b26] dark:bg-[#161b26]">
                    <img src={logoUrl} alt={emp.name} className="h-full w-full rounded-xl object-cover" />
                  </div>
                  
                  {/* Tên công ty & Tích xanh */}
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{emp.name}</h3>
                    {emp.is_verified === 1 || emp.is_verified === true ? (
                      <ShieldCheck size={20} className="text-emerald-500" />
                    ) : null}
                  </div>
                  
                  {/* Mô tả ngắn */}
                  <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{emp.description || "No description provided."}</p>
                  
                  {/* KHỐI TECH STACK LẤY ĐỘNG TỪ SQL */}
                  <div className="mb-8">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((t: string, tIdx: number) => (
                        <span key={tIdx} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Nút View Hub đi kèm chuyển hướng theo ID */}
                  <button 
                    onClick={() => navigate(`/company/${emp.id || emp.company_id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 border border-gray-200 hover:border-gray-300 hover:text-gray-900 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    View Hub & Jobs
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}