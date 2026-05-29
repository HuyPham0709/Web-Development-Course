import React, { useState, useEffect, useCallback } from "react";
import { getJobs } from "../../../../services/jobService";
import { api } from "../../../../services/api"; 
import { JobCard } from "./JobCard";
import { HorizontalTrack } from "./HorizontalTrack";
import { IJob } from "../../../../types/job";

// Định nghĩa các tab bộ lọc loại công việc (Bằng Tiếng Anh)
const jobTabs = ["All Jobs", "Full-Time", "Contract", "Remote"];

// Khai báo Interface nhận dữ liệu từ Home.tsx gửi xuống
interface HighSalaryJobsProps {
  titleFilter: string;
  locationFilter: string;
  categoryFilter: string;
  salaryFilter: string;
}

export function HighSalaryJobs({ titleFilter, locationFilter, categoryFilter, salaryFilter }: HighSalaryJobsProps) {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [activeTab, setActiveTab] = useState("All Jobs"); // State lưu tab đang chọn
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHighSalaryJobs = async () => {
      setLoading(true);
      try {
        // Chuyển đổi tab text sang query param thích hợp cho API
        let typeParam = "";
        if (activeTab === "Full-Time") typeParam = "full-time";
        if (activeTab === "Contract") typeParam = "contract";
        if (activeTab === "Remote") typeParam = "remote";

        const [response] = await Promise.all([
          getJobs({
            title: titleFilter,
            location: locationFilter,
            category_id: categoryFilter,
            salary: salaryFilter,
            type: typeParam,        // Thêm lọc theo loại công việc của Tab
            status: "approved",
            sort: "salary_desc",    // Bắt buộc giữ nguyên để sắp xếp lương từ cao xuống thấp
            page: 1,       
            limit: 10,     
          }),
          new Promise(resolve => setTimeout(resolve, 500))
        ]);
        
        const approvedJobs = response.data.filter((job: IJob) => job.status === "approved");
        setJobs(approvedJobs.slice(0, 10));
      } catch (error) {
        console.error("Error loading high salary jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighSalaryJobs();
    // Kích hoạt lại useEffect khi bất kỳ filter nào hoặc Tab thay đổi
  }, [titleFilter, locationFilter, categoryFilter, salaryFilter, activeTab]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await api.get("/api/favorites"); 
        const savedIds = res.data.data.map((job: any) => job.id);
        setSavedJobs(savedIds);
      } catch (err) {
        console.error("Fetch saved jobs error:", err);
      }
    };
    if (localStorage.getItem("token")) {
      fetchSavedJobs();
    }
  }, []);

  const handleToggleSave = useCallback(async (jobId: number) => {
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

  return (
    <section className="w-full bg-white pt-10 pb-20 relative transition-colors duration-300 dark:bg-[#0B0F19]">
      {/* BACKGROUND LƯỚI KHỚP KHÍT NỐI LIỀN VỚI LIVEJOBFEED */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_top,transparent_0%,#000_20%,#000_100%)] opacity-50 dark:opacity-10 dark:bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] pointer-events-none"></div>
      
      <div className="relative mx-auto max-w-7xl px-6">
        
        {/* HEADER SECTION (Gồm Tiêu đề bên trái và Bộ lọc Tab bên phải giống 100% LiveJobFeed) */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 dark:bg-orange-950/40 dark:border-orange-900/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-600"></span>
              </span>
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Premium Opportunities</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              High-Paying Jobs
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Elevate your career with top-tier compensation packages.
            </p>
          </div>

          {/* THANH TAB ĐÃ THÊM: Đồng bộ layout với LiveJobFeed nhưng mang màu Orange đặc trưng */}
          <div className="flex space-x-2 rounded-2xl border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/5">
            {jobTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? "bg-white text-orange-600 shadow-sm border border-gray-100 dark:bg-orange-600 dark:text-white dark:border-transparent" 
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* NỘI DUNG FEED LOGIC */}
        {loading ? (
          <HorizontalTrack onLoadMore={() => {}} hasMore={false} isLoading={false}>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div 
                key={`skeleton-high-${idx}`}
                style={{ animationDelay: `${idx * 120}ms` }}
                className="w-[280px] sm:w-[320px] shrink-0 self-stretch pointer-events-auto flex flex-col h-[340px] bg-white dark:bg-[#0B0F19] rounded-3xl p-6 border border-gray-100 dark:border-white/5 justify-between animate-pulse"
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
          </HorizontalTrack>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            No high-salary jobs available at the moment for this category.
          </div>
        ) : (
          <HorizontalTrack onLoadMore={() => {}} hasMore={false} isLoading={loading}>
            {jobs.map((job, idx) => (
              <div 
                key={`high-${job.id}-${idx}`}
                className="w-[280px] sm:w-[320px] shrink-0 self-stretch pointer-events-auto transition-all duration-300"
              >
                <JobCard 
                  index={idx}
                  job={job} 
                  isSaved={savedJobs.includes(job.id)} 
                  onToggleSave={handleToggleSave} 
                />
              </div>
            ))}
          </HorizontalTrack>
        )}
      </div>
    </section>
  );
}