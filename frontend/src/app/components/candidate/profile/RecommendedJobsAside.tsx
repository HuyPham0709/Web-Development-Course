import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  ChevronRight,
  MapPin,
  Clock3,
} from 'lucide-react';

interface RecommendedJob {
  id: number;
  title: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  experience_level: string;
  company_logo: string | null;
  slug: string;
  created_at: string;
  company_name: string;
  location_name: string;
  match_score: number;
}

interface RecommendedJobsAsideProps {
  recommendedJobs?: RecommendedJob[];
  openModal: (
    type: 'personalInfo' | 'experience' | 'education' | 'skills' | null
  ) => void;
  // Thêm tuỳ chọn className để truyền class linh hoạt từ component cha
  className?: string; 
}

export function RecommendedJobsAside({
  recommendedJobs = [],
  openModal,
  className = ""
}: RecommendedJobsAsideProps) {

  // LỌC: Sắp xếp theo % match_score giảm dần và lấy tối đa 3 công việc
  const topRecommendedJobs = [...recommendedJobs]
    .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
    .slice(0, 3);

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {/* ───────────────── AI RECOMMENDED JOBS ───────────────── */}
      <div className="relative overflow-hidden rounded-[24px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[#0B1120] shadow-sm dark:shadow-none">
        
        {/* Header */}
        <div className="relative px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                AI Job Matches
              </h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Top 3 picks for you
              </p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-600 dark:text-blue-400">
            PREMIUM
          </div>
        </div>

        {/* Jobs List */}
        <div className="relative p-3 max-h-[580px] overflow-y-auto custom-scrollbar space-y-2">
          {topRecommendedJobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="w-8 h-8 mx-auto text-gray-300 mb-3" />
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No recommendations</h4>
              <p className="text-[11px] text-gray-500">Complete profile to unlock</p>
            </div>
          ) : (
            topRecommendedJobs.map((job, idx) => (
              <Link
                key={job.id || idx}
                to={`/job/${job.id}`}
                className="group relative block rounded-2xl border border-transparent bg-gray-50/50 dark:bg-white/[0.03] p-3 transition-all hover:border-blue-500/30 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-md"
              >
                <div className="flex gap-3">
                  <div className="relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white p-1.5">
                    <img
                      src={job.company_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_name || 'C')}&background=random`}
                      alt={job.company_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[13px] text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {job.company_name}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location_name || 'Remote'}</span>
                      <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" /> {job.job_type}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[12px] font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                        {job.salary_min ? `$${job.salary_min/1000}k - $${job.salary_max/1000}k` : 'Negotiable'}
                      </span>
                      
                      {job.match_score > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">{job.match_score}%</span>
                          <div className="w-12 h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                              style={{ width: `${job.match_score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}