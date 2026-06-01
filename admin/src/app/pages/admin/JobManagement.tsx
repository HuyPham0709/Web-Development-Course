import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search, MoreVertical, ChevronLeft, ChevronRight,
  Briefcase, CheckCircle2, Clock, XCircle, Loader2, RefreshCw, AlertTriangle, Download
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { toast } from "sonner"
import { ADMIN_JOBS_API, getHeaders } from "../../../constants"
import { formatDate, formatSalary } from "../../../utils"
import { AdminJob, JobStats, PaginationMeta } from '../../../types'
import { jobService } from "../../../services/jobService"

const STATUS_BADGE: Record<string, React.ReactElement> = {
  approved: <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">Approved</Badge>,
  pending: <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40">Pending</Badge>,
  rejected: <Badge className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40">Rejected</Badge>,
  closed: <Badge className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Closed</Badge>,
  banned: <Badge className="bg-red-100 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/40">Banned</Badge>,
}

export function JobManagement() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [stats, setStats] = useState<JobStats>({ total: 0, total_approved: 0, total_pending: 0, total_closed: 0, total_rejected: 0, total_banned: 0 })
  const [pagination, setPagination] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // State for multi-row bulk selection
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLevel, setFilterLevel] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 500)
    return () => clearTimeout(t)
  }, [searchInput])

  const fetchJobs = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (filterStatus) params.append('status', filterStatus)
      if (filterType) params.append('job_type', filterType)
      if (filterLevel) params.append('experience_level', filterLevel)
      if (search) params.append('search', search)

      const res = await fetch(`${ADMIN_JOBS_API}/all?${params}`, { headers: getHeaders() })
      const data = await res.json()

      if (data.success) {
        setJobs(data.data)
        setStats(data.stats)
        setPagination(data.pagination)
        setSelectedJobIds([])
      } else {
        setError(data.message || 'Failed to load data')
      }
    } catch {
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterType, filterLevel, search])

  useEffect(() => { fetchJobs(1) }, [fetchJobs])

  const toggleSelectAll = () => {
    if (selectedJobIds.length === jobs.length) {
      setSelectedJobIds([])
    } else {
      setSelectedJobIds(jobs.map(job => job.id))
    }
  }

  const handleDuplicate = async (jobId: number) => {
    try {
      toast.loading("Duplicating...", { id: "duplicate" })
      const data = await jobService.duplicateJob(jobId);
      if (data.success) {
        toast.success(data.message, { id: "duplicate" })
        fetchJobs(pagination.page)
      } else {
        toast.error(data.message, { id: "duplicate" })
      }
    } catch {
      toast.error("Server error", { id: "duplicate" })
    }
  }

  const toggleSelectJob = (id: number) => {
    if (selectedJobIds.includes(id)) {
      setSelectedJobIds(selectedJobIds.filter(jobId => jobId !== id))
    } else {
      setSelectedJobIds([...selectedJobIds, id])
    }
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedJobIds.length} selected job postings?`)) return

    setIsBulkDeleting(true)
    try {
      const res = await fetch(`${ADMIN_JOBS_API}/bulk-delete`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedJobIds })
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Successfully deleted ${selectedJobIds.length} job postings`)
        setSelectedJobIds([])
        fetchJobs(pagination.page)
      } else {
        toast.error(data.message || 'Bulk delete failed')
      }
    } catch {
      toast.error('Server connection error during deletion')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleDelete = async (job: AdminJob) => {
    if (!window.confirm(`Delete job "${job.title}"?`)) return
    setDeletingId(job.id)
    try {
      const res = await fetch(`${ADMIN_JOBS_API}/${job.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      const data = await res.json()
      if (data.success) {
        setJobs(prev => prev.filter(j => j.id !== job.id))
        setSelectedJobIds(prev => prev.filter(id => id !== job.id))
        toast.success('Job posting deleted successfully!')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Connection error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportCSV = async () => {
    try {
      toast.info('Preparing file for download...')
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterType) params.append('job_type', filterType)
      if (filterLevel) params.append('experience_level', filterLevel)
      if (search) params.append('search', search)

      const res = await fetch(`${ADMIN_JOBS_API}/export?${params}`, {
        headers: getHeaders()
      })

      if (!res.ok) throw new Error();

      // Read raw content as text
      const textData = await res.text();

      // Add BOM character to help Excel recognize Unicode encoding
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), textData], { type: 'text/csv;charset=utf-8;' });

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `jobs-report-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('CSV file exported successfully!')
    } catch {
      toast.error('Unable to export file at this time')
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setFilterStatus('')
    setFilterType('')
    setFilterLevel('')
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900 p-8 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Job Management</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage, moderate, and monitor all job postings across the platform.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExportCSV} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>

              <Button
                onClick={() => navigate('/jobs')}
                variant="outline"
                className="border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                <Clock className="w-4 h-4 mr-2" /> Moderation Queue
                {stats.total_pending > 0 && (
                  <span className="ml-2 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {stats.total_pending}
                  </span>
                )}
              </Button>
              <Button variant="outline" onClick={() => fetchJobs(pagination.page)} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Jobs', value: stats.total, icon: Briefcase, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
              { label: 'Active', value: stats.total_approved, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
              { label: 'Pending Review', value: stats.total_pending, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
              { label: 'Closed/Rejected/Banned', value: Number(stats.total_closed || 0) + Number(stats.total_rejected || 0) + Number(stats.total_banned || 0), icon: XCircle, color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/60' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9 h-10 bg-slate-50 dark:bg-slate-950 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 text-sm text-slate-900 dark:text-white"
              placeholder="Search by job title or company..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800">
            <option value="">Status: All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
            <option value="banned">Banned</option>
          </select>

          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800">
            <option value="">Job Type: All</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>

          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
            className="h-10 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800">
            <option value="">Experience: All</option>
            <option value="intern">Intern</option>
            <option value="fresher">Fresher</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
          </select>

          {(filterStatus || filterType || filterLevel || search) && (
            <button onClick={clearFilters} className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 transition-colors">
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-red-500">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchJobs(1)}>Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <TableRow>
                    <TableHead className="w-12 px-6">
                      <Checkbox
                        checked={jobs.length > 0 && selectedJobIds.length === jobs.length}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all jobs"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Job Info</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Location / Category</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Salary</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Tags</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Status</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Posted</TableHead>
                    <TableHead className="w-16 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-16 text-slate-400 dark:text-slate-500">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : jobs.map(job => (
                    <TableRow key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group border-slate-200 dark:border-slate-800">
                      <TableCell className="px-6 py-4">
                        <Checkbox
                          checked={selectedJobIds.includes(job.id)}
                          onCheckedChange={() => toggleSelectJob(job.id)}
                          aria-label={`Select job ${job.id}`}
                        />
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {job.title}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {job.company_name} <span className="text-slate-300 dark:text-slate-700 mx-1">•</span> #{job.id}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{job.location_name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{job.category_name}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatSalary(job.salary_min, job.salary_max, (job as any).currency)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 font-normal capitalize">
                            {job.job_type}
                          </Badge>
                          <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900 font-normal capitalize">
                            {job.experience_level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {STATUS_BADGE[job.status] || <Badge>{job.status}</Badge>}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(job.created_at)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right">
                        {deletingId === job.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-auto" />
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                              <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)} className="dark:hover:bg-slate-800">
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}/edit`)} className="dark:hover:bg-slate-800">
                                Edit Job
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(job.id)} className="dark:hover:bg-slate-800">
                                Duplicate
                              </DropdownMenuItem>
                              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                              <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/50"
                                onClick={() => handleDelete(job)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Table footer with Bulk Actions and Pagination */}
          {!loading && !error && pagination.totalPages > 0 && (
            <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">

              {/* Bulk Actions area */}
              <div className="flex-1">
                {selectedJobIds.length > 0 ? (
                  <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {selectedJobIds.length} selected
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isBulkDeleting}
                      className="h-8 bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 border-transparent shadow-none"
                      onClick={handleDeleteSelected}
                    >
                      {isBulkDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Delete selected items
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Select rows to perform bulk actions.
                  </div>
                )}
              </div>

              {/* Pagination area */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    disabled={pagination.page === 1}
                    onClick={() => fetchJobs(pagination.page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => fetchJobs(pagination.page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}