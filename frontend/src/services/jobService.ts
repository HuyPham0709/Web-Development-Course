import { api } from "./api";

// 1. Lấy thông tin chi tiết 1 Job theo ID (Đã có sẵn của bạn)
export const getJobById = async (id: string) => {
  const res = await api.get(`/api/jobs/${id}`);
  return res.data.data;
};

// 2. Lấy danh sách công việc kèm các tham số lọc tìm kiếm (title, location, type, category_id)
export const getJobs = async (params?: { title?: string; location?: string; type?: string; category_id?: string }) => {
  const res = await api.get("/api/jobs", { params });
  return res.data.data || res.data; // Phòng hờ cấu trúc trả về tùy thuộc backend tuyển dụng
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

// 5. Lấy danh sách công ty uy tín hàng đầu (Top Verified Companies)
export const getTopCompanies = async () => {
  const res = await api.get("/api/companies?is_verified=true");
  return res.data.data || res.data;
};

// 6. Lấy danh sách kỹ năng nổi bật (Trending Skills)
export const getSkills = async () => {
  const res = await api.get("/api/skills");
  return res.data.data || res.data;
};