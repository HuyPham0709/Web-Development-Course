import React, { useEffect, useState } from 'react';
import { getJobCriteria, saveJobCriteria } from '../../../../services/jobCriteriaService';
import { Briefcase, Save, Check } from 'lucide-react';

const SuccessToast = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div className="bg-[#10B981] text-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl shadow-emerald-500/30 border border-emerald-400/30 min-w-[280px]">
        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4" strokeWidth={3.5} />
        </div>
        <span className="font-medium text-[15px]">Hồ sơ đã được cập nhật!</span>
        <button 
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all"
          aria-label="Đóng thông báo"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default function JobCriteria() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    desired_position: '',
    job_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    preferred_location: '',
    workplace_type: '',
    skills: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getJobCriteria();
      if (res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      console.error('Fetch job criteria error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await saveJobCriteria(formData);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi lưu tiêu chí');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 transition-colors duration-300">
        Đang tải...
      </div>
    );
  }

  // Định nghĩa animation class dùng chung cho các phần tử con
  const animationItemClass = "opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]";

  return (
    <div className="bg-white dark:bg-[#0E1422] border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-4xl mx-auto relative shadow-sm transition-colors duration-300 group dark:hover:border-white/20">
      
      {/* Khai báo CSS Keyframe cục bộ cho hiệu ứng mượt mà */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Header */}
      <div 
        className={`flex items-center gap-3 mb-8 ${animationItemClass}`}
        style={{ animationDelay: '0ms' }}
      >
        <div className="w-10 h-10 bg-purple-600/10 dark:bg-purple-950/50 rounded-2xl flex items-center justify-center transition-colors duration-300">
          <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Tiêu chí tìm việc
        </h2>
      </div>

      {/* Grid Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Vị trí mong muốn */}
        <div className={animationItemClass} style={{ animationDelay: '75ms' }}>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
            Vị trí mong muốn
          </label>
          <input
            type="text"
            name="desired_position"
            value={formData.desired_position}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-300"
            placeholder="Tester, Frontend Developer..."
          />
        </div>

        {/* Loại công việc */}
        <div className={animationItemClass} style={{ animationDelay: '150ms' }}>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
            Loại công việc
          </label>
          <select
            name="job_type"
            value={formData.job_type}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-all duration-300 [&>option]:text-gray-900 [&>option]:dark:bg-[#0E1422] [&>option]:dark:text-white"
          >
            <option value="">Chọn loại công việc</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        {/* Kinh nghiệm */}
        <div className={animationItemClass} style={{ animationDelay: '225ms' }}>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
            Kinh nghiệm
          </label>
          <select
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-all duration-300 [&>option]:text-gray-900 [&>option]:dark:bg-[#0E1422] [&>option]:dark:text-white"
          >
            <option value="">Chọn mức kinh nghiệm</option>
            <option value="intern">Intern</option>
            <option value="fresher">Fresher</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
          </select>
        </div>

        {/* Mức lương mong muốn */}
        <div className={animationItemClass} style={{ animationDelay: '300ms' }}>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
            Mức lương mong muốn
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-all duration-300"
                  placeholder="10"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors duration-300">triệu</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 pl-1 transition-colors duration-300">Tối thiểu</p>
            </div>

            <div>
              <div className="relative">
                <input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-all duration-300"
                  placeholder="100"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm transition-colors duration-300">triệu</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 pl-1 transition-colors duration-300">Tối đa</p>
            </div>
          </div>
        </div>

        {/* Địa điểm mong muốn */}
        <div className={animationItemClass} style={{ animationDelay: '375ms' }}>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
            Địa điểm mong muốn
          </label>
          <input
            type="text"
            name="preferred_location"
            value={formData.preferred_location}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-300"
            placeholder="TP.HCM, Hà Nội, Remote..."
          />
        </div>

        {/* Hình thức làm việc */}
        <div className={animationItemClass} style={{ animationDelay: '450ms' }}>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
            Hình thức làm việc
          </label>
          <select
            name="workplace_type"
            value={formData.workplace_type}
            onChange={handleChange}
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none transition-all duration-300 [&>option]:text-gray-900 [&>option]:dark:bg-[#0E1422] [&>option]:dark:text-white"
          >
            <option value="">Chọn hình thức</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Skills */}
      <div className={`mt-8 ${animationItemClass}`} style={{ animationDelay: '525ms' }}>
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block transition-colors duration-300">
          Skills
        </label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="React, TypeScript, Node.js, Python..."
          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all duration-300"
        />
      </div>

      {/* Submit Button */}
      <div className={`${animationItemClass}`} style={{ animationDelay: '600ms' }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-10 w-full md:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 dark:hover:border-purple-500/50 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10 disabled:opacity-70 border border-transparent"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Đang lưu...' : 'Lưu tiêu chí'}
        </button>
      </div>

      {/* Success Toast */}
      {showSuccess && <SuccessToast onClose={() => setShowSuccess(false)} />}
    </div>
  );
}