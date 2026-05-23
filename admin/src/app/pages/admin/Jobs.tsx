import React, { useState, useEffect } from "react"
import {
  CheckCircle, MapPin, DollarSign, Briefcase, GraduationCap,
  ShieldCheck, AlertTriangle, Check, Loader2, Building2, RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { PendingJob } from '../../../types'


const API_URL = 'http://localhost:5000/api/admin';

function getHeaders() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}


const QUICK_REASONS = [
  "Missing salary info",
  "Spam / Duplicate",
  "Inappropriate content",
  "Invalid application link",
  "Unverified company",
  "Suspicious salary range",
];

// Parse requirements — có thể là JSON array hoặc plain text
function parseRequirements(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch { }
  return raw.split('\n').filter(Boolean);
}

// Tạo initials từ tên công ty
function getInitials(name: string): string {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
}

export function Jobs() {
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchPendingJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/jobs/admin/pending`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      } else {
        setError(data.message || 'Lỗi khi tải dữ liệu');
      }
    } catch {
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!jobs[selectedIndex]) return;
    const currentJob = jobs[selectedIndex];

    if (action === 'reject' && !reason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối!');
      return;
    }

    setActionLoading(true);
    try {
      const endpoint = action === 'approve'
        ? `${API_URL}/jobs/admin/${currentJob.id}/approve`
        : `${API_URL}/jobs/admin/${currentJob.id}/reject`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (data.success) {
        if (action === 'approve') {
          toast.success(`Job #${currentJob.id} approved successfully.`);
        } else {
          toast.error(`Job #${currentJob.id} rejected. ${reason ? `Reason: ${reason}` : ''}`);
        }

        // Xóa job vừa duyệt ra khỏi hàng đợi
        setJobs(prev => {
          const next = prev.filter((_, i) => i !== selectedIndex);
          setSelectedIndex(0); // reset về đầu sau khi xử lý
          return next;
        });
        setReason('');
      } else {
        toast.error(data.message || 'Có lỗi xảy ra');
      }
    } catch {
      toast.error('Không thể kết nối đến máy chủ');
    } finally { // <-- Đã sửa lỗi viết sai chính tả 'finaly' tại đây
      setActionLoading(false);
    }
  };

  // ── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[600px] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-medium">Đang tải hàng đợi kiểm duyệt...</span>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────
  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center min-h-[600px] gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchPendingJobs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </button>
      </div>
    );
  }

  // ── Empty queue ───────────────────────────────────────
  if (jobs.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#F8FAFC] animate-in fade-in duration-500 p-8 min-h-[600px]">
        <div className="w-24 h-24 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Review Queue Empty</h2>
        <p className="text-slate-500 text-center font-medium max-w-sm mb-6">
          You've successfully processed all pending job applications. Great work!
        </p>
        <button
          onClick={fetchPendingJobs}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Queue
        </button>
      </div>
    );
  }

  const job = jobs[selectedIndex];
  const requirements = parseRequirements(job.requirements);
  const initials = getInitials(job.company_name);

  // Lọc ra danh sách các công việc tiếp theo (bỏ qua công việc hiện tại đang được chọn)
  const upcomingJobs = jobs.filter((_, idx) => idx !== selectedIndex);
  // Cắt mảng để chỉ lấy tối đa 3 phần tử tiếp theo hiển thị lên UI
  const displayedUpcomingJobs = upcomingJobs.slice(0, 3);
  const remainingCount = upcomingJobs.length - displayedUpcomingJobs.length;

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Moderation Queue</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Reviewing job ID: <span className="font-bold text-blue-600">#{job.id}</span>
            {' · '}{job.posted_by_email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPendingJobs}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="bg-blue-100 text-blue-700 text-sm font-bold px-4 py-2 rounded-xl">
            {jobs.length} Pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

        {/* Cột Trái: Chi tiết job */}
        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 md:p-10 flex flex-col animate-in slide-in-from-right-8 duration-500 fade-in">

          {/* Header job */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 border-b border-gray-50 pb-8 mb-8">
            <div className="flex gap-6 items-start">
              {/* Logo / initials */}
              <div className="w-20 h-20 rounded-2xl border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm bg-indigo-50 text-indigo-600 text-2xl font-black">
                {job.logo_url
                  ? <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-cover rounded-2xl" />
                  : initials
                }
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                    New Submission
                  </span>
                  <span className="bg-green-50 text-green-600 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-lg flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Pending Review
                  </span>
                  {job.company_verified === 1 && (
                    <span className="bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-lg flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Verified Company
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{job.title}</h2>
                <p className="text-lg font-bold text-gray-500">{job.company_name}</p>
                <p className="text-xs text-gray-400 mt-1">{job.category_name}</p>
              </div>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <MapPin className="w-5 h-5 text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm font-bold text-gray-900">{job.location_name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <DollarSign className="w-5 h-5 text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Salary</p>
              <p className="text-sm font-bold text-gray-900">
                {job.salary_min && job.salary_max
                  ? `${(job.salary_min / 1_000_000).toFixed(0)}M – ${(job.salary_max / 1_000_000).toFixed(0)}M`
                  : 'Thỏa thuận'
                }
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <Briefcase className="w-5 h-5 text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Job Type</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{job.job_type}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <GraduationCap className="w-5 h-5 text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Experience</p>
              <p className="text-sm font-bold text-gray-900 capitalize">{job.experience_level || 'N/A'}</p>
            </div>
          </div>

          {/* Description + Requirements */}
          <div className="space-y-10 flex-1">
            <div>
              <h4 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Job Description
              </h4>
              <div className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap text-sm">
                {job.description}
              </div>
            </div>

            {requirements.length > 0 && (
              <div>
                <h4 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Key Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm font-bold text-gray-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cột Phải: Action panel */}
        <div className="bg-[#0A0A0B] rounded-[32px] shadow-2xl p-8 lg:p-10 text-white flex flex-col relative overflow-hidden h-fit sticky top-8 animate-in slide-in-from-bottom-8 duration-500 fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-600 rounded-full opacity-10 blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex-1 flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-black mb-2">Moderation Action</h3>
              <p className="text-gray-400 text-sm font-medium">Review carefully before publishing to the live platform.</p>
            </div>

            {/* Submitted by */}
            <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Submitted by</p>
              <p className="text-sm font-bold text-white">{job.posted_by_username}</p>
              <p className="text-xs text-gray-400">{job.posted_by_email}</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              {/* Quick rejection chips */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                  Quick Rejection Notes
                </label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REASONS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setReason(chip)}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors ${reason === chip
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300'
                        }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason textarea */}
              <div className="flex-1 min-h-[120px] flex flex-col">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                  Reason Details
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full flex-1 p-5 bg-gray-800/50 border border-gray-700 rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Add specific notes or context here..."
                  rows={4}
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-4 pt-4 border-t border-gray-800">
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                >
                  {actionLoading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Check className="w-5 h-5" />
                  }
                  Approve & Publish
                </button>

                <button
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                  className="w-full py-4 bg-transparent hover:bg-red-500/10 disabled:opacity-50 border border-red-500/20 text-red-500 text-sm font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {actionLoading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <AlertTriangle className="w-5 h-5" />
                  }
                  Reject Posting
                </button>
              </div>

              {/* Up Next: Đã tối ưu chỉ hiển thị tối đa 3 items */}
              {upcomingJobs.length > 0 && (
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Up Next</p>
                  <div className="space-y-2">
                    {displayedUpcomingJobs.map((nextJob) => {
                      // Tìm vị trí gốc trong mảng `jobs` ban đầu để setSelectedIndex cho đúng
                      const originalIndex = jobs.findIndex(j => j.id === nextJob.id);
                      return (
                        <button
                          key={nextJob.id}
                          onClick={() => { setSelectedIndex(originalIndex); setReason(''); }}
                          className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-black text-gray-300 flex-shrink-0">
                            {getInitials(nextJob.company_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{nextJob.title}</p>
                            <p className="text-[11px] text-gray-400 truncate">{nextJob.company_name}</p>
                          </div>
                        </button>
                      );
                    })}

                    {/* Nếu số lượng còn lại lớn hơn 0 thì hiển thị số lượng ẩn bổ sung */}
                    {remainingCount > 0 && (
                      <p className="text-xs text-gray-500 text-center pt-1">+{remainingCount} more in queue</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}