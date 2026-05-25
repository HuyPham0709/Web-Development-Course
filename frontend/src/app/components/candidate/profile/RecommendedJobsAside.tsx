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
  recommendedJobs: RecommendedJob[];
  openModal: (type: 'personalInfo' | 'experience' | 'education' | 'skills' | null) => void;
}

export function RecommendedJobsAside({ recommendedJobs, openModal }: RecommendedJobsAsideProps) {
  return (
    <aside className="hidden 2xl:block w-[340px] p-6 pl-0 flex-shrink-0 select-none">
      <div className="sticky top-6 space-y-6">
        
        {/* RECOMMENDED JOBS CARD */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm tracking-wide">Gợi ý cho bạn</h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">Công việc phù hợp hồ sơ</p>
              </div>
            </div>
            <Link 
              to="/recommended-jobs" 
              className="group/link flex items-center gap-0.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Xem tất cả
              <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-0.5" />
            </Link>
          </div>

          {/* Jobs List */}
          <div className="max-h-[620px] overflow-y-auto custom-scrollbar">
            {recommendedJobs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex items-center justify-center mb-4 shadow-sm">
                  <Briefcase className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chưa có công việc phù hợp</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
                  Hãy cập nhật hồ sơ để nhận đề xuất tốt hơn
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {recommendedJobs.slice(0, 3).map((job) => (
                  <Link 
                    key={job.id} 
                    to={`/job/${job.id}`} 
                    className="group block p-5 hover:bg-gray-50/60 dark:hover:bg-white/[0.015] border-l-4 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200"
                  >
                    <div className="flex gap-3.5">
                      {/* Logo công ty */}
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-white/5 shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {job.company_logo ? (
                          <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                        ) : (
                          <Briefcase className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>

                      {/* Thông tin công việc */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h4>
                          {job.match_score > 0 && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 tracking-wider shadow-sm border ${
                              job.match_score >= 60
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                : 'bg-amber-50 text-amber-700 border-amber-200/40 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            }`}>
                              {job.match_score}%
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1 truncate">
                          {job.company_name} <span className="mx-1 text-gray-300 dark:text-gray-700">·</span> {job.location_name || 'Remote'}
                        </p>

                        {job.experience_level && (
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50/80 border border-blue-100/30 dark:bg-blue-500/10 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold">
                              {job.experience_level}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 dark:bg-white/5 dark:border-white/5 text-gray-500 dark:text-gray-400 font-semibold">
                              {job.job_type}
                            </span>
                          </div>
                        )}

                        {job.match_score > 0 && (
                          <div className="mt-3.5">
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                  job.match_score >= 60 
                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                                    : 'bg-gradient-to-r from-amber-400 to-amber-500'
                                }`}
                                style={{ width: `${job.match_score}%` }}
                              />
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${job.match_score >= 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {job.match_score >= 60 ? 'Phù hợp cao' : 'Có thể phù hợp'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QUICK STATS / PROFILE COMPLETE */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 text-white shadow-[0_12px_30px_rgba(59,130,246,0.25)] dark:shadow-none">
          {/* Vòng tròn decor ambient nền mờ tạo chiều sâu */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10">
            <h3 className="font-extrabold text-lg tracking-wide mb-0.5">Hồ sơ của bạn</h3>
            <p className="text-xs text-blue-100/80 font-medium mb-5">Hoàn thiện hồ sơ để tăng cơ hội được tuyển dụng</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold tracking-wide mb-1.5">
                  <span className="text-blue-100">Độ hoàn thiện</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-[11px]">80%</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden shadow-inner p-[1px]">
                  <div className="h-full w-[80%] bg-white rounded-full shadow-sm transition-all duration-500" />
                </div>
              </div>
              
              <button 
                onClick={() => openModal('personalInfo')} 
                className="w-full py-3 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:bg-blue-50 hover:shadow-md active:scale-[0.98] transition-all duration-200"
              >
                Cập nhật hồ sơ
              </button>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}