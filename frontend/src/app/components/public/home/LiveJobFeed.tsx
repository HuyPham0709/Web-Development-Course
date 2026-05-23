import React, { useState, useEffect } from "react";
import { ShieldCheck, MapPin, Heart, Zap, Clock } from "lucide-react";
import { motion } from "motion/react";
import { getJobs } from "../../../../services/jobService";
import { useNavigate } from "react-router-dom"; // BỔ SUNG: Import useNavigate để điều hướng trang
import axios from "axios";

const jobTabs = ["All Jobs", "Full-Time", "Contract", "Remote"];

interface LiveJobFeedProps {
  titleFilter: string;
  locationFilter: string;
  categoryFilter: string;
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return "Recently posted";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 60) {
    return diffInMins <= 1 ? "Just now" : `${diffInMins} mins ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }
  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function LiveJobFeed({ titleFilter, locationFilter, categoryFilter }: LiveJobFeedProps) {
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("All Jobs");
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const navigate = useNavigate(); // BỔ SUNG: Khởi tạo hook điều hướng


  useEffect(() => {
    const fetchFilteredJobs = async () => {
      setLoading(true);
      try {
        let typeParam = "";
        if (activeTab === "Full-Time") typeParam = "full-time";
        if (activeTab === "Contract") typeParam = "contract";
        if (activeTab === "Remote") typeParam = "remote";

        const data = await getJobs({
          title: titleFilter,
          location: locationFilter,
          category_id: categoryFilter,
          type: typeParam
        });
        setJobs(data);
      } catch (error) {
        console.error("Lỗi nạp danh sách công việc:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredJobs();
  }, [titleFilter, locationFilter, categoryFilter, activeTab]);

  useEffect(() => {
  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://127.0.0.1:5000/api/favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedIds = res.data.data.map((job: any) => job.id);

      setSavedJobs(savedIds);

    } catch (err) {
      console.error("Fetch saved jobs error:", err);
    }
  };

  fetchSavedJobs();
}, []);
const handleSaveJob = async (jobId: number) => {
  try {
    const token = localStorage.getItem("token");

    const isSaved = savedJobs.includes(jobId);

    if (isSaved) {
      await axios.delete(
        `http://127.0.0.1:5000/api/favorites/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSavedJobs((prev) =>
        prev.filter((id) => id !== jobId)
      );

    } else {
      await axios.post(
        `http://127.0.0.1:5000/api/favorites/${jobId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSavedJobs((prev) => [...prev, jobId]);
    }

  } catch (err) {
    console.error("Save job error:", err);
  }
};
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
            {jobTabs.map((tab, idx) => (
              <button
                key={idx}
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

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">Loading matching openings...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">No jobs matched your filter criteria.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job: any, idx) => {
              const companyName = job.Company?.name || job.company_name || "Company";
              const companyLogo = job.Company?.logo_url || job.logo_url || "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e";
              const isVerified = job.Company?.is_verified ?? job.is_verified ?? false;
              const locationName = job.Location?.name || job.location_name || job.location || "Remote";
              
              const jobType = job.job_type || job.type || "Full-time";
              const experience = job.experience_level || job.experience || "Not specified";

              const formattedSalary = job.salary_min && job.salary_max
                ? `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k`
                : "Negotiable";

              let skillList: string[] = ["Tech"];
              if (Array.isArray(job.Skills)) {
                skillList = job.Skills.map((s: any) => s.name);
              } else if (Array.isArray(job.skills)) {
                skillList = job.skills.map((s: any) => s.name || s);
              } else if (typeof job.skills === "string") {
                skillList = job.skills.split(",").map((s: string) => s.trim());
              }

              return (
                <motion.div
                  key={job.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/30"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img src={companyLogo} alt={companyName} className="h-12 w-12 rounded-full border border-gray-100 object-cover dark:border-white/10" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{companyName}</h4>
                          {isVerified && <ShieldCheck size={16} className="text-emerald-500" />}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(job.created_at)}
                        </span>
                      </div>
                    </div>
                    <button
  onClick={() => handleSaveJob(job.id)}
  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors
    ${
      savedJobs.includes(job.id)
        ? "border-rose-200 bg-rose-50 text-rose-500 dark:bg-rose-950/40"
        : "border-gray-200 bg-gray-50 text-gray-400 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 dark:border-white/10 dark:bg-white/5"
    }
  `}
>
  <Heart
    size={18}
    fill={savedJobs.includes(job.id) ? "currentColor" : "none"}
  />
</button>
                  </div>

                  <div className="mb-6">
                    {/* BỔ SUNG: Thêm onClick và cursor-pointer để bấm vào tiêu đề cũng xem được chi tiết */}
                    <h3 
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors dark:text-white dark:group-hover:text-blue-400"
                    >
                      {job.title}
                    </h3>
                    <div className="mb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        <span className="capitalize">{locationName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span className="capitalize">{jobType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 capitalize dark:bg-white/10 dark:text-gray-300">{jobType}</span>
                      <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 capitalize dark:bg-white/10 dark:text-gray-300">{experience}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="mb-6">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Estimated Salary</p>
                      <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{formattedSalary}</p>
                    </div>
                    <div className="mb-8 flex flex-wrap gap-2">
                      {skillList.map((skill: string, sIdx: number) => (
                        <span key={sIdx} className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 dark:border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-300">
                          {skill
                        }</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* BỔ SUNG: Thêm onClick xử lý điều hướng chuyển sang trang JobDetail */}
                      <button 
                        onClick={() => navigate(`/job/${job.id}`)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <Zap size={18} />
                        Quick Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
            View All Jobs
          </button>
        </div>
      </div>
    </section>
  );
}