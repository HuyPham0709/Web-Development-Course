// ProfileDashboard.tsx (fully translated to English)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom';
import {
  Briefcase, Bookmark, Bell, Edit2, MapPin, Phone, Calendar,
  Plus, Trash2, UploadCloud, Loader2, FileText, X, Sparkles,
  LayoutTemplate, PenTool, Eye, Check
} from 'lucide-react';

import { RecommendedJobs } from '../../components/candidate/RecommendedJobs';
import { CVBuilder } from '../../components/candidate/CVBuilder';
import CVTemplateGallery from '../../components/candidate/CVTemplateGallery';
import {
  getProfile, saveProfile, uploadCV, deleteCV,
  PersonalInfo, WorkExperience, Education
} from '../../../services/profileService';
import { resolveFileUrl } from '../../../utils/format';
import { SIDEBAR_MENU, DEFAULT_AVATAR, DEFAULT_COVER } from '../../components/candidate/profile/constants';
import { ProfileToast, ToastState } from '../../components/candidate/profile/ProfileToast';
import { ProfileSkeleton } from '../../components/candidate/profile/ProfileSkeleton';
import { EditModal } from '../../components/candidate/profile/EditModal';
import { Field, inputCls } from '../../components/candidate/profile/Field';
import { ProfileSidebar } from '../../components/candidate/profile/ProfileSidebar';
import MyApplications from './MyApplications';
import JobCriteria from '../../components/candidate/profile/JobCriteria';
import axios from 'axios';
import SavedJobs from '../../components/candidate/profile/SavedJobs';
import dayjs from '../../../utils/date';
import { getRecommendations } from '../../../services/recommendationService';
import Settings from '../../components/candidate/profile/Settings';

