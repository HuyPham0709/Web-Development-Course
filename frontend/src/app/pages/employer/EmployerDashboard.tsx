import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Users, MessageSquare, Eye, Plus, MoreVertical, MapPin, Clock, Loader2, Pencil, Trash2, XCircle, RefreshCw, AlertCircle, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../../../services/applicationService';
import { Job, Stats } from '../../../types/application';
import { timeAgo, formatSalary } from '../../../utils/format';

// ── Rejection Reason Modal ──────────────────────────────────────────────────
function RejectionModal({ reason, onClose }: { reason: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#151D30] rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Rejection Reason
          </h2>
          <button onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
            ✕
          </button>
        </div>
        <div className="px-6 py-5">
          {reason
            ? <p className="text-slate-700 dark:text-gray-300 leading-relaxed">{reason}</p>
            : <p className="text-slate-400 dark:text-gray-500 italic">The admin did not provide a specific reason.</p>
          }
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0E1422]/40">
          <button onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 font-medium rounded-lg text-sm transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}



export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({ total_jobs: 0, total_applications: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [rejectionModal, setRejectionModal] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applicationService.getEmployerJobs()
      .then(res => {
        setJobs(res.data.data || []);
        setStats(res.data.stats || { total_jobs: 0, total_applications: 0 });
      })
      .catch(err => setError(err.response?.data?.message || 'Error loading data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimate(true), 60);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggleJobStatus = async (job_id: number) => {
    setTogglingId(job_id);
    setOpenMenuId(null);
    try {
      const res = await applicationService.toggleJobStatus(job_id);
      setJobs(prev => prev.map(j => j.id === job_id ? { ...j, status: res.data.new_status } : j));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteJob = async (job_id: number) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    setOpenMenuId(null);
    try {
      await applicationService.deleteJob(job_id);
      setJobs(prev => prev.filter(j => j.id !== job_id));
      setStats(prev => ({ ...prev, total_jobs: prev.total_jobs - 1 }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting job posting');
    }
  };

  const getActions = (job: Job) => {
    switch (job.status) {
      case 'pending':
        return [
          {
            label: 'Edit job',
            icon: <Pencil className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
            onClick: () => { setOpenMenuId(null); navigate(`/employer/jobs/edit/${job.id}`); },
          },
          {
            label: 'Delete job',
            icon: <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />,
            danger: true,
            onClick: () => handleDeleteJob(job.id),
          },
        ];
      case 'approved':
        return [
          {
            label: 'Close job',
            icon: <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />,
            danger: true,
            onClick: () => handleToggleJobStatus(job.id),
          },
        ];
      case 'closed':
        return [
          {
            label: 'Reopen job',
            icon: <RefreshCw className="w-4 h-4 text-green-500 dark:text-green-400" />,
            onClick: () => handleToggleJobStatus(job.id),
          },
        ];
      case 'rejected':
        return [
          {
            label: 'View rejection reason',
            icon: <AlertCircle className="w-4 h-4 text-orange-500 dark:text-orange-400" />,
            onClick: () => { setOpenMenuId(null); setRejectionModal(job.rejection_reason || ''); },
          },
          {
            label: 'Edit & resubmit',
            icon: <Pencil className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
            onClick: () => { setOpenMenuId(null); navigate(`/employer/jobs/edit/${job.id}`); },
          },
        ];
      case 'banned':
        return [
          {
            label: 'View ban reason',
            icon: <AlertCircle className="w-4 h-4 text-red-500" />,
            onClick: () => { setOpenMenuId(null); setRejectionModal('Your job was banned due to violation reports from users.'); }
          },
          {
            label: 'Delete job',
            icon: <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />,
            danger: true,
            onClick: () => handleDeleteJob(job.id),
          },
        ]; // Không có action nào
      default:
        return [];
    }
  };

  const STATUS_CONFIG: Record<string, { label: string; dotColor: string; badgeClass: string }> = {
    approved: { label: 'Open', dotColor: 'bg-green-500', badgeClass: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-500/20' },
    pending: { label: 'Pending', dotColor: 'bg-yellow-400', badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-500/20' },
    closed: { label: 'Closed', dotColor: 'bg-gray-400', badgeClass: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-400 dark:border-white/5' },
    rejected: { label: 'Rejected', dotColor: 'bg-red-400', badgeClass: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-500/20' },
    banned: {
      label: 'Banned',
      dotColor: 'bg-red-600',
      badgeClass: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-500/20'
    },
  };

  const STATS_DISPLAY = [
    { id: 1, label: 'Total Jobs', value: String(stats.total_jobs), icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { id: 2, label: 'Active Applications', value: String(stats.total_applications), icon: Users, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40' },
    { id: 3, label: 'New Messages', value: '0', icon: MessageSquare, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { id: 4, label: 'Total Views', value: '—', icon: Eye, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40' },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-blue-600 dark:text-blue-400 dark:bg-[#0E1422] transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-gray-400 text-sm">Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0E1422] py-8 relative transition-colors duration-300">
      {rejectionModal !== null && (
        <RejectionModal reason={rejectionModal} onClose={() => setRejectionModal(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transform transition-all duration-500 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Employer Dashboard</h1>
            <div className="flex space-x-8 border-b border-gray-200 dark:border-white/10 mt-6">
              <Link to="/employer/dashboard" className="border-b-2 border-blue-600 dark:border-blue-400 pb-4 text-blue-600 dark:text-blue-400 font-medium text-sm transition-colors">
                Overview & Jobs
              </Link>
              <Link to="/employer/candidates" className="border-b-2 border-transparent pb-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium text-sm transition-colors">
                Candidates
              </Link>
            </div>
          </div>
          <button onClick={() => navigate('/employer/jobs/new')}
            className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm self-start mt-2">
            <Plus className="w-5 h-5" /> Post a New Job
          </button>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 transform transition-all duration-500 ease-out delay-75 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {STATS_DISPLAY.map(stat => (
            <div key={stat.id} className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4 transition-colors">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Job Postings */}
        <div className={`bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden mb-24 sm:mb-8 transform transition-all duration-500 ease-out delay-150 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Job Postings</h2>
            <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">View All</button>
          </div>

          {error ? (
            <div className="text-center py-16 text-red-500 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-[#0E1422]/40 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                    <th className="px-6 py-4 font-semibold">Job Title</th>
                    <th className="px-6 py-4 font-semibold">Salary</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Applications</th>
                    <th className="px-6 py-4 font-semibold">Posted</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                        No job postings available.
                      </td>
                    </tr>
                  ) : jobs.map(job => {
                    const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG['pending'];
                    const actions = getActions(job);
                    const salary = formatSalary(job.salary_min, job.salary_max, job.currency);

                    return (
                      <tr key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white mb-1">{job.title}</div>
                          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-xs">
                            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.job_type}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location_name || 'N/A'}</span>
                          </div>
                        </td>

                        {/* 🛠️ SALARY CONFIG: Returns {salary} directly, no manual "M" suffix added */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {formatSalary(job.salary_min, job.salary_max, job.currency)}
                        </td>

                        {/* 🛠️ REJECTION REASON CONFIG: Click directly on "Rejected" label to view reason quickly */}
                        <td className="px-6 py-4">
                          <span
                            onClick={() => {
                              if (job.status === 'rejected') {
                                setRejectionModal(job.rejection_reason || '');
                              }
                            }}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors 
                              ${cfg.badgeClass} ${job.status === 'rejected' ? 'cursor-pointer hover:brightness-95 dark:hover:brightness-110' : ''}`}
                            title={job.status === 'rejected' ? 'Click to view rejection reason' : undefined}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dotColor}`} />
                            {cfg.label}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{job.application_count || 0}</span>
                            {Number(job.application_count) > 0 && job.status === 'approved' && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">New</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            {timeAgo(job.created_at)}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block" ref={openMenuId === job.id ? menuRef : null}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                              disabled={togglingId === job.id}
                            >
                              {togglingId === job.id
                                ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                : <MoreVertical className="w-5 h-5" />
                              }
                            </button>

                            {openMenuId === job.id && actions.length > 0 && (
                              <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#151D30] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-20 overflow-hidden py-1">
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#0E1422]/40">
                                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                                    Status: {cfg.label}
                                  </span>
                                </div>
                                {actions.map((action, idx) => (
                                  <button key={idx} onClick={action.onClick}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors
                                      ${action.danger
                                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                      }`}>
                                    {action.icon}
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <button onClick={() => navigate('/employer/jobs/new')}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.3)] dark:shadow-[0_8px_20px_rgba(59,130,246,0.2)] transition-transform hover:scale-105 active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}