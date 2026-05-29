import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  X, 
  SlidersHorizontal,
  DollarSign,
  GraduationCap,
  CalendarDays,
  Grid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown
} from "lucide-react";

import { IJob, IJobFilters } from "../../../types/job";
// 1. Đã thêm getJobSuggestions vào đây
import { getJobs, getLocations, getCategories, getJobSuggestions } from "../../../services/jobService";
import { getRecommendations } from "../../../services/recommendationService";
import { JobCard } from "../../components/public/home/JobCard";
import { RecommendedJobsAside } from "../../components/candidate/profile/RecommendedJobsAside";
import { Link } from "react-router-dom";
import { api } from "../../../services/api";
// 2. Import SearchAutocomplete theo đúng cấu trúc thư mục của Jobs.tsx
import { SearchAutocomplete } from "../../components/shared/SearchAutocomplete";
import { useSharedProfile } from '../../../hooks/useSharedProfile';

interface IExtendedFilters extends IJobFilters {
  experience_level?: string;
  salary_min?: number;
}

export const Jobs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { userData } = useSharedProfile();

  // Main Filter State
  const [filters, setFilters] = useState<IExtendedFilters>(
    {
      title: "",
      location: "",
      category_id: "",
      type: "",
      experience_level: "",
      salary_min: 0,
      page: 1,
      limit: 12
    }
  );
  const navigate = useNavigate();
  // Local Immediate UI States
  const [salarySlider, setSalarySlider] = useState<number>(0);
  const [searchInput, setSearchInput] = useState("");
  
  // Data States
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]); 
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const apiRequestCountRef = useRef<number>(0);

  // ĐỒNG BỘ HOÁ DỮ LIỆU TỪ URL PARAMETERS VÀO FILTER STATE
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const categoryIdParam = searchParams.get("category_id");
    const titleParam = searchParams.get("title");

    setFilters(prev => {
      const nextCategoryId = categoryIdParam ? Number(categoryIdParam) : "";
      const nextTitle = titleParam || "";

      if (prev.category_id !== nextCategoryId || prev.title !== nextTitle) {
        return {
          ...prev,
          category_id: nextCategoryId,
          title: nextTitle,
          page: 1
        };
      }
      return prev;
    });

    if (titleParam !== null) {
      setSearchInput(titleParam);
    }
  }, [searchParams]);

  // Sync Slider UI
  useEffect(() => {
    if (filters.salary_min !== undefined) {
      setSalarySlider(filters.salary_min);
    }
  }, [filters.salary_min]);

  // Debounce logic for Salary Slider
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (salarySlider !== filters.salary_min) {
        setFilters(prev => ({ 
          ...prev, 
          salary_min: salarySlider, 
          page: 1 
        }));
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [salarySlider, filters.salary_min]);

  // Fetch Core Jobs
  const fetchJobsData = useCallback(async (currentFilters: IExtendedFilters) => {
    const currentRequestVersion = ++apiRequestCountRef.current;
    setLoading(true);
    
    try {
      const [response] = await Promise.all([
        getJobs(currentFilters),
        new Promise(resolve => setTimeout(resolve, 500)) 
      ]);
      
      if (currentRequestVersion !== apiRequestCountRef.current) return;

      if (response && response.data) {
        setJobs(response.data);
        const total = response.meta?.total || response.data.length;
        setTotalJobs(total);
        setTotalPages(Math.ceil(total / (currentFilters.limit || 12)) || 1);
      }
    } catch (error) {
      console.error("Error fetching jobs list:", error);
    } finally {
      if (currentRequestVersion === apiRequestCountRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Init Data
  useEffect(() => {
    const initData = async () => {
      try {
        const [catData, locData] = await Promise.all([getCategories(), getLocations()]);
        setCategories(catData);
        setLocations(locData);

        const token = localStorage.getItem("token");
        if (token) {
          try {
            const aiRes = await getRecommendations();
            const data = aiRes?.data?.jobs;
            setAiRecommendations(Array.isArray(data) ? data : []);
          } catch (err) {
            setAiRecommendations([]);
          }

          // GIẢI PHÁP SỬA LỖI: Gọi API lấy danh sách các Job đã được user save từ trước để hiển thị tim đỏ
          try {
            const res = await api.get("/api/favorites"); 
            const savedIds = res.data.data.map((job: any) => job.id);
            setSavedJobs(savedIds);
          } catch (err) {
            console.error("Fetch saved jobs error in Jobs.tsx:", err);
          }
        }
      } catch (error) {
        console.error("Error initializing auxiliary filters data:", error);
      }
    };
    initData();
  }, []);

  // Trigger API whenever filters state changes
  useEffect(() => {
    fetchJobsData(filters);
  }, [filters, fetchJobsData]);

  // Handle Input Changes
  const handleInputChange = (field: keyof IExtendedFilters, value: string | number) => {
    const processedValue = (field === "category_id" && value !== "") ? Number(value) : value;
    
    setFilters(prev => ({ 
      ...prev, 
      [field]: processedValue, 
      page: field === "page" ? (value as number) : 1 
    }));
  };

  const handleTriggerSearch = () => {
    handleInputChange("title", searchInput);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSalarySlider(0);
    setActiveDropdown(null);
    setFilters({
      title: "",
      location: "",
      category_id: "",
      type: "",
      experience_level: "",
      salary_min: 0,
      page: 1,
      limit: 12
    });
    setSearchParams({}); 
  };

  const handleToggleSaveJob = useCallback(async (jobId: number) => {
    try {
      setSavedJobs(prev => {
        const isSaved = prev.includes(jobId);
        if (isSaved) {
          api.delete(`/api/favorites/${jobId}`).catch(err => console.error(err));
          return prev.filter(id => id !== jobId);
        } else {
          api.post(`/api/favorites/${jobId}`, {}).catch(err => console.error(err));
          return [...prev, jobId];
        }
      });
    } catch (err) {
      console.error("Save job error:", err);
    }
  }, []);

  const [activeModal, setActiveModal] = useState<
  'personalInfo' | 'experience' | 'education' | 'skills' | null
>(null);

const handleOpenModal = (
  type: 'personalInfo' | 'experience' | 'education' | 'skills' | null
) => {
  setActiveModal(type);
};

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleInputChange("page", newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 transition-colors duration-300 dark:bg-[#070A13] dark:text-gray-100">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.3);
            border-radius: 9999px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.5);
          }
        `}
      </style>

      <div className="absolute top-0 left-1/4 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-10 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none -z-10"></div>

      <div className="mx-auto max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px] px-4 py-8 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Discover Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dream Job</span> Career
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Explore thousands of verified top-tier job opportunities tailored specifically to your expertise.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 rounded-3xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-100/50 transition-all dark:border-white/5 dark:bg-[#0B0F19]/80 dark:shadow-none md:grid-cols-12 md:gap-2">
            
            {/* Ô TÌM KIẾM CHÍNH ĐÃ TÍCH HỢP AUTOCOMPLETE */}
            <div className="relative flex items-center md:col-span-5 px-3 w-full">
              <SearchAutocomplete
                placeholder="Job title, keywords, or company name..."
                initialValue={searchInput}
                onSelect={(item) => {
                  setSearchInput(item.label);
                  setFilters(prev => ({
                    ...prev,
                    title: item.label,
                    page: 1
                  }));
                }}
                onInputChange={(value) => setSearchInput(value)}
                onFetchSuggestions={async (query, signal) => {
                  if (!query.trim()) return [];
                  return await getJobSuggestions(query, signal);
                }}
              />
            </div>
            
            <div className="h-px bg-gray-100 dark:bg-white/5 md:h-8 md:w-px md:self-center md:col-span-1 justify-self-center hidden md:block"></div>

            {/* DROPDOWN CUSTOM: LOCATION (HEADER) */}
            <div className="relative flex items-center md:col-span-4 px-3">
              <MapPin className="absolute left-4 text-purple-500 z-10" size={20} />
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "location" ? null : "location")}
                className="w-full flex items-center justify-between bg-transparent py-3 pl-9 pr-2 text-sm text-gray-700 outline-none cursor-pointer dark:text-gray-300 text-left"
              >
                <span className="truncate">{filters.location || "All Locations"}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${activeDropdown === "location" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "location" && (
                <ul className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B0F19] z-50 custom-scrollbar animate-fade-in">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange("location", "");
                        setActiveDropdown(null);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${!filters.location ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                    >
                      All Locations
                    </button>
                  </li>
                  {locations.map((loc: any) => (
                    <li key={loc.id}>
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange("location", loc.name);
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${filters.location === loc.name ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                      >
                        {loc.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex md:col-span-2 items-center justify-end px-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex items-center justify-center gap-2 w-full rounded-2xl border border-gray-200 p-3 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 md:hidden transition-colors"
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
              
              <button 
                type="button"
                onClick={handleTriggerSearch}
                className="hidden md:flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-semibold text-white transition-all hover:opacity-95 shadow-md shadow-blue-500/10"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* BODY LAYOUT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
          
          {/* SIDEBAR */}
          <aside className="sticky top-24 hidden lg:flex lg:flex-col gap-6 lg:col-span-1 overflow-x-hidden">
            
            {/* ADVANCED FILTERS */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#0B0F19]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/5">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                  <Filter size={18} className="text-blue-500" />
                  Advanced Filters
                </div>
                <button 
                  onClick={handleResetFilters}
                  className="text-xs font-medium text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  Reset All
                </button>
              </div>

              <div className="mt-5 space-y-6">
                {/* DROPDOWN CUSTOM: CATEGORIES (DESKTOP) */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mb-2.5">
                    <Briefcase size={14} /> Categories
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-700 outline-none transition-all hover:border-gray-300 focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:focus:border-blue-500 text-left"
                  >
                    <span className="truncate">
                      {filters.category_id 
                        ? categories.find(c => Number(c.id) === Number(filters.category_id))?.name || "All Specialities" 
                        : "All Specialities"}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${activeDropdown === "category" ? "rotate-180" : ""}`} />
                  </button>

                  {activeDropdown === "category" && (
                    <ul className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B0F19] z-50 custom-scrollbar animate-fade-in">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("category_id", "");
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${!filters.category_id ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                        >
                          All Specialities
                        </button>
                      </li>
                      {categories.map((cat: any) => (
                        <li key={cat.id}>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange("category_id", cat.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${Number(filters.category_id) === Number(cat.id) ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                          >
                            {cat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* DROPDOWN CUSTOM: JOB TYPE (DESKTOP) */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mb-2.5">
                    <CalendarDays size={14} /> Job Type
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "type" ? null : "type")}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-700 outline-none transition-all hover:border-gray-300 focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:focus:border-blue-500 text-left"
                  >
                    <span className="truncate">{filters.type || "All Work Types"}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${activeDropdown === "type" ? "rotate-180" : ""}`} />
                  </button>

                  {activeDropdown === "type" && (
                    <ul className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B0F19] z-50 custom-scrollbar animate-fade-in">
                      {[
                        { value: "", label: "All Work Types" },
                        { value: "Full-time", label: "Full-time" },
                        { value: "Part-time", label: "Part-time" },
                        { value: "Contract", label: "Contract" },
                        { value: "Remote", label: "Remote" }
                      ].map((t) => (
                        <li key={t.value}>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange("type", t.value);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${filters.type === t.value ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                          >
                            {t.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mb-3">
                      <GraduationCap size={14} /> Experience Level
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Intern", value: "intern" },
                        { label: "Fresher", value: "fresher" },
                        { label: "Junior", value: "junior" },
                        { label: "Middle", value: "middle" },
                        { label: "Senior", value: "senior" }
                      ].map((lvl) => {
                        const isActive = filters.experience_level === lvl.value;
                        return (
                          <button
                            type="button"
                            key={lvl.value}
                            onClick={() => handleInputChange("experience_level", isActive ? "" : lvl.value)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              isActive 
                                ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold shadow-sm" 
                                : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                            }`}
                          >
                            {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mb-3">
                      <DollarSign size={14} /> Salary Expectation
                    </label>
                    <div className="relative w-full">
                      <input 
                        type="range" 
                        min="0" 
                        max="3200"
                        step="400"
                        value={salarySlider}
                        onChange={(e) => setSalarySlider(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                      <span>Any</span>
                      <span className={salarySlider > 0 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>
                        {salarySlider > 0 ? `${salarySlider} $+` : "Negotiable"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <RecommendedJobsAside 
              recommendedJobs={aiRecommendations}
              userData={userData}
              
              openModal={(type) => {
                if (type === "personalInfo") {
                  navigate('/profile');
                }
              }}
            />

          </aside>

          {/* MAIN JOBS LIST AREA */}
          <main className="lg:col-span-3 space-y-5 min-h-[600px]">
            <div className="flex items-center justify-between bg-white dark:bg-[#0B0F19] rounded-2xl px-5 py-3.5 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Grid size={16} className="text-purple-500" />
                Found <span className="font-bold text-gray-900 dark:text-white">{totalJobs}</span> matching job listings
              </div>
            </div>

            {/* RENDER LOGIC */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: filters.limit || 12 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    style={{ animationDelay: `${idx * 100}ms` }}
                    className="flex flex-col h-[340px] bg-white dark:bg-[#0B0F19] rounded-3xl p-6 border border-gray-100 dark:border-white/5 justify-between animate-pulse"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-200/80 dark:bg-gray-800 rounded-2xl" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200/80 dark:bg-gray-800 rounded w-2/3" />
                          <div className="h-3 bg-gray-200/80 dark:bg-gray-800 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="h-3 bg-gray-200/80 dark:bg-gray-800 rounded w-full" />
                        <div className="h-3 bg-gray-200/80 dark:bg-gray-800 rounded w-5/6" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                      <div className="h-7 bg-gray-200/80 dark:bg-gray-800 rounded-xl w-20" />
                      <div className="h-7 bg-gray-200/80 dark:bg-gray-800 rounded-xl w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-3xl border border-dashed border-gray-200 bg-white dark:border-white/10 dark:bg-[#0B0F19]">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4 text-gray-400">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No jobs found matching parameters</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  Try adjusting your search keywords or tweaking the advanced filters on the right.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 rounded-xl border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {jobs.map((job, idx) => (
                    <div 
                      key={job.id} 
                      className="flex flex-col h-full hover:scale-[1.01] hover:shadow-lg hover:shadow-gray-100/30 transition-all duration-300 rounded-3xl dark:hover:shadow-none bg-white dark:bg-[#0B0F19] p-1 border border-gray-100 dark:border-white/5"
                    >
                      <JobCard
                        index={idx}
                        job={job}
                        isSaved={savedJobs.includes(job.id)}
                        onToggleSave={handleToggleSaveJob}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-6 mt-8">
                    <div className="hidden sm:flex flex-1 justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        Showing page <span className="font-semibold text-gray-900 dark:text-white">{filters.page}</span> of{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span> pages
                      </p>
                    </div>
                    <div className="flex flex-1 sm:justify-end justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange((filters.page || 1) - 1)}
                        disabled={filters.page === 1}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium bg-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0B0F19] dark:text-gray-300 transition-colors"
                      >
                        <ChevronLeft size={16} /> Prev
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - (filters.page || 1)) <= 1)
                        .map((pageNumber, idx, arr) => {
                          const showEllipsis = idx > 0 && pageNumber - arr[idx - 1] > 1;
                          return (
                            <React.Fragment key={pageNumber}>
                              {showEllipsis && <span className="px-2 py-2 text-gray-400">...</span>}
                              <button
                                type="button"
                                onClick={() => handlePageChange(pageNumber)}
                                className={`h-9 w-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                                  filters.page === pageNumber
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0B0F19] dark:text-gray-400"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button
                        type="button"
                        onClick={() => handlePageChange((filters.page || 1) + 1)}
                        disabled={filters.page === totalPages}
                        className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium bg-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-[#0B0F19] dark:text-gray-300 transition-colors"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>

        </div>
      </div>

      {/* MOBILE DRAWER FILTER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="h-full w-full max-w-xs bg-white p-6 shadow-2xl dark:bg-[#0B0F19] overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter size={18} /> Filters Panel
                </h2>
                <button 
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)} 
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {/* DROPDOWN CUSTOM: CATEGORIES (MOBILE) */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-2">
                    Categories
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "mobile_category" ? null : "mobile_category")}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 text-left"
                  >
                    <span className="truncate">
                      {filters.category_id 
                        ? categories.find(c => Number(c.id) === Number(filters.category_id))?.name || "All Specialities" 
                        : "All Specialities"}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${activeDropdown === "mobile_category" ? "rotate-180" : ""}`} />
                  </button>

                  {activeDropdown === "mobile_category" && (
                    <ul className="absolute left-0 right-0 top-full mt-2 max-h-48 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B0F19] z-50 custom-scrollbar animate-fade-in">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange("category_id", "");
                            setActiveDropdown(null);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${!filters.category_id ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                        >
                          All Specialities
                        </button>
                      </li>
                      {categories.map((cat: any) => (
                        <li key={cat.id}>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange("category_id", cat.id);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${Number(filters.category_id) === Number(cat.id) ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                          >
                            {cat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* DROPDOWN CUSTOM: JOB TYPE (MOBILE) */}
                <div className="relative">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-2">
                    Job Type
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "mobile_type" ? null : "mobile_type")}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 text-left"
                  >
                    <span className="truncate">{filters.type || "All Work Types"}</span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${activeDropdown === "mobile_type" ? "rotate-180" : ""}`} />
                  </button>

                  {activeDropdown === "mobile_type" && (
                    <ul className="absolute left-0 right-0 top-full mt-2 max-h-48 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B0F19] z-50 custom-scrollbar animate-fade-in">
                      {[
                        { value: "", label: "All Work Types" },
                        { value: "Full-time", label: "Full-time" },
                        { value: "Part-time", label: "Part-time" },
                        { value: "Contract", label: "Contract" },
                        { value: "Remote", label: "Remote" }
                      ].map((t) => (
                        <li key={t.value}>
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange("type", t.value);
                              setActiveDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${filters.type === t.value ? "bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"}`}
                          >
                            {t.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-3">
                    Experience Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Intern", value: "intern" },
                      { label: "Fresher", value: "fresher" },
                      { label: "Junior", value: "junior" },
                      { label: "Middle", value: "middle" },
                      { label: "Senior", value: "senior" }
                    ].map((lvl) => {
                      const isActive = filters.experience_level === lvl.value;
                      return (
                        <button
                          type="button"
                          key={lvl.value}
                          onClick={() => handleInputChange("experience_level", isActive ? "" : lvl.value)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                            isActive 
                              ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold" 
                              : "bg-gray-50 border-transparent text-gray-500 dark:bg-white/5 dark:text-gray-400"
                          }`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-3">
                    Salary Expectation
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="3200"
                    step="400"
                    value={salarySlider}
                    onChange={(e) => setSalarySlider(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-2 font-medium">
                    <span>Any</span>
                    <span className={salarySlider > 0 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>
                      {salarySlider > 0 ? `${salarySlider} $+` : "Negotiable"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-gray-300"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};