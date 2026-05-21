import { api } from './api';

export const getJobCriteria = async () => {
  const res = await api.get('/api/job-criteria');
  return res.data;
};

export const saveJobCriteria = async (data: any) => {
  const res = await api.put('/api/job-criteria', data);
  return res.data;
};