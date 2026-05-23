import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  DollarSign,
  Clock,
  Building,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  X,
  MessageCircle // Thêm icon Chat
} from "lucide-react";
// Thêm useNavigate
import { Link, useParams, useNavigate } from "react-router-dom"; 

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); // Khởi tạo hook điều hướng
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- Logic State và Hàm điều khiển Modal ---
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [submitting, setSubmitting] = useState(false); // State quản lý trạng thái loading/chống spam

  // States cho Form Data
  const [formData, setFormData] = useState({
    resume: null as File | null,
    coverLetter: "",
    yearsExperience: "",
    remoteComfort: "",
  });

  // --- XỬ LÝ SỰ KIỆN NHẮN TIN ---
  const handleStartChat = () => {
    // Sửa thành job?.posted_by theo đúng chuẩn Database của bạn
    const targetId = job?.posted_by; 

    if (!targetId) {
      alert("Không tìm thấy thông tin nhà tuyển dụng để nhắn tin!");
      return;
    }

    // Chuyển hướng sang trang chat kèm state
    navigate('/chat', {
      state: {
        targetUser: {
          id: targetId,
          name: job?.company_name || "Nhà tuyển dụng",
          avatar_url: job?.logo_url || ""
        }
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

  // Logic gửi API chuẩn chỉnh
  const handleSubmitApplication = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      
      // CẬP NHẬT PAYLOAD: Truyền thêm thông tin nhà tuyển dụng và tên job để backend xử lý thông báo
      const payload = {
        job_id: id,
        employer_id: job?.posted_by,   // Truyền ID Employer sang để lưu MongoDB receiver_id
        job_title: job?.title,         // Truyền tên công việc sang để hiển thị thông báo
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
    } finally { // ✅ Đã sửa: Khôi phục từ khóa finally chuẩn cú pháp try-catch
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Tự động cuộn lên đầu trang khi vào trang chi tiết
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/jobs/${id}`);
        setJob(res.data.data);
      } catch (err) {
        console.error("API Error:", err);
      } finally { // ✅ Đã sửa: Viết đúng chính tả từ khóa finally (2 chữ l)
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-left font-bold text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-[#0E1422] min-h-screen">
        Loading...
      </div>
    );
  if (!job)
    return (
      <div className="p-10 text-left text-red-500 font-bold bg-gray-50/50 dark:bg-[#0E1422] min-h-screen">
        Job not found!
      </div>
    );

  const getLogoUrl = (url: string) => {
    if (!url) return "https://ui-avatars.com/api/?name=Company&background=random";
    if (url.startsWith("http")) return url;
    return `http://127.0.0.1:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="bg-gray-50/50 dark:bg-[#0E1422] transition-colors duration-300 min-h-screen pb-24 text-left font-sans">
      {/* Định nghĩa Keyframes cho hiệu ứng Staggered Animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header Section */}
      <div className="bg-white dark:bg-white/5 border-b border-gray-100 dark:border-white/10 py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors opacity-0 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Job Main Info */}
            <div
              className="bg-white dark:bg-white/5 rounded-2xl p-8 border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none hover:border-gray-200 dark:hover:border-white/20 transition-all duration-300 opacity-0 animate-fade-in-up group"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight transition-colors">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors">
                      <Building className="w-4 h-4" />{" "}
                      {job.company_name || "Verified Company"}
                    </div>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />{" "}
                      {job.location_name || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {job.job_type}
                    </span>
                    <span className="flex items-center gap-1 text-gray-900 dark:text-white font-bold transition-colors">
                      <DollarSign className="w-4 h-4" />{" "}
                      {job.salary_min
                        ? `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k`
                        : "Negotiable"}
                    </span>
                  </div>
                </div>

                {/* THÊM NÚT NHẮN TIN VÀO ĐÂY (DESKTOP) */}
                <div className="hidden sm:flex items-start gap-3">
                  <button
                    onClick={handleStartChat}
                    className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Nhắn tin
                  </button>
                  <button
                    onClick={handleApply}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg dark:shadow-blue-900/20 whitespace-nowrap"
                  >
                    Apply Now
                  </button>
                </div>

              </div>
            </div>

            {/* Description Sections */}
            <div
              className="bg-white dark:bg-white/5 rounded-2xl p-8 border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none hover:border-gray-200 dark:hover:border-white/20 transition-all duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "300ms" }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                About the Role
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-10 whitespace-pre-line transition-colors">
                {job.description}
              </p>

              {[
                { label: "Requirements", data: job.requirements },
                { label: "Benefits", data: job.benefit },
              ].map((section, index) => {
                if (!section.data) return null;
                return (
                  <div key={index} className="mb-10 last:mb-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 transition-colors">
                      {section.label}
                    </h3>
                    <div className="space-y-4">
                      {section.data
                        .split("\n")
                        .map((line: string, i: number) => {
                          if (!line.trim()) return null;
                          return (
                            <div
                              key={i}
                              className="flex items-start gap-3 opacity-0 animate-fade-in-up"
                              style={{ animationDelay: `${400 + i * 50}ms` }}
                            >
                              <CheckCircle2
                                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                                  section.label === "Benefits"
                                    ? "text-green-500 dark:text-green-400"
                                    : "text-blue-600 dark:text-blue-400"
                                }`}
                              />
                              <span className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium transition-colors">
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

          {/* Sidebar */}
          <div
            className="lg:col-span-1 space-y-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/10 shadow-sm dark:shadow-none hover:border-gray-200 dark:hover:border-white/20 transition-all duration-300 group">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 transition-colors">
                About the Company
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-[#0E1422] shadow-sm flex-shrink-0">
                  <img
                    src={getLogoUrl(job.logo_url)}
                    alt="Logo"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white leading-tight transition-colors">
                    {job.company_name || "Verified Company"}
                  </h4>
                  <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline transition-colors">
                    View company profile
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed line-clamp-3 transition-colors">
                {job.company_desc}
              </p>
              <a
                href={job.website}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm dark:shadow-none"
              >
                <LinkIcon className="w-4 h-4" />{" "}
                {job.website?.replace(/^https?:\/\//, "") || "website.io"}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* THÊM NÚT VÀO THANH CỐ ĐỊNH (MOBILE) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#0E1422] border-t border-gray-100 dark:border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-none sm:hidden z-40 transition-colors duration-300">
        <div className="flex gap-3">
          <button
            onClick={handleStartChat}
            className="flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3.5 font-bold transition-all"
            title="Nhắn tin"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl py-3.5 font-bold shadow-md dark:shadow-blue-900/20 transition-all"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* --- APPLICATION MODAL --- */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-[#0E1422]/80 backdrop-blur-sm text-left transition-colors duration-300">
          <div className="bg-white dark:bg-[#0E1422] dark:border dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0E1422] z-10 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {applyStep === 4
                  ? "Application Sent"
                  : `Apply for ${job.title}`}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {applyStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 transition-colors">
                      Step 1: Resume / CV
                    </h3>
                    <label className="block relative cursor-pointer group mb-4">
                      <input
                        type="radio"
                        name="resume_choice"
                        className="peer sr-only"
                        defaultChecked
                        onChange={() => {}}
                      />
                      <div className="p-4 border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-500/50 rounded-xl flex items-start gap-4 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Profile Resume
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sử dụng CV mặc định trong hồ sơ cá nhân
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 ml-auto" />
                      </div>
                    </label>
                    <label className="block relative cursor-pointer group">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                      />
                      <div
                        className={`p-4 border-2 border-dashed rounded-xl flex items-start gap-4 transition-colors ${
                          formData.resume
                            ? "border-blue-500 bg-blue-50/30 dark:border-blue-500/50 dark:bg-blue-900/10"
                            : "border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20"
                        }`}
                      >
                        <div className="w-6 h-6 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 transition-colors">
                          <Upload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white transition-colors">
                            {formData.resume
                              ? formData.resume.name
                              : "Cập nhật CV mới"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                            PDF, DOCX up to 5MB (Optional)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {applyStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 transition-colors">
                      Step 2: Cover Letter (Optional)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors">
                      Introduce yourself and explain why you're a strong
                      candidate.
                    </p>
                    <textarea
                      rows={6}
                      value={formData.coverLetter}
                      onChange={(e) =>
                        setFormData({ ...formData, coverLetter: e.target.value })
                      }
                      placeholder="Write your cover letter here..."
                      className="w-full p-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    ></textarea>
                  </div>
                </div>
              )}

              {applyStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2 transition-colors">
                      Step 3: Employer Questions
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5 transition-colors">
                          How many years of experience?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.yearsExperience}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              yearsExperience: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-white dark:bg-[#0E1422] border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-colors"
                        >
                          <option value="">Select an option</option>
                          <option value="1-2">1-2 years</option>
                          <option value="3-5">3-5 years</option>
                          <option value="5+">5+ years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5 transition-colors">
                          Remote comfortable?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          {["Yes", "No"].map((val) => (
                            <label
                              key={val}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="remote"
                                checked={formData.remoteComfort === val}
                                onChange={() =>
                                  setFormData({ ...formData, remoteComfort: val })
                                }
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-white/20 dark:bg-white/5"
                              />
                              <span className="text-gray-700 dark:text-gray-300 transition-colors">
                                {val}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {applyStep === 4 && (
                <div className="py-8 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
                    Application Submitted!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto transition-colors">
                    Your application for {job.title} has been sent to{" "}
                    {job.company_name || "Employer"}. Good luck!
                  </p>
                  <Link
                    to="/applications"
                    onClick={closeModal}
                    className="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md dark:shadow-blue-900/20"
                  >
                    View My Applications
                  </Link>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {applyStep < 4 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-between sticky bottom-0 transition-colors duration-300">
                {applyStep > 1 ? (
                  <button
                    onClick={prevStep}
                    className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}

                {applyStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="bg-gray-900 dark:bg-white/10 text-white dark:text-white dark:border dark:border-white/20 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-white/20 transition-all"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-md dark:shadow-blue-900/20"
                  >
                    {submitting ? "Processing..." : "Submit Application"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}