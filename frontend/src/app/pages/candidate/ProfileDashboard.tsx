import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, X, Plus, Trash2 } from 'lucide-react';

import { CVBuilder } from '../../components/candidate/CVBuilder';
import {
  getProfile, saveProfile, uploadCV, deleteCV,
  PersonalInfo, WorkExperience, Education
} from '../../../services/profileService';
import { SIDEBAR_MENU, DEFAULT_AVATAR, DEFAULT_COVER } from '../../components/candidate/profile/constants';
import { ProfileToast, ToastState } from '../../components/candidate/profile/ProfileToast';
import { EditModal } from '../../components/candidate/profile/EditModal';
import { Field, inputCls } from '../../components/candidate/profile/Field';
import { ProfileSidebar } from '../../components/candidate/profile/ProfileSidebar';
import MyApplications from './MyApplications';
import JobCriteria from '../../components/candidate/profile/JobCriteria';
import axios from 'axios';
import SavedJobs from '../../components/candidate/profile/SavedJobs';
import { getRecommendations } from '../../../services/recommendationService';

// CÁC COMPONENT CON VỪA TÁCH
import { CvLibraryTab } from '../../components/candidate/profile/CvLibraryTab';
import { RecommendedJobsAside } from '../../components/candidate/profile/RecommendedJobsAside';
import { ProfileTab } from '../../components/candidate/profile/ProfileTab';

