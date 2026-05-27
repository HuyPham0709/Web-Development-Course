import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit2, MapPin, Globe, CheckCircle2, Info, Briefcase, ChevronRight, Search
} from 'lucide-react';
import axios from 'axios';

import { getCompanyProfile, saveCompanyProfile } from '../../../services/companyService';
import { getJobs } from '../../../services/jobService';
import { CompanyInfo } from '../../../types/company';
import { ProfileToast, ToastState } from '../../components/candidate/profile/ProfileToast';
import { ProfileSkeleton } from '../../components/candidate/profile/ProfileSkeleton';
import { EditModal } from '../../components/candidate/profile/EditModal';
import { Field, inputCls } from '../../components/candidate/profile/Field';

const DEFAULT_LOGO = 'https://placehold.co/150?text=Logo';
const DEFAULT_BANNER = 'https://placehold.co/800x200?text=Banner';

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '', website: '', description: '', address: '', logo_url: null, banner_url: null
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editInfo, setEditInfo] = useState<CompanyInfo>(companyInfo);

  const [logoSrc, setLogoSrc] = useState<string>(DEFAULT_LOGO);
  const [bannerSrc, setBannerSrc] = useState<string>(DEFAULT_BANNER);

  const [openJobs, setOpenJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Added state for search and pagination display
  const [visibleJobsCount, setVisibleJobsCount] = useState(5);
  const [searchJob, setSearchJob] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const currentCompanyId = user?.company_id || user?.companyId || (user?.role === 'employer' ? user?.id : undefined);
  const parsedUrlId = id ? parseInt(id) : NaN;

  const targetCompanyId = !isNaN(parsedUrlId) ? parsedUrlId : currentCompanyId;
  const isOwner = isNaN(parsedUrlId) || targetCompanyId === currentCompanyId;
  const canEdit = isOwner && user?.role === 'employer';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    if (!targetCompanyId) { 
      setLoading(false); 
      setLoadingJobs(false);
      showToast('error', 'Company information not found');
      return; 
    }
    
    getCompanyProfile(targetCompanyId)
      .then(data => {
        setCompanyInfo(data);
        const baseUrl = 'http://127.0.0.1:5000'; 
        setLogoSrc(data.logo_url ? (data.logo_url.startsWith('http') ? data.logo_url : `${baseUrl}${data.logo_url}`) : DEFAULT_LOGO);
        setBannerSrc(data.banner_url ? (data.banner_url.startsWith('http') ? data.banner_url : `${baseUrl}${data.banner_url}`) : DEFAULT_BANNER);
      })
      .catch(() => showToast('error', 'Failed to load company profile'))
      .finally(() => setLoading(false));

    setLoadingJobs(true);
    // PASS COMPANY_ID to params so BE filters it
    getJobs({ company_id: targetCompanyId, limit: 100 } as any)
      .then((jobsData: any) => {
        const list = Array.isArray(jobsData) ? jobsData : (jobsData?.data || []);
        setOpenJobs(list);
      })
      .catch(err => console.error("Error loading job list:", err))
      .finally(() => setLoadingJobs(false));

  }, [targetCompanyId]);

  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message });

  const handleSave = async () => {
    if (!targetCompanyId || !canEdit) return;
    setSaving(true);
    try {
      if (!editInfo.name.trim()) {
        showToast('error', 'Company name cannot be empty!');
        setSaving(false); return;
      }
      
      await saveCompanyProfile(targetCompanyId, editInfo);
      setCompanyInfo(editInfo);
      setModalOpen(false);
      showToast('success', 'Company profile updated successfully!');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoSrc(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('logo', file);
      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        'http://127.0.0.1:5000/api/companies/upload-logo',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setLogoSrc(data.logo_url);
        setCompanyInfo(prev => ({ ...prev, logo_url: data.logo_url }));
        showToast('success', 'Logo updated successfully!');
      }
    } catch (err) {
      showToast('error', 'Failed to upload logo');
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerSrc(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('banner', file);
      const token = localStorage.getItem('token');

      const { data } = await axios.post(
        'http://127.0.0.1:5000/api/companies/upload-banner',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const fullUrl = `http://127.0.0.1:5000${data.banner_url}`;
        setBannerSrc(fullUrl);
        setCompanyInfo(prev => ({ ...prev, banner_url: data.banner_url }));
        showToast('success', 'Banner updated successfully!');
      }
    } catch (err) {
      showToast('error', 'Failed to upload banner');
    }
  };

  // Filter and calculate displayed jobs
  const filteredJobs = openJobs.filter(job => 
    (job.title || '').toLowerCase().includes(searchJob.toLowerCase())
  );
  const displayedJobs = filteredJobs.slice(0, visibleJobsCount);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 transition-colors duration-300 dark:bg-[#070A13] dark:text-gray-100 relative overflow-hidden text-left pb-16">
      
      {/* CSS Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: calc(var(--stagger-index) * 100ms);
        }
      `}</style>

      {/* Background Decorators */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[600px] translate-x-1/2 rounded-full bg-gradient-to-bl from-blue-500/10 to-purple-500/10 blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 left-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10"></div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        
        {/* HERO CARD */}
        <div 
          className="animate-fade-in-up bg-white dark:bg-[#0B0F19] rounded-3xl border border-gray-200 dark:border-white/5 shadow-xl shadow-gray-100/50 dark:shadow-none overflow-hidden transition-all duration-300"
          style={{ '--stagger-index': 0 } as React.CSSProperties}
        >
          <div className="h-40 md:h-64 w-full relative group">
            {loading ? <ProfileSkeleton className="w-full h-full rounded-none" /> : <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/40 pointer-events-none transition-colors duration-300"></div>

            {canEdit && (
              <>
                <button onClick={() => bannerInputRef.current?.click()} className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-black/80 dark:hover:text-blue-400 transition-colors shadow-sm">
                  <Edit2 className="w-4 h-4" />
                </button>
                <input type="file" ref={bannerInputRef} accept="image/*" className="hidden" onChange={handleBannerChange} />
              </>
            )}
          </div>

          <div className="px-6 md:px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 md:-mt-16 mb-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-[#0B0F19] rounded-2xl shadow-lg border-4 border-white dark:border-[#0B0F19] p-2 transition-colors duration-300">
                {loading ? <ProfileSkeleton className="w-full h-full rounded-xl" /> : <img src={logoSrc} alt="Logo" className="w-full h-full rounded-xl object-contain transition-colors" />}
                
                {canEdit && (
                  <>
                    <button onClick={() => logoInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </>
                )}
              </div>

              {canEdit && (
                <button 
                  onClick={() => { setEditInfo({...companyInfo}); setModalOpen(true); }} 
                  className="self-start md:self-auto px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3"><ProfileSkeleton className="h-8 w-64" /><ProfileSkeleton className="h-5 w-48" /></div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">{companyInfo.name || 'Company Name'}</h1>
                  {companyInfo.is_verified && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {companyInfo.address && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {companyInfo.address}</span>}
                  {companyInfo.website && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" /> <a href={companyInfo.website} target="_blank" rel="noreferrer" className="hover:text-blue-500 hover:underline">{companyInfo.website}</a></span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION CARD */}
        <div 
          className="animate-fade-in-up bg-white dark:bg-[#0B0F19] rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm p-6 md:p-8 transition-all duration-300"
          style={{ '--stagger-index': 1 } as React.CSSProperties}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </span>
              About Company
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3"><ProfileSkeleton className="h-4 w-full" /><ProfileSkeleton className="h-4 w-5/6" /></div>
          ) : companyInfo.description ? (
            <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {companyInfo.description}
            </div>
          ) : (
            <p className="text-gray-400 italic text-center py-6">No company description available yet.</p>
          )}
        </div>

        {/* OPEN JOBS CARD - UPDATED TO ENGLISH & NEW SALARY FORMAT */}
        <div 
          className="animate-fade-in-up bg-white dark:bg-[#0B0F19] rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm p-6 md:p-8 transition-all duration-300"
          style={{ '--stagger-index': 2 } as React.CSSProperties}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 shrink-0">
               <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <Briefcase className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </span>
              Open Positions {openJobs.length > 0 && <span className="text-sm font-medium bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md text-gray-500">{openJobs.length}</span>}
            </h2>

            {/* Search Bar */}
            {openJobs.length > 0 && (
              <div className="w-full sm:w-64 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search job positions..." 
                  value={searchJob}
                  onChange={(e) => {
                    setSearchJob(e.target.value);
                    setVisibleJobsCount(5); // Reset display when searching
                  }}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            )}
          </div>
          
          {loadingJobs ? (
            <div className="flex h-32 w-full flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
            </div>
          ) : openJobs.length > 0 ? (
            <>
              {displayedJobs.length > 0 ? (
                <div className="grid gap-4">
                  {displayedJobs.map((job, index) => (
                    <div
                      key={job.id || index}
                      onClick={() => navigate(`/job/${job.id}`)}
                      className="animate-fade-in-up group flex items-center justify-between p-5 bg-white dark:bg-[#0B0F19] rounded-3xl border border-gray-200 dark:border-white/5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                      style={{ '--stagger-index': 3 + index } as React.CSSProperties}
                    >
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {job.title || 'Open Position'}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {job.location_name || job.location?.name || 'Remote'}
                          </span>
                          {/* SALARY FORMAT UPDATED HERE */}
                          {job.salary_max > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              ${((job.salary_min || 0) / 1000).toFixed(0)}k - ${((job.salary_max || 0) / 1000).toFixed(0)}k
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">No jobs match your search.</p>
              )}

              {/* Load More / Show Less Buttons */}
              {filteredJobs.length > 5 && (
                <div className="mt-8 flex justify-center gap-4">
                  {visibleJobsCount < filteredJobs.length && (
                    <button 
                      onClick={() => setVisibleJobsCount(prev => prev + 5)}
                      className="px-6 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 shadow-sm"
                    >
                      Load more ({filteredJobs.length - visibleJobsCount} positions)
                    </button>
                  )}
                  {visibleJobsCount > 5 && (
                    <button 
                      onClick={() => {
                        setVisibleJobsCount(5);
                      }}
                      className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300"
                    >
                      Show less
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-3xl border border-dashed border-gray-200 bg-white dark:border-white/10 dark:bg-[#0B0F19]">
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4 text-gray-400">
                <Briefcase size={32} />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                There are currently no open positions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {modalOpen && canEdit && (
        <EditModal title="Company Information" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
          <Field label="Company Name" required>
            <input type="text" value={editInfo.name} onChange={e => setEditInfo({ ...editInfo, name: e.target.value })} className={inputCls} placeholder="Enter company name" />
          </Field>
          <Field label="Office Address">
            <input type="text" value={editInfo.address || ''} onChange={e => setEditInfo({ ...editInfo, address: e.target.value })} className={inputCls} placeholder="Headquarters" />
          </Field>
          <Field label="Website">
            <input type="url" value={editInfo.website || ''} onChange={e => setEditInfo({ ...editInfo, website: e.target.value })} className={inputCls} placeholder="https://..." />
          </Field>
          <Field label="Description (Bio)" className="col-span-full">
            <textarea rows={5} value={editInfo.description || ''} onChange={e => setEditInfo({ ...editInfo, description: e.target.value })} className={`${inputCls} resize-none`} placeholder="Describe the company size, industry, culture..." />
          </Field>
        </EditModal>
      )}

      {toast && <ProfileToast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}