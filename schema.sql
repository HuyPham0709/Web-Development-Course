-- ==========================================================
-- DATABASE: job_finder_db (Optimized & Clean Production Version)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
CREATE DATABASE job_finder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_finder_db;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- 1. SYSTEM MASTER DATA (Lookup Tables)
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
-- 2. MAIN ENTITIES (Companies, Users & Security)
-- ==========================================================

CREATE TABLE Companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(512) NULL,
    banner_url VARCHAR(512) NULL,
    website VARCHAR(255) NULL,
    description TEXT NULL,
    address VARCHAR(255) NULL,
    location_id INT NULL, -- Chuẩn hóa khu vực của công ty
    slug VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (location_id) REFERENCES Locations(id) ON DELETE SET NULL
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
    ban_reason TEXT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 3. DETAILED PROFILES & CVs
-- ==========================================================

CREATE TABLE Profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100) NULL,
    title VARCHAR(255) NULL,
    location_id INT NULL, -- Đổi từ VARCHAR sang FK để query chính xác
    phone VARCHAR(20) NULL,
    gender ENUM('male', 'female', 'other') NULL,
    dob DATE NULL,
    cv_url VARCHAR(512) NULL,        
    avatar_url VARCHAR(512) NULL,    
    cover_url VARCHAR(512) NULL,     
    bio TEXT NULL,
    allow_employer_search BOOLEAN DEFAULT FALSE, -- Đưa trực tiếp vào đây
    social_links JSON NULL COMMENT 'Lưu liên kết mạng xã hội dạng JSON',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES Locations(id) ON DELETE SET NULL,
    INDEX idx_allow_search (allow_employer_search)
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

CREATE TABLE User_Skills (
    profile_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (profile_id, skill_id),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================
-- 4. JOB MANAGEMENT
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
    currency ENUM('VND', 'USD') DEFAULT 'VND', -- Quản lý loại tiền tệ
    is_negotiable BOOLEAN DEFAULT FALSE,       -- Cờ xử lý lương thỏa thuận
    thumbnail_url VARCHAR(512) NULL,
    job_type ENUM('full-time', 'part-time', 'contract', 'freelance') DEFAULT 'full-time',
    experience_level ENUM('intern', 'fresher', 'junior', 'middle', 'senior') NULL,
    description TEXT NOT NULL,
    requirements TEXT NULL,
    benefit TEXT NULL,                
    status ENUM('pending', 'approved', 'rejected', 'closed', 'banned') DEFAULT 'pending',
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

CREATE TABLE Job_Skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================
-- 5. OPERATIONS & INTERACTIONS
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

-- Bảng lưu lịch sử xem profile chuẩn hóa (1 NTD - 1 Ứng viên là Duy nhất)
CREATE TABLE Employer_Profile_Views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,
    candidate_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_notified TINYINT DEFAULT 0,
    status VARCHAR(50) DEFAULT NULL,
    FOREIGN KEY (employer_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_employer_candidate (employer_id, candidate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Job_Invitations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employer_id INT NOT NULL,       
    candidate_id INT NOT NULL,      
    job_id INT NOT NULL,            
    message TEXT NOT NULL,          
    status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employer_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    
    INDEX idx_invitation_candidate (candidate_id),
    INDEX idx_invitation_employer (employer_id),
    INDEX idx_invitation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================
-- 6. ADVANCED MATCHING CRITERIA
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
    currency ENUM('VND', 'USD') DEFAULT 'VND',
    preferred_salary_type VARCHAR(50) NULL,        
    workplace_type VARCHAR(100) NULL,
    languages TEXT NULL, -- Nếu cần filter nâng cao, sau này nên tách thành bảng riêng tương tự Skills
    preferred_companies TEXT NULL,                 
    benefits TEXT NULL,                            
    available_from DATE NULL,                      
    is_open_to_work BOOLEAN DEFAULT TRUE,            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    INDEX idx_jobcriteria_salary (salary_min, salary_max),
    INDEX idx_jobcriteria_open_to_work (is_open_to_work)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Các bảng quan hệ nhiều-nhiều (Many-to-Many) phục vụ riêng cho tính năng Gợi ý/Matching việc làm nhanh
CREATE TABLE Criteria_Skills (
    criteria_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (criteria_id, skill_id),
    FOREIGN KEY (criteria_id) REFERENCES JobCriteria(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Criteria_Locations (
    criteria_id INT NOT NULL,
    location_id INT NOT NULL,
    PRIMARY KEY (criteria_id, location_id),
    FOREIGN KEY (criteria_id) REFERENCES JobCriteria(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES Locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==========================================================
-- 7. NOTES MANAGEMENT
-- ==========================================================

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