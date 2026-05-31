import { CompanyFeedback } from '../types';
// Tạo chữ viết tắt từ tên (VD: "Global Logistics" -> "GL")
export function getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
}

// Hiển thị thời gian tương đối (VD: "5 phút trước")
export function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    return `${Math.floor(hrs / 24)} ngày trước`;
}

// Format ngày theo kiểu Việt Nam
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

// src/utils/index.ts

export function formatSalary(
    min: number | string | null | undefined,
    max: number | string | null | undefined,
    currency = "USD"
): string {
    const numMin = min !== null && min !== undefined ? Number(min) : 0;
    const numMax = max !== null && max !== undefined ? Number(max) : 0;

    if (!numMin && !numMax) return 'Negotiable';

    const fmt = (val: number) =>
        val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    if (numMin && numMax) return `${fmt(numMin)} - ${fmt(numMax)}`;
    if (numMin) return `From ${fmt(numMin)}`;
    return `Up to ${fmt(numMax)}`;
}

// Parse requirements từ JSON array hoặc plain text
export function parseRequirements(raw: string): string[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch { }
    return raw.split('\n').filter(Boolean);
}

// Auto-generate slug từ tên tiếng Việt
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

export function getCompanyFeedbacks(): CompanyFeedback[] {
  const data = localStorage.getItem('company_feedbacks');
  return data ? JSON.parse(data) : [];
}

export function saveCompanyFeedback(feedbacks: CompanyFeedback[]): void {
  localStorage.setItem('company_feedbacks', JSON.stringify(feedbacks));
}