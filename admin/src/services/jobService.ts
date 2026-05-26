import { ADMIN_JOBS_API, getHeaders } from '../constants';

export const jobService = {
    // 1. GET /api/admin/jobs/admin/pending
    getPendingJobs: async () => {
        const res = await fetch(`${ADMIN_JOBS_API}/admin/pending`, { headers: getHeaders() });
        return res.json();
    },

    // 2. PUT /api/admin/jobs/admin/:job_id/approve
    approveJob: async (jobId: number, reason?: string) => {
        const res = await fetch(`${ADMIN_JOBS_API}/admin/${jobId}/approve`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ reason }),
        });
        return res.json();
    },

    // 3. PUT /api/admin/jobs/admin/:job_id/reject
    rejectJob: async (jobId: number, reason: string) => {
        const res = await fetch(`${ADMIN_JOBS_API}/admin/${jobId}/reject`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ reason }),
        });
        return res.json();
    },

    // 4. POST /api/admin/jobs/:job_id/duplicate
    duplicateJob: async (jobId: number) => {
        const res = await fetch(`${ADMIN_JOBS_API}/${jobId}/duplicate`, {
            method: 'POST',
            headers: getHeaders()
        });
        return res.json();
    }, // <-- THÊM DẤU PHẨY Ở ĐÂY để ngăn cách

    // 5. GET /api/admin/jobs/:job_id
    getJobById: async (jobId: string | number) => {
        const res = await fetch(`${ADMIN_JOBS_API}/${jobId}`, { headers: getHeaders() });
        return res.json();
    }, // <-- THÊM DẤU PHẨY Ở ĐÂY để ngăn cách

    // 6. PUT /api/admin/jobs/:job_id
    updateJob: async (jobId: string | number, jobData: any) => {
        const res = await fetch(`${ADMIN_JOBS_API}/${jobId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(jobData)
        });
        return res.json();
    }
};