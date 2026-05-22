import React, { useState, useEffect, useRef } from 'react';
import {
  Briefcase, Bookmark, Bell, Edit2, MapPin, Phone, Calendar,
  Plus, Trash2, UploadCloud, Loader2, FileText, X, Sparkles,
  LayoutTemplate, PenTool, Eye, Check
} from 'lucide-react';

import { RecommendedJobs } from '../../components/candidate/RecommendedJobs';
import { CVBuilder } from '../../components/candidate/CVBuilder';
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

const CV_TEMPLATES = [
  { id: '1', name: 'Đào Phú Quý', tags: ['Đơn giản', 'Chuyên nghiệp'], isNew: true,
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&h=280&fit=crop' },
  { id: '2', name: 'Đào Phú Quốc', tags: ['Đơn giản', 'Chuyên nghiệp'], isNew: false,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=280&fit=crop' },
  { id: '3', name: 'Đào Nam Du', tags: ['Đơn giản', 'Chuyên nghiệp'], isNew: true,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=280&fit=crop' },
  { id: '4', name: 'Đào Bình Ba', tags: ['Đơn giản', 'Sáng tạo'], isNew: false,
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=200&h=280&fit=crop' },
  { id: '5', name: 'Đào Phú Quý (S)', tags: ['Đơn giản', 'Sáng tạo'], isNew: true,
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=280&fit=crop' },
  { id: '6', name: 'Nguyễn Trúc Quỳnh', tags: ['Hiện đại', 'Sáng tạo'], isNew: true,
    image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=200&h=280&fit=crop' },
  { id: '7', name: 'Nguyễn Trúc Quỳnh (P)', tags: ['Chuyên nghiệp', 'Hiện đại'], isNew: false,
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=200&h=280&fit=crop' },
  { id: '8', name: 'Nguyễn Trúc Quỳnh (M)', tags: ['Sáng tạo', 'Đơn giản'], isNew: false,
    image: 'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=200&h=280&fit=crop' },
];

const TEMPLATE_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Đơn giản', label: 'Đơn giản' },
  { id: 'Hiện đại', label: 'Hiện đại' },
  { id: 'Sáng tạo', label: 'Sáng tạo' },
  { id: 'Chuyên nghiệp', label: 'Chuyên nghiệp' }
];

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

  // ── Load profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    getProfile(userId)
      .then(data => {
        setPersonalInfo(data.personalInfo);
        setExperiences(data.experiences);
        setEducation(data.education);
        setSkills(data.skills);

        const baseUrl = 'http://127.0.0.1:5000';
        const avatar = data.personalInfo.avatar_url;
        const cover = data.personalInfo.cover_url;

        setAvatarSrc(
          avatar
            ? avatar.startsWith('http') ? avatar : `${baseUrl}${avatar}`
            : DEFAULT_AVATAR
        );
        setCoverSrc(
          cover
            ? cover.startsWith('http') ? cover : `${baseUrl}${cover}`
            : DEFAULT_COVER
        );
      })
      .catch(() => showToast('error', 'Không thể tải hồ sơ'))
      .finally(() => setLoading(false));
  }, [userId]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message });

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
      let newPI = personalInfo, newExp = experiences, newEdu = education, newSkills = skills;

      if (modal === 'personalInfo') newPI = editPI;
      if (modal === 'experience') newExp = editExp;
      if (modal === 'education') newEdu = editEdu;
      if (modal === 'skills') newSkills = editSkills;

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

      await saveProfile(userId, { personalInfo: newPI, experiences: newExp, education: newEdu, skills: newSkills });
      setPersonalInfo(newPI); setExperiences(newExp); setEducation(newEdu); setSkills(newSkills);
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
            detail: {
              full_name: newPI.full_name,
              avatar_url: newPI.avatar_url || null
            }
          }));
        }
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Lưu thất bại');
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

  // ── Avatar Upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Tạo blob url cục bộ để hiển thị ngay lập tức trên UI (Cực mượt, không tốn tải mạng)
    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarSrc(localPreviewUrl);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('token');

      // 2. Gọi API trung chuyển lên thẳng Cloud
      const { data } = await axios.post(
        'http://127.0.0.1:5000/api/profile/upload-avatar',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // data.avatar_url lúc này là link Cloud dạng https:// sạch sẽ
        setAvatarSrc(data.avatar_url);
        setPersonalInfo(prev => ({ ...prev, avatar_url: data.avatar_url }));
        showToast('success', 'Cập nhật ảnh đại diện thành công!');
        
        // Đồng bộ lại local storage nếu cần
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.avatar_url = data.avatar_url;
        localStorage.setItem('user', JSON.stringify(savedUser));
      }
    } catch (err) {
      showToast('error', 'Upload ảnh thất bại');
    }
  };

  // ── Cover Upload ──────────────────────────────────────────────────────────
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant preview
    const reader = new FileReader();
    reader.onloadend = () => setCoverSrc(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('cover', file);
      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        'http://127.0.0.1:5000/api/profile/upload-cover',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const fullUrl = `http://127.0.0.1:5000${data.cover_url}`;
        setCoverSrc(fullUrl);
        setPersonalInfo(prev => ({ ...prev, cover_url: data.cover_url }));
        showToast('success', 'Cập nhật ảnh bìa thành công!');

        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        savedUser.cover_url = data.cover_url;
        localStorage.setItem('user', JSON.stringify(savedUser));

        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: {
            full_name: savedUser.full_name || null,
            avatar_url: savedUser.avatar_url || null
          }
        }));
      }
    } catch (err) {
      showToast('error', 'Upload ảnh bìa thất bại');
    }
  };

  // ── Formatters ────────────────────────────────────────────────────────────
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const getTagColor = (tag: string) => {
    if (tag === 'Đơn giản') return 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400';
    if (tag === 'Chuyên nghiệp') return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400';
    if (tag === 'Sáng tạo') return 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400';
    if (tag === 'Hiện đại') return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400';
    return 'text-gray-500 bg-gray-50 dark:bg-white/5 dark:text-gray-400';
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
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userName={personalInfo.full_name}
          />
        </div>

        {/* MAIN CONTENT */}
        <main className={`w-full p-4 md:p-8 overflow-y-auto ${activeTab === 'cv-builder' ? 'xl:w-4/5' : 'xl:w-3/5'}`}>
          <div className={`w-full mx-auto ${activeTab === 'cv-builder' ? 'max-w-7xl' : 'max-w-4xl'}`}>

            {/* CV LIBRARY */}
            {activeTab === 'cv-builder' && (
              <div className="animate-fade-in-up">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  Danh sách các mẫu CV được Top nhà tuyển dụng ưa thích
                </h2>

                <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">Lọc theo chủ đề:</span>
                  <div className="flex gap-2">
                    {TEMPLATE_FILTERS.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setTemplateFilter(filter.id)}
                        className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all border flex items-center gap-1.5 ${
                          templateFilter === filter.id
                            ? 'bg-gray-800 text-white border-gray-800 shadow-sm dark:bg-white dark:text-gray-900 dark:border-white'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:border-white/20'
                        }`}
                      >
                        {templateFilter === filter.id && <Check className="w-3 h-3" />}
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {CV_TEMPLATES.filter(t => templateFilter === 'all' || t.tags.includes(templateFilter)).map(t => (
                    <div key={t.id} className="group flex flex-col">
                      <div className="relative aspect-[1/1.4] rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-purple-200 dark:group-hover:border-purple-500/30 bg-white dark:bg-white/5">
                        <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                        {t.isNew && (
                          <div className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                            NEW
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                          <button
                            onClick={() => setShowFullCVBuilder(true)}
                            className="bg-[#6b46c1] text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#553c9a] dark:bg-purple-600 dark:hover:bg-purple-500"
                          >
                            Dùng mẫu này
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 px-1">
                        <h3 className="text-[14px] font-bold text-gray-800 dark:text-white mb-2 truncate group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                          {t.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {t.tags.map(tag => (
                            <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTagColor(tag)}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                      <button onClick={() => openModal('personalInfo')} className="self-start md:self-auto px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2"><Edit2 className="w-4 h-4" /> Chỉnh sửa hồ sơ</button>
                    </div>

                    {loading ? (
                      <div className="space-y-3"><ProfileSkeleton className="h-8 w-48" /><ProfileSkeleton className="h-5 w-72" /></div>
                    ) : (
                      <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{personalInfo.full_name || 'Chưa có tên'}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 font-medium">{personalInfo.title || 'Chưa có chức danh'}</p>
                        {personalInfo.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">{personalInfo.bio}</p>}
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                          {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {personalInfo.location}</span>}
                          {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {personalInfo.phone}</span>}
                          {personalInfo.dob && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {personalInfo.dob}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kinh nghiệm làm việc</h2>
                    <button onClick={() => openModal('experience')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                  </div>
                  {loading ? (
                    <div className="space-y-6">{[1, 2].map(i => <ProfileSkeleton key={i} className="h-24" />)}</div>
                  ) : experiences.length === 0 ? (
                    <button onClick={() => openModal('experience')} className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-6 h-6" /> Thêm kinh nghiệm</button>
                  ) : (
                    <div className="space-y-6">
                      {experiences.map((exp, i) => (
                        <div key={i} className="relative pl-6 border-l-2 border-gray-100 dark:border-white/10 pb-6 last:pb-0">
                          <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-[#0E1422] ${i === 0 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                          <h3 className="font-bold text-gray-900 dark:text-white">{exp.position}</h3>
                          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">{exp.company_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{exp.start_date && <>{formatDate(exp.start_date)}{exp.end_date ? ` — ${formatDate(exp.end_date)}` : ' — Hiện tại'}</>}</p>
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
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Học vấn</h2>
                      <button onClick={() => openModal('education')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    </div>
                    {loading ? <ProfileSkeleton className="h-20" /> :
                      education.length === 0 ? (
                        <button onClick={() => openModal('education')} className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-5 h-5" /> Thêm học vấn</button>
                      ) : (
                        <div className="space-y-4">
                          {education.map((edu, i) => (
                            <div key={i} className="flex gap-4">
                              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-500/30"><span className="font-bold text-blue-500 dark:text-blue-400 text-lg">{edu.school_name.charAt(0).toUpperCase()}</span></div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{edu.school_name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{edu.major}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{edu.start_date && <>{formatDate(edu.start_date)}{edu.end_date ? ` — ${formatDate(edu.end_date)}` : ' — Hiện tại'}</>}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Skills */}
                  <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kỹ năng</h2>
                      <button onClick={() => openModal('skills')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    </div>
                    {loading ? <ProfileSkeleton className="h-16" /> : (
                      <div className="flex flex-wrap gap-2">
                        {skills.length === 0 ? (
                          <button onClick={() => openModal('skills')} className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-5 h-5" /> Thêm kỹ năng</button>
                        ) : (
                          <>
                            {skills.map(skill => <span key={skill} className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm rounded-lg font-medium">{skill}</span>)}
                            <button onClick={() => openModal('skills')} className="px-3 py-1.5 border border-dashed border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 text-sm rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-1"><Plus className="w-4 h-4" /> Thêm</button>
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
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cvUploading ? 'Đang tải lên...' : 'Tải lên CV'}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">PDF, DOCX tối đa 5MB</p>
                      <span className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:border-blue-300 dark:group-hover:border-blue-500/50">Chọn file</span>
                    </label>

                    {loading ? <ProfileSkeleton className="rounded-2xl h-40" /> : personalInfo.cv_url ? (
                      <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex flex-col">
                        <div className="flex items-start gap-4 mb-auto">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6" /></div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{personalInfo.cv_url.split('/').pop()}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">CV đã tải lên</p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <a 
                            href={resolveFileUrl(personalInfo.cv_url)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-center"
                          >
                            Xem
                          </a>
                          
                          <button onClick={handleCVDelete} className="flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2">
                            <Trash2 className="w-4 h-4" /> Xóa
                          </button>
                      </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
                        <FileText className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">Chưa có CV nào</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'applications' && <MyApplications />}
            {activeTab === 'search-criteria' && (
  <JobCriteria />
)}
            {/* FALLBACK for unimplemented tabs */}
            {!['profile', 'cv-builder', 'recommended', 'applied', 'applications','search-criteria'].includes(activeTab) && (
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

        {/* RIGHT SIDEBAR: Job suggestions */}
        {activeTab !== 'cv-builder' && (
          <aside className="w-full xl:w-1/5 p-4 md:p-8 xl:pl-0 flex-shrink-0">
            <div className="sticky top-8 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-5 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Gợi ý cho bạn</h3>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="group cursor-pointer border-b border-gray-50 dark:border-white/5 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm line-clamp-2 leading-snug">Senior ReactJS / VueJS Developer (Upto $2500)</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-gray-400" /> TechCorp Việt Nam</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" /> TP. Hồ Chí Minh</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">Xem tất cả việc làm</button>
            </div>
          </aside>
        )}
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
