import axios from "axios";

const API_URL = "https://web-development-course-y23i.onrender.com/api";

// Cải tiến: Chỉ đính kèm Bearer token nếu token thực sự tồn tại trong localStorage
function getHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Thay đổi thành applicationService (chữ S viết HOA) để trùng khớp với Component gọi tới
export const applicationService = {
  // =========================
  // EMPLOYER
  // =========================

  // Đổi thành "A" viết hoa để trùng với candidateManagement gọi: applicationService.getEmployerApplications()
  getEmployerApplications: () =>
    axios.get(`${API_URL}/applications/employer/list`, {
      headers: getHeaders(),
    }),

  // Định nghĩa thêm hàm chữ thường để phòng hờ các file cũ khác gọi trúng
  getEmployerapplications: () =>
    axios.get(`${API_URL}/applications/employer/list`, {
      headers: getHeaders(),
    }),

  getApplicationById: (id: string | number) =>
    axios.get(`${API_URL}/applications/employer/detail/${id}`, {
      headers: getHeaders(),
    }),

  updateStatus: (application_id: number | string, status: string) =>
    axios.put(
      `${API_URL}/applications/update-status`,
      { application_id, status },
      { headers: getHeaders() }
    ),

  // ✅ Đã sửa thành J viết HOA cho đồng bộ hệ thống
  getEmployerJobs: () =>
    axios.get(`${API_URL}/applications/employer/jobs`, { // <-- Đường dẫn chính xác
      headers: getHeaders(),
    }),

  // API Gửi thư mời phỏng vấn
  inviteInterview: (data: { application_id: string | number; location?: string; time?: string; message?: string }) =>
    axios.post(
      `${API_URL}/applications/interview/invite`,
      data,
      { headers: getHeaders() }
    ),

  // =========================
  // CANDIDATE
  // =========================

  applyJob: (jobId: number | string) =>
    axios.post(
      `${API_URL}/applications/apply`,
      { jobId },
      { headers: getHeaders() }
    ),

  getMyapplications: () =>
    axios.get(`${API_URL}/applications/my`, {
      headers: getHeaders(),
    }),

  // ✅ BỔ SUNG THÊM: API Chấp nhận phỏng vấn
  acceptInterview: (application_id: string | number) =>
    axios.post(
      `${API_URL}/applications/interview/accept/${application_id}`,
      {},
      { headers: getHeaders() }
    ),

  // ✅ BỔ SUNG THÊM: API Từ chối phỏng vấn
  declineInterview: (application_id: string | number, reason: string) =>
    axios.post(
      `${API_URL}/applications/interview/decline/${application_id}`,
      { reason },
      { headers: getHeaders() }
    ),

  // =========================
  // NOTES & JOB ACTIONS
  // =========================

  getNotes: (application_id: number | string) =>
    axios.get(`${API_URL}/applications/notes/${application_id}`, { headers: getHeaders() }),

  addNote: (application_id: number | string, content: string) =>
    axios.post(`${API_URL}/applications/notes`, { application_id, content }, { headers: getHeaders() }),

  deleteNote: (note_id: number | string) =>
    axios.delete(`${API_URL}/applications/notes/${note_id}`, { headers: getHeaders() }),

  // ✅ Đã sửa thành J và S viết HOA cho chuẩn CamelCase
  toggleJobStatus: (job_id: number | string) =>
    axios.put(`${API_URL}/applications/jobs/toggle-status`, { job_id }, { headers: getHeaders() }),

  deleteJob: (job_id: number | string) =>
    axios.delete(`${API_URL}/jobs/${job_id}`, { headers: getHeaders() }),
};

// Tạo một alias tên viết thường để tương thích ngược nếu có file nào khác đang import { applicationService }
export const applicationService = applicationService;

// EXPORT DEFAULT để file CandidateManagement.tsx có thể nhận dạng đúng cấu trúc
export default applicationService;