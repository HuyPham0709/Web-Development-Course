import React, { useEffect, useState } from 'react';
import { getJobCriteria, saveJobCriteria } from '../../../../services/jobCriteriaService';
import { Briefcase, Save, Check } from 'lucide-react';
import { notifyRecommendationsRefresh } from '../../../../services/recommendationService';
import toast from 'react-hot-toast';

const SuccessToast = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div className="bg-emerald-600 text-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl shadow-emerald-500/30 border border-emerald-400/30">
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Check className="w-5 h-5" strokeWidth={3.5} />
        </div>
        <span className="font-medium">Profile has been updated!</span>
        <button
          onClick={onClose}
          className="ml-auto text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
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
    industry: '',
    job_type: '',
    experience_level: '',
    career_level: '',
    salary_min: '',
    salary_max: '',
    preferred_salary_type: '',
    preferred_location: '',
    workplace_type: '',
    skills: '',
    languages: '',
    preferred_companies: '',
    benefits: '',
    available_from: '',
    is_open_to_work: 1,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getJobCriteria();
      if (res.data) {
        setFormData({
          ...formData,
          ...res.data,
          available_from: res.data.available_from ? res.data.available_from.split('T')[0] : '',
        });
      }
    } catch (error) {
      console.error('Fetch job criteria error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked ? 1 : 0 
        : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await saveJobCriteria(formData);
      notifyRecommendationsRefresh();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2800);
    } catch (error) {
      console.error(error);
      alert('An error occurred while saving criteria');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-[#0E1422] border border-gray-200 dark:border-white/10 rounded-3xl p-8 max-w-5xl mx-auto shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Job Criteria</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Update your preferences to receive relevant job recommendations</p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-5">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Desired Position</label>
              <input
                type="text"
                name="desired_position"
                value={formData.desired_position}
                onChange={handleChange}
                placeholder="Frontend Developer, Product Manager..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="Information Technology, Marketing..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Job Type</label>
              <select name="job_type" value={formData.job_type || ''} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                <option value="">Select job type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Experience Level</label>
              <select name="experience_level" value={formData.experience_level || ''} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                <option value="">Select experience level</option>
                <option value="intern">Intern</option>
                <option value="fresher">Fresher</option>
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-5">Desired Salary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Minimum Salary</label>
              <input type="number" name="salary_min" value={formData.salary_min} onChange={handleChange}
                placeholder="10,000,000" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Maximum Salary</label>
              <input type="number" name="salary_max" value={formData.salary_max} onChange={handleChange}
                placeholder="30,000,000" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>

        {/* Work Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-5">Work Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Workplace Type</label>
              <select name="workplace_type" value={formData.workplace_type || ''} onChange={handleChange}
                className="w-full bg-gray-50 dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select type</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Preferred Location</label>
              <input type="text" name="preferred_location" value={formData.preferred_location} onChange={handleChange}
                placeholder="Ho Chi Minh City, Hanoi, Da Nang..." className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>

        {/* Skills & Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-5">Skills & Additional Preferences</h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Skills</label>
              <textarea name="skills" value={formData.skills || ''} onChange={handleChange} rows={3}
                placeholder="React, TypeScript, TailwindCSS, Node.js..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Languages</label>
                <input type="text" name="languages" value={formData.languages || ''} onChange={handleChange}
                  placeholder="English, Japanese, Korean..." className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Preferred Companies</label>
                <input type="text" name="preferred_companies" value={formData.preferred_companies || ''} onChange={handleChange}
                  placeholder="VNG, FPT, Google, Meta..." className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Desired Benefits</label>
              <textarea name="benefits" value={formData.benefits || ''} onChange={handleChange} rows={2}
                placeholder="Health insurance, performance bonus, remote work..." 
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Available from</label>
            <input
              type="date"
              name="available_from"
              value={formData.available_from}
              onChange={handleChange}
              className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_open_to_work"
              checked={formData.is_open_to_work === 1}
              onChange={handleChange}
              className="w-5 h-5 accent-purple-600"
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">Open to work</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-10 w-full md:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-2xl text-white font-semibold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Saving...' : 'Save Job Criteria'}
      </button>

      {showSuccess && <SuccessToast onClose={() => setShowSuccess(false)} />}
    </div>
  );
}