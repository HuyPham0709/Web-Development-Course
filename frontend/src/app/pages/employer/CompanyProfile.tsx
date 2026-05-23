import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Bổ sung để lấy ID từ URL khi Employee xem
import {
  Edit2, MapPin, Globe, CheckCircle2, Info
} from 'lucide-react';
import axios from 'axios';

import { getCompanyProfile, saveCompanyProfile } from '../../../services/companyService';
import { CompanyInfo } from '../../../types/company';
import { ProfileToast, ToastState } from '../../components/candidate/profile/ProfileToast';
import { ProfileSkeleton } from '../../components/candidate/profile/ProfileSkeleton';
import { EditModal } from '../../components/candidate/profile/EditModal';
import { Field, inputCls } from '../../components/candidate/profile/Field';

const DEFAULT_LOGO = 'https://placehold.co/150?text=Logo';
const DEFAULT_BANNER = 'https://placehold.co/800x200?text=Banner';

export default function CompanyProfile() {
  // Lấy id từ URL nếu có (ví dụ: /companies/5)
  const { id } = useParams<{ id: string }>();

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

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Lấy thông tin user hiện tại từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Xử lý phân quyền xem/sửa (Mở quyền sửa nếu không có ID trên url HOẶC ID trên url khớp với công ty của user)
  const targetCompanyId = id ? parseInt(id) : user?.company_id;
  const isOwner = !id || parseInt(id) === user?.company_id;
  const canEdit = isOwner && user?.role === 'employer'; // Hoặc kiểm tra điều kiện role của bạn

  useEffect(() => {
    if (!targetCompanyId) { 
      setLoading(false); 
      showToast('error', 'Không tìm thấy thông tin công ty');
      return; 
    }
    
    getCompanyProfile(targetCompanyId)
      .then(data => {
        setCompanyInfo(data);
        const baseUrl = 'http://127.0.0.1:5000'; // Đổi theo cấu hình API_URL của bạn
        setLogoSrc(data.logo_url ? (data.logo_url.startsWith('http') ? data.logo_url : `${baseUrl}${data.logo_url}`) : DEFAULT_LOGO);
        setBannerSrc(data.banner_url ? (data.banner_url.startsWith('http') ? data.banner_url : `${baseUrl}${data.banner_url}`) : DEFAULT_BANNER);
      })
      .catch(() => showToast('error', 'Không thể tải hồ sơ công ty'))
      .finally(() => setLoading(false));
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

  // ── Upload Logo ──
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

  // ── Upload Banner ──
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
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HERO CARD */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="h-40 md:h-56 w-full relative">
            {loading ? <ProfileSkeleton className="w-full h-full rounded-none" /> : <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />}
            
            {/* Chỉ hiện nút sửa Banner nếu có quyền canEdit */}
            {canEdit && (
              <>
                <button onClick={() => bannerInputRef.current?.click()} className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-black/80 transition-colors shadow">
                  <Edit2 className="w-4 h-4" />
                </button>
                <input type="file" ref={bannerInputRef} accept="image/*" className="hidden" onChange={handleBannerChange} />
              </>
            )}
          </div>

          <div className="px-6 md:px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 md:-mt-16 mb-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-[#0E1422] rounded-2xl shadow-md border-4 border-white dark:border-[#0E1422] p-2">
                {loading ? <ProfileSkeleton className="w-full h-full rounded-xl" /> : <img src={logoSrc} alt="Logo" className="w-full h-full rounded-xl object-contain transition-colors" />}
                
                {/* Chỉ hiện nút sửa Logo nếu có quyền canEdit */}
                {canEdit && (
                  <>
                    <button onClick={() => logoInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-white dark:bg-white/10 p-2 rounded-full shadow border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <input type="file" ref={logoInputRef} accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </>
                )}
              </div>

              {/* Chỉ hiện nút cập nhật thông tin nếu có quyền canEdit */}
              {canEdit && (
                <button onClick={() => { setEditInfo({...companyInfo}); setModalOpen(true); }} className="self-start md:self-auto px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
                  <Edit2 className="w-4 h-4" /> Cập nhật thông tin
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3"><ProfileSkeleton className="h-8 w-64" /><ProfileSkeleton className="h-5 w-48" /></div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{companyInfo.name || 'Tên công ty'}</h1>
                  {companyInfo.is_verified && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {companyInfo.address && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {companyInfo.address}</span>}
                  {companyInfo.website && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> <a href={companyInfo.website} target="_blank" rel="noreferrer" className="hover:text-blue-500 hover:underline">{companyInfo.website}</a></span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION CARD */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> Giới thiệu công ty
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3"><ProfileSkeleton className="h-4 w-full" /><ProfileSkeleton className="h-4 w-5/6" /><ProfileSkeleton className="h-4 w-4/6" /></div>
          ) : companyInfo.description ? (
            <div className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
              {companyInfo.description}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic text-center py-6">Chưa có thông tin giới thiệu công ty.</p>
          )}
        </div>

      </div>

      {/* EDIT MODAL (Chỉ render khi canEdit và thực hiện mở modal) */}
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