export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function getInitials(name: string): string {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return '1 ngày trước';
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}
export const resolveFileUrl = (url: string | null | undefined): string => {
  if (!url) return '#';

  // Nếu url đã bắt đầu bằng http hoặc https (đây là link Cloudinary), trả về luôn không nối chuỗi
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Nếu là link cũ lưu local ở backend
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (url.startsWith('/uploads/')) {
    return `${baseUrl}${url}`;
  }
  return `${baseUrl}/uploads/${url}`;
};

export function formatSalary(
  min: number | string | null | undefined,
  max: number | string | null | undefined,
  currency = "USD"
): string {
  const numMin = min !== null && min !== undefined ? Number(min) : 0;
  const numMax = max !== null && max !== undefined ? Number(max) : 0;

  if (!numMin && !numMax) return "Negotiable";

  const fmt = (val: number) =>
    val.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  if (numMin && numMax) return `${fmt(numMin)} - ${fmt(numMax)}`;
  if (numMin) return `From ${fmt(numMin)}`;
  return `Up to ${fmt(numMax)}`;
}

export function formatRelativeTime(dateString?: string) {
  if (!dateString) return "Recently posted";
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMins < 60) {
    return diffInMins <= 1 ? "Just now" : `${diffInMins} mins ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }
  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}