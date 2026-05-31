// ==========================================
// JobForm.tsx — Fixed & Unified (Post Job + Edit Job + Skills with Array of Strings)
// ==========================================
import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { formatSalary } from "../../../utils/format";

// Ensure this URL targets your correct Backend port 5000
const BACKEND_URL = "http://localhost:5000/api";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: number; name: string; }
interface Location { id: number; name: string; }
// Không cần interface Skill nữa vì API skill hiện tại trả về mảng chuỗi string[]

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium
        ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      {type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full px-4 py-2.5 rounded-lg border transition-colors bg-white dark:bg-[#151D30] 
   text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500
   focus:outline-none focus:ring-2
   ${hasError ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-slate-300 dark:border-white/10 focus:ring-blue-500/20 focus:border-blue-500"}`;

const selectClass = (hasError?: boolean) =>
  `w-full px-4 py-2.5 rounded-lg border transition-colors appearance-none cursor-pointer
   bg-white dark:bg-[#151D30] text-slate-700 dark:text-gray-200
   focus:outline-none focus:ring-2
   ${hasError ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-slate-300 dark:border-white/10 focus:ring-blue-500/20 focus:border-blue-500"}`;

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichTextEditor({
  label, required, placeholder, value, onChange, error,
}: {
  label: string; required?: boolean; placeholder?: string; value: string; onChange: (val: string) => void; error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`border rounded-lg overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 bg-white dark:bg-[#151D30] ${error ? "border-red-400" : "border-slate-300 dark:border-white/10"}`}>
        <div className="bg-slate-50 dark:bg-[#0E1422]/60 border-b border-slate-300 dark:border-white/5 px-3 py-2 flex items-center gap-2 text-slate-600 dark:text-gray-400 transition-colors">
          {["B", "I", "U"].map((t) => (
            <button key={t} type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded w-7 h-7 flex items-center justify-center dark:hover:text-white text-sm font-bold">{t}</button>
          ))}
          <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
          <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded flex flex-col items-center justify-center gap-[2px] w-7 h-7 dark:hover:text-white">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-current" />
                <span className="w-3 h-[2px] bg-current" />
              </div>
            ))}
          </button>
        </div>
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none resize-y min-h-[100px]" placeholder={placeholder} />
      </div>
      {error && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────
interface FormState {
  title: string;
  category_id: string;
  location_id: string;
  job_type: string;
  experience_level: string;
  salary_min: string;
  salary_max: string;
  currency: string;
  description: string;
  requirements: string;
  benefits: string;
  skills: string[]; // <-- Đổi thành mảng chuỗi (VD: ['React', 'NodeJS'])
}

const defaultForm: FormState = {
  title: "",
  category_id: "",
  location_id: "",
  job_type: "full-time",
  experience_level: "",
  salary_min: "",
  salary_max: "",
  currency: "VND",
  description: "",
  requirements: "",
  benefits: "",
  skills: [], // <-- Khởi tạo mảng rỗng
};

export function JobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]); // <-- Chứa danh sách skill string[] từ API
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [animate, setAnimate] = useState(false);

  // 1. Load categories, locations, skills từ Backend
  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND_URL}/categories`).then((r) => r.json()),
      fetch(`${BACKEND_URL}/locations`).then((r) => r.json()),
      fetch(`${BACKEND_URL}/skills`).then((r) => r.json()),
    ])
      .then(([catData, locData, skillData]) => {
        setCategories(catData.data || []);
        setLocations(locData.data || []);
        setAvailableSkills(skillData.data || []); // <-- skillData.data hiện là ['React', 'NodeJS', ...]
      })
      .catch(console.error)
      .finally(() => setLoadingMeta(false));
  }, []);

  // 2. Load thông tin Job nếu ở chế độ Edit
  useEffect(() => {
    if (isEditMode) {
      fetch(`${BACKEND_URL}/jobs/${id}`, { headers: getHeaders() })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data) {
            const job = resData.data;

            // Backend đang trả về GROUP_CONCAT dạng chuỗi, VD: "React,NodeJS"
            const jobSkillsArray = job.skills ? job.skills.split(',').filter(Boolean) : [];

            setForm({
              title: job.title || "",
              category_id: String(job.category_id || ""),
              location_id: String(job.location_id || ""),
              job_type: job.job_type || "full-time",
              experience_level: job.experience_level || "",
              salary_min: job.salary_min !== null && job.salary_min !== undefined ? String(job.salary_min) : "",
              salary_max: job.salary_max !== null && job.salary_max !== undefined ? String(job.salary_max) : "",
              currency: job.currency || "VND",
              description: job.description || "",
              requirements: job.requirements || "",
              benefits: job.benefits || "",
              skills: jobSkillsArray, // <-- Gán mảng chuỗi kỹ năng
            });
          } else {
            showToast("error", "Job posting data not found!");
          }
        })
        .catch(() => showToast("error", "Error fetching previous job information"));
    }
  }, [id, isEditMode]);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, []);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const setRich = (field: keyof FormState) => (val: string) => setForm((f) => ({ ...f, [field]: val }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Required";
    if (!form.category_id) e.category_id = "Required";
    if (!form.location_id) e.location_id = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.requirements.trim()) e.requirements = "Required";
    if (form.skills.length === 0) e.skills = "Please select at least one skill"; // <-- Validate mảng skills

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // 3. Submit Data
  const handleSubmit = async () => {
    if (!validate()) {
      showToast("error", "Please fill in all required fields!");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditMode ? `${BACKEND_URL}/jobs/${id}` : `${BACKEND_URL}/jobs/create`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify({
          ...form,
          category_id: Number(form.category_id),
          location_id: Number(form.location_id),
          salary_min: Number(form.salary_min) || 0,
          salary_max: Number(form.salary_max) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", isEditMode ? "Job updated successfully!" : "Job posted successfully! Pending review.");
        setTimeout(() => navigate("/employer/dashboard"), 1500);
      } else {
        showToast("error", data.message || "An error occurred");
      }
    } catch {
      showToast("error", "Cannot connect to the server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0E1422] py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 transform transition-all duration-500 ease-out ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-gray-400 dark:hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isEditMode ? "Edit Job Posting" : "Post a Job"}
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
                {isEditMode ? "Update the necessary information for this job posting." : "Fill in all the fields to create a new listing."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-slate-600 dark:text-gray-400 font-medium hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-sm">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={submitting} className="px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm shadow-sm disabled:opacity-50">
              <Send className="w-4 h-4" /> {submitting ? "Submitting..." : isEditMode ? "Update Job" : "Post Job"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`bg-white dark:bg-white/5 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden transform transition-all duration-500 ease-out delay-75 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="p-6 md:p-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Job Title" required error={errors.title}>
                <input type="text" value={form.title} onChange={set("title")} className={inputClass(!!errors.title)} placeholder="e.g., Senior Frontend Developer" />
              </Field>

              <Field label="Category" required error={errors.category_id}>
                <select value={form.category_id} onChange={set("category_id")} disabled={loadingMeta} className={selectClass(!!errors.category_id) + " disabled:opacity-60"}>
                  <option value="">{loadingMeta ? "Loading..." : "Select Category"}</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>

              <Field label="Location" required error={errors.location_id}>
                <select value={form.location_id} onChange={set("location_id")} disabled={loadingMeta} className={selectClass(!!errors.location_id) + " disabled:opacity-60"}>
                  <option value="">{loadingMeta ? "Loading..." : "Select Location"}</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </Field>

              <Field label="Job Type" required>
                <select value={form.job_type} onChange={set("job_type")} className={selectClass()}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </Field>

              <Field label="Experience Level" required error={errors.experience_level}>
                <select value={form.experience_level} onChange={set("experience_level")} className={selectClass(!!errors.experience_level)}>
                  <option value="">Select Level</option>
                  <option value="intern">Intern</option>
                  <option value="fresher">Fresher</option>
                  <option value="junior">Junior</option>
                  <option value="middle">Middle</option>
                  <option value="senior">Senior</option>
                </select>
              </Field>

              <Field label="Salary Range">
                <div className="flex items-center gap-2">
                  <input type="number" value={form.salary_min} onChange={set("salary_min")} className={inputClass()} placeholder="Min" />
                  <span className="text-slate-500 dark:text-gray-400 flex-shrink-0">–</span>
                  <input type="number" value={form.salary_max} onChange={set("salary_max")} className={inputClass()} placeholder="Max" />
                  <span className="w-24 px-3 py-2.5 text-center rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#151D30] text-slate-500 dark:text-gray-400 text-sm flex-shrink-0">
                    USD
                  </span>
                </div>
                {form.salary_min.length > 0 && form.salary_max.length > 0 && (
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 font-medium">
                    Preview: <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {formatSalary(form.salary_min, form.salary_max)}
                    </span>
                  </p>
                )}
              </Field>

              {/* Giao diện chọn Skills được sửa lại theo mảng chuỗi */}
              <div className="md:col-span-2">
                <Field label="Required Skills" required error={errors.skills}>
                  <div className={`flex flex-wrap gap-2 p-3 bg-white dark:bg-[#151D30] border rounded-lg h-32 overflow-y-auto ${errors.skills ? 'border-red-400' : 'border-slate-300 dark:border-white/10'}`}>
                    {loadingMeta ? (
                      <span className="text-slate-500 text-sm">Loading skills...</span>
                    ) : (
                      availableSkills.map((skillName, index) => (
                        <label key={index} className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300 cursor-pointer p-1.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded transition-colors">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 bg-white dark:bg-[#151D30]"
                            // Kiểm tra chuỗi thay vì id
                            checked={form.skills.includes(skillName)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(prev => ({ ...prev, skills: [...prev.skills, skillName] }));
                              } else {
                                setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillName) }));
                              }
                            }}
                          />
                          {skillName}
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Select the relevant skills for this job.</p>
                </Field>
              </div>
            </div>

            <div className="w-full h-px bg-slate-200 dark:bg-white/5 transition-colors" />

            <div className="flex flex-col gap-6">
              <RichTextEditor label="Job Description" required placeholder="What are the daily tasks and responsibilities?" value={form.description} onChange={setRich("description")} error={errors.description} />
              <RichTextEditor label="Candidate Requirements" required placeholder="What specific skills and experience are required?" value={form.requirements} onChange={setRich("requirements")} error={errors.requirements} />
              <RichTextEditor label="Perks & Benefits" placeholder="What core benefits and perks are offered here?" value={form.benefits} onChange={setRich("benefits")} />
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} />}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}