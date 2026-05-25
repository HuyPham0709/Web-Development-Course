export interface Candidate {
    application_id: number;
    candidate_id: number;
    candidate_name: string;
    candidate_email: string;
    full_name: string;
    job_title: string;
    job_id: number;
    experience_level: string;
    status: string;
    applied_at: string;
    avatar_url?: string;
    avatar?: string;
}

export interface ApplicationDetail extends Candidate {
    phone: string;
    bio: string;
    cv_url: string;
    cover_letter: string;
    work_experience: Array<{
        company_name: string;
        position: string;
        start_date: string;
        end_date: string;
        description: string;
    }>;
    education: Array<{
        school_name: string;
        major: string;
        start_date: string;
        end_date: string;
    }>;
    skills: string[];
}

export interface Note {
    id: number;
    author: string;
    date: string;
    text: string;
}

export interface Job {
    id: number;
    title: string;
    job_type: string;
    location_name: string;
    created_at: string;
    application_count: number;
    status: string;
    rejection_reason?: string;
    salary_min: number;
    salary_max: number;
    currency: string;
}

export interface Stats {
    total_jobs: number;
    total_applications: number;
}

export interface ApplicationNote {
    id: number;
    content: string;
    created_at: string;
    display_name: string | null;
    username: string;
}