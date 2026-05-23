import React, { useEffect, useState } from "react";
import axios from "axios";
import { Heart, Search } from "lucide-react";

interface SavedJob {
  id: number;
  title: string;
  company_name: string;
  location_name: string;
  salary_min: number;
  salary_max: number;
  logo_url: string;
  job_type: string;
}

export default function SavedJobs() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // SEARCH
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:5000/api/favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const jobData = response.data.data;

      setJobs(jobData);

      // lưu id các job đã save
      setSavedJobs(jobData.map((job: SavedJob) => job.id));

    } catch (error) {
      console.error("Fetch saved jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId: number) => {
    try {
      const token = localStorage.getItem("token");

      const isSaved = savedJobs.includes(jobId);

      // BỎ LƯU
      if (isSaved) {
        await axios.delete(
          `http://127.0.0.1:5000/api/favorites/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // update UI
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));

        // xoá khỏi list
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      }

    } catch (error) {
      console.error("Save job error:", error);
    }
  };

  // FILTER SEARCH
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400">
        Loading...
      </div>
    );
  }

  // EMPTY
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">

        {/* ICON */}
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
          <Heart className="h-10 w-10 text-gray-400" />
        </div>

        {/* TEXT */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Chưa có việc làm nào được lưu
        </h2>

        <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
          Hãy nhấn vào biểu tượng trái tim ở các công việc để lưu lại và xem sau.
        </p>

        {/* BUTTON */}
        <button
          onClick={() => window.location.href = "/"}
          className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:opacity-90"
        >
          Tìm việc ngay
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Interested Jobs
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Discover and manage your saved jobs in one place. Click the heart icon to save or remove jobs from your list.
        </p>
      </div>

      {/* SEARCH + INFO BOX GỘP */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-950/30">

        {/* INFO */}

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      {/* EMPTY SEARCH */}
      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-400 dark:border-white/10">
          Không tìm thấy công việc phù hợp.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="relative bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 min-h-[140px]"
            >

              {/* HEART */}
              <button
                onClick={() => handleSaveJob(job.id)}
                className="absolute top-3 right-3 flex items-center justify-center transition-colors"
              >
                <Heart
                  size={18}
                  className={`transition-colors
                    ${
                      savedJobs.includes(job.id)
                        ? "text-rose-500 fill-rose-500"
                        : "text-gray-400 fill-none"
                    }
                  `}
                />
              </button>

              {/* APPLY BUTTON */}
              <button
                onClick={() => (window.location.href = `/job/${job.id}`)}
                className="absolute bottom-[15px] right-[15px] rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:scale-[1.02] hover:opacity-90"
              >
                Apply Now
              </button>

              {/* CONTENT */}
              <div className="flex gap-4">
                <img
                  src={job.logo_url}
                  alt={job.company_name}
                  className="w-14 h-14 rounded-xl object-cover"
                />

                <div className="flex-1 pr-28">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                    {job.title}
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    {job.company_name}
                  </p>

                  <div className="mt-2 flex gap-4 text-sm text-gray-400">
                    <span>{job.location_name}</span>
                    <span>{job.job_type}</span>
                  </div>

                  <div className="mt-2 text-emerald-500 font-semibold">
                    ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}