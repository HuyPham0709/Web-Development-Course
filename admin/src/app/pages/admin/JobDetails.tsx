import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, MapPin, Briefcase, DollarSign, Award, Loader2, CheckCircle2, XCircle, Edit } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import { jobService } from "../../../services/jobService"
import { formatSalary, formatDate } from "../../../utils"
import { AdminJob } from '../../../types'

const STATUS_COLOR: Record<string, string> = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    closed: "bg-slate-100 text-slate-600 border-slate-200",
}

export function JobDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [job, setJob] = useState<AdminJob | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState<string | null>(null)

    useEffect(() => {
        const fetchJobDetail = async () => {
            // Nếu id là "management" hoặc không hợp lệ, không thực hiện gọi API để tránh lỗi crash
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
                // Tự load lại dữ liệu mới nhất
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

    // Khối bảo vệ 1: Hiển thị màn hình Loading trong lúc chờ API phản hồi
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm">Loading job details...</p>
            </div>
        )
    }

    // Khối bảo vệ 2: Nếu không có dữ liệu job (hoặc lỗi ID), không render giao diện chính để tránh lỗi sập 'status'
    if (!job) {
        return (
            <div className="p-8 text-center text-slate-500 text-sm">
                No job details available. <button onClick={() => navigate("/jobs/management")} className="text-indigo-600 underline">Go Back</button>
            </div>
        )
    }

    return (
        <div className="min-h-full bg-[#F8FAFC] p-8 animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Back button */}
                <button
                    onClick={() => navigate("/jobs/management")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </button>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Top banner */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
                                <Badge variant="outline" className={`capitalize font-semibold ${STATUS_COLOR[job.status] || "bg-slate-100"}`}>
                                    {job.status}
                                </Badge>
                            </div>
                            <p className="text-slate-500 mt-1 font-medium text-sm">
                                {job.company_name} <span className="text-slate-300 mx-1.5">•</span> Job ID: #{job.id}
                            </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/jobs/${job.id}/edit`)}
                                className="border-slate-200 text-slate-700 bg-white"
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
                                        className="border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
                                    >
                                        {submitting === 'reject' ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <XCircle className="w-4 h-4 mr-1.5" />}
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={submitting !== null}
                                        onClick={() => handleStatusUpdate('approve')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        {submitting === 'approve' ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                                        Approve
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Grid Overview Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 bg-white">
                        <div className="p-4 border-r border-slate-100 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Salary Range</span>
                            <span className="text-sm font-semibold text-slate-800">{formatSalary(job.salary_min, job.salary_max, (job as any).currency)}</span>
                        </div>
                        <div className="p-4 border-r border-slate-100 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
                            <span className="text-sm font-semibold text-slate-800">{job.location_name}</span>
                        </div>
                        <div className="p-4 border-r border-slate-100 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Job Type</span>
                            <span className="text-sm font-semibold text-slate-800 capitalize">{job.job_type}</span>
                        </div>
                        <div className="p-4 flex flex-col gap-1">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Experience</span>
                            <span className="text-sm font-semibold text-slate-800 capitalize">{job.experience_level || 'Not required'}</span>
                        </div>
                    </div>

                    {/* Full Descriptions */}
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Job Description</h3>
                            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                {job.description}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Requirements</h3>
                            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                {job.requirements || "No specific requirements provided."}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Benefits & Perks</h3>
                            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                {job.benefit || "Standard company benefits applied."}
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-4 border-t border-slate-100">
                            <Calendar className="w-3.5 h-3.5" /> Posted Date: {formatDate(job.created_at)}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}