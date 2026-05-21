export const STATUSES = ['pending', 'reviewed', 'interviewing', 'accepted', 'rejected'];

export const STATUS_LABEL: Record<string, string> = {
    pending: 'Pending',
    reviewed: 'Under Review',
    interviewing: 'Interviewing',
    accepted: 'Hired',
    rejected: 'Rejected',
};

export const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700 border-blue-200',
    reviewed: 'bg-orange-100 text-orange-700 border-orange-200',
    interviewing: 'bg-purple-100 text-purple-700 border-purple-200',
    accepted: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
};

// Dùng riêng cho CandidateDetail (không có border)
export const STATUS_BADGE_COLORS: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700',
    reviewed: 'bg-orange-100 text-orange-700',
    interviewing: 'bg-purple-100 text-purple-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Under Review' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'accepted', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
];