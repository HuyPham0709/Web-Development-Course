import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  DollarSign,
  Clock,
  Building,
  Link as LinkIcon,
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  X,
  MessageCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom"; 

// 1. Import Component và Service
import { RecommendedJobsAside } from "../../components/candidate/profile/RecommendedJobsAside";
import { getRecommendations } from "../../../services/recommendationService";
import { useSharedProfile } from "../../../hooks/useSharedProfile";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useSharedProfile();
  
  // --- Recommended Jobs State ---
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

  // --- Apply Modal State & Logic ---
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // --- Report Function State & Logic ---
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Apply Form Data States
  const [formData, setFormData] = useState({
    resume: null as File | null,
    coverLetter: "",
    yearsExperience: "",
    remoteComfort: "",
  });

  // --- CHAT INTERACTION HANDLER ---
  const handleStartChat = () => {
    if (!job || !job.company_id) { // Đổi từ posted_by sang company_id
        alert("Không tìm thấy thông tin công ty để bắt đầu trò chuyện.");
        return;
    }

    navigate('/chat', {
      state: {
        targetUser: {
          id: job.company_id, // 🔥 QUAN TRỌNG: Truyền ID Công ty
          name: job.company_name || "Nhà tuyển dụng",
          avatar_url: job.logo_url || "" 
        },
        chatType: 'company' // Cờ báo hiệu đây là ID công ty
      }
    });
  };

  const handleApply = () => {
    setShowApplyModal(true);
    setApplyStep(1);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowApplyModal(false);
    setShowReportModal(false);
    setReportSuccess(false);
    setReportReason("");
    setCustomReason("");
    document.body.style.overflow = "unset";
  };

  const nextStep = () => {
    if (applyStep === 3) {
      handleSubmitApplication();
    } else {
      setApplyStep((prev) => prev + 1);
    }
  };
  const prevStep = () => setApplyStep((prev) => prev - 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  // Submit Job Application API Logic
  const handleSubmitApplication = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        job_id: id,
        employer_id: job?.posted_by,   
        job_title: job?.title,         
        cover_letter: formData.coverLetter,
        experience: formData.yearsExperience,
        remote_comfort: formData.remoteComfort,
      };

      await axios.post("http://127.0.0.1:5000/api/applications/apply", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setApplyStep(4);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Error submitting application.";
      alert(errorMsg);
    } finally { 
      setSubmitting(false);
    }
  };

  // Submit Job Report Violation API Logic
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) {
      alert("Please choose or fill out a valid reason for reporting!");
      return;
    }

    setReporting(true);
    try {
      const token = localStorage.getItem("token");
      const finalReason = reportReason === "Other" ? customReason : reportReason;

      if (reportReason === "Other" && !customReason.trim()) {
        alert("Please enter specified details for the other reason!");
        setReporting(false);
        return;
      }

      const payload = {
        job_id: id,
        reason: finalReason
      };

      await axios.post("http://127.0.0.1:5000/api/admin/reports", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setReportSuccess(true);
    } catch (err: any) {
      setReportSuccess(true);
    } finally {
      setReporting(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/jobs/${id}`);
        setJob(res.data.data);
      } catch (err) {
        console.error("API Error:", err);
      } finally { 
        setLoading(false);
      }
    };

    // 2. Fetch recommended jobs
    const fetchAiJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await getRecommendations();
          const data = res?.data?.jobs;
          setAiRecommendations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("API Error AI recommendations:", err);
      }
    };

    fetchJob();
    fetchAiJobs();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-left font-bold text-gray-500 dark:text-gray-400 bg-[#F8FAFC] dark:bg-[#070A13] min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  if (!job)
    return (
      <div className="p-10 text-left text-red-500 font-bold bg-[#F8FAFC] dark:bg-[#070A13] min-h-screen flex items-center justify-center">
        Job listing not found!
      </div>
    );

  const getLogoUrl = (url: string) => {
    if (!url) return "https://ui-avatars.com/api/?name=Company&background=random";
    if (url.startsWith("http")) return url;
    return `http://127.0.0.1:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#070A13] text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen pb-24 text-left font-sans relative overflow-hidden">
      
      {/* Background Glowing Circles Decorators */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[600px] translate-x-1/2 rounded-full bg-gradient-to-bl from-blue-500/10 to-purple-500/10 blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 left-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10"></div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header / Navigation Bar */}
      <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 py-4 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Body Grid Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Job Main Information Head Block */}
            <div
              className="bg-white dark:bg-[#0B0F19]/80 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/5 shadow-xl shadow-gray-100/40 dark:shadow-none transition-all duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {job.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      <Building className="w-3.5 h-3.5" />{" "}
                      {job.company_name || "Enterprise"}
                    </div>
                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {job.location_name || "Remote"}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full capitalize">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> {job.job_type}
                    </span>
                    <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold">
                      <DollarSign className="w-3.5 h-3.5" />{" "}
                      {job.salary_min
                        ? `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k`
                        : "Negotiable"}
                    </span>
                  </div>
                </div>

                {/* Primary Premium Action Buttons (Desktop Layout) */}
                <div className="hidden sm:flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={handleStartChat} 
                    className="flex items-center justify-center w-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 font-bold py-3 px-4 rounded-xl transition-all"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat now
                  </button>
                  <button
                    onClick={handleApply}
                    className="flex-1 md:flex-none justify-center text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.45)] active:scale-95"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>

            {/* Description Card Section */}
            <div
              className="bg-white dark:bg-[#0B0F19]/80 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/5 shadow-xl shadow-gray-100/40 dark:shadow-none transition-all opacity-0 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> Job Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 whitespace-pre-line text-sm sm:text-base">
                {job.description}
              </p>

              {[
                { label: "Job Requirements", data: job.requirements, themeColor: "text-blue-500" },
                { label: "Benefits & Perks", data: job.benefit, themeColor: "text-emerald-500" },
              ].map((section, index) => {
                if (!section.data) return null;
                return (
                  <div key={index} className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                    <h3 className="text-md sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
                      {section.label}
                    </h3>
                    <div className="space-y-3.5">
                      {section.data
                        .split("\n")
                        .map((line: string, i: number) => {
                          if (!line.trim()) return null;
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle2
                                className={`w-4 h-4 flex-shrink-0 mt-1 ${
                                  section.themeColor === "text-emerald-500"
                                    ? "text-emerald-500"
                                    : "text-blue-500"
                                }`}
                              />
                              <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
                                {line.replace(/^[•-]\s*/, "")}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column / Sidebar Layout */}
          <div
            className="lg:col-span-1 space-y-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            {/* Company Info Block */}
            <div className="bg-white dark:bg-[#0B0F19]/80 rounded-3xl p-6 border border-gray-200 dark:border-white/5 shadow-xl shadow-gray-100/40 dark:shadow-none group">
              <h3 className="text-md sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
                Company Information
              </h3>
              
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#070A13] p-1 flex-shrink-0 shadow-sm">
                  <img
                    src={getLogoUrl(job.logo_url)}
                    alt="Company Logo"
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">
                    {job.company_name || "Enterprise Hub"}
                  </h4>
                  <Link
                    to={`/company/${job.company_id || job.posted_by}`} 
                    className="text-blue-500 dark:text-blue-400 text-xs font-semibold hover:underline mt-1 inline-block"
                  >
                    View company profile
                  </Link>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed line-clamp-4">
                {job.company_desc || "No company description details provided."}
              </p>

              <a
                href={job.website}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-white/5 rounded-2xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
              >
                <LinkIcon className="w-3.5 h-3.5 text-gray-400" />{" "}
                {job.website?.replace(/^https?:\/\//, "") || "company-website.com"}
              </a>
            </div>
            {/* 3. THÊM RECOMMENDED JOBS VÀO ĐÂY */}
            <div className="sticky top-24">
              <RecommendedJobsAside 
                            recommendedJobs={aiRecommendations}
                            userData={userData}
                            
                            openModal={(type) => {
                              if (type === "personalInfo") {
                                navigate('/profile');
                              }
                            }}
                          />
              
            </div>
            {/* PREMIUM RED REPORT BLOCK */}
            <div className="bg-rose-500/5 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-3xl p-6 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <h4 className="font-extrabold text-sm sm:text-base tracking-tight">Report This Listing</h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                If you encounter fraudulent details, misleading content, or any policy violations regarding this post, please report it immediately to our administrative team.
              </p>
              <button
                onClick={() => { setShowReportModal(true); document.body.style.overflow = "hidden"; }}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] active:scale-95 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Report Violation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED FOOTER CONTROLS FOR MOBILE SCREENS */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-t border-gray-200 dark:border-white/5 shadow-2xl sm:hidden z-40 transition-all flex items-center gap-2">
        <button
          onClick={() => { setShowReportModal(true); document.body.style.overflow = "hidden"; }}
          className="flex items-center justify-center bg-rose-500/10 text-rose-500 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl px-4 py-4 font-bold active:scale-95 transition-all"
          title="Report Post"
        >
          <AlertTriangle className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleStartChat}
          className="flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-950 rounded-xl px-4 py-4 font-bold active:scale-95 transition-all"
          title="Chat"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleApply}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-4 text-sm font-bold shadow-lg active:scale-95 transition-all"
        >
          Apply Now
        </button>
      </div>

      {/* --- APPLICATION SUBMISSION STEPPED MODAL --- */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-[#070A13]/70 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-white dark:bg-[#0B0F19] dark:border dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0B0F19] z-10">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {applyStep === 4 ? "Application Sent" : `Apply: ${job.title}`}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-sm">
              {applyStep === 1 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 1: Choose Resume / CV</h3>
                  <label className="block relative cursor-pointer group">
                    <input type="radio" name="resume_choice" className="peer sr-only" defaultChecked onChange={() => {}} />
                    <div className="p-4 border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl flex items-start gap-4">
                      <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Profile Resume</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Use your default profile CV attached to your system account</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-blue-500 ml-auto self-center" />
                    </div>
                  </label>
                  
                  <label className="block relative cursor-pointer">
                    <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                    <div className={`p-5 border-2 border-dashed rounded-2xl flex items-center gap-4 transition-all ${formData.resume ? 'border-blue-500 bg-blue-50/10' : 'border-gray-200 dark:border-white/5 hover:border-gray-300'}`}>
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Upload className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{formData.resume ? formData.resume.name : "Upload new file attachment"}</p>
                        <p className="text-xs text-gray-400">PDF, DOCX formats up to 5MB maximum size</p>
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {applyStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 2: Cover Letter</h3>
                  <p className="text-xs text-gray-500">Briefly introduce yourself and outline why you are suitable for this opening.</p>
                  <textarea
                    rows={5}
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                    placeholder="Write your cover letter content here..."
                    className="w-full p-4 bg-transparent border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                  ></textarea>
                </div>
              )}

              {applyStep === 3 && (
                <div className="space-y-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step 3: Screening Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Years of practical working experience? *</label>
                      <select
                        value={formData.yearsExperience}
                        onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                        className="w-full p-3 bg-white dark:bg-[#070A13] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none"
                      >
                        <option value="">Select an option</option>
                        <option value="Under 1 year">Under 1 year experience</option>
                        <option value="1-2">1 - 2 years experience</option>
                        <option value="3-5">3 - 5 years experience</option>
                        <option value="5+">Over 5 years experience</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Are you comfortable working remotely? *</label>
                      <div className="flex gap-4">
                        {["Yes", "No"].map((val) => (
                          <label key={val} className="flex items-center gap-2 cursor-pointer font-medium text-gray-600 dark:text-gray-300">
                            <input
                              type="radio"
                              name="remote"
                              checked={formData.remoteComfort === val}
                              onChange={() => setFormData({ ...formData, remoteComfort: val })}
                              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-white/10"
                            />
                            <span>{val === "Yes" ? "Yes, fully comfortable" : "No, prefer Onsite work"}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {applyStep === 4 && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Applied Successfully!</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-xs leading-relaxed">
                    Your job application for <strong>{job.title}</strong> has been transmitted to the selection board. Good luck with your search!
                  </p>
                  <div className="pt-4">
                    <Link to="/applications" onClick={closeModal} className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all">
                      Review Application Progress
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {applyStep < 4 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center justify-between sticky bottom-0">
                {applyStep > 1 ? (
                  <button onClick={prevStep} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">Back</button>
                ) : (
                  <div></div>
                )}
                <button
                  onClick={nextStep}
                  disabled={submitting}
                  className="bg-gray-900 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                >
                  {applyStep < 3 ? "Continue" : submitting ? "Processing..." : "Submit Application"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- FORM MODAL REPORT VIOLATION (REPORT MODAL) --- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-[#070A13]/70 backdrop-blur-sm transition-all">
          <div className="bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0B0F19]">
              <h2 className="text-md sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Report Job Listing
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {!reportSuccess ? (
                <form onSubmit={handleSubmitReport} className="space-y-4 text-sm text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">
                    If you believe this job post contains scam details, multi-level marketing traps, misleading statements, or infringes upon community guidelines, please submit a formal review request.
                  </p>

                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Select a Violation Reason *</label>
                    
                    {[
                      "Scam listing, multi-level marketing trap, or identity fraud",
                      "Inappropriate words, offensive phrasing, or vulgar descriptions",
                      "Job summary details severely contrast the reality of roles",
                      "Listing is outdated, closed, or corporate profile is obsolete",
                    ].map((reasonOption, idx) => (
                      <label key={idx} className="flex items-start gap-3 p-3 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="report_reason_options"
                          checked={reportReason === reasonOption}
                          onChange={() => setReportReason(reasonOption)}
                          className="mt-0.5 w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 dark:border-white/10"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">{reasonOption}</span>
                      </label>
                    ))}

                    <label className="flex items-start gap-3 p-3 border border-gray-100 dark:border-white/5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="report_reason_options"
                        checked={reportReason === "Other"}
                        onChange={() => setReportReason("Other")}
                        className="mt-0.5 w-4 h-4 text-rose-600 focus:ring-rose-500 border-gray-300 dark:border-white/10"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">Other specific reason (Fill context below)</span>
                    </label>
                  </div>

                  {/* Specified text input fields mapped directly with DB TEXT data structure schema constraints */}
                  {(reportReason === "Other" || reportReason !== "") && (
                    <div className="space-y-1.5 pt-2 animate-in fade-in duration-300">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Detailed Verification Log *</label>
                      <textarea
                        rows={4}
                        required={reportReason === "Other"}
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Please supply explicit parameters, screenshots context, or text notes proving this behavior violation pattern..."
                        className="w-full p-3 bg-transparent border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-white text-xs sm:text-sm resize-none"
                      ></textarea>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reporting || !reportReason}
                      className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all"
                    >
                      {reporting ? "Submitting..." : "Submit Report"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Report Successfully Logged</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                    We have successfully captured your validation parameters for this opening. Administrators will verify the listing against compliance policies soon. Thank you for your feedback!
                  </p>
                  <div className="pt-2">
                    <button onClick={closeModal} className="bg-gray-900 dark:bg-white/10 dark:hover:bg-white/20 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition-all">
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}