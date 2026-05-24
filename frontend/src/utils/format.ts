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
  currency = "VND"
): string {
  const numMin = min !== null && min !== undefined ? Number(min) : 0;
  const numMax = max !== null && max !== undefined ? Number(max) : 0;
  const currentCurrency = String(currency || "VND").toUpperCase();

  if (!numMin && !numMax) return 'Thỏa thuận';

  if (currentCurrency === "VND") {
    // Hàm phụ để biến đổi từng số đơn lẻ thành chuỗi hiển thị thông minh
    const formatSingleValue = (val: number): string => {
      if (val >= 1000000) {
        const valueM = val / 1000000;
        // Nếu là số nguyên (ví dụ 1.0) thì lấy 1M, nếu lẻ (ví dụ 1.5) thì giữ 1.5M
        return Number(valueM.toFixed(1)) + "M";
      } else if (val >= 1000) {
        const valueK = val / 1000;
        // Chuyển thành dạng "500 nghìn" hoặc "50k" tùy bạn thích. 
        // Ở đây mình để chữ "nghìn" cho thân thiện, bạn có thể đổi chữ " nghìn" thành "k" nếu muốn ngắn gọn.
        return Number(valueK.toFixed(0)) + " K";
      }
      return val.toString();
    };

    return `${formatSingleValue(numMin)} - ${formatSingleValue(numMax)}`;
  }

  // Fallback định dạng chuẩn cho ngoại tệ khác (USD...)
  return `${numMin.toLocaleString()} - ${numMax.toLocaleString()} ${currentCurrency}`;
}