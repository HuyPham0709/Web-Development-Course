export const API_BASE = 'https://web-development-course-y23i.onrender.com/api';

// Admin routes — khớp với app.js
export const ADMIN_USERS_API = `${API_BASE}/admin/users`;
export const ADMIN_jobs_API = `${API_BASE}/admin/jobs`;
export const ADMIN_METADATA_API = `${API_BASE}/admin/metadata`;
export const ADMIN_REPORTS_API = `${API_BASE}/admin/reports`;
export const ADMIN_DASHBOARD_API = `${API_BASE}/admin/dashboard`;

export function getHeaders() {
    const token = localStorage.getItem('admin_token');
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export const QUICK_REASONS = [
    'Missing salary info',
    'Spam / Duplicate',
    'Inappropriate content',
    'Invalid application link',
    'Unverified company',
    'Suspicious salary range',
];

export const METADATA_VIEWS = [
    { key: 'categories' as const, label: 'Job Categories', apiPath: 'categories' },
    { key: 'locations' as const, label: 'locations (SEO)', apiPath: 'locations' },
    { key: 'skills' as const, label: 'Skill Tags', apiPath: 'skills' },
];