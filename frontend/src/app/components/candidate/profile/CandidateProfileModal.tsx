import React, { useEffect, useState, useCallback } from 'react';
import {
  X, MapPin, Phone, Mail, Calendar, Briefcase, GraduationCap,
  Code2, FileText, Download, ExternalLink, Building2, Loader2,
  User, Clock, ChevronRight, Eye
} from 'lucide-react';
import { resolveFileUrl } from '../../../../utils/format';

interface ProfileData {
  personalInfo: {
    full_name: string;
    title: string;
    bio: string;
    location: string;
    phone: string | null;
    gender: string | null;
    dob: string | null;
    avatar_url: string | null;
    cover_url: string | null;
    cv_url: string | null;
    email: string;
  };
  experiences: {
    company_name: string;
    position: string;
    start_date: string;
    end_date: string | null;
    description: string;
  }[];
  education: {
    school_name: string;
    major: string;
    gpa: string | null;
    start_date: string;
    end_date: string | null;
    description: string;
  }[];
  skills: string[];
}

interface ProfileView {
  employer_id: number;
  company_name: string;
  company_logo: string | null;
  viewed_at: string;
}

interface CandidateProfileModalProps {
  candidateId: number | null;
  candidateName?: string;
  onClose: () => void;
  onReject?: (candidateId: number) => void;
}

const API_BASE = 'http://127.0.0.1:5000';

const getFullUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};

