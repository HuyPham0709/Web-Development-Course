import { api } from "./api";
import { IJobFilters, IPaginatedResponse, IJob } from "../types/job";
// 1. Lấy thông tin chi tiết 1 Job theo ID (Đã có sẵn của bạn)
export const getJobById = async (id: string) => {
  const res = await api.get(`/api/jobs/${id}`);
  return res.data.data;
};

// 2. Lấy danh sách công việc có hỗ trợ phân trang (Pagination/Infinite Scroll)
export const getJobs = async (params?: IJobFilters): Promise<IPaginatedResponse<IJob>> => {
  const res = await api.get("/api/jobs", { params });
  
  // Giả định backend trả về { data: [...], meta: { hasMore: true } }
  // Nếu backend hiện tại chỉ trả về mảng, ta bọc lại cho đúng chuẩn Interface Frontend
  if (Array.isArray(res.data.data || res.data)) {
    return {
      data: res.data.data || res.data,
      meta: res.data.meta || { hasMore: false } // Dự phòng nếu backend chưa có meta
    };
  }
  
  return res.data;
};

// 3. Lấy danh sách danh mục ngành nghề (Categories)
export const getCategories = async () => {
  const res = await api.get("/api/categories");
  return res.data.data || res.data;
};

// 4. Lấy danh sách địa điểm (Locations)
export const getLocations = async () => {
  const res = await api.get("/api/locations");
  return res.data.data || res.data;
};

// 5. Lấy danh sách công ty uy tín hàng đầu (Mock data dựa trên seed.sql để tránh lỗi 404)
export const getTopCompanies = async () => {
  const res = await api.get("/api/companies/top");
  return res.data; // Trả về dữ liệu thật chạy từ câu lệnh SQL ở Backend
};

// 6. Lấy danh sách kỹ năng nổi bật (Trending Skills)
export const getSkills = async () => {
  const res = await api.get("/api/skills");
  return res.data.data || res.data;
};
export const getJobSuggestions = async (query: string, signal: AbortSignal): Promise<any[]> => {
  try {
    // SỬA: Thêm tiền tố /api vào trước /jobs/autocomplete
    const response = await api.get(`/api/jobs/autocomplete?q=${encodeURIComponent(query)}`, { signal });
    
    // Trả về response.data.data nếu backend bọc qua object success, hoặc response.data nếu trả về mảng trực tiếp
    return response.data.data || response.data;
  } catch (error: any) {
    // Nếu request bị hủy bởi AbortController thì bỏ qua không log lỗi
    if (error.name === "CanceledError" || error.name === "AbortError") {
      throw error;
    }
    console.error("Lỗi khi fetch gợi ý từ database:", error);
    return [];
  }
};