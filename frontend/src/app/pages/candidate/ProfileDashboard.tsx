// ProfileDashboard.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, X, Plus, Trash2, Edit2, MapPin, Phone, Calendar, Loader2, UploadCloud, Sparkles, Briefcase, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CVBuilder } from '../../components/candidate/CVBuilder';
import ViewedByEmployers from '../../components/candidate/profile/ViewedByEmployers';
import { InvitationsPage } from '../../components/candidate/profile/InvitationsPage';
import {
  getProfile, saveProfile, uploadCV, deleteCV,
  PersonalInfo, WorkExperience, Education
} from '../../../services/profileService';
import { SIDEBAR_MENU, DEFAULT_AVATAR, DEFAULT_COVER } from '../../components/candidate/profile/constants';
import { ProfileToast } from '../../components/candidate/profile/ProfileToast';
import { EditModal } from '../../components/candidate/profile/EditModal';
import { Field, inputCls } from '../../components/candidate/profile/Field';
import { ProfileSidebar } from '../../components/candidate/profile/ProfileSidebar';
import MyApplications from './MyApplications';
import JobCriteria from '../../components/candidate/profile/JobCriteria';
import axios from 'axios';
import SavedJobs from '../../components/candidate/profile/SavedJobs';
import { getRecommendations } from '../../../services/recommendationService';
import Settings from '../../components/candidate/profile/Settings';
import { CvLibraryTab } from '../../components/candidate/profile/CvLibraryTab';
import { RecommendedJobsAside } from '../../components/candidate/profile/RecommendedJobsAside';
import { ProfileTab } from '../../components/candidate/profile/ProfileTab';
import { ProfileSkeleton } from '../../components/candidate/profile/ProfileSkeleton';
import { invalidateProfileCache } from '../../../hooks/useSharedProfile';

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

const resolveFileUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `http://127.0.0.1:5000${url}`;
};

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showFullCVBuilder, setShowFullCVBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ template: string; accentColor: string } | null>(null);
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
  const [toast, setToast] = useState<any>(null);
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

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await getRecommendations();
      setRecommendedJobs(res.data.jobs || []);
    } catch (error) {
      console.error('Fetch recommendations error:', error);
    }
  }, []);

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
      .catch(() => showToast('error', 'Could not load profile'))
      .finally(() => setLoading(false));
  }, [userId, fetchRecommendations]);

  useEffect(() => {
    window.addEventListener('criteria-updated', fetchRecommendations);
    return () => window.removeEventListener('criteria-updated', fetchRecommendations);
  }, [fetchRecommendations]);

  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message });

  const formatDate = (date?: string | null) => {
    if (!date) return 'Not updated';
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
      // Fixed syntax error here
      if (modal === 'skills') {
        newSkills = editSkills;
      }

      if (modal === 'experience' && newExp.some(e => !e.company_name?.trim() || !e.position?.trim() || !e.start_date)) {
        showToast('error', 'Please fill in all work experience fields!');
        setSaving(false); return;
      }
      if (modal === 'education' && newEdu.some(e => !e.school_name?.trim() || !e.major?.trim() || !e.start_date)) {
        showToast('error', 'Please fill in all education fields!');
        setSaving(false); return;
      }
      if (modal === 'skills' && newSkills.some(s => !s.trim())) {
        showToast('error', 'Skill cannot be empty!');
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
      invalidateProfileCache();
      showToast('success', 'Profile updated successfully!');

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
      showToast('error', err?.message || 'Save failed');
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
      showToast('success', 'CV uploaded successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Upload failed');
    } finally {
      setCvUploading(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  const handleCVDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this CV?')) return;
    try {
      await deleteCV();
      setPersonalInfo(prev => ({ ...prev, cv_url: null }));
      showToast('success', 'CV deleted');
    } catch (err: any) {
      showToast('error', err.message || 'Deletion failed');
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
        showToast('success', 'Avatar updated successfully!');

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.avatar_url = data.avatar_url;
        localStorage.setItem('user', JSON.stringify(savedUser));

        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: { full_name: savedUser.full_name || null, avatar_url: data.avatar_url },
        }));
      }
    } catch (err) {
      showToast('error', 'Avatar upload failed');
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
        showToast('success', 'Cover image updated successfully!');

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.cover_url = data.cover_url;
        localStorage.setItem('user', JSON.stringify(savedUser));

        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: { full_name: savedUser.full_name || null, avatar_url: savedUser.avatar_url || null },
        }));
      }
    } catch (err) {
      showToast('error', 'Cover upload failed');
    }
  };

  const handleSelectTemplate = (template: string, accentColor: string) => {
    setSelectedTemplate({ template, accentColor });
    setShowFullCVBuilder(true);
  };

  const getActiveTabLabel = () => {
    for (const item of SIDEBAR_MENU) {
      if (item.id === activeTab) return item.label;
      if (item.subItems) {
        const sub = item.subItems.find(s => s.id === activeTab);
        if (sub) return sub.label;
      }
    }
    return 'This feature';
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

  return (
    <>
      {showFullCVBuilder && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0E1422] transition-colors duration-300 animate-fade-in-up">
          <CVBuilder
            onClose={() => {
              setShowFullCVBuilder(false);
              setSelectedTemplate(null);
            }}
            initialTemplate={selectedTemplate?.template}
            initialAccentColor={selectedTemplate?.accentColor}
          />
        </div>
      )}

      {/* Áp dụng Viewport Isolation (h-screen) để tách thanh cuộn Sidebar và Content */}
      <div className={`min-h-screen xl:h-screen xl:overflow-hidden bg-white dark:bg-[#0E1422] flex flex-col xl:flex-row max-w-[1920px] mx-auto transition-colors duration-300 ${showFullCVBuilder ? 'hidden' : ''}`}>

        {/* Sidebar */}
        <div className="w-full xl:w-1/5 flex-shrink-0 p-4 md:p-8 xl:pr-0">
          <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} userName={personalInfo.full_name} />
        </div>

        {/* Main Content */}
        <main className={`w-full p-4 md:p-8 xl:h-full overflow-y-auto no-scrollbar transition-all duration-300 ${activeTab === 'cv-builder' ? 'xl:w-4/5' : 'xl:w-3/5'}`}>
          <div className={`w-full mx-auto animate-fade-in-up ${activeTab === 'cv-builder' ? 'max-w-7xl' : 'max-w-4xl'}`}>

            {activeTab === 'cv-builder' && (
              <CvLibraryTab
                templateFilter={templateFilter}
                setTemplateFilter={setTemplateFilter}
                setShowFullCVBuilder={setShowFullCVBuilder}
              />
            )}

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

            {activeTab === 'applications' && <MyApplications />}
            {activeTab === 'search-criteria' && <JobCriteria />}
            {activeTab === 'saved' && <SavedJobs />}
            {activeTab === 'apply' && <InvitationsPage />}
            {activeTab === 'viewed-by-employer' && <ViewedByEmployers />}

            {activeTab === 'account' && (
              <Settings topJob={recommendedJobs.length > 0
                ? recommendedJobs.reduce((prev, current) => (prev.match_score > current.match_score ? prev : current))
                : undefined}
              />
            )}

            {!['profile', 'cv-builder', 'applications', 'search-criteria', 'saved', 'account', 'apply', 'viewed-by-employer'].includes(activeTab) && (
              <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
                <div className="w-16 h-16 flex items-center justify-center rounded-2xl mb-4 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 shadow-sm border border-gray-100 dark:border-white/10">
                  <FileText className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{getActiveTabLabel()}</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">This feature is under development. Please check back later.</p>
              </div>
            )}
          </div>
        </main>

        {activeTab !== 'cv-builder' && (
          <aside className="hidden 2xl:block w-[360px] flex-shrink-0 p-4 md:p-8 xl:pl-0 xl:h-full xl:overflow-y-auto no-scrollbar">
            <RecommendedJobsAside
              recommendedJobs={recommendedJobs}
              userData={personalInfo}
              openModal={openModal}
            />
          </aside>
        )}
      </div>

      {/* MODALS */}
      {modal === 'personalInfo' && (
        <EditModal title="Edit Personal Information" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4 animate-fade-in-up">
            <Field label="Full name *"><input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="Nguyễn Văn A" value={editPI.full_name || ''} onChange={e => setEditPI(p => ({ ...p, full_name: e.target.value }))} /></Field>
            <Field label="Title"><input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="Senior Frontend Engineer" value={editPI.title || ''} onChange={e => setEditPI(p => ({ ...p, title: e.target.value }))} /></Field>
            <Field label="Bio"><textarea className={inputCls + ' bg-gray-50 h-24 resize-none dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="A few lines about you..." value={editPI.bio || ''} onChange={e => setEditPI(p => ({ ...p, bio: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Location"><input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="Ho Chi Minh City" value={editPI.location || ''} onChange={e => setEditPI(p => ({ ...p, location: e.target.value }))} /></Field>
              <Field label="Phone"><input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="0901 234 567" value={editPI.phone || ''} onChange={e => setEditPI(p => ({ ...p, phone: e.target.value }))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of birth"><input type="date" className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors [color-scheme:dark]'} value={editPI.dob || ''} onChange={e => setEditPI(p => ({ ...p, dob: e.target.value }))} /></Field>
              <Field label="Gender">
                <select className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} value={editPI.gender || ''} onChange={e => setEditPI(p => ({ ...p, gender: e.target.value as any }))}>
                  <option value="" className="dark:bg-[#0E1422] dark:text-white">-- Select --</option>
                  <option value="male" className="dark:bg-[#0E1422] dark:text-white">Male</option>
                  <option value="female" className="dark:bg-[#0E1422] dark:text-white">Female</option>
                  <option value="other" className="dark:bg-[#0E1422] dark:text-white">Other</option>
                </select>
              </Field>
            </div>
          </div>
        </EditModal>
      )}

      {modal === 'experience' && (
        <EditModal title="Edit Work Experience" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            {editExp.map((exp, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 100}ms` }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 animate-fade-in-up opacity-0"
              >
                <button onClick={() => removeExp(i)} className="absolute top-4 right-4 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10"><Trash2 className="w-5 h-5" /></button>
                <div className="space-y-3 relative z-0">
                  <Field label="Company"><input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="TechCorp Inc." value={exp.company_name} onChange={e => updateExp(i, 'company_name', e.target.value)} /></Field>
                  <Field label="Position"><input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="Senior Frontend Engineer" value={exp.position} onChange={e => updateExp(i, 'position', e.target.value)} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start date"><input type="date" className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white transition-colors [color-scheme:dark]'} value={formatDateForInput(exp.start_date)} onChange={e => updateExp(i, 'start_date', e.target.value)} /></Field>
                    <Field label="End date"><input type="date" className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white transition-colors [color-scheme:dark]'} value={formatDateForInput(exp.end_date)} onChange={e => updateExp(i, 'end_date', e.target.value)} /></Field>
                  </div>
                  <Field label="Description"><textarea className={inputCls + ' bg-gray-50 h-20 resize-none dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="Job description..." value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} /></Field>
                </div>
              </div>
            ))}
            <button onClick={addExp} className="w-full py-4 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-blue-500/50 dark:hover:text-blue-400 flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Add Experience</button>
          </div>
        </EditModal>
      )}

      {modal === 'education' && (
        <EditModal title="Edit Education" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            {editEdu.map((edu, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 100}ms` }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 animate-fade-in-up opacity-0"
              >
                <button onClick={() => removeEdu(i)} className="absolute top-4 right-4 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors z-10"><Trash2 className="w-5 h-5" /></button>
                <div className="space-y-3 relative z-0">
                  <Field label="School"><input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="Hanoi University of Science and Technology" value={edu.school_name} onChange={e => updateEdu(i, 'school_name', e.target.value)} /></Field>
                  <Field label="Major"><input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="Information Technology" value={edu.major} onChange={e => updateEdu(i, 'major', e.target.value)} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start year"><input type="date" className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white transition-colors [color-scheme:dark]'} value={edu.start_date} onChange={e => updateEdu(i, 'start_date', e.target.value)} /></Field>
                    <Field label="End year"><input type="date" className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white transition-colors [color-scheme:dark]'} value={edu.end_date || ''} onChange={e => updateEdu(i, 'end_date', e.target.value)} /></Field>
                  </div>
                  <Field label="Description"><textarea className={inputCls + ' bg-gray-50 h-20 resize-none dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-blue-500/50 transition-colors'} placeholder="Achievements, activities..." value={edu.description || ''} onChange={e => updateEdu(i, 'description', e.target.value)} /></Field>
                </div>
              </div>
            ))}
            <button onClick={addEdu} className="w-full py-4 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500 transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-blue-500/50 dark:hover:text-blue-400 flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Add Education</button>
          </div>
        </EditModal>
      )}

      {modal === 'skills' && (
        <EditModal title="Edit Skills" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-6 animate-fade-in-up">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex-shrink-0">
                <TrendingUp size={20} />
              </div>
              <div className="flex-1 flex gap-2">
                <input className={inputCls + ' bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 dark:text-white focus:dark:border-purple-500/50 transition-colors'} placeholder="Add your skills..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <button onClick={addSkill} className="px-5 py-2.5 bg-purple-600 dark:bg-purple-500 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-all flex-shrink-0 shadow-md hover:shadow-lg"><Plus className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 min-h-[120px] p-6 bg-white dark:bg-[#0E1422] rounded-3xl border border-gray-200 dark:border-white/10 shadow-inner">
              {editSkills.length === 0 && <span className="text-sm text-gray-400 dark:text-gray-500 m-auto flex flex-col items-center gap-2"><Sparkles className="w-6 h-6 opacity-50" />Type a skill and press Enter</span>}
              {editSkills.map((skill, i) => (
                <span
                  key={skill}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="group flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-medium text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-purple-500/50 dark:hover:text-purple-400 animate-fade-in-up opacity-0"
                >
                  {skill}
                  <button onClick={() => setEditSkills(prev => prev.filter(s => s !== skill))} className="text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          </div>
        </EditModal>
      )}

      {/* CSS Injection cho Animations và Scrollbar */}
      <style>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(16px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-up { 
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {toast && <ProfileToast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}