const getCloudinaryDownloadUrl = (url: string | null, fileName = 'cv') => {
   if (!url) return '#';

  if (url.includes('res.cloudinary.com')) {
    // Xóa transformation cũ trước
    const cleanUrl = url.replace(/\/upload\/[^/]*\/v/, '/upload/v');
    // Thêm fl_attachment để force download
    return cleanUrl.replace('/upload/', `/upload/fl_attachment:${fileName}/`);
  }

  return resolveFileUrl(url);
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'N/A' : `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export function CandidateProfileModal({ candidateId, candidateName, onClose, onReject }: CandidateProfileModalProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'experience' | 'education' | 'skills' | 'views'>('info');
  const [profileViews, setProfileViews] = useState<ProfileView[]>([]);
  const [loadingViews, setLoadingViews] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!candidateId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/employer/candidate/${candidateId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('API returned an error or invalid path (404/500)');
      const data = await res.json();
      if (data.success) setProfile(data.data);
      else setError(data.message || 'Candidate not found or invalid account type');
    } catch (err) {
      setError('Server connection error or invalid API response format');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  const fetchProfileViews = useCallback(async () => {
    if (!candidateId) return;
    setLoadingViews(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/employer/candidate/${candidateId}/views`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('HTTP error fetching views list');
      const data = await res.json();
      if (data.success) setProfileViews(data.data || []);
    } catch (err) {
      console.error('Error fetching viewing history', err);
    } finally {
      setLoadingViews(false);
    }
  }, [candidateId]);

  const recordView = useCallback(async () => {
    if (!candidateId) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/employer/candidate/${candidateId}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error recording view', err);
    }
  }, [candidateId]);

  const handleReject = async () => {
    if (!candidateId) return;
    const confirm = window.confirm('Are you sure you want to skip this candidate?');
    if (!confirm) return;
    setIsRejecting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/employer/candidate/${candidateId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Error when calling API rejects candidate');
      if (onReject) onReject(candidateId);
      onClose();
    } catch (err) {
      console.error('Error rejecting candidate:', err);
      alert('An error occurred while skipping the candidate. Please try again later.');
    } finally {
      setIsRejecting(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      fetchProfile();
      fetchProfileViews();
      recordView();
    }
  }, [candidateId, fetchProfile, fetchProfileViews, recordView]);

  const personal = profile?.personalInfo;
  const avatarSrc = getFullUrl(personal?.avatar_url) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(personal?.full_name || candidateName || 'U')}&background=6366f1&color=fff&size=128`;
  const coverSrc = getFullUrl(personal?.cover_url);

  const formatGender = (gender: string | null | undefined) => {
    if (!gender) return 'N/A';
    const g = gender.toLowerCase();
    if (g === 'male' || g === 'nam') return 'Male';
    if (g === 'female' || g === 'nữ' || g === 'nu') return 'Female';
    return 'Other';
  };

  const formatDOB = (dobStr: string | null | undefined) => {
    if (!dobStr) return 'N/A';
    const d = new Date(dobStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0a0f1e]">

        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
          <X size={18} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
            <p className="text-white/50 text-sm">Loading candidate data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-80 p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <X className="text-red-500" size={32} />
            </div>
            <p className="text-white font-medium mb-4">{error}</p>
            <button onClick={fetchProfile} className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">Retry</button>
          </div>
        ) : profile && personal && (
          <>
            <div className="relative h-32 w-full flex-shrink-0">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-blue-600"
                style={coverSrc ? { backgroundImage: `url(${coverSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                <div className="absolute inset-0 bg-black/30" />
              </div>
              <div className="absolute -bottom-10 left-8">
                <img src={avatarSrc} className="w-24 h-24 rounded-2xl border-4 border-[#0a0f1e] object-cover bg-white" alt="avatar" />
              </div>
            </div>

            <div className="px-8 pt-12 pb-4">
              <h2 className="text-2xl font-bold text-white">{personal.full_name}</h2>
              <p className="text-indigo-400 font-medium">{personal.title || 'Position not updated'}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-white/50 text-xs">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-indigo-400" /> {personal.location || 'N/A'}</span>
                <span className="flex items-center gap-1"><Mail size={14} className="text-indigo-400" /> {personal.email}</span>
                <span className="flex items-center gap-1"><Phone size={14} className="text-indigo-400" /> {personal.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="px-6 border-b border-white/5 flex gap-4 overflow-x-auto no-scrollbar">
              {[
                { id: 'info', label: 'About', icon: User },
                { id: 'experience', label: 'Experience', icon: Briefcase },
                { id: 'education', label: 'Education', icon: GraduationCap },
                { id: 'skills', label: 'Skills', icon: Code2 },
                { id: 'views', label: 'Views', icon: Eye }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-2 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/40 hover:text-white/60'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-white/30 uppercase mb-2 tracking-widest">About</h4>
                    <p className="text-white/70 text-sm leading-relaxed bg-white/5 p-4 rounded-2xl">{personal.bio || 'No introduction provided.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] text-white/30 uppercase mb-1">Gender</p>
                      <p className="text-white text-sm">{formatGender(personal.gender)}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] text-white/30 uppercase mb-1">Date of Birth</p>
                      <p className="text-white text-sm">{formatDOB(personal.dob)}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  {profile.experiences?.length > 0 ? profile.experiences.map((exp, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-indigo-500/30 pb-6 last:pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-[#0a0f1e]" />
                      <h4 className="text-white font-bold">{exp.position}</h4>
                      <p className="text-indigo-400 text-sm font-medium">{exp.company_name}</p>
                      <p className="text-white/30 text-[10px] mt-1">{formatDate(exp.start_date)} - {formatDate(exp.end_date)}</p>
                      <p className="text-white/60 text-sm mt-3">{exp.description}</p>
                    </div>
                  )) : <p className="text-white/30 text-center">No experience info provided.</p>}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  {profile.education?.length > 0 ? profile.education.map((edu, idx) => (
                    <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-bold">{edu.school_name}</h4>
                          <p className="text-indigo-400 text-sm">{edu.major}</p>
                        </div>
                        {edu.gpa && <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-1 rounded-lg font-bold">GPA: {edu.gpa}</span>}
                      </div>
                      <p className="text-white/30 text-[10px] mt-2">{formatDate(edu.start_date)} - {formatDate(edu.end_date)}</p>
                    </div>
                  )) : <p className="text-white/30 text-center">No education info provided.</p>}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.length > 0 ? profile.skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-sm font-medium">
                      {skill}
                    </span>
                  )) : <p className="text-white/30 text-center">No skills updated.</p>}
                </div>
              )}

              {activeTab === 'views' && (
                <div className="space-y-4">
                  {loadingViews ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-indigo-500" />
                    </div>
                  ) : profileViews.length > 0 ? profileViews.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        {v.company_name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold">{v.company_name}</p>
                        <p className="text-white/30 text-[10px]">{new Date(v.viewed_at).toLocaleString('en-US')}</p>
                      </div>
                    </div>
                  )) : <p className="text-white/30 text-center">No views yet.</p>}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/5 flex gap-3">
              {/* ✅ Sửa: dùng getCloudinaryDownloadUrl để tạo link download đúng */}
              {personal.cv_url && (() => {
                const downloadUrl = getCloudinaryDownloadUrl(personal.cv_url, 'cv');
                return downloadUrl ? (
                  <a
    href={getCloudinaryDownloadUrl(personal.cv_url, 'cv')}
    download
    target="_blank"
    rel="noopener noreferrer"
    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
  >
    <Download size={18} />
    Download CV
  </a>
                ) : null;
              })()}

              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-[2] flex items-center justify-center gap-2 py-3 bg-gray-700 text-white rounded-2xl font-bold hover:bg-gray-600 shadow-lg shadow-gray-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  'Skip this candidate'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}