import { ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

const employers = [
  {
    name: "NextGen Tech",
    logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdGVjaCUyMGxvZ298ZW58MXx8fHwxNzc5MTI1NDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    bg: "from-blue-600 to-blue-800",
    desc: "Pioneering AI solutions for the modern workforce. Join our rapid growth.",
    tech: ["React", "Python", "AWS"]
  },
  {
    name: "Alpha Commerce",
    logo: "https://images.unsplash.com/photo-1669220339242-c12788586902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcHAlMjBsb2dvfGVufDF8fHx8MTc3OTEyNTQxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    bg: "from-purple-600 to-purple-900",
    desc: "Global e-commerce leaders building next-gen marketplace infrastructure.",
    tech: ["Node.js", "GraphQL", "GCP"]
  },
  {
    name: "GrowthHackers",
    logo: "https://images.unsplash.com/photo-1776243365809-b259876c75a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0ZWNoJTIwbG9nb3xlbnwxfHx8fDE3NzkxMjU0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    bg: "from-emerald-500 to-emerald-800",
    desc: "Data-driven marketing tech platform empowering B2B enterprises.",
    tech: ["Vue", "Ruby", "Docker"]
  }
];

export function TopEmployers() {
  return (
    <section className="w-full py-24 overflow-hidden relative bg-gray-50 transition-colors duration-300 dark:bg-[#0B0F19]">
      {/* Đốm sáng tím trung tâm: giảm nhẹ opacity xuống 0.2 để không làm chói tầm mắt chữ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-purple-200 blur-[120px] rounded-full pointer-events-none opacity-50 dark:bg-purple-900/20 dark:opacity-20"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-12 text-center">
          {/* Thêm dark:text-white */}
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Top Verified Employers Showcase</h2>
          {/* Thêm dark:text-gray-400 */}
          <p className="mt-3 text-gray-500 dark:text-gray-400">Discover premium hubs from the world's most innovative tech giants.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {employers.map((emp, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:border-gray-300 hover:shadow-2xl dark:border-white/10 dark:bg-white/5"
            >
              <div className={`h-32 w-full bg-gradient-to-br ${emp.bg} opacity-90 transition-opacity group-hover:opacity-100`}></div>
              
              <div className="relative px-6 pb-8 pt-12">
                {/* Viền bọc Logo công ty */}
                <div className="absolute -top-10 left-6 h-20 w-20 rounded-2xl border-4 border-white bg-white p-1 shadow-lg dark:border-[#161b26] dark:bg-[#161b26]">
                  <img src={emp.logo} alt={emp.name} className="h-full w-full rounded-xl object-cover" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  {/* Thêm chữ trắng cho tên doanh nghiệp giới thiệu */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{emp.name}</h3>
                  <ShieldCheck size={20} className="text-emerald-500" />
                </div>
                
                {/* Thêm mô tả phụ dark:text-gray-400 */}
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{emp.desc}</p>
                
                <div className="mb-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {emp.tech.map((t, tIdx) => (
                      <span key={tIdx} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/5">
                        {/* Thẻ Tech items nhỏ: chuyển thành dạng tag mờ dark:bg-white/10 dark:text-gray-300 dark:border-white/5 */}
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Nút điều hướng vào Hub chi tiết: dark:bg-white/5 dark:text-gray-300 */}
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 border border-gray-200 hover:border-gray-300 hover:text-gray-900 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white">
                  View Hub & Jobs
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}