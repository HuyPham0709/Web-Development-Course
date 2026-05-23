import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit2, MapPin, Globe, CheckCircle2, Info, Briefcase, ChevronRight
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
      showToast('error', 'Không tìm thấy thông tin công ty');
      return; 
    }
    
    getCompanyProfile(targetCompanyId)
      .then(data => {
        setCompanyInfo(data);
        const baseUrl = 'http://127.0.0.1:5000'; 
        setLogoSrc(data.logo_url ? (data.logo_url.startsWith('http') ? data.logo_url : `${baseUrl}${data.logo_url}`) : DEFAULT_LOGO);
        setBannerSrc(data.banner_url ? (data.banner_url.startsWith('http') ? data.banner_url : `${baseUrl}${data.banner_url}`) : DEFAULT_BANNER);
      })
      .catch(() => showToast('error', 'Không thể tải hồ sơ công ty'))
      .finally(() => setLoading(false));

    setLoadingJobs(true);
    getJobs()
      .then((jobsData: any) => {
        const list = Array.isArray(jobsData) ? jobsData : (jobsData?.data || []);
        const filteredJobs = list.filter((job: any) => {
          const isMatchCompany = job.company_id === targetCompanyId || job.companyId === targetCompanyId;
          const isApproved = job.status === 'approved'; 
          return isMatchCompany && isApproved;
        });
        
        setOpenJobs(filteredJobs);
      })
      .catch(err => console.error("Lỗi khi tải danh sách công việc:", err))
      .finally(() => setLoadingJobs(false));

  }, [targetCompanyId]);

  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message });

  const handleSave = async () => {
    if (!targetCompanyId || !canEdit) return;
    setSaving(true);
    try {
      if (!editInfo.name.trim()) {
        showToast('error', 'Tên công ty không được để trống!');
        setSaving(false); return;
      }
      
      await saveCompanyProfile(targetCompanyId, editInfo);
      setCompanyInfo(editInfo);
      setModalOpen(false);
      showToast('success', 'Hồ sơ công ty đã được cập nhật!');
    } catch (err: any) {
      showToast('error', err?.message || 'Lưu thất bại');
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
        showToast('success', 'Cập nhật logo thành công!');
      }
    } catch (err) {
      showToast('error', 'Upload logo thất bại');
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
        showToast('success', 'Cập nhật ảnh bìa thành công!');
      }
    } catch (err) {
      showToast('error', 'Upload ảnh bìa thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1422] p-4 md:p-8 overflow-y-auto transition-colors duration-300">
      
      {/* Khởi tạo Keyframe Animation dùng chung cho Staggered Effect */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HERO CARD - Hiệu ứng trễ 0ms */}
        <div 
          className="animate-fade-in-up bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 dark:hover:border-white/20 shadow-sm overflow-hidden transition-all duration-300"
          style={{ animationDelay: '0ms' }}
        >
          <div className="h-40 md:h-56 w-full relative group">
            {loading ? <ProfileSkeleton className="w-full h-full rounded-none" /> : <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30 pointer-events-none transition-colors duration-300"></div>

            {canEdit && (
              <>
                <button onClick={() => bannerInputRef.current?.click()} className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-black/80 dark:hover:text-blue-400 transition-colors shadow">
                  <Edit2 className="w-4 h-4" />
                </button>
                <input type="file" ref={bannerInputRef} accept="image/*" className="hidden" onChange={handleBannerChange} />
              </>
            )}
          </div>

          <div className="px-6 md:px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 md:-mt-16 mb-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-[#0E1422] rounded-2xl shadow-md border-4 border-white dark:border-[#0E1422] p-2 transition-colors duration-300">
                {loading ? <ProfileSkeleton className="w-full h-full rounded-xl" /> : <img src={logoSrc} alt="Logo" className="w-full h-full rounded-xl object-contain transition-colors" />}
                
                {canEdit && (
                  <>
                    <button onClick={() => logoInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-white dark:bg-white/10 p-2 rounded-full shadow border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </>
                )}
              </div>

              {canEdit && (
                <button 
                  onClick={() => { setEditInfo({...companyInfo}); setModalOpen(true); }} 
                  className="self-start md:self-auto px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 dark:hover:border-blue-500/50 dark:hover:text-blue-400 dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Cập nhật thông tin
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3"><ProfileSkeleton className="h-8 w-64" /><ProfileSkeleton className="h-5 w-48" /></div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">{companyInfo.name || 'Tên công ty'}</h1>
                  {companyInfo.is_verified && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {companyInfo.address && <span className="flex items-center gap-1.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"><MapPin className="w-4 h-4 text-gray-400 dark:text-blue-400/70" /> {companyInfo.address}</span>}
                  {companyInfo.website && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400 dark:text-blue-400/70" /> <a href={companyInfo.website} target="_blank" rel="noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors">{companyInfo.website}</a></span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION CARD - Hiệu ứng trễ 150ms */}
        <div 
          className="animate-fade-in-up bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 dark:hover:border-white/20 shadow-sm p-6 md:p-8 transition-all duration-300"
          style={{ animationDelay: '150ms' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
              <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </span>
              Giới thiệu công ty
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3"><ProfileSkeleton className="h-4 w-full" /><ProfileSkeleton className="h-4 w-5/6" /><ProfileSkeleton className="h-4 w-4/6" /></div>
          ) : companyInfo.description ? (
            <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base transition-colors duration-300">
              {companyInfo.description}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic text-center py-6 transition-colors duration-300">Chưa có thông tin giới thiệu công ty.</p>
          )}
        </div>

        {/* OPEN JOBS CARD - Hiệu ứng trễ 300ms */}
        <div 
          className="animate-fade-in-up bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 dark:hover:border-white/20 shadow-sm p-6 md:p-8 transition-all duration-300"
          style={{ animationDelay: '300ms' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors duration-300">
               <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                <Briefcase className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </span>
              Việc làm đang tuyển
            </h2>
          </div>
          
          {loadingJobs ? (
            <div className="space-y-4">
              <ProfileSkeleton className="h-16 w-full rounded-xl" />
              <ProfileSkeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : openJobs.length > 0 ? (
            <div className="grid gap-4">
              {/* Dynamic Map - Độ trễ tuỳ biến dựa vào index (450ms, 525ms, 600ms...) */}
              {openJobs.map((job, index) => (
                <div
                  key={job.id || index}
                  onClick={() => navigate(`/job/${job.id}`)}
                  className="animate-fade-in-up group flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400/50 hover:shadow-md cursor-pointer transition-all duration-300 bg-gray-50/50 dark:bg-white/5 dark:hover:bg-white/10"
                  style={{ animationDelay: `${450 + index * 75}ms` }}
                >
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {job.title || 'Vị trí đang tuyển'}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      <span className="flex items-center gap-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        <MapPin className="w-3 h-3" /> {job.location_name || job.location?.name || 'Hồ Chí Minh'}
                      </span>
                      {job.salary_max > 0 && (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {((job.salary_min || 0) / 1000000).toFixed(0)} - {((job.salary_max || 0) / 1000000).toFixed(0)} triệu VND
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-transparent group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors duration-300">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic text-center py-6 transition-colors duration-300">
              Hiện tại công ty chưa có vị trí nào đang mở.
            </p>
          )}
        </div>

      </div>

      {/* EDIT MODAL */}
      {modalOpen && canEdit && (
        <EditModal title="Thông tin Công ty" onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
          <Field label="Tên công ty" required>
            <input type="text" value={editInfo.name} onChange={e => setEditInfo({ ...editInfo, name: e.target.value })} className={inputCls} placeholder="Nhập tên công ty" />
          </Field>
          <Field label="Địa chỉ văn phòng">
            <input type="text" value={editInfo.address || ''} onChange={e => setEditInfo({ ...editInfo, address: e.target.value })} className={inputCls} placeholder="Trụ sở chính" />
          </Field>
          <Field label="Website">
            <input type="url" value={editInfo.website || ''} onChange={e => setEditInfo({ ...editInfo, website: e.target.value })} className={inputCls} placeholder="https://..." />
          </Field>
          <Field label="Giới thiệu (Bio)" className="col-span-full">
            <textarea rows={5} value={editInfo.description || ''} onChange={e => setEditInfo({ ...editInfo, description: e.target.value })} className={`${inputCls} resize-none`} placeholder="Mô tả về quy mô, lĩnh vực, văn hóa công ty..." />
          </Field>
        </EditModal>
      )}

      {toast && <ProfileToast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}