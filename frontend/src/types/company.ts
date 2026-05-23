export interface CompanyInfo {
  id?: number;
  name: string;
  logo_url: string | null;
  banner_url: string | null;
  website: string | null;
  description: string | null;
  address: string | null;
  slug?: string;
  is_verified?: boolean;
}