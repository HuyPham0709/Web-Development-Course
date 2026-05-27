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
  // Thay vì gọi api.get gây lỗi 404, ta trả về dữ liệu giả lập chuẩn theo DB của bạn
  return [
    {
      id: 200,
      name: "NextGen Tech",
      slug: "nextgen-tech",
      logo_url: "/uploads/logos/nextgen.png",
      banner_url: "/uploads/banners/nextgen.png",
      address: "Quận 1, Hồ Chí Minh",
      is_verified: 1
    },
    {
      id: 201,
      name: "Global Logistics Solutions",
      slug: "global-logistics",
      logo_url: "/uploads/logos/logistics.png",
      banner_url: null,
      address: "Quận 7, Hồ Chí Minh",
      is_verified: 1
    },
    {
      id: 203,
      name: "Green Design Studio",
      slug: "green-design",
      logo_url: null,
      banner_url: null,
      address: "Hoàn Kiếm, Hà Nội",
      is_verified: 1
    },
    {
      id: 205,
      name: "Alpha Trading",
      slug: "alpha-trading",
      logo_url: null,
      banner_url: null,
      address: "Hải Châu, Đà Nẵng",
      is_verified: 1
    }
  ];
};

// 6. Lấy danh sách kỹ năng nổi bật (Trending Skills)
export const getSkills = async () => {
  const res = await api.get("/api/skills");
  return res.data.data || res.data;
};