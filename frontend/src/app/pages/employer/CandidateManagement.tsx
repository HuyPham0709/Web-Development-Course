import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, MoreVertical, Calendar, Briefcase, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../../services/applicationService';
import { Candidate } from '../../../types/application';
import { STATUSES, STATUS_LABEL, STATUS_COLORS } from '../../../constants/status';
import { getInitials, formatDateVN } from '../../../utils/format';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

// ADDED: Backend URL configuration to handle candidate avatars
const BASE_URL = 'http://localhost:5000';

const toFullUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  const cleanUrl = url.replace(/\\/g, '/');
  return `${BASE_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
};

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterJob, setFilterJob] = useState('All');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // ADDED: State to control smooth slide-up animation on page load
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    applicationService.getEmployerApplications()
      .then(res => setCandidates(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Error loading candidate list'))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ADDED: Trigger animation immediately after loading finishes
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimate(true), 60);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleStatusChange = async (application_id: number, newStatus: string) => {
    setUpdatingId(application_id);
    try {
      await applicationService.updateStatus(application_id, newStatus);
      setCandidates(prev => prev.map(c =>
        c.application_id === application_id ? { ...c, status: newStatus } : c
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const jobOptions = ['All', ...Array.from(new Set(candidates.map(c => c.job_title)))];
  const filtered = candidates.filter(c => filterJob === 'All' || c.job_title === filterJob);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center gap-2 text-gray-400 dark:bg-[#0E1422] transition-colors duration-300">
      <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" /><span className="dark:text-gray-400">Loading...</span>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-[#0E1422] transition-colors duration-300">
      <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
    </div>
  );

  // Delay array to create a stagger ripple effect for the 4 Kanban columns
  const delays = ['delay-75', 'delay-150', 'delay-200', 'delay-300'];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0E1422] py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        
        {/* 1. Header - Appears first */}
        <div className={`mb-6 transform transition-all duration-500 ease-out ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employer Dashboard</h1>
          <div className="flex space-x-8 border-b border-gray-200 dark:border-white/10 mt-6">
            <Link to="/employer/dashboard" className="border-b-2 border-transparent pb-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm transition-colors">Overview & Jobs</Link>
            <Link to="/employer/candidates" className="border-b-2 border-blue-600 dark:border-blue-500 pb-4 text-blue-600 dark:text-blue-400 font-medium text-sm transition-colors">Candidates</Link>
          </div>
        </div>

        {/* 2. Toolbar - Appears second with a slight delay */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 transform transition-all duration-500 ease-out delay-75 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="relative">
            <select value={filterJob} onChange={e => setFilterJob(e.target.value)}
              className="appearance-none bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 shadow-sm transition-colors">
              {jobOptions.map(job => <option key={job} value={job} className="dark:bg-[#0E1422]">{job}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg shrink-0 transition-colors">
            {(['kanban', 'table'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === mode ? 'bg-white dark:bg-[#0E1422] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {mode === 'kanban' ? <><LayoutGrid className="w-4 h-4" /> Board</> : <><List className="w-4 h-4" /> Table</>}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Content (Kanban or Table) */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-8">
            {STATUSES.map((status, index) => {
              const isRejected = status.toLowerCase().includes('reject') || status === 'FAILED';
              const delayClass = delays[index] || 'delay-300';

              return (
                <div 
                  key={status} 
                  className={`flex flex-col transform transition-all duration-700 ease-out ${delayClass} ${
                    animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  } ${isRejected ? 'col-span-1 md:col-span-2 lg:col-span-4 mt-4' : 'w-full'}`}
                >
                  {/* Column Title & Count Badge */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className={`font-bold text-sm uppercase tracking-wider ${isRejected ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-300'}`}>
                      {STATUS_LABEL[status]}
                    </h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isRejected ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                    }`}>
                      {filtered.filter(c => c.status === status).length}
                    </span>
                  </div>

                  {/* Container for Candidate Cards */}
                  <div className={`flex flex-col gap-4 rounded-2xl p-3 transition-colors ${
                    isRejected 
                      ? 'bg-red-50/30 dark:bg-red-950/10 border border-dashed border-red-200 dark:border-red-500/20 min-h-[180px]' 
                      : 'bg-gray-100/50 dark:bg-white/5 min-h-[450px]'
                  }`}>
                    <div className={isRejected ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-4'}>
                      {filtered.filter(c => c.status === status).map(candidate => (
                        <div key={candidate.application_id} className="bg-white dark:bg-[#0E1422] p-4 rounded-xl border border-gray-200 dark:border-white/10 dark:hover:border-white/20 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <Link to={`/employer/candidate/${candidate.application_id}`} className="flex items-center gap-3 hover:opacity-80">
                              {/* FIXED: Replaced old div block with Avatar component synchronized with Navbar */}
                              <Avatar className="w-10 h-10 border border-gray-200 dark:border-white/10 shrink-0">
                                <AvatarImage 
                                  src={toFullUrl(candidate.avatar_url || candidate.avatar)} 
                                  alt={candidate.full_name || candidate.candidate_name} 
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold text-sm">
                                  {getInitials(candidate.full_name || candidate.candidate_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  {candidate.full_name || candidate.candidate_name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{candidate.experience_level || 'N/A'}</p>
                              </div>
                            </Link>
                            <div className="relative">
                              <select value={candidate.status}
                                onChange={e => handleStatusChange(candidate.application_id, e.target.value)}
                                disabled={updatingId === candidate.application_id}
                                className="text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-md py-1 pl-2 pr-6 appearance-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500/50 cursor-pointer disabled:opacity-50 transition-colors">
                                {STATUSES.map(s => <option key={s} value={s} className="dark:bg-[#0E1422]">{STATUS_LABEL[s]}</option>)}
                              </select>
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 dark:text-gray-500 pointer-events-none" />
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              <span className="truncate">{candidate.job_title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              <span>Applied {formatDateVN(candidate.applied_at)}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between transition-colors">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${STATUS_COLORS[candidate.status] || 'dark:bg-white/5 dark:text-gray-400 dark:border-white/10'}`}>
                              {STATUS_LABEL[candidate.status]}
                            </span>
                            <button className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filtered.filter(c => c.status === status).length === 0 && (
                      <div className={`text-center text-sm py-8 border-2 border-dashed rounded-xl w-full transition-colors ${
                        isRejected 
                          ? 'border-red-200/60 dark:border-red-500/20 text-red-400 bg-white/50 dark:bg-transparent' 
                          : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500'
                      }`}>
                        No candidates found
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className={`bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden transform transition-all duration-700 ease-out delay-150 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider transition-colors">
                    <th className="px-6 py-4 font-semibold">Candidate</th>
                    <th className="px-6 py-4 font-semibold">Position</th>
                    <th className="px-6 py-4 font-semibold">Applied Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/10 text-sm">
                  {filtered.map(candidate => (
                    <tr key={candidate.application_id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/employer/candidate/${candidate.application_id}`} className="flex items-center gap-3 hover:opacity-80 group">
                          {/* FIXED: Replaced old div block with Avatar component synchronized with Navbar */}
                          <Avatar className="w-9 h-9 border border-gray-200 dark:border-white/10 shrink-0">
                            <AvatarImage 
                              src={toFullUrl(candidate.avatar_url || candidate.avatar)} 
                              alt={candidate.full_name || candidate.candidate_name} 
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold text-xs">
                              {getInitials(candidate.full_name || candidate.candidate_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {candidate.full_name || candidate.candidate_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{candidate.candidate_email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{candidate.job_title}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDateVN(candidate.applied_at)}</td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-36">
                          <select value={candidate.status}
                            onChange={e => handleStatusChange(candidate.application_id, e.target.value)}
                            disabled={updatingId === candidate.application_id}
                            className="w-full bg-white dark:bg-[#0E1422] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg py-2 pl-3 pr-8 appearance-none text-sm font-medium focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 cursor-pointer shadow-sm disabled:opacity-50 transition-colors">
                            {STATUSES.map(s => <option key={s} value={s} className="dark:bg-[#0E1422]">{STATUS_LABEL[s]}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No candidates found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}