-- ==========================================================
-- DATABASE: job_finder_db (Phiên bản sạch & Tối ưu hoàn chỉnh)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS job_finder_db;
CREATE DATABASE job_finder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_finder_db;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- 1. DANH MỤC HỆ THỐNG
-- ==========================================================

CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    icon_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 2. THỰC THỂ CHÍNH (Companies & Users)
-- ==========================================================

CREATE TABLE Companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255) NULL,
    banner_url VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    description TEXT NULL,
    address VARCHAR(255) NULL,
    slug VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    avatar_url VARCHAR(255) NULL,
    display_name VARCHAR(100) NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 3. HỒ SƠ CHI TIẾT (Profiles, Education, Work_Experience)
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
    social_links JSON NULL COMMENT 'Lưu link mạng xã hội dưới dạng JSON',
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
-- 4. QUẢN LÝ VIỆC LÀM (Jobs & Bảng liên kết Kỹ năng)
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
    thumbnail_url VARCHAR(255) NULL,
    job_type ENUM('full-time', 'part-time', 'contract', 'freelance') DEFAULT 'full-time',
    experience_level ENUM('Thực tập sinh', 'Mới tốt nghiệp/ Chưa có kinh nghiệm', 'Nhân viên', 'Trưởng nhóm', 'Quản lý cấp cao') NULL,
    description TEXT NOT NULL,
    requirements TEXT NULL,
    benefit TEXT NULL,                
    status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (location_id) REFERENCES Locations(id) ON DELETE RESTRICT
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
-- 5. NGHIỆP VỤ KẾT NỐI & TƯƠNG TÁC
-- ==========================================================

CREATE TABLE Applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    cover_letter TEXT NULL,
    cv_snapshot_url VARCHAR(255) NULL,
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
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
    message TEXT NOT NULL,
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
-- 6. TIÊU CHÍ TÌM VIỆC (JobCriteria)
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
    skills TEXT NULL COMMENT 'Danh sách kỹ năng cách nhau bởi dấu phẩy hoặc JSON',
    languages TEXT NULL,                           
    preferred_companies TEXT NULL,                 
    benefits TEXT NULL,                            
    available_from DATE NULL,                      
    is_open_to_work TINYINT DEFAULT 1,            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- 7. CHỈ MỤC (INDEXES TỐI ƯU SEARCH)
-- ==========================================================

-- Chỉ mục cho bảng Jobs & Applications
CREATE INDEX idx_job_status ON Jobs(status);
CREATE INDEX idx_job_type ON Jobs(job_type);
CREATE INDEX idx_application_status ON Applications(status);

-- Chỉ mục cho bảng JobCriteria
CREATE INDEX idx_jobcriteria_user ON JobCriteria(user_id);
CREATE INDEX idx_jobcriteria_salary ON JobCriteria(salary_min, salary_max);
CREATE INDEX idx_jobcriteria_location ON JobCriteria(preferred_location);
CREATE INDEX idx_jobcriteria_industry ON JobCriteria(industry);
CREATE INDEX idx_jobcriteria_career_level ON JobCriteria(career_level);
CREATE INDEX idx_jobcriteria_workplace ON JobCriteria(workplace_type);
CREATE INDEX idx_jobcriteria_open_to_work ON JobCriteria(is_open_to_work);

ALTER TABLE Notifications ADD COLUMN link_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE Notifications ADD COLUMN title VARCHAR(255) NOT NULL AFTER user_id;