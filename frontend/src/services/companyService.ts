import { api } from './api';
import { CompanyInfo } from '../types/company';

export const getCompanyProfile = async (companyId: number): Promise<CompanyInfo> => {
  const response = await api.get(`/api/companies/${companyId}`);
  return response.data;
};

export const saveCompanyProfile = async (companyId: number, data: Partial<CompanyInfo>): Promise<CompanyInfo> => {
  const response = await api.put(`/api/companies/${companyId}`, data);
  return response.data;
};

// Lưu ý: Cần thêm endpoints upload logo và banner ở backend tương tự như upload-avatar