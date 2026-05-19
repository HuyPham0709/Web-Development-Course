// ==========================================
// JobForm.tsx (Dark Mode & Staggered Animation)
// ==========================================
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper component cho Rich Text Editor mock
function RichTextEditor({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700 dark:text-gray-300 transition-colors">{label}</label>
      <div className="border border-slate-300 dark:border-white/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors bg-white dark:bg-[#151D30]">
        
        {/* Toolbar của Editor */}
        <div className="bg-slate-50 dark:bg-[#0E1422]/60 border-b border-slate-300 dark:border-white/5 px-3 py-2 flex items-center gap-2 text-slate-600 dark:text-gray-400 transition-colors">
          <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-sm font-bold w-7 h-7 flex items-center justify-center dark:hover:text-white">B</button>
          <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-sm italic w-7 h-7 flex items-center justify-center dark:hover:text-white">I</button>
          <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-sm underline w-7 h-7 flex items-center justify-center dark:hover:text-white">U</button>
          <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1"></div>
          <button type="button" className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded flex flex-col items-center justify-center gap-[2px] w-7 h-7 dark:hover:text-white">
            <div className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-current"></span><span className="w-3 h-[2px] bg-current"></span></div>
            <div className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-current"></span><span className="w-3 h-[2px] bg-current"></span></div>
            <div className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-current"></span><span className="w-3 h-[2px] bg-current"></span></div>
          </button>
        </div>

        {/* Vùng nhập văn bản */}
        <textarea 
          rows={4}
          className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none resize-y min-h-[100px]"
          placeholder={placeholder}
        ></textarea>
      </div>
    </div>
  );
}

export function JobForm() {
  const navigate = useNavigate();
  
  // ĐÃ THÊM: Trạng thái kiểm soát animation xuất hiện so le (Staggered Animation)
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Kích hoạt hiệu ứng ngay sau khi component mount
    const timer = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0E1422] py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* 1. Header Form - Khối xuất hiện trước tiên với hiệu ứng mượt */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 transform transition-all duration-500 ease-out ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          
          {/* Thông tin tiêu đề bên trái */}
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create New Job</h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Fill in the details below to post a new position.</p>
            </div>
          </div>

          {/* Cụm 3 nút thao tác bên phải */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-slate-600 dark:text-gray-400 font-medium hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
            
            <button 
              type="button"
              className="px-5 py-2.5 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500/40 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            
            <button 
              type="button"
              className="px-5 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Publish Job</span>
            </button>
          </div>
        </div>

        {/* 2. Thân Form nhập liệu - Xuất hiện sau với delay-75 */}
        <div className={`bg-white dark:bg-white/5 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden transform transition-all duration-500 ease-out delay-75 ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <form className="p-6 md:p-8 flex flex-col gap-8">
            
            {/* Top Section - Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Job Title */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Job Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-[#151D30] transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              
              {/* Category / Industry */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Category / Industry <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-[#151D30] text-slate-700 dark:text-gray-200 transition-all appearance-none cursor-pointer">
                    <option value="" className="dark:bg-[#151D30]">Select Category</option>
                    <option value="1" className="dark:bg-[#151D30]">Công nghệ thông tin</option>
                    <option value="2" className="dark:bg-[#151D30]">Marketing</option>
                    <option value="3" className="dark:bg-[#151D30]">Kế toán</option>
                    <option value="4" className="dark:bg-[#151D30]">Thiết kế</option>
                    <option value="5" className="dark:bg-[#151D30]">Nhân sự</option>
                    <option value="6" className="dark:bg-[#151D30]">Kinh doanh</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Location <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-[#151D30] text-slate-700 dark:text-gray-200 transition-all appearance-none cursor-pointer">
                  <option value="" className="dark:bg-[#151D30]">Select Location</option>
                  <option value="1" className="dark:bg-[#151D30]">Hà Nội</option>
                  <option value="2" className="dark:bg-[#151D30]">Hồ Chí Minh</option>
                  <option value="3" className="dark:bg-[#151D30]">Đà Nẵng</option>
                  <option value="4" className="dark:bg-[#151D30]">Hải Phòng</option>
                  <option value="5" className="dark:bg-[#151D30]">Cần Thơ</option>
                </select>
              </div>

              {/* Job Type */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Job Type <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-[#151D30] text-slate-700 dark:text-gray-200 transition-all appearance-none cursor-pointer">
                  <option value="full-time" className="dark:bg-[#151D30]">Full-time</option>
                  <option value="part-time" className="dark:bg-[#151D30]">Part-time</option>
                  <option value="contract" className="dark:bg-[#151D30]">Contract</option>
                  <option value="freelance" className="dark:bg-[#151D30]">Freelance</option>
                </select>
              </div>

              {/* Experience Level */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Experience Level <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-[#151D30] text-slate-700 dark:text-gray-200 transition-all appearance-none cursor-pointer">
                  <option value="" className="dark:bg-[#151D30]">Select Level</option>
                  <option value="intern" className="dark:bg-[#151D30]">Intern</option>
                  <option value="fresher" className="dark:bg-[#151D30]">Fresher</option>
                  <option value="junior" className="dark:bg-[#151D30]">Junior</option>
                  <option value="middle" className="dark:bg-[#151D30]">Middle</option>
                  <option value="senior" className="dark:bg-[#151D30]">Senior</option>
                </select>
              </div>

              {/* Salary Range */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-gray-300">Salary Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-[#151D30] transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
                    placeholder="Min"
                  />
                  <span className="text-slate-500 dark:text-gray-400">-</span>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-[#151D30] transition-all placeholder:text-slate-400 dark:placeholder:text-gray-500"
                    placeholder="Max"
                  />
                  <select className="w-24 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-[#151D30] text-slate-700 dark:text-gray-200 transition-all appearance-none cursor-pointer">
                    <option value="VND" className="dark:bg-[#151D30]">VND</option>
                    <option value="USD" className="dark:bg-[#151D30]">USD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Thanh ngăn cách giữa các section */}
            <div className="w-full h-px bg-slate-200 dark:bg-white/5 transition-colors"></div>

            {/* Bottom Section - Rich Text Editors */}
            <div className="flex flex-col gap-6">
              <RichTextEditor 
                label="Job Description (Mô tả công việc)" 
                placeholder="What will this person do on a daily basis?" 
              />
              <RichTextEditor 
                label="Job Requirements (Yêu cầu ứng viên)" 
                placeholder="What skills and experiences are necessary?" 
              />
              <RichTextEditor 
                label="Benefits (Quyền lợi)" 
                placeholder="What are the perks of working here?" 
              />
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}