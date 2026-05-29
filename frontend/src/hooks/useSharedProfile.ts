import { useState, useEffect } from 'react';

interface PersonalInfo {
  full_name?: string;
  title?: string;
  bio?: string;
  location?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  cv_url?: string | null;
}

let cachedProfile: PersonalInfo | null = null;
let listeners: Array<(data: PersonalInfo | null) => void> = [];

const notifyListeners = (data: PersonalInfo | null) => {
  cachedProfile = data;
  listeners.forEach(fn => fn(data));
};

export function useSharedProfile() {
  const [userData, setUserData] = useState<PersonalInfo | null>(cachedProfile);
  const [loading, setLoading] = useState(!cachedProfile);

  useEffect(() => {
    // Đăng ký listener
    listeners.push(setUserData);

    // Nếu chưa có cache thì fetch
    if (!cachedProfile) {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id;

      if (token && userId) {
        fetch(`http://127.0.0.1:5000/api/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data?.personalInfo) {
              notifyListeners(data.personalInfo);
            }
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    // Lắng nghe khi profile được update từ ProfileDashboard
    const handleProfileUpdate = (e: CustomEvent) => {
      if (cachedProfile) {
        const updated = {
          ...cachedProfile,
          full_name: e.detail.full_name || cachedProfile.full_name,
          avatar_url: e.detail.avatar_url || cachedProfile.avatar_url,
        };
        notifyListeners(updated);
      }
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate as EventListener);

    return () => {
      // Hủy đăng ký listener khi unmount
      listeners = listeners.filter(fn => fn !== setUserData);
      window.removeEventListener('user-profile-updated', handleProfileUpdate as EventListener);
    };
  }, []);

  return { userData, loading };
}

// Gọi hàm này từ ProfileDashboard sau khi save để invalidate cache
export function invalidateProfileCache() {
  cachedProfile = null;
}