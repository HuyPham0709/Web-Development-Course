import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Briefcase, Zap, Layers, ChevronDown, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCategories, getLocations, getJobSuggestions } from "../../../../services/jobService";
// Nhúng file Autocomplete đã được tối ưu hóa tự trị ở trên
import { SearchAutocomplete } from "../../shared/SearchAutocomplete";

interface HeroProps {
  initialTitle: string;
  initialLocation: string;
  initialCategoryId: string;
  initialSalary?: string;
}

export function Hero({ initialTitle, initialLocation, initialCategoryId, initialSalary = "" }: HeroProps) {
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // State lưu trữ dữ liệu người dùng nhập
  const [title, setTitle] = useState(initialTitle);
  const [location, setLocation] = useState(initialLocation);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [salary, setSalary] = useState(initialSalary);

  // State quản lý dropdown nào đang mở
  const [activeDropdown, setActiveDropdown] = useState<"category" | "location" | "salary" | null>(null);

  // State chứa danh sách tùy chọn lấy từ API
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Danh sách khoảng lương (USD)
  const salaryOptions = [
    { value: "0-1000", label: "Under $1,000" },
    { value: "1000-2000", label: "$1,000 - $2,000" },
    { value: "2000-3000", label: "$2,000 - $3,000" },
    { value: "3000+", label: "$3,000+" },
  ];

  useEffect(() => {
    setTitle(initialTitle);
    setLocation(initialLocation);
    setCategoryId(initialCategoryId);
    setSalary(initialSalary);
  }, [initialTitle, initialLocation, initialCategoryId, initialSalary]);

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [catData, locData] = await Promise.all([getCategories(), getLocations()]);
        setCategories(catData);
        setLocations(locData);
      } catch (error) {
        console.error("Lỗi nạp danh mục/địa điểm của Hero:", error);
      }
    };
    fetchSelectData();
  }, []);

  // Xử lý click ra ngoài để đóng các dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm xử lý tìm kiếm nhận params trực tiếp để tránh state bất đồng bộ
  const handleSearch = (updatedFields?: { title?: string; location?: string; categoryId?: string; salary?: string }) => {
    const finalTitle = updatedFields && updatedFields.hasOwnProperty('title') ? updatedFields.title : title;
    const finalLocation = updatedFields && updatedFields.hasOwnProperty('location') ? updatedFields.location : location;
    const finalCategory = updatedFields && updatedFields.hasOwnProperty('categoryId') ? updatedFields.categoryId : categoryId;
    const finalSalary = updatedFields && updatedFields.hasOwnProperty('salary') ? updatedFields.salary : salary;

    const params = new URLSearchParams();
    if (finalTitle) params.append("title", finalTitle);
    if (finalLocation) params.append("location", finalLocation);
    if (finalCategory) params.append("category_id", finalCategory);
    if (finalSalary) params.append("salary", finalSalary);
    
    navigate(`?${params.toString()}`);
  };

  const toggleDropdown = (dropdown: "category" | "location" | "salary") => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const getDisplayCategory = () => categories.find(c => c.id.toString() === categoryId)?.name || "All Categories";
  const getDisplayLocation = () => locations.find(l => l.name === location)?.name || "Any Location";
  const getDisplaySalary = () => salaryOptions.find(s => s.value === salary)?.label || "Salary Range";

  return (
    <section className="relative z-10 w-full pt-20 pb-32 transition-colors duration-300 dark:bg-[#0B0F19]">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-20 dark:opacity-35">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400 blur-[150px]"></div>
        <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-400 blur-[150px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Cột trái: Text */}
          <div className="flex flex-col justify-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex max-w-max items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <Zap size={16} className="text-emerald-500 dark:text-emerald-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI-Powered Skill Matching Engine</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl font-extrabold leading-[1.1] tracking-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-white"
            >
              Find your next <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[200%_auto] bg-clip-text text-transparent animate-gradient">
                dream job.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg text-lg text-gray-600 dark:text-gray-400"
            >
              Discover thousands of job opportunities with all the information you need. It's your future. Come find it.
            </motion.p>
          </div>

          {/* Cột phải: Hình ảnh & Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative flex h-[500px] w-full items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-white/5"
          >
            <img
              src="https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMDNkJTIwbmVvbiUyMGdlb21ldHJ5fGVufDF8fHx8MTc3OTEyNTQxMsww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="3D Abstract Geometry"
              className="absolute inset-0 h-full w-full rounded-3xl object-cover opacity-20 mix-blend-multiply dark:opacity-40 dark:mix-blend-screen"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-gray-100 to-transparent opacity-50 dark:from-[#0B0F19]"></div>

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
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzkxMjU0MTR8MA"
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

        {/* Thanh Tìm Kiếm Động */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-20 mt-16 rounded-3xl border border-gray-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-lg"
        >
          <div ref={searchContainerRef} className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            
            {/* 1. Kế thừa Ô Input Autocomplete Mới */}
            <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 lg:col-span-2 border border-gray-100 dark:bg-white/5 dark:border-white/5">
              <Search className="text-gray-400 dark:text-gray-500 shrink-0" size={20} />
              <SearchAutocomplete
                placeholder="Keywords, Skills, or Roles..."
                initialValue={title}
                onSelect={(item) => {
                  setTitle(item.label);
                  handleSearch({ title: item.label });
                }}
                onInputChange={(value) => setTitle(value)} // Đảm bảo dòng này đã có để cập nhật state 'title' liên tục khi gõ phím
                onFetchSuggestions={async (query, signal) => {
                  if (!query.trim()) return [];
                  return await getJobSuggestions(query, signal);
                }}
              />
            </div>
            
            {/* 2. Category Custom Dropdown */}
            <div className="relative flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 dark:bg-white/5 dark:border-white/5">
              <Layers className="text-gray-400 dark:text-gray-500 shrink-0" size={20} />
              <button 
                onClick={() => toggleDropdown("category")}
                className="flex w-full items-center justify-between outline-none"
              >
                <span className={`text-sm truncate pr-2 ${categoryId ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {getDisplayCategory()}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-300 ${activeDropdown === "category" ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === "category" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-3 w-full min-w-[220px] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl z-50 dark:border-white/10 dark:bg-[#0B0F19]"
                  >
                    <button
                      onClick={() => { setCategoryId(""); setActiveDropdown(null); handleSearch({ categoryId: "" }); }}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all ${!categoryId ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => { setCategoryId(cat.id.toString()); setActiveDropdown(null); handleSearch({ categoryId: cat.id.toString() }); }}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all ${categoryId === cat.id.toString() ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Location Custom Dropdown */}
            <div className="relative flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 dark:bg-white/5 dark:border-white/5">
              <MapPin className="text-gray-400 dark:text-gray-500 shrink-0" size={20} />
              <button 
                onClick={() => toggleDropdown("location")}
                className="flex w-full items-center justify-between outline-none"
              >
                <span className={`text-sm truncate pr-2 ${location ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {getDisplayLocation()}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-300 ${activeDropdown === "location" ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === "location" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-3 w-full min-w-[200px] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl z-50 dark:border-white/10 dark:bg-[#0B0F19]"
                  >
                    <button
                      onClick={() => { setLocation(""); setActiveDropdown(null); handleSearch({ location: "" }); }}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all ${!location ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      Any Location
                    </button>
                    {locations.map((loc: any) => (
                      <button
                        key={loc.id}
                        onClick={() => { setLocation(loc.name); setActiveDropdown(null); handleSearch({ location: loc.name }); }}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all ${location === loc.name ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Salary Custom Dropdown */}
            <div className="relative flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100 dark:bg-white/5 dark:border-white/5">
              <DollarSign className="text-gray-400 dark:text-gray-500 shrink-0" size={20} />
              <button 
                onClick={() => toggleDropdown("salary")}
                className="flex w-full items-center justify-between outline-none"
              >
                <span className={`text-sm truncate pr-2 ${salary ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {getDisplaySalary()}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-300 ${activeDropdown === "salary" ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === "salary" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-3 w-full min-w-[200px] rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl z-50 dark:border-white/10 dark:bg-[#0B0F19]"
                  >
                    <button
                      onClick={() => { setSalary(""); setActiveDropdown(null); handleSearch({ salary: "" }); }}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all ${!salary ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      Any Salary
                    </button>
                    {salaryOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSalary(opt.value); setActiveDropdown(null); handleSearch({ salary: opt.value }); }}
                        className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all ${salary === opt.value ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 5. Nút Search */}
            <button 
              onClick={() => handleSearch()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg lg:col-span-1 hover:opacity-95"
            >
              <Zap size={18} />
              Find Match
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}