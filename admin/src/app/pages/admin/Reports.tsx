import { useState, useEffect, useCallback } from "react"
import { AlertOctagon, MessageSquare, Trash2, MailWarning, CheckSquare, Search, Loader2, RefreshCw, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Card } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"

const API_URL = 'http://localhost:5000/api/admin'

function getHeaders() {
  const token = localStorage.getItem('admin_token')
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

interface Report {
  id: number
  reason: string
  status: 'pending' | 'resolved' | 'ignored'
  created_at: string
  job_id: number
  job_title: string
  job_status: string
  company_name: string
  reporter_id: number
  reporter_username: string
  reporter_email: string
}

interface Stats {
  total: number
  total_pending: number
  total_resolved: number
  total_ignored: number
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'destructive' as const, icon: Clock },
  resolved: { label: 'Resolved', variant: 'success' as const, icon: CheckCircle2 },
  ignored: { label: 'Ignored', variant: 'secondary' as const, icon: XCircle },
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, total_pending: 0, total_resolved: 0, total_ignored: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [actionLoading, setActionLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (search) params.append('search', search)

      const res = await fetch(`${API_URL}/reports?${params}`, { headers: getHeaders() })
      const data = await res.json()
      if (data.success) {
        setReports(data.data)
        setStats(data.stats)
        // Auto-select report đầu tiên
        if (data.data.length > 0 && !selectedReport) {
          setSelectedReport(data.data[0])
        }
      } else {
        toast.error(data.message || 'Lỗi tải dữ liệu')
      }
    } catch {
      toast.error('Không thể kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, search])

  useEffect(() => { fetchReports() }, [fetchReports])

  // Cập nhật status report
  const handleUpdateStatus = async (status: 'resolved' | 'ignored') => {
    if (!selectedReport) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/reports/${selectedReport.id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.success) {
        setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status } : r))
        setSelectedReport(prev => prev ? { ...prev, status } : prev)
        toast.success(status === 'resolved' ? 'Đã đánh dấu resolved' : 'Đã ignore report')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Lỗi kết nối')
    } finally {
      setActionLoading(false)
    }
  }

  // Xóa job
  const handleDeleteJob = async () => {
    if (!selectedReport) return
    if (!window.confirm(`Xóa tin "${selectedReport.job_title}"? Hành động này không thể hoàn tác.`)) return
    setActionLoading(true)
    try {
      const res = await fetch(`${API_URL}/reports/${selectedReport.id}/job`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      const data = await res.json()
      if (data.success) {
        setReports(prev => prev.map(r =>
          r.job_id === selectedReport.job_id
            ? { ...r, status: 'resolved', job_status: 'closed' }
            : r
        ))
        setSelectedReport(prev => prev ? { ...prev, status: 'resolved', job_status: 'closed' } : prev)
        toast.success('Đã xóa tin tuyển dụng')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Lỗi kết nối')
    } finally {
      setActionLoading(false)
    }
  }

  const FILTER_TABS = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.total_pending },
    { key: 'resolved', label: 'Resolved', count: stats.total_resolved },
    { key: 'ignored', label: 'Ignored', count: stats.total_ignored },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-8rem)] flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resolution Center</h1>
          <p className="text-slate-500 mt-1">Investigate and resolve user reports regarding jobs and companies.</p>
        </div>
        <Button variant="outline" onClick={fetchReports} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.total, color: 'text-slate-700' },
          { label: 'Pending', value: stats.total_pending, color: 'text-red-600' },
          { label: 'Resolved', value: stats.total_resolved, color: 'text-emerald-600' },
          { label: 'Ignored', value: stats.total_ignored, color: 'text-slate-400' },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Main Layout */}
      <div className="flex-1 grid md:grid-cols-3 gap-6 min-h-0">

        {/* Left — Report List */}
        <Card className="md:col-span-1 flex flex-col overflow-hidden">
          {/* Search + Filter */}
          <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Tìm theo job, reporter..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${filterStatus === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 ${filterStatus === tab.key ? 'opacity-80' : 'text-slate-400'}`}>
                      ({tab.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <AlertOctagon className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">Không có report nào</p>
              </div>
            ) : reports.map(report => {
              const cfg = STATUS_CONFIG[report.status]
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all ${selectedReport?.id === report.id
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                    : 'border-transparent hover:bg-slate-50'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <Badge variant={cfg.variant} className="text-[10px] uppercase tracking-wider">
                      {report.reason.length > 20 ? report.reason.slice(0, 20) + '…' : report.reason}
                    </Badge>
                    <span className="text-xs text-slate-400 shrink-0 ml-1">{timeAgo(report.created_at)}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm truncate">{report.job_title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500 truncate">{report.company_name}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${report.status === 'pending' ? 'bg-red-100 text-red-600' :
                      report.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                      {cfg.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Right — Detail */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden">
          {selectedReport ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-xl font-bold text-slate-900">{selectedReport.job_title}</h2>
                      <Badge variant="outline">{selectedReport.company_name}</Badge>
                      {selectedReport.job_status === 'closed' && (
                        <Badge variant="secondary">Job Closed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Report #{selectedReport.id} • {timeAgo(selectedReport.created_at)}
                    </p>
                  </div>
                  <Badge variant={STATUS_CONFIG[selectedReport.status].variant}>
                    {STATUS_CONFIG[selectedReport.status].label}
                  </Badge>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Reason */}
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-900">
                  <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <h4 className="font-semibold text-sm">Lý do báo cáo: {selectedReport.reason}</h4>
                    <p className="text-sm mt-1 opacity-80">
                      Reported by <strong>{selectedReport.reporter_username}</strong> ({selectedReport.reporter_email})
                    </p>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Job ID</p>
                    <p className="font-semibold text-slate-800">#{selectedReport.job_id}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Job Status</p>
                    <p className="font-semibold text-slate-800 capitalize">{selectedReport.job_status}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Reporter</p>
                    <p className="font-semibold text-slate-800">{selectedReport.reporter_username}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Ngày báo cáo</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(selectedReport.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-slate-400" />
                    Investigation Notes
                  </h3>
                  <textarea
                    className="w-full h-28 p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none bg-slate-50"
                    placeholder="Ghi chú nội bộ về quá trình xử lý..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center gap-3">
                <Button
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-900"
                  onClick={() => handleUpdateStatus('ignored')}
                  disabled={actionLoading || selectedReport.status === 'ignored'}
                >
                  {actionLoading
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <CheckSquare className="w-4 h-4 mr-2" />
                  }
                  Ignore Report
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => handleUpdateStatus('resolved')}
                    disabled={actionLoading || selectedReport.status === 'resolved'}
                  >
                    <MailWarning className="w-4 h-4 mr-2" /> Mark Resolved
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteJob}
                    disabled={actionLoading || selectedReport.job_status === 'closed'}
                  >
                    {actionLoading
                      ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      : <Trash2 className="w-4 h-4 mr-2" />
                    }
                    Delete Job
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <AlertOctagon className="w-12 h-12 mb-4 opacity-20" />
              <p>Chọn một report để xem chi tiết</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}