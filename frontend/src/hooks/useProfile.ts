import { useState, useEffect } from 'react';
import { getProfile, saveProfile, uploadCV, deleteCV, PersonalInfo, WorkExperience, Education } from '../services/profileService';

export function useProfile(userId: string) {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    full_name: '', title: '', bio: '', location: '', phone: '', gender: '', dob: '', avatar_url: null, cover_url: null, cv_url: null, social_links: {}
  });
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy dữ liệu profile khi userId thay đổi
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getProfile(userId)
      .then(data => {
        if (data) {
          setPersonalInfo(data.personalInfo || {});
          setExperiences(data.experiences || []);
          setEducation(data.education || []);
          setSkills(data.skills || []);
        }
      })
      .catch(err => console.error("Profile Fetch Error:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  // Cập nhật thông tin Profile (Tránh bug ghi đè state cũ)
  const updateProfileData = async (type: 'personalInfo' | 'experiences' | 'education' | 'skills', newData: any) => {
    setSaving(true);
    try {
      // Chuẩn bị payload động chính xác bằng cách lấy data mới nhất găm vào đúng vị trí
      const payload = {
        personalInfo: type === 'personalInfo' ? newData : personalInfo,
        experiences: type === 'experiences' ? newData : experiences,
        education: type === 'education' ? newData : education,
        skills: type === 'skills' ? newData : skills,
      };

      await saveProfile(userId, payload);
      
      // Cập nhật local state sau khi API đã trả về thành công
      if (type === 'personalInfo') setPersonalInfo(newData);
      if (type === 'experiences') setExperiences(newData);
      if (type === 'education') setEducation(newData);
      if (type === 'skills') setSkills(newData);
      
      return { success: true };
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      return { success: false, message: error.response?.data?.message || error.message };
    } finally {
      setSaving(false);
    }
  };

  // 🎯 ĐÃ SỬA: Truyền thêm userId vào hàm upload và delete để service gửi lên Backend
  const handleUploadCV = async (file: File) => {
    if (!userId) return { success: false, message: "User information not found!" };
    try {
      const result = await uploadCV(userId, file); // Thêm userId ở đây
      
      // Cập nhật URL mới vào local state cá nhân
      const updatedPersonalInfo = { ...personalInfo, cv_url: result.cv_url };
      setPersonalInfo(updatedPersonalInfo);
      
      return { success: true, cv_url: result.cv_url };
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const handleDeleteCV = async () => {
    if (!userId) return { success: false, message: "User information not found!" };
    try {
      await deleteCV(userId); // Thêm userId ở đây
      
      setPersonalInfo(prev => ({ ...prev, cv_url: null }));
      return { success: true };
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  return {
    personalInfo, setPersonalInfo,
    experiences, education, skills,
    loading, saving, updateProfileData, handleUploadCV, handleDeleteCV
  };
}