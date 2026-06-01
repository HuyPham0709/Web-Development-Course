// ==================== JOBS ====================
export interface PendingJob {
    id: number;
    title: string;
    description: string;
    requirements: string;
    job_type: string;
    experience_level: string;
    salary_min: number;
    salary_max: number;
    status: string;
    created_at: string;
    company_id: number;
    company_name: string;
    logo_url: string | null;
    company_verified: number;
    location_name: string;
    category_name: string;
    posted_by_username: string;
    posted_by_email: string;
}

// Đổi tên để tránh trùng
export interface JobStats {
    total: number
    total_approved: number
    total_pending: number
    total_closed: number
    total_rejected: number
    total_banned: number
}

export interface AdminJob {
    id: number
    title: string
    company_name: string
    location_name: string
    category_name: string
    job_type: string
    experience_level: string
    salary_min: number
    salary_max: number
    status: 'pending' | 'approved' | 'rejected' | 'closed' | 'banned'
    created_at: string
    description: string
    requirements: string
    benefit: string
    rejection_reason?: string
}

// Đổi tên Pagination thành PaginationMeta để không trùng
export interface PaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}
// ==================== USERS ====================
export interface UserItem {
    id: number;
    username: string;
    display_name: string | null;
    email: string;
    role: 'candidate' | 'employer';
    is_active: number;
    is_verified: number;
    created_at: string;
    company_id: number | null;
    company_name: string | null;
    company_verified: number | null;
}

export interface UserStats {
    total: number;
    total_candidates: number;
    total_employers: number;
    total_banned: number;
    total_pending: number;
}

export interface UserDetail extends UserItem {
    avatar_url: string | null;
    full_name: string | null;
    phone: string | null;
    bio: string | null;
    website: string | null;
    address: string | null;
    total_applications?: number;
    total_jobs?: number;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ==================== REPORTS ====================
export interface Report {
    id: number;
    reason: string;
    status: 'pending' | 'resolved' | 'ignored';
    created_at: string;
    job_id: number;
    job_title: string;
    job_status: string;
    company_name: string;
    reporter_id: number;
    reporter_username: string;
    reporter_email: string;
}

export interface ReportStats {
    total: number;
    total_pending: number;
    total_resolved: number;
    total_ignored: number;
}

// ==================== METADATA ====================
export type MetadataView = 'categories' | 'locations' | 'skills';

export interface MetaItem {
    id: number;
    name: string;
    slug?: string;
    job_count?: number;
    user_count?: number;
    created_at?: string;
}

export interface MetaFormState {
    name: string;
    slug: string;
}

// ==================== DASHBOARD ====================
export interface DashboardStats {
    totalCandidates: number;
    verifiedCompanies: number;
    pendingJobs: number;
    activeReports: number;
}

export interface CategoryChartItem {
    name: string;
    value: number;
    color: string;
}

export interface CompanyFeedback {
    id: string;
    employerName: string;
    note: string;
    rating: number;
    addedAt: string;
}