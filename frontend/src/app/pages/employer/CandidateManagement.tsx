// ==========================================
// CandidateManagement.tsx  (sau khi refactor)
// ==========================================
import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, MoreVertical, Calendar, Briefcase, ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../../services/applicationService';
import { Candidate } from '../../../types/application';
import { STATUSES, STATUS_LABEL, STATUS_COLORS } from '../../../constants/status';
import { getInitials, formatDateVN } from '../../../utils/format';

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterJob, setFilterJob] = useState('Tất cả');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    applicationService.getEmployerApplications()
      .then(res => setCandidates(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Lỗi khi tải danh sách ứng viên'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (application_id: number, newStatus: string) => {
    setUpdatingId(application_id);
    try {
      await applicationService.updateStatus(application_id, newStatus);
      setCandidates(prev => prev.map(c =>
        c.application_id === application_id ? { ...c, status: newStatus } : c
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  const jobOptions = ['Tất cả', ...Array.from(new Set(candidates.map(c => c.job_title)))];
  const filtered = candidates.filter(c => filterJob === 'Tất cả' || c.job_title === filterJob);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center gap-2 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin" /><span>Đang tải...</span>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
          <div className="flex space-x-8 border-b border-gray-200 mt-6">
            <Link to="/employer/dashboard" className="border-b-2 border-transparent pb-4 text-gray-500 hover:text-gray-700 font-medium text-sm">Overview & Jobs</Link>
            <Link to="/employer/candidates" className="border-b-2 border-blue-600 pb-4 text-blue-600 font-medium text-sm">Candidates</Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="relative">
            <select value={filterJob} onChange={e => setFilterJob(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
              {jobOptions.map(job => <option key={job} value={job}>{job}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
            {(['kanban', 'table'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {mode === 'kanban' ? <><LayoutGrid className="w-4 h-4" /> Board</> : <><List className="w-4 h-4" /> Table</>}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' ? (
          <div className="flex gap-6 overflow-x-auto pb-8">
            {STATUSES.map(status => (
              <div key={status} className="w-80 min-w-[320px] flex-shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-bold text-gray-900">{STATUS_LABEL[status]}</h3>
                  <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                    {filtered.filter(c => c.status === status).length}
                  </span>
                </div>
                <div className="flex flex-col gap-4 rounded-2xl bg-gray-100/50 p-3 min-h-[500px]">
                  {filtered.filter(c => c.status === status).map(candidate => (
                    <div key={candidate.application_id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <Link to={`/employer/candidate/${candidate.application_id}`} className="flex items-center gap-3 hover:opacity-80">
                          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            {getInitials(candidate.full_name || candidate.candidate_name)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm hover:text-blue-600">
                              {candidate.full_name || candidate.candidate_name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">{candidate.experience_level || 'N/A'}</p>
                          </div>
                        </Link>
                        <div className="relative">
                          <select value={candidate.status}
                            onChange={e => handleStatusChange(candidate.application_id, e.target.value)}
                            disabled={updatingId === candidate.application_id}
                            className="text-xs bg-gray-50 border border-gray-200 text-gray-600 rounded-md py-1 pl-2 pr-6 appearance-none focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50">
                            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{candidate.job_title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Nộp {formatDateVN(candidate.applied_at)}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${STATUS_COLORS[candidate.status]}`}>
                          {STATUS_LABEL[candidate.status]}
                        </span>
                        <button className="text-gray-400 hover:text-blue-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filtered.filter(c => c.status === status).length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded-xl">
                      Không có ứng viên
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Ứng viên</th>
                    <th className="px-6 py-4 font-semibold">Vị trí</th>
                    <th className="px-6 py-4 font-semibold">Ngày nộp</th>
                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filtered.map(candidate => (
                    <tr key={candidate.application_id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <Link to={`/employer/candidate/${candidate.application_id}`} className="flex items-center gap-3 hover:opacity-80">
                          <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitials(candidate.full_name || candidate.candidate_name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 hover:text-blue-600">
                              {candidate.full_name || candidate.candidate_name}
                            </div>
                            <div className="text-xs text-gray-500">{candidate.candidate_email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{candidate.job_title}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDateVN(candidate.applied_at)}</td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-36">
                          <select value={candidate.status}
                            onChange={e => handleStatusChange(candidate.application_id, e.target.value)}
                            disabled={updatingId === candidate.application_id}
                            className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg py-2 pl-3 pr-8 appearance-none text-sm font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm disabled:opacity-50">
                            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Chưa có ứng viên nào.</td></tr>
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