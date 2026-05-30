import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { toast } from "sonner"
import { jobService } from "../../../services/jobService"
import { formatSalary } from "../../../utils"

export function EditJob() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        title: "",
        salary_min: "",
        salary_max: "",
        currency: "VND",
        status: "",
        description: "",
        requirements: "",
        benefit: ""
    })

    useEffect(() => {
        const fetchJobData = async () => {
            if (!id) return
            try {
                const data = await jobService.getJobById(id)
                if (data.success) {
                    const j = data.data
                    setForm({
                        title: j.title || "",
                        salary_min: j.salary_min !== null ? String(j.salary_min) : "",
                        salary_max: j.salary_max !== null ? String(j.salary_max) : "",
                        currency: j.currency || "VND",
                        status: j.status || "pending",
                        description: j.description || "",
                        requirements: j.requirements || "",
                        benefit: j.benefit || ""
                    })
                } else {
                    toast.error(data.message || "Job not found")
                    navigate("/admin/jobs")
                }
            } catch {
                toast.error("Failed to load job details")
            } finally {
                setLoading(false)
            }
        }
        fetchJobData()
    }, [id, navigate])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return
        if (!form.title.trim() || !form.description.trim()) {
            toast.error("Title and Description are required")
            return
        }

        setSaving(true)
        try {
            const payload = {
                ...form,
                salary_min: form.salary_min ? Number(form.salary_min) : 0,
                salary_max: form.salary_max ? Number(form.salary_max) : 0
            }

            const res = await jobService.updateJob(id, payload)
            if (res.success) {
                toast.success("Job updated successfully!")
                navigate(-1)
            } else {
                toast.error(res.message || "Update failed")
            }
        } catch {
            toast.error("Server connection error error")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-sm">Loading edit form...</p>
            </div>
        )
    }

    return (
        <div className="min-h-full bg-[#F8FAFC] p-8 animate-in fade-in duration-500">
            <div className="max-w-3xl mx-auto space-y-6">

                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Cancel & Go Back
                </button>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Job Posting</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Modify and moderate system job posting content.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Job Title <span className="text-rose-500">*</span></label>
                            <Input name="title" value={form.title} onChange={handleInputChange} placeholder="e.g. Senior React Developer" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Minimum Salary (Min)</label>
                                <Input type="number" name="salary_min" value={form.salary_min} onChange={handleInputChange} placeholder="e.g. 10000000" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Maximum Salary (Max)</label>
                                <Input type="number" name="salary_max" value={form.salary_max} onChange={handleInputChange} placeholder="e.g. 15000000" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Moderation Status</label>
                                <select name="status" value={form.status} onChange={handleInputChange}
                                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500">
                            Live Preview: <span className="text-indigo-600 font-bold text-sm ml-1">{formatSalary(form.salary_min, form.salary_max, form.currency)}</span>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Job Description <span className="text-rose-500">*</span></label>
                            <textarea name="description" value={form.description} onChange={handleInputChange} rows={5}
                                className="w-full p-3 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-pre-line" placeholder="Detailed job description..." required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Candidate Requirements</label>
                            <textarea name="requirements" value={form.requirements} onChange={handleInputChange} rows={4}
                                className="w-full p-3 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-pre-line" placeholder="Required degrees, skills..." />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Benefits & Perks</label>
                            <textarea name="benefit" value={form.benefit} onChange={handleInputChange} rows={4}
                                className="w-full p-3 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 whitespace-pre-line" placeholder="Insurance, bonus, company perks..." />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 shadow-sm">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}