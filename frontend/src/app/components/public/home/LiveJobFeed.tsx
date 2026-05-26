import React, { useState, useEffect, useCallback } from "react";
import { getJobs } from "../../../../services/jobService";
import { api } from "../../../../services/api"; // Chuyển axios sang api local của bạn
import { JobCard } from "./JobCard";
import { HorizontalTrack } from "./HorizontalTrack";
import { IJob } from "../../../../types/job";

const jobTabs = ["All Jobs", "Full-Time", "Contract", "Remote"];

interface LiveJobFeedProps {
  titleFilter: string;
  locationFilter: string;
  categoryFilter: string;
}

export function LiveJobFeed({ titleFilter, locationFilter, categoryFilter }: LiveJobFeedProps) {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [activeTab, setActiveTab] = useState("All Jobs");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  
  // States cho Infinite Scroll
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 1. Reset feed khi Filters hoặc Tab thay đổi
  useEffect(() => {
    setJobs([]);
    setPage(1);
    setHasMore(true);
  }, [titleFilter, locationFilter, categoryFilter, activeTab]);

  // 2. Load Jobs logic
  useEffect(() => {
    const fetchJobs = async () => {
      if (!hasMore || loading) return;
      
      setLoading(true);
      try {
        let typeParam = "";
        if (activeTab === "Full-Time") typeParam = "full-time";
        if (activeTab === "Contract") typeParam = "contract";
        if (activeTab === "Remote") typeParam = "remote";

        const response = await getJobs({
          title: titleFilter,
          location: locationFilter,
          category_id: categoryFilter,
          type: typeParam,
          status: "approved",
          page: page,
          limit: 9, // Số lượng load mỗi lần
        });
        
        const approvedJobs = response.data.filter((job: IJob) => job.status === "approved");
        
        setJobs(prev => page === 1 ? approvedJobs : [...prev, ...approvedJobs]);
        
        // Kiểm tra xem còn data để load không (Phụ thuộc vào backend của bạn)
        // Nếu backend chưa hỗ trợ trả về meta.hasMore, ta có thể check bằng cách:
        const hasNext = response.meta?.hasMore ?? (approvedJobs.length === 9); 
        setHasMore(hasNext);
        
      } catch (error) {
        console.error("Error loading job list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, titleFilter, locationFilter, categoryFilter, activeTab]);

  // 3. Load Saved Jobs (Thay axios bằng config api của bạn)
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const res = await api.get("/api/favorites"); // Api interceptor tự đính kèm token
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

  // 4. Handle Save Toggle
  const handleToggleSave = useCallback(async (jobId: number) => {
    try {
      const isSaved = savedJobs.includes(jobId);
      if (isSaved) {
        await api.delete(`/api/favorites/${jobId}`);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        await api.post(`/api/favorites/${jobId}`, {});
        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (err) {
      console.error("Save job error:", err);
    }
  }, [savedJobs]);

  const loadMoreJobs = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  return (
    <section className="w-full bg-white py-20 relative transition-colors duration-300 dark:bg-[#0B0F19]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 dark:opacity-10 dark:bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]"></div>
      
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 dark:bg-blue-950/40 dark:border-blue-900/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
              </span>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Live Feed Updated Just Now</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Featured AI-Matched Openings</h2>
          </div>
          
          <div className="flex space-x-2 rounded-2xl border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/5">
            {jobTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? "bg-white text-blue-600 shadow-sm border border-gray-100 dark:bg-blue-600 dark:text-white dark:border-transparent" 
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {jobs.length === 0 && !loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">No jobs matched your filter criteria.</div>
        ) : (
          <HorizontalTrack onLoadMore={loadMoreJobs} hasMore={hasMore} isLoading={loading}>
            {jobs.map((job, idx) => (
              <div 
                key={`${job.id}-${idx}`}
                // ĐIỀU CHỈNH: Giảm width xuống 320px (hoặc 340px tuỳ ý thích)
                // Đảm bảo chiều cao các thẻ bằng nhau (self-stretch)
                className="w-[280px] sm:w-[320px] shrink-0 snap-start self-stretch pointer-events-auto"
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