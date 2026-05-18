import { Search, MapPin, Briefcase, Zap, Layers } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-20 pb-32 transition-colors duration-300 dark:bg-[#0B0F19]">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-20 dark:opacity-35">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400 blur-[150px]"></div>
        <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-400 blur-[150px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          
          <div className="flex flex-col justify-center space-y-8">
            {/* Tag Engine: Áp dụng dark:border-white/10 dark:bg-white/5 để đồng bộ kính mờ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex max-w-max items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <Zap size={16} className="text-emerald-500 dark:text-emerald-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI-Powered Skill Matching Engine</span>
            </motion.div>

            {/* Tiêu đề chính h1: Chuyển sang chữ trắng text-white khi bật Dark Mode */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-white"
            >
              Next-Gen AI <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[200%_auto] bg-clip-text text-transparent animate-gradient">
                Career Intelligence.
              </span>
            </motion.h1>

            {/* Thêm dark:text-gray-400 giúp đoạn văn dài có độ tương phản dễ chịu cho mắt vào ban đêm */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg text-lg text-gray-600 dark:text-gray-400"
            >
              Automate your job search. Our futuristic AI analyzes your profile, skills, and potential to instantly connect you with top-tier tech opportunities globally.
            </motion.p>
          </div>

          {/* Khung Hero Image lớn phía bên phải: Thiết lập giao diện kính mờ đục cao hơn một chút */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative flex h-[500px] w-full items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-white/5"
          >
            {/* Tăng nhẹ opacity của hình ảnh abstract trong dark mode để hòa quyện sâu hơn */}
            <img
              src="https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMDNkJTIwbmVvbiUyMGdlb21ldHJ5fGVufDF8fHx8MTc3OTEyNTQxMsww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="3D Abstract Geometry"
              className="absolute inset-0 h-full w-full rounded-3xl object-cover opacity-20 mix-blend-multiply dark:opacity-40 dark:mix-blend-screen"
            />
            {/* Gradient phủ từ trong suốt chuyển dần sang tiệp màu với màu nền ứng dụng dark:from-[#0B0F19] */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-gray-100 to-transparent opacity-50 dark:from-[#0B0F19]"></div>

            {/* Các Khung Badge Floating (Thẻ nổi): Tận dụng backdrop-blur-md để tạo hiệu ứng kính mờ xuyên thấu */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 top-12 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-lg dark:border-white/10 dark:bg-white/10 dark:backdrop-blur-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">14,250+</p>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Active Tech Jobs</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 top-1/2 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-lg dark:border-white/10 dark:bg-white/10 dark:backdrop-blur-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">98.5%</p>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">AI Match Rate</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 left-1/2 w-64 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-white/10 dark:backdrop-blur-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Live Applications</span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzkxMjU0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Applicant"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Alex M. applied to</p>
                  <p className="text-xs text-purple-600 font-medium dark:text-purple-400">Senior Frontend Role</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Thanh Tìm Kiếm Lớn (Search Bar Dashboard): Đưa về cấu trúc kính mờ sang trọng */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-20 mt-16 rounded-3xl border border-gray-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-lg"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {/* Hộp nhập liệu ô tìm kiếm */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 lg:col-span-2 border border-gray-100 dark:bg-white/5 dark:border-white/5">
              <Search className="text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search Keywords, Skills, or Roles..."
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none dark:text-white dark:placeholder-gray-400"
              />
            </div>
            
            {/* Ô Select chọn Category */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 dark:bg-white/5 dark:border-white/5">
              <Layers className="text-gray-400 dark:text-gray-500" size={20} />
              <select className="w-full appearance-none bg-transparent text-sm text-gray-700 outline-none cursor-pointer dark:text-gray-200">
                <option value="" className="dark:bg-[#0B0F19]">All Categories</option>
                <option value="engineering" className="dark:bg-[#0B0F19]">Engineering</option>
                <option value="design" className="dark:bg-[#0B0F19]">Design</option>
                <option value="data" className="dark:bg-[#0B0F19]">Data Science</option>
              </select>
            </div>

            {/* Ô Select chọn Location */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 dark:bg-white/5 dark:border-white/5">
              <MapPin className="text-gray-400 dark:text-gray-500" size={20} />
              <select className="w-full appearance-none bg-transparent text-sm text-gray-700 outline-none cursor-pointer dark:text-gray-200">
                <option value="" className="dark:bg-[#0B0F19]">Any Location</option>
                <option value="remote" className="dark:bg-[#0B0F19]">Remote</option>
                <option value="ny" className="dark:bg-[#0B0F19]">New York</option>
                <option value="sf" className="dark:bg-[#0B0F19]">San Francisco</option>
              </select>
            </div>

            {/* Ô Select chọn Mức lương */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 dark:bg-white/5 dark:border-white/5">
              <span className="text-gray-400 font-medium dark:text-gray-500">$</span>
              <select className="w-full appearance-none bg-transparent text-sm text-gray-700 outline-none cursor-pointer dark:text-gray-200">
                <option value="" className="dark:bg-[#0B0F19]">Salary Range</option>
                <option value="50k" className="dark:bg-[#0B0F19]">$50k - $80k</option>
                <option value="80k" className="dark:bg-[#0B0F19]">$80k - $120k</option>
                <option value="120k" className="dark:bg-[#0B0F19]">$120k+</option>
              </select>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg lg:col-span-1 hover:opacity-95">
              <Zap size={18} />
              Find Match
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}