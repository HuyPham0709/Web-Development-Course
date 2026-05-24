import axios from "axios";
import api from "./api"; // nhớ api export default

const API_URL = "http://localhost:5000/api";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
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


  updateStatus: (application_id: number, status: string) =>
    axios.put(
      `${API_URL}/applications/update-status`,
      { application_id, status },
      { headers: getHeaders() }
    ),

  getEmployerJobs: () =>
    axios.get(`${API_URL}/jobs/my-jobs`, {
      headers: getHeaders(),
    }),

  // =========================
  // CANDIDATE
  // =========================

  applyJob: (jobId: number) =>
    axios.post(
      `${API_URL}/applications/apply`,
      { jobId },
      { headers: getHeaders() }
    ),

  getMyApplications: () =>
    axios.get(`${API_URL}/applications/my`, {
      headers: getHeaders(),
    }),


  // Thêm vào object applicationService:

  // Notes
  getNotes: (application_id: number) =>
    axios.get(`${API_URL}/applications/notes/${application_id}`, { headers: getHeaders() }),

  addNote: (application_id: number, content: string) =>
    axios.post(`${API_URL}/applications/notes`, { application_id, content }, { headers: getHeaders() }),

  deleteNote: (note_id: number) =>
    axios.delete(`${API_URL}/applications/notes/${note_id}`, { headers: getHeaders() }),

  // Toggle job status
  toggleJobStatus: (job_id: number) =>
    axios.put(`${API_URL}/applications/jobs/toggle-status`, { job_id }, { headers: getHeaders() }),

  deleteJob: (job_id: number) =>
    axios.delete(`${API_URL}/jobs/${job_id}`, { headers: getHeaders() }),

};