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
    label: 'Job Profile',
    icon: FileText,
    subItems: [
      { id: 'profile', label: 'My Profile' },
      { id: 'search-criteria', label: 'Job Search Criteria' },
    ]
  },

  {
    id: 'cv-builder',
    label: 'CV Builder',
    icon: Sparkles,
  },

  {
    id: 'group-jobs',
    label: 'Job Management',
    icon: Briefcase,
    subItems: [
      { id: 'applications', label: 'Applied Jobs' },
      { id: 'saved', label: 'Saved Jobs' },
      { id: 'pending', label: 'Pending Applications' },
      { id: 'viewed-by-employer', label: 'Employers Viewed Your Profile' },
    ]
  },

  {
    id: 'group-support',
    label: 'Support & Notifications',
    icon: Bell,
    subItems: [
      { id: 'messages', label: 'Messages' },
      { id: 'email-settings', label: 'Email Notification Settings' },
      { id: 'guidelines', label: 'User Guidelines' },
      // { id: 'handbook', label: 'Career Handbook' },
      // { id: 'personality-test', label: 'Personality Test' },
    ]
  },

  {
    id: 'account',
    label: 'Appearance Settings',
    icon: Settings,
  },
];

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1762522926157-bcc04bf0b10a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400';

export const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1646038572822-432f8ccf2522?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';