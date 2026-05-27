-- ==========================================================
-- DATABASE: job_finder_db (Clean & 100% Monolithic Version)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
CREATE DATABASE job_finder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_finder_db;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- 1. SYSTEM CATEGORIES
-- ==========================================================

CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    icon_url VARCHAR(512) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(512) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 2. MAIN ENTITIES (Companies & Users)
-- ==========================================================

CREATE TABLE Companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512) NULL,
    banner_url VARCHAR(512) NULL,
    website VARCHAR(255) NULL,
    description TEXT NULL,
    address VARCHAR(255) NULL,
    slug VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('candidate', 'employer', 'admin') NOT NULL,
    company_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6) NULL,
    otp_expires DATETIME NULL,
    avatar_url VARCHAR(512) NULL,
    display_name VARCHAR(100) NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 3. DETAILED PROFILES (Profiles, Education, Work_Experience)
-- ==========================================================

CREATE TABLE Profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100) NULL,
    title VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    gender ENUM('male', 'female', 'other') NULL,
    dob DATE NULL,
    cv_url VARCHAR(512) NULL,        
    avatar_url VARCHAR(512) NULL,    
    cover_url VARCHAR(512) NULL,     
    bio TEXT NULL,
    social_links JSON NULL COMMENT 'Save social links as JSON',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    major VARCHAR(255) NULL,
    gpa VARCHAR(10) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    description TEXT NULL,
    period_text VARCHAR(100) NULL,
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Work_Experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(100) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    description TEXT NULL,
    period_text VARCHAR(100) NULL,
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 4. JOB MANAGEMENT (Jobs & Skill Mapping Tables)
-- ==========================================================

CREATE TABLE Jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    posted_by INT NOT NULL,
    category_id INT NOT NULL,
    location_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    salary_min BIGINT DEFAULT 0,
    salary_max BIGINT DEFAULT 0,
    thumbnail_url VARCHAR(512) NULL,
    job_type ENUM('full-time', 'part-time', 'contract', 'freelance') DEFAULT 'full-time',
    experience_level ENUM('intern', 'fresher', 'junior', 'middle', 'senior') NULL,
    description TEXT NOT NULL,
    requirements TEXT NULL,
    benefit TEXT NULL,                
    status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
    rejection_reason TEXT NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES Locations(id) ON DELETE RESTRICT,
    
    INDEX idx_job_status (status),
    INDEX idx_job_type (job_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE User_Skills (
    profile_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (profile_id, skill_id),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Job_Skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 5. CONNECTION & INTERACTION OPERATIONS
-- ==========================================================

CREATE TABLE Applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    cover_letter TEXT NULL,
    cv_snapshot_url VARCHAR(512) NULL,
    status ENUM('pending', 'reviewed', 'accepted', 'rejected', 'interviewing') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    
    INDEX idx_application_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Favorite_Jobs (
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    job_id INT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(512) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type ENUM('application_status', 'new_job', 'system') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    job_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'resolved', 'ignored') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 6. JOB SEARCH CRITERIA & NOTES
-- ==========================================================

CREATE TABLE JobCriteria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    desired_position VARCHAR(255) NULL,
    industry VARCHAR(255) NULL,                    
    job_type VARCHAR(100) NULL,                    
    experience_level VARCHAR(100) NULL,            
    career_level VARCHAR(100) NULL,                
    salary_min BIGINT NULL,
    salary_max BIGINT NULL,
    preferred_salary_type VARCHAR(50) NULL,        
    preferred_location VARCHAR(255) NULL,
    workplace_type VARCHAR(100) NULL,
    skills TEXT NULL COMMENT 'Comma-separated list of skills or JSON',
    languages TEXT NULL,                           
    preferred_companies TEXT NULL,                 
    benefits TEXT NULL,                            
    available_from DATE NULL,                      
    is_open_to_work BOOLEAN DEFAULT TRUE,            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    INDEX idx_jobcriteria_user (user_id),
    INDEX idx_jobcriteria_salary (salary_min, salary_max),
    INDEX idx_jobcriteria_location (preferred_location),
    INDEX idx_jobcriteria_industry (industry),
    INDEX idx_jobcriteria_career_level (career_level),
    INDEX idx_jobcriteria_workplace (workplace_type),
    INDEX idx_jobcriteria_open_to_work (is_open_to_work)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Application_Notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES Applications(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE Users ADD COLUMN phone VARCHAR(20) NULL;

-- 1. Thêm cột bật/tắt cho phép NTD tìm bạn (trong bảng Profiles)
ALTER TABLE Profiles 
ADD COLUMN allow_employer_search BOOLEAN DEFAULT FALSE,
ADD INDEX idx_allow_employer_search (allow_employer_search);

use job_finder_db ;
-- 2. Bảng lưu lịch sử NTD xem profile ứng viên
CREATE TABLE IF NOT EXISTS Employer_Profile_Views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    candidate_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_notified TINYINT DEFAULT 0,
    view_date DATE GENERATED ALWAYS AS (DATE(viewed_at)) STORED,
    FOREIGN KEY (employer_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_candidate (candidate_id),
    UNIQUE KEY uk_view_per_day (employer_id, candidate_id, view_date)
);
