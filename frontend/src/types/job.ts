// src/types/job.ts

export interface ICompany {
  id?: number;
  name?: string;
  logo_url?: string;
  is_verified?: boolean;
}

export interface ILocation {
  name?: string;
}

export interface ISkill {
  name: string;
}

export interface IJob {
  id: number;
  title: string;
  created_at: string;
  company_name?: string;
  logo_url?: string;
  is_verified?: boolean;
  Company?: ICompany;
  Location?: ILocation;
  location_name?: string;
  location?: string;
  job_type?: string;
  type?: string;
  experience_level?: string;
  experience?: string;
  salary_min?: number;
  salary_max?: number;
  status?: string;
  Skills?: ISkill[];
  skills?: ISkill[] | string;
}

export interface IJobFilters {
  title?: string;
  location?: string;
  category_id?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  salary?: string;
  sort?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}