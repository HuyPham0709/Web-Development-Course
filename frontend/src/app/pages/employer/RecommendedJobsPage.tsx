// pages/candidate/RecommendedJobsPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Sparkles, SlidersHorizontal, ChevronDown } from 'lucide-react';
import dayjs from '../../../utils/date';
import { getRecommendations } from '../../../services/recommendationService';

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

export default function RecommendedJobsPage() {
  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await getRecommendations();
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter(job => {
    if (filter === 'high') return job.match_score >= 60;
    if (filter === 'medium') return job.match_score > 0 && job.match_score < 60;
    return true;
  });

  const highCount = jobs.filter(j => j.match_score >= 60).length;
  const medCount = jobs.filter(j => j.match_score > 0 && j.match_score < 60).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1422]">
      <div className="max-w-4xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gợi ý cho bạn</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {jobs.length} công việc phù hợp với hồ sơ của bạn
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mt-6 mb-6">
          {[
            { key: 'all', label: `Tất cả (${jobs.length})` },
            { key: 'high', label: `Phù hợp cao (${highCount})` },
            { key: 'medium', label: `Có thể phù hợp (${medCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                filter === tab.key
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-white/5 rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-white/10" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/3" />
                    <div className="h-2 bg-gray-100 dark:bg-white/5 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Jobs list */}
        {!loading && (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Không có công việc phù hợp</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Hãy cập nhật tiêu chí tìm việc để nhận gợi ý tốt hơn</p>
                <Link
                  to="/profile"
                  className="inline-block mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                >
                  Cập nhật tiêu chí
                </Link>
              </div>
            ) : (
              filtered.map(job => (
                <Link
                  key={job.id}
                  to={`/job/${job.id}`}
                  className="group bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/10 p-5 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-500/30 transition-all block"
                >
                  <div className="flex gap-4">

                    {/* Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {job.company_logo
                        ? <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                        : <Briefcase className="w-5 h-5 text-gray-400" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">

                      {/* Title + Score */}
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {job.title}
                        </h2>
                        {job.match_score > 0 && (
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                            job.match_score >= 60
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                          }`}>
                            {job.match_score}%
                          </span>
                        )}
                      </div>

                      {/* Company + Location */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {job.company_name}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {job.location_name || 'Remote'}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.experience_level && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                            {job.experience_level}
                          </span>
                        )}
                        {job.job_type && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
                            {job.job_type}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {job.match_score > 0 && (
                        <div className="mt-3">
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                job.match_score >= 60 ? 'bg-emerald-500' : 'bg-yellow-400'
                              }`}
                              style={{ width: `${job.match_score}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                            {job.match_score >= 60 ? 'Phù hợp cao' : 'Có thể phù hợp'}
                          </p>
                        </div>
                      )}

                      {/* Salary + Time */}
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {job.salary_min && job.salary_max
                            ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} VNĐ`
                            : 'Thỏa thuận'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {dayjs(job.created_at).fromNow()}
                        </span>
                      </div>

                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}