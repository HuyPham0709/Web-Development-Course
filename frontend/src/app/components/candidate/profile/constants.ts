import { User, Briefcase, Bell, FileText, Sparkles, Settings } from 'lucide-react';

export type MenuItem = {
  id: string;
  label: string;
  icon?: React.ElementType;
  subItems?: { id: string; label: string }[];
};

export const SIDEBAR_MENU: MenuItem[] = [
  {
    id: 'group-profile',
    label: 'Hồ sơ Việc Làm 24h',
    icon: FileText,
    subItems: [
      { id: 'profile', label: 'Hồ sơ của tôi' },
      { id: 'search-criteria', label: 'Tiêu chí tìm việc' },
    ]
  },
  { id: 'cv-builder', label: 'Trang trí CV', icon: Sparkles },
  {
    id: 'group-jobs',
    label: 'Quản lý việc làm',
    icon: Briefcase,
    subItems: [
      { id: 'applications', label: 'Việc làm đã ứng tuyển' },
      { id: 'saved', label: 'Việc làm đã lưu' },
      { id: 'pending', label: 'Việc làm chờ ứng tuyển' },
      { id: 'viewed-by-employer', label: 'Nhà tuyển dụng xem hồ sơ bạn' },
    ]
  },
  {
    id: 'group-support',
    label: 'Hỗ trợ và thông báo',
    icon: Bell,
    subItems: [
      { id: 'messages', label: 'Tin nhắn từ Việc làm 24h' },
      { id: 'email-settings', label: 'Cài đặt thông báo qua Email' },
      { id: 'guidelines', label: 'Hướng dẫn sử dụng' },
      { id: 'handbook', label: 'Cẩm nang nghề nghiệp' },
      { id: 'personality-test', label: 'Trắc nghiệm tính cách' },
    ]
  },
  { id: 'account', label: 'Cài đặt giao diện', icon: Settings },
];

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1762522926157-bcc04bf0b10a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400';
export const DEFAULT_COVER = 'https://images.unsplash.com/photo-1646038572822-432f8ccf2522?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';