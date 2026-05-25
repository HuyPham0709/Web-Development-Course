import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, ChevronRight } from 'lucide-react';

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
  recommendedJobs?: RecommendedJob[]; // Cho phép undefined
  openModal: (type: 'personalInfo' | 'experience' | 'education' | 'skills' | null) => void;
}

// LƯU Ý KỸ THUẬT: Gán default value recommendedJobs = [] để chống crash app khi data chưa load kịp hoặc API lỗi
export function RecommendedJobsAside({ recommendedJobs = [], openModal }: RecommendedJobsAsideProps) {
  return (
    <aside className="hidden xl:block w-[360px] p-6 pl-0 flex-shrink-0 sticky top-24 self-start">
      <div className="space-y-6">
        
        {/* RECOMMENDED JOBS PANEL */}
        <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl shadow-gray-100/40 dark:shadow-none overflow-hidden relative group/panel transition-all duration-300">
          {/* Top Decorative Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70"></div>
          
          {/* Header */}
          <div className="px-5 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl text-blue-500 dark:text-blue-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white">
                AI Match For You
              </h3>
            </div>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full">
              Smart AI
            </span>
          </div>

          {/* Job Items List */}
          <div className="p-4 space-y-3.5 max-h-[480px] overflow-y-auto custom-scrollbar">
            {/* Sử dụng ?.length an toàn */}
            {!recommendedJobs || recommendedJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500 space-y-2">
                <Briefcase className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs italic font-medium">No recommendations found.</p>
              </div>
            ) : (
              recommendedJobs.map((job, idx) => (
                <Link
                  key={job.id || idx}
                  to={`/job/${job.id}`}
                  className="block p-3.5 bg-gray-50/50 dark:bg-[#0E1322]/40 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-500/30 dark:hover:border-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:bg-white dark:hover:bg-[#121829] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_0_25px_rgba(147,51,234,0.15)] group"
                >
                  <div className="flex items-start gap-3">
                    {/* Company Logo Container */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white p-1 flex-shrink-0 transition-transform group-hover:scale-105">
                      <img
                        src={job.company_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_name || 'C')}&background=random`}
                        alt={job.company_name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Meta Info */}
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {job.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                        {job.company_name}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {job.salary_min && job.salary_max
                            ? `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k`
                            : 'Negotiable'}
                        </span>
                        
                        {job.match_score > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md">
                              {job.match_score}% Match
                            </span>
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

        {/* PROFILE COMPLETION BANNER */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          
          <h3 className="font-extrabold text-base tracking-tight mb-1">Optimize Your Profile</h3>
          <p className="text-xs text-blue-100/90 mb-5 leading-relaxed">
            Complete your profile mapping parameters to achieve maximum AI matching performance.
          </p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-blue-100">Profile Strength</span>
                <span>80%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-[80%] bg-white rounded-full transition-all duration-1000" />
              </div>
            </div>
            
            <button 
              onClick={() => openModal('personalInfo')} 
              className="w-full py-3 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5 shadow-md hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            >
              Update Profile <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}