// No longer need CV_TEMPLATES or TEMPLATE_FILTERS here

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
  const [selectedTemplate, setSelectedTemplate] = useState<{ template: string; accentColor: string } | null>(null);

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
  }, [userId]);

  // ── Listen to criteria-updated event ─────────────────────────────────────
  useEffect(() => {
    window.addEventListener('criteria-updated', fetchRecommendations);
    return () => window.removeEventListener('criteria-updated', fetchRecommendations);
  }, [fetchRecommendations]);

  // ── Helpers ───────────────────────────────────────────────────────────────
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
      if (modal === 'skills') newSkills = editSkills;

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
      showToast('success', 'Profile updated successfully!');

      if (modal === 'personalInfo') {
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          savedUser.full_name = newPI.full_name;
          if (newPI.avatar_url) savedUser.avatar_url = newPI.avatar_url;
          localStorage.setItem('user', JSON.stringify(savedUser));

          window.dispatchEvent(new CustomEvent('user-profile-updated', {
            detail: {
              full_name: newPI.full_name,
              avatar_url: newPI.avatar_url || null
            }
          }));
        }
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── CV Upload ─────────────────────────────────────────────────────────────
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

  // ── Avatar Upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarSrc(localPreviewUrl);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        'http://127.0.0.1:5000/api/profile/upload-avatar',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setAvatarSrc(data.avatar_url);
        setPersonalInfo(prev => ({ ...prev, avatar_url: data.avatar_url }));
        showToast('success', 'Avatar updated successfully!');

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.avatar_url = data.avatar_url;
        localStorage.setItem('user', JSON.stringify(savedUser));

        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: {
            full_name: savedUser.full_name || null,
            avatar_url: data.avatar_url,
          },
        }));
      }
    } catch (err) {
      showToast('error', 'Avatar upload failed');
    }
  };

  // ── Cover Upload ──────────────────────────────────────────────────────────
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setCoverSrc(localPreviewUrl);

    try {
      const formData = new FormData();
      formData.append('cover', file);

      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        'http://127.0.0.1:5000/api/profile/upload-cover',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setCoverSrc(data.cover_url);
        setPersonalInfo(prev => ({ ...prev, cover_url: data.cover_url }));
        showToast('success', 'Cover image updated successfully!');

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.cover_url = data.cover_url;
        localStorage.setItem('user', JSON.stringify(savedUser));

        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: {
            full_name: savedUser.full_name || null,
            avatar_url: savedUser.avatar_url || null,
          },
        }));
      }
    } catch (err) {
      showToast('error', 'Cover upload failed');
    }
  };

  // Handler for selecting a template from gallery
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

  // ── Experience helpers ────────────────────────────────────────────────────
  const addExp = () => setEditExp(prev => [...prev, { company_name: '', position: '', description: '', start_date: '', end_date: '' }]);
  const removeExp = (i: number) => setEditExp(prev => prev.filter((_, idx) => idx !== i));
  const updateExp = (i: number, field: keyof WorkExperience, value: string) =>
    setEditExp(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));

  // ── Education helpers ─────────────────────────────────────────────────────
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
      {/* FULLSCREEN CV BUILDER */}
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

      {/* MAIN DASHBOARD */}
      <div className={`min-h-screen bg-gray-50 dark:bg-[#0E1422] flex flex-col xl:flex-row max-w-[1920px] mx-auto transition-colors duration-300 ${showFullCVBuilder ? 'hidden' : ''}`}>

        {/* SIDEBAR */}
        <div className="w-full xl:w-1/5 flex-shrink-0 p-4 md:p-8 xl:pr-0">
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userName={personalInfo.full_name}
          />
        </div>

        {/* MAIN CONTENT */}
        <main className={`w-full p-4 md:p-8 overflow-y-auto ${activeTab === 'cv-builder' ? 'xl:w-4/5' : 'xl:w-3/5'}`}>
          <div className={`w-full mx-auto ${activeTab === 'cv-builder' ? 'max-w-7xl' : 'max-w-4xl'}`}>

            {/* CV LIBRARY - Using CVTemplateGallery component */}
            {activeTab === 'cv-builder' && (
              <CVTemplateGallery onSelectTemplate={handleSelectTemplate} />
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">

                {/* Hero Card */}
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden transition-colors duration-300">
                  <div className="h-32 md:h-48 w-full relative">
                    {loading ? <ProfileSkeleton className="w-full h-full rounded-none" /> : <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />}
                    <button onClick={() => coverInputRef.current?.click()} className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-black/80 transition-colors shadow"><Edit2 className="w-4 h-4" /></button>
                    <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </div>

                  <div className="px-6 md:px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 md:-mt-16 mb-4">
                      <div className="relative w-24 h-24 md:w-32 md:h-32">
                        {loading ? <ProfileSkeleton className="w-full h-full rounded-full" /> : <img src={avatarSrc} alt="Avatar" className="w-full h-full rounded-full border-4 border-white dark:border-[#0E1422] object-cover shadow-md transition-colors" />}
                        <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white dark:bg-white/10 p-2 rounded-full shadow border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      </div>
                      <button onClick={() => openModal('personalInfo')} className="self-start md:self-auto px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit Profile</button>
                    </div>

                    {loading ? (
                      <div className="space-y-3"><ProfileSkeleton className="h-8 w-48" /><ProfileSkeleton className="h-5 w-72" /></div>
                    ) : (
                      <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{personalInfo.full_name || 'No name'}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 font-medium">{personalInfo.title || 'No title'}</p>
                        {personalInfo.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">{personalInfo.bio}</p>}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                          {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {personalInfo.location}</span>}
                          {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {personalInfo.phone}</span>}
                          {personalInfo.dob && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(personalInfo.dob)}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h2>
                    <button onClick={() => openModal('experience')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                  </div>
                  {loading ? (
                    <div className="space-y-6">{[1, 2].map(i => <ProfileSkeleton key={i} className="h-24" />)}</div>
                  ) : experiences.length === 0 ? (
                    <button onClick={() => openModal('experience')} className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-6 h-6" /> Add Experience</button>
                  ) : (
                    <div className="space-y-6">
                      {experiences.map((exp, i) => (
                        <div key={i} className="relative pl-6 border-l-2 border-gray-100 dark:border-white/10 pb-6 last:pb-0">
                          <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-[#0E1422] ${i === 0 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          <h3 className="font-bold text-gray-900 dark:text-white">{exp.position}</h3>
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">{exp.company_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{exp.start_date && <>{formatDate(exp.start_date)}{exp.end_date ? ` — ${formatDate(exp.end_date)}` : ' — Present'}</>}</p>
                          {exp.description && <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education + Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Education */}
                  <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
                      <button onClick={() => openModal('education')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    </div>
                    {loading ? <ProfileSkeleton className="h-20" /> :
                      education.length === 0 ? (
                        <button onClick={() => openModal('education')} className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-5 h-5" /> Add Education</button>
                      ) : (
                        <div className="space-y-4">
                          {education.map((edu, i) => (
                            <div key={i} className="flex gap-4">
                              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-500/30"><span className="font-bold text-blue-500 dark:text-blue-400 text-lg">{edu.school_name.charAt(0).toUpperCase()}</span></div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{edu.school_name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{edu.major}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{edu.start_date && <>{formatDate(edu.start_date)}{edu.end_date ? ` — ${formatDate(edu.end_date)}` : ' — Present'}</>}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Skills */}
                  <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h2>
                      <button onClick={() => openModal('skills')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    </div>
                    {loading ? <ProfileSkeleton className="h-16" /> : (
                      <div className="flex flex-wrap gap-2">
                        {skills.length === 0 ? (
                          <button onClick={() => openModal('skills')} className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-5 h-5" /> Add Skills</button>
                        ) : (
                          <>
                            {skills.map(skill => <span key={skill} className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm rounded-lg font-medium">{skill}</span>)}
                            <button onClick={() => openModal('skills')} className="px-3 py-1.5 border border-dashed border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 text-sm rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* CV Upload */}
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Resume / CV</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${cvUploading ? 'opacity-60 pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-white/5 hover:border-blue-300 dark:hover:border-blue-500/50 border-gray-200 dark:border-white/10'}`}>
                      <input ref={cvInputRef} type="file" accept=".pdf,.docx" onChange={handleCVUpload} className="hidden" />
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">{cvUploading ? <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" /> : <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />}</div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cvUploading ? 'Uploading...' : 'Upload CV'}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">PDF, DOCX up to 5MB</p>
                      <span className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:border-blue-300 dark:group-hover:border-blue-500/50">Choose file</span>
                    </label>

                    {loading ? <ProfileSkeleton className="rounded-2xl h-40" /> : personalInfo?.cv_url ? (
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex flex-col">
                        <div className="flex items-start gap-4 mb-auto">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6" /></div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{personalInfo?.cv_url?.split('/').pop()}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded CV</p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <a
                            href={resolveFileUrl(personalInfo.cv_url)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-center"
                          >
                            View
                          </a>
                          <button
                            onClick={handleCVDelete}
                            className="flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
                        <FileText className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">No CV uploaded yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'applications' && <MyApplications />}
            {activeTab === 'search-criteria' && (<JobCriteria />)}
            {activeTab === 'saved' && <SavedJobs />}

            {/* SETTINGS TAB (thay thế cho account management) */}
            {activeTab === 'account' && (
              <Settings topJob={recommendedJobs.length > 0
                ? recommendedJobs.reduce((prev, current) => (prev.match_score > current.match_score ? prev : current))
                : undefined}
              />
            )}

            {/* FALLBACK for unimplemented tabs */}
            {!['profile', 'cv-builder', 'recommended', 'applied', 'applications', 'search-criteria', 'saved', 'account'].includes(activeTab) && (
              <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{getActiveTabLabel()}</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">This feature is under development. Please check back later.</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: Job suggestions */}
        {activeTab !== 'cv-builder' && (
          <aside className="hidden 2xl:block w-[340px] p-6 pl-0 flex-shrink-0">
            <div className="sticky top-6 space-y-6">

              {/* RECOMMENDED JOBS */}
              <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Recommended for you
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Jobs matching your profile
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/recommended-jobs"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    View all
                  </Link>
                </div>

                {/* Jobs */}
                <div className="max-h-[650px] overflow-y-auto custom-scrollbar">
                  {recommendedJobs.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                      </div>

                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        No matching jobs yet
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Update your profile to get better recommendations
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                      {recommendedJobs.slice(0, 3).map((job) => (
                        <Link
                          key={job.id}
                          to={`/job/${job.id}`}
                          className="group block p-5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="flex gap-3">

                            {/* Logo */}
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {job.company_logo ? (
                                <img
                                  src={job.company_logo}
                                  alt={job.company_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Briefcase className="w-5 h-5 text-gray-400" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">

                              {/* Title + Badge % */}
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {job.title}
                                </h4>
                                {job.match_score > 0 && (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${job.match_score >= 60
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                                    }`}>
                                    {job.match_score}%
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                {job.company_name} · {job.location_name || 'Remote'}
                              </p>

                              {/* Skills tags */}
                              {job.experience_level && (
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                                    {job.experience_level}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-medium">
                                    {job.job_type}
                                  </span>
                                </div>
                              )}

                              {/* Progress bar */}
                              {job.match_score > 0 && (
                                <div className="mt-3">
                                  <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${job.match_score >= 60
                                        ? 'bg-emerald-500'
                                        : 'bg-yellow-400'
                                        }`}
                                      style={{ width: `${job.match_score}%` }}
                                    />
                                  </div>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                    {job.match_score >= 60 ? 'Highly suitable' : 'Potentially suitable'}
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK STATS */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-lg">

                <h3 className="font-bold text-lg mb-1">
                  Your profile
                </h3>

                <p className="text-sm text-blue-100 mb-5">
                  Complete your profile to increase your chances
                </p>

                <div className="space-y-4">

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion</span>
                      <span>80%</span>
                    </div>

                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-[80%] bg-white rounded-full" />
                    </div>
                  </div>

                  <button
                    onClick={() => openModal('personalInfo')}
                    className="w-full py-3 rounded-2xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition"
                  >
                    Update profile
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* CUSTOM SCROLLBAR */}
        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }

            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(100,100,100,0.3);
              border-radius: 999px;
            }

            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
          `}</style>
      </div>

      {/* MODALS */}
      {modal === 'personalInfo' && (
        <EditModal title="Edit Personal Information" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <Field label="Full name *"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Nguyễn Văn A" value={editPI.full_name || ''} onChange={e => setEditPI(p => ({ ...p, full_name: e.target.value }))} /></Field>
          <Field label="Title"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Senior Frontend Engineer" value={editPI.title || ''} onChange={e => setEditPI(p => ({ ...p, title: e.target.value }))} /></Field>
          <Field label="Bio"><textarea className={inputCls + ' h-24 resize-none dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="A few lines about you..." value={editPI.bio || ''} onChange={e => setEditPI(p => ({ ...p, bio: e.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Ho Chi Minh City" value={editPI.location || ''} onChange={e => setEditPI(p => ({ ...p, location: e.target.value }))} /></Field>
            <Field label="Phone"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="0901 234 567" value={editPI.phone || ''} onChange={e => setEditPI(p => ({ ...p, phone: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date of birth"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={editPI.dob || ''} onChange={e => setEditPI(p => ({ ...p, dob: e.target.value }))} /></Field>
            <Field label="Gender">
              <select className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={editPI.gender || ''} onChange={e => setEditPI(p => ({ ...p, gender: e.target.value as any }))}>
                <option value="" className="dark:bg-[#0E1422] dark:text-white">-- Select --</option>
                <option value="male" className="dark:bg-[#0E1422] dark:text-white">Male</option>
                <option value="female" className="dark:bg-[#0E1422] dark:text-white">Female</option>
                <option value="other" className="dark:bg-[#0E1422] dark:text-white">Other</option>
              </select>
            </Field>
          </div>
        </EditModal>
      )}

      {modal === 'experience' && (
        <EditModal title="Edit Work Experience" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          {editExp.map((exp, i) => (
            <div key={i} className="p-4 border border-gray-100 dark:border-white/10 rounded-xl space-y-3 relative bg-gray-50 dark:bg-white/5">
              <button onClick={() => removeExp(i)} className="absolute top-3 right-3 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              <Field label="Company"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="TechCorp Inc." value={exp.company_name} onChange={e => updateExp(i, 'company_name', e.target.value)} /></Field>
              <Field label="Position"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Senior Frontend Engineer" value={exp.position} onChange={e => updateExp(i, 'position', e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={formatDateForInput(exp.start_date)} onChange={e => updateExp(i, 'start_date', e.target.value)} /></Field>
                <Field label="End date"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={formatDateForInput(exp.end_date)} onChange={e => updateExp(i, 'end_date', e.target.value)} /></Field>
              </div>
              <Field label="Description"><textarea className={inputCls + ' h-20 resize-none dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Job description..." value={exp.description} onChange={e => updateExp(i, 'description', e.target.value)} /></Field>
            </div>
          ))}
          <button onClick={addExp} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Experience</button>
        </EditModal>
      )}

      {modal === 'education' && (
        <EditModal title="Edit Education" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          {editEdu.map((edu, i) => (
            <div key={i} className="p-4 border border-gray-100 dark:border-white/10 rounded-xl space-y-3 relative bg-gray-50 dark:bg-white/5">
              <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              <Field label="School"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Hanoi University of Science and Technology" value={edu.school_name} onChange={e => updateEdu(i, 'school_name', e.target.value)} /></Field>
              <Field label="Major"><input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Information Technology" value={edu.major} onChange={e => updateEdu(i, 'major', e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start year"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={edu.start_date} onChange={e => updateEdu(i, 'start_date', e.target.value)} /></Field>
                <Field label="End year"><input type="date" className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} value={edu.end_date || ''} onChange={e => updateEdu(i, 'end_date', e.target.value)} /></Field>
              </div>
              <Field label="Description"><textarea className={inputCls + ' h-16 resize-none dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="Achievements, activities..." value={edu.description || ''} onChange={e => updateEdu(i, 'description', e.target.value)} /></Field>
            </div>
          ))}
          <button onClick={addEdu} className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Add Education</button>
        </EditModal>
      )}

      {modal === 'skills' && (
        <EditModal title="Edit Skills" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="flex gap-2">
            <input className={inputCls + ' dark:bg-white/5 dark:border-white/10 dark:text-white'} placeholder="e.g., React, TypeScript..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <button onClick={addSkill} className="px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex-shrink-0"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
            {editSkills.length === 0 && <span className="text-sm text-gray-400 dark:text-gray-500 m-auto">Type a skill and press Enter or + button</span>}
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