import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, MapPin, Briefcase, DollarSign, Award, Loader2, CheckCircle2, XCircle, Edit } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import { jobService } from "../../../services/jobService"
import { formatSalary, formatDate } from "../../../utils"
import { AdminJob } from '../../../types'

// 🌟 Đồng bộ màu Badge trạng thái để tương thích tốt trên cả nền sáng và nền tối
const STATUS_COLOR: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50",
    pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50",
    rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50",
    closed: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
}

export function JobDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [job, setJob] = useState<AdminJob | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState<string | null>(null)

    useEffect(() => {
        const fetchJobDetail = async () => {
            if (!id || id === "management" || isNaN(Number(id))) {
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const data = await jobService.getJobById(id)
                if (data.success && data.data) {
                    setJob(data.data)
                } else {
                    toast.error(data.message || "Failed to load job details")
                    navigate("/jobs/management")
                }
            } catch {
                toast.error("Server connection error")
            } finally {
                setLoading(false)
            }
        }

        fetchJobDetail()
    }, [id, navigate])

    const handleStatusUpdate = async (action: 'approve' | 'reject') => {
        if (!job) return
        let reason = ""
        if (action === 'reject') {
            const inputReason = window.prompt("Enter rejection reason:")
            if (inputReason === null) return
            if (!inputReason.trim()) {
                toast.error("Rejection reason cannot be empty")
                return
            }
            reason = inputReason
        } else {
            if (!window.confirm("Are you sure you want to approve this job posting?")) return
        }

        setSubmitting(action)
        try {
            const res = action === 'approve'
                ? await jobService.approveJob(job.id, reason)
                : await jobService.rejectJob(job.id, reason)

            if (res.success) {
                toast.success(res.message || `Job ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
                const data = await jobService.getJobById(job.id)
                if (data.success) setJob(data.data)
            } else {
                toast.error(res.message)
            }
        } catch {
            toast.error("Action failed due to connection error")
        } finally {
            setSubmitting(null)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                <p className="text-sm">Loading job details...</p>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No job details available. <button onClick={() => navigate("/jobs/management")} className="text-indigo-600 dark:text-indigo-400 underline">Go Back</button>
            </div>
        )
    }

    return (
        // 🌟 Nền trang chính thích ứng với Dark Mode: bg-[#F8FAFC] -> dark:bg-slate-950
        <div className="min-h-full bg-slate-50 dark:bg-slate-900 p-8 animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Back button */}
                <button
                    onClick={() => navigate("/jobs/management")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </button>

                {/* Main Content Card: bg-white -> dark:bg-slate-900, border-slate-200 -> dark:border-slate-800 */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                    {/* Top banner */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{job.title}</h1>
                                <Badge variant="outline" className={`capitalize font-semibold ${STATUS_COLOR[job.status] || "bg-slate-100 dark:bg-slate-800"}`}>
                                    {job.status}
                                </Badge>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
                                {job.company_name} <span className="text-slate-300 dark:text-slate-700 mx-1.5">•</span> Job ID: #{job.id}
                            </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/jobs/${job.id}/edit`)}
                                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 dark:hover:bg-slate-700"
                            >
                                <Edit className="w-4 h-4 mr-1.5" /> Edit Job
                            </Button>
                            {job.status === 'pending' && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={submitting !== null}
                                        onClick={() => handleStatusUpdate('reject')}
                                        className="border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50"
                                    >
                                        {submitting === 'reject' ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <XCircle className="w-4 h-4 mr-1.5" />}
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={submitting !== null}
                                        onClick={() => handleStatusUpdate('approve')}
                                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
                                    >
                                        {submitting === 'approve' ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                                        Approve
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Grid Overview Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Salary Range</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatSalary(job.salary_min, job.salary_max, (job as any).currency)}</span>
                        </div>
                        <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{job.location_name}</span>
                        </div>
                        <div className="p-4 border-r border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Job Type</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{job.job_type}</span>
                        </div>
                        <div className="p-4 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Experience</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{job.experience_level || 'Not required'}</span>
                        </div>
                    </div>

                    {/* Full Descriptions */}
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Job Description</h3>
                            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800/60">
                                {job.description}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Requirements</h3>
                            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800/60">
                                {job.requirements || "No specific requirements provided."}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">Benefits & Perks</h3>
                            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800/60">
                                {job.benefit || "Standard company benefits applied."}
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Calendar className="w-3.5 h-3.5" /> Posted Date: {formatDate(job.created_at)}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}