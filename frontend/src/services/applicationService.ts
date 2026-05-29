import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Cải tiến: Chỉ đính kèm Bearer token nếu token thực sự tồn tại trong localStorage
function getHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const applicationService = {
  // =========================
  // EMPLOYER
  // =========================

  getEmployerApplications: () =>
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

  getEmployerJobs: () =>
    axios.get(`${API_URL}/jobs/my-jobs`, {
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

  getMyApplications: () =>
    axios.get(`${API_URL}/applications/my`, {
      headers: getHeaders(),
    }),

  // =========================
  // NOTES & JOB ACTIONS
  // =========================

  getNotes: (application_id: number | string) =>
    axios.get(`${API_URL}/applications/notes/${application_id}`, { headers: getHeaders() }),

  addNote: (application_id: number | string, content: string) =>
    axios.post(`${API_URL}/applications/notes`, { application_id, content }, { headers: getHeaders() }),

  deleteNote: (note_id: number | string) =>
    axios.delete(`${API_URL}/applications/notes/${note_id}`, { headers: getHeaders() }),

  // Toggle job status
  toggleJobStatus: (job_id: number | string) =>
    axios.put(`${API_URL}/applications/jobs/toggle-status`, { job_id }, { headers: getHeaders() }),

  deleteJob: (job_id: number | string) =>
    axios.delete(`${API_URL}/jobs/${job_id}`, { headers: getHeaders() }),
};