interface RecommendedJob {
  id: number;
  title: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  experience_level: string;
  company_logo: string | null;
  slug: string;
  created_at: string;
  company_name: string;
  location_name: string;
  match_score: number;
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showFullCVBuilder, setShowFullCVBuilder] = useState(false);
  const [templateFilter, setTemplateFilter] = useState('all');

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    full_name: '', title: '', bio: '', location: '',
    phone: '', gender: '', dob: '', avatar_url: null, cover_url: null, cv_url: null,
    social_links: {}
  });
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [modal, setModal] = useState<'personalInfo' | 'experience' | 'education' | 'skills' | null>(null);

  const [editPI, setEditPI] = useState<PersonalInfo>(personalInfo);
  const [editExp, setEditExp] = useState<WorkExperience[]>([]);
  const [editEdu, setEditEdu] = useState<Education[]>([]);
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const [avatarSrc, setAvatarSrc] = useState<string>(DEFAULT_AVATAR);
  const [coverSrc, setCoverSrc] = useState<string>(DEFAULT_COVER);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  // ── Fetch recommendations ─────────────────────────────────────────────────
  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await getRecommendations();
      setRecommendedJobs(res.data.jobs || []);
    } catch (error) {
      console.error('Fetch recommendations error:', error);
    }
  }, []);

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    if (!userId) { setLoading(false); return; }
    getProfile(userId)
      .then(data => {
        if (data && data.personalInfo) {
          setPersonalInfo(data.personalInfo);
          setExperiences(data.experiences || []);
          setEducation(data.education || []);
          setSkills(data.skills || []);
          setAvatarSrc(data.personalInfo.avatar_url || DEFAULT_AVATAR);
          setCoverSrc(data.personalInfo.cover_url || DEFAULT_COVER);
          fetchRecommendations();
        }
      })
      .catch(() => showToast('error', 'Không thể tải hồ sơ'))
      .finally(() => setLoading(false));
  }, [userId, fetchRecommendations]);

  // ── Lắng nghe criteria-updated ────────────────────────────────────────────
  useEffect(() => {
    window.addEventListener('criteria-updated', fetchRecommendations);
    return () => window.removeEventListener('criteria-updated', fetchRecommendations);
  }, [fetchRecommendations]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message });

  const formatDate = (date?: string | null) => {
    if (!date) return 'Chưa cập nhật';
    const pureDate = date.split('T')[0];
    const [year, month, day] = pureDate.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  const openModal = (type: typeof modal) => {
    if (type === 'personalInfo') setEditPI({ ...personalInfo });
    if (type === 'experience') setEditExp(experiences.map(e => ({ ...e })));
    if (type === 'education') setEditEdu(education.map(e => ({ ...e })));
    if (type === 'skills') setEditSkills([...skills]);
    setModal(type);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      let newPI = { ...personalInfo };
      let newExp = [...experiences];
      let newEdu = [...education];
      let newSkills = [...skills];

      if (modal === 'personalInfo') {
        newPI = { ...editPI, dob: editPI.dob || null };
      }
      if (modal === 'experience') {
        newExp = editExp.map(exp => ({ ...exp, start_date: exp.start_date || '', end_date: exp.end_date || null }));
      }
      if (modal === 'education') {
        newEdu = editEdu.map(edu => ({ ...edu, start_date: edu.start_date || '', end_date: edu.end_date || null }));
      }
      if (modal === 'skills' && newSkills) newSkills = editSkills;

      if (modal === 'experience' && newExp.some(e => !e.company_name?.trim() || !e.position?.trim() || !e.start_date)) {
        showToast('error', 'Vui lòng điền đầy đủ thông tin kinh nghiệm làm việc!');
        setSaving(false); return;
      }
      if (modal === 'education' && newEdu.some(e => !e.school_name?.trim() || !e.major?.trim() || !e.start_date)) {
        showToast('error', 'Vui lòng điền đầy đủ thông tin học vấn!');
        setSaving(false); return;
      }
      if (modal === 'skills' && newSkills.some(s => !s.trim())) {
        showToast('error', 'Kỹ năng không được để trống!');
        setSaving(false); return;
      }

      await saveProfile(userId, {
        personalInfo: newPI,
        experiences: newExp,
        education: newEdu,
        skills: newSkills
      });

      setPersonalInfo(newPI);
      setExperiences(newExp);
      setEducation(newEdu);
      setSkills(newSkills);
      setModal(null);
      showToast('success', 'Hồ sơ đã được cập nhật!');

      if (modal === 'personalInfo') {
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          savedUser.full_name = newPI.full_name;
          if (newPI.avatar_url) savedUser.avatar_url = newPI.avatar_url;
          localStorage.setItem('user', JSON.stringify(savedUser));

          window.dispatchEvent(new CustomEvent('user-profile-updated', {
            detail: { full_name: newPI.full_name, avatar_url: newPI.avatar_url || null }
          }));
        }
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvUploading(true);
    try {
      const result = await uploadCV(file);
      setPersonalInfo(prev => ({ ...prev, cv_url: result.cv_url }));
      showToast('success', 'Upload CV thành công!');
    } catch (err: any) {
      showToast('error', err.message || 'Upload thất bại');
    } finally {
      setCvUploading(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  const handleCVDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa CV này?')) return;
    try {
      await deleteCV();
      setPersonalInfo(prev => ({ ...prev, cv_url: null }));
      showToast('success', 'CV đã được xóa');
    } catch (err: any) {
      showToast('error', err.message || 'Xóa thất bại');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarSrc(localPreviewUrl);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://127.0.0.1:5000/api/profile/upload-avatar', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setAvatarSrc(data.avatar_url);
        setPersonalInfo(prev => ({ ...prev, avatar_url: data.avatar_url }));
        showToast('success', 'Cập nhật ảnh đại diện thành công!');

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.avatar_url = data.avatar_url;
        localStorage.setItem('user', JSON.stringify(savedUser));

        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: { full_name: savedUser.full_name || null, avatar_url: data.avatar_url },
        }));
      }
    } catch (err) {
      showToast('error', 'Upload ảnh thất bại');
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreviewUrl = URL.createObjectURL(file);
    setCoverSrc(localPreviewUrl);

    try {
      const formData = new FormData();
      formData.append('cover', file);
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://127.0.0.1:5000/api/profile/upload-cover', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCoverSrc(data.cover_url);
        setPersonalInfo(prev => ({ ...prev, cover_url: data.cover_url }));
        showToast('success', 'Cập nhật ảnh bìa thành công!');

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.cover_url = data.cover_url;
        localStorage.setItem('user', JSON.stringify(savedUser));

        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: { full_name: savedUser.full_name || null, avatar_url: savedUser.avatar_url || null },
        }));
      }
    } catch (err) {
      showToast('error', 'Upload ảnh bìa thất bại');
    }
  };

  const addExp = () => setEditExp(prev => [...prev, { company_name: '', position: '', description: '', start_date: '', end_date: '' }]);
  const removeExp = (i: number) => setEditExp(prev => prev.filter((_, idx) => idx !== i));
  const updateExp = (i: number, field: keyof WorkExperience, value: string) =>
    setEditExp(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));

  const addEdu = () => setEditEdu(prev => [...prev, { school_name: '', major: '', description: '', start_date: '', end_date: '' }]);
  const removeEdu = (i: number) => setEditEdu(prev => prev.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, field: keyof Education, value: string) =>
    setEditEdu(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !editSkills.includes(s)) { setEditSkills(prev => [...prev, s]); setNewSkill(''); }
  };

  const getActiveTabLabel = () => {
    for (const item of SIDEBAR_MENU) {
      if (item.id === activeTab) return item.label;
      if (item.subItems) {
        const sub = item.subItems.find(s => s.id === activeTab);
        if (sub) return sub.label;
      }
    }
    return 'Tính năng này';
  };

  return (
    <>
      {/* FULLSCREEN CV BUILDER */}
      {showFullCVBuilder && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0E1422] transition-colors duration-300 animate-fade-in-up">
          <CVBuilder onClose={() => setShowFullCVBuilder(false)} />
        </div>
      )}

      {/* MAIN DASHBOARD */}
      <div className={`min-h-screen bg-gray-50 dark:bg-[#0E1422] flex flex-col xl:flex-row max-w-[1920px] mx-auto transition-colors duration-300 ${showFullCVBuilder ? 'hidden' : ''}`}>
        
        {/* SIDEBAR */}
        <div className="w-full xl:w-1/5 flex-shrink-0 p-4 md:p-8 xl:pr-0">
          <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} userName={personalInfo.full_name} />
        </div>

        {/* MAIN CONTENT */}
        <main className={`w-full p-4 md:p-8 overflow-y-auto ${activeTab === 'cv-builder' ? 'xl:w-4/5' : 'xl:w-3/5'}`}>
          <div className={`w-full mx-auto ${activeTab === 'cv-builder' ? 'max-w-7xl' : 'max-w-4xl'}`}>
            
            {/* CV LIBRARY TAB */}
            {activeTab === 'cv-builder' && (
              <CvLibraryTab 
                templateFilter={templateFilter} 
                setTemplateFilter={setTemplateFilter} 
                setShowFullCVBuilder={setShowFullCVBuilder} 
              />
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <ProfileTab 
                loading={loading}
                coverSrc={coverSrc}
                avatarSrc={avatarSrc}
                personalInfo={personalInfo}
                experiences={experiences}
                education={education}
                skills={skills}
                cvUploading={cvUploading}
                coverInputRef={coverInputRef}
                avatarInputRef={avatarInputRef}
                cvInputRef={cvInputRef}
                handleCoverChange={handleCoverChange}
                handleAvatarChange={handleAvatarChange}
                handleCVUpload={handleCVUpload}
                handleCVDelete={handleCVDelete}
                openModal={openModal}
                formatDate={formatDate}
              />
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'applications' && <MyApplications />}
            {activeTab === 'search-criteria' && <JobCriteria />}
            {activeTab === 'saved' && <SavedJobs />}

            {/* FALLBACK */}
            {!['profile', 'cv-builder', 'recommended', 'applied', 'applications', 'search-criteria', 'saved'].includes(activeTab) && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{getActiveTabLabel()}</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">Tính năng đang được phát triển. Vui lòng quay lại sau.</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        {activeTab !== 'cv-builder' && (
          <RecommendedJobsAside recommendedJobs={recommendedJobs} openModal={openModal} />
        )}

        {/* STYLES SCROLLBAR */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100,100,100,0.3); border-radius: 999px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        `}</style>
      </div>

      {/* MODALS */}
      {modal === 'personalInfo' && (
        <EditModal title="Chỉnh sửa thông tin cá nhân" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <Field label="Họ và tên *"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Nguyễn Văn A" value={editPI.full_name || ''} onChange={e => setEditPI(p => ({ ...p, full_name: e.target.value }))} /></Field>
          <Field label="Chức danh"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Senior Frontend Engineer" value={editPI.title || ''} onChange={e => setEditPI(p => ({ ...p, title: e.target.value }))} /></Field>
          <Field label="Giới thiệu bản thân"><textarea className={inputCls + ' h-24 resize-none dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Một vài dòng về bạn..." value={editPI.bio || ''} onChange={e => setEditPI(p => ({ ...p, bio: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Địa điểm"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="TP. Hồ Chí Minh" value={editPI.location || ''} onChange={e => setEditPI(p => ({ ...p, location: e.target.value }))} /></Field>
            <Field label="Số điện thoại"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="0901 234 567" value={editPI.phone || ''} onChange={e => setEditPI(p => ({ ...p, phone: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ngày sinh"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={editPI.dob || ''} onChange={e => setEditPI(p => ({ ...p, dob: e.target.value }))} /></Field>
            <Field label="Giới tính">
              <select className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={editPI.gender || ''} onChange={e => setEditPI(p => ({ ...p, gender: e.target.value as any }))}>
                <option value="" className="dark:bg-[#0E1422] dark:text-white">-- Chọn --</option>
                <option value="male" className="dark:bg-[#0E1422] dark:text-white">Nam</option>
                <option value="female" className="dark:bg-[#0E1422] dark:text-white">Nữ</option>
                <option value="other" className="dark:bg-[#0E1422] dark:text-white">Khác</option>
              </select>
            </Field>
          </div>
        </EditModal>
      )}

      {modal === 'experience' && (
        <EditModal title="Chỉnh sửa kinh nghiệm" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          {editExp.map((exp, i) => (
            <div key={i} className="p-4 border border-gray-100 dark:border-white/10 rounded-xl space-y-3 relative bg-gray-50 dark:bg-white/5">
              <button onClick={() => removeExp(i)} className="absolute top-3 right-3 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              <Field label="Tên công ty"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="TechCorp Inc." value={exp.company_name} onChange={e => updateExp(i, 'company_name', e.target.value)} /></Field>
              <Field label="Vị trí"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Senior Frontend Engineer" value={exp.position} onChange={e => updateExp(i, 'position', e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Từ ngày"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={formatDateForInput(exp.start_date)} onChange={e => updateExp(i, 'start_date', e.target.value)} /></Field>
                <Field label="Đến ngày"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={formatDateForInput(exp.end_date)} onChange={e => updateExp(i, 'end_date', e.target.value)} /></Field>
              </div>
              <Field label="Mô tả"><textarea className={inputCls + ' h-20 resize-none dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Mô tả công việc..." value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} /></Field>
            </div>
          ))}
          <button onClick={addExp} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Thêm kinh nghiệm</button>
        </EditModal>
      )}

      {modal === 'education' && (
        <EditModal title="Chỉnh sửa học vấn" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          {editEdu.map((edu, i) => (
            <div key={i} className="p-4 border border-gray-100 dark:border-white/10 rounded-xl space-y-3 relative bg-gray-50 dark:bg-white/5">
              <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              <Field label="Trường học"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Đại học Bách Khoa" value={edu.school_name} onChange={e => updateEdu(i, 'school_name', e.target.value)} /></Field>
              <Field label="Chuyên ngành"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Công nghệ thông tin" value={edu.major} onChange={e => updateEdu(i, 'major', e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Từ năm"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={edu.start_date} onChange={e => updateEdu(i, 'start_date', e.target.value)} /></Field>
                <Field label="Đến năm"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={edu.end_date || ''} onChange={e => updateEdu(i, 'end_date', e.target.value)} /></Field>
              </div>
              <Field label="Mô tả"><textarea className={inputCls + ' h-16 resize-none dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Thành tích, hoạt động..." value={edu.description || ''} onChange={e => updateEdu(i, 'description', e.target.value)} /></Field>
            </div>
          ))}
          <button onClick={addEdu} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Thêm học vấn</button>
        </EditModal>
      )}

      {modal === 'skills' && (
        <EditModal title="Chỉnh sửa kỹ năng" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="flex gap-2">
            <input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="VD: React, TypeScript..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <button onClick={addSkill} className="px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex-shrink-0"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
            {editSkills.length === 0 && <span className="text-sm text-gray-400 dark:text-gray-500 m-auto">Nhập kỹ năng và nhấn Enter hoặc nút +</span>}
            {editSkills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm rounded-lg font-medium">
                {skill}
                <button onClick={() => setEditSkills(prev => prev.filter(s => s !== skill))} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
              </span>
            ))}
          </div>
        </EditModal>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {toast && <ProfileToast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}