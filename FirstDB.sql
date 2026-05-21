-- ==========================================================
-- DATABASE: job_finder_db (Phát hành: Version 2.1 - Clean & Optimized)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS job_finder_db;
CREATE DATABASE job_finder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_finder_db;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. DANH MỤC HỆ THỐNG
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. THỰC THỂ CHÍNH (Companies & Users)
CREATE TABLE Companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255) NULL,
    website VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    slug VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

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
    display_name VARCHAR(100) NULL,
    avatar_url VARCHAR(255) NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE SET NULL
);

-- 3. HỒ SƠ CHI TIẾT
CREATE TABLE Profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100),
    title VARCHAR(255),
    phone VARCHAR(20),
    gender ENUM('male', 'female', 'other'),
    dob DATE,
    cv_url VARCHAR(255),
    avatar_url LONGTEXT,
    cover_url LONGTEXT,
    bio TEXT,
    social_links JSON NULL COMMENT 'Lưu link mạng xã hội',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    gpa VARCHAR(10),
    start_date DATE,
    end_date DATE,
    description TEXT,
    period_text VARCHAR(100),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

CREATE TABLE Work_Experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    period_text VARCHAR(100),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

-- 4. QUẢN LÝ VIỆC LÀM
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
    experience_level ENUM('intern', 'fresher', 'junior', 'middle', 'senior'),
    description TEXT NOT NULL,
    requirements TEXT,
    status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
);

-- Bảng trung gian
CREATE TABLE User_Skills (
    profile_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (profile_id, skill_id),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

CREATE TABLE Job_Skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

-- 5. NGHIỆP VỤ KẾT NỐI & TƯƠNG TÁC
CREATE TABLE Applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    cover_letter TEXT,
    cv_snapshot_url VARCHAR(255),
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Favorite_Jobs (
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    job_id INT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE SET NULL
);

CREATE TABLE Notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type ENUM('application_status', 'new_job', 'system') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    job_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'resolved', 'ignored') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES Users(id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

-- 6. INDEXES TỐI ƯU
CREATE INDEX idx_job_status ON Jobs(status);
CREATE INDEX idx_job_type ON Jobs(job_type);
CREATE INDEX idx_application_status ON Applications(status);

-- ==========================================
-- 7. CHÈN DỮ LIỆU MẪU (SEED DATA - GIỮ NGUYÊN)
-- ==========================================

-- Công ty (ID 200-209)
INSERT IGNORE INTO Companies (id, name, slug, logo_url, banner_url, website, address, description, is_verified) VALUES  
(200, 'NextGen Tech', 'nextgen-tech', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e', NULL, 'https://nextgen.vn', 'Hồ Chí Minh', 'Phát triển phần mềm AI và Blockchain', 1),
(201, 'Alpha Commerce', 'alpha-commerce', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab', NULL, 'https://alpha.com', 'Hà Nội', 'Sàn thương mại điện tử xuyên biên giới', 1),
(202, 'Global Logistics VN', 'global-logistics-vn', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36', NULL, 'https://globallogistics.vn', 'Hải Phòng', 'Vận tải và chuỗi cung ứng quốc tế', 1),
(203, 'Creative Pulse', 'creative-pulse', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(204, 'MetricsCorp', 'metricscorp', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(205, 'CloudSystems 2', 'cloudsystems2', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(206, 'GrowthHackers', 'growthhackers', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1),
(207, 'TechFlow', 'techflow', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1pbmltYWxpc3QlMjB0ZWNoJTIwbG9nb3xlbnwxfHx8fDE3NzgxNzI2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://techflow.io', 'Hà Nội', 'TechFlow is a leading technology company expanding globally.', 1),
(208, 'InnovateSpace', 'innovatespace', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYnN0cmFjdCUyMGNvbXBhbnklMjBsb2dvfGVufDF8fHx8MTc3ODE3MjYwNHww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://innovatespace.com', 'Hồ Chí Minh', 'InnovateSpace focuses on product innovation and creativity.', 1),
(209, 'CreativePulse', 'creativepulse', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBicmFuZCUyMGxvZ298ZW58MXx8fHwxNzc4MTcyNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(210, 'MetricsCorp 2', 'metricscorp2', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY2lyY2xlJTIwbG9nb3xlbnwxfHx8fDE3NzgxNzI2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(211, 'CloudSystems', 'cloudsystems', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXR0ZXIlMjBsb2dvJTIwbW9kZXJufGVufDF8fHx8MTc3ODE3MjYwN3ww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(212, 'GrowthHackers 2', 'growthhackers2', 'https://images.unsplash.com/photo-1660137340590-d48549625980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGFwcCUyMGljb258ZW58MXx8fHwxNzc4MTcyNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1);

-- Danh mục, Địa điểm, Kỹ năng
INSERT IGNORE INTO Categories (id, name) VALUES (1, 'Công nghệ thông tin'), (2, 'Marketing'), (3, 'Kế toán'), (4, 'Thiết kế'), (5, 'Nhân sự'), (6, 'Kinh doanh'), (7, 'Kỹ thuật'), (8, 'Y tế'), (9, 'Giáo dục'), (10, 'Logistics');
INSERT IGNORE INTO Locations (id, name, slug) VALUES 
(1, 'Hà Nội', 'ha-noi'), 
(2, 'Hồ Chí Minh', 'ho-chi-minh'), 
(3, 'Đà Nẵng', 'da-nang'), 
(4, 'Hải Phòng', 'hai-phong'), 
(5, 'Cần Thơ', 'can-tho');
INSERT IGNORE INTO Skills (id, name) VALUES (1, 'Java'), (2, 'React'), (3, 'Python'), (10, 'Excel'), (11, 'English'), (12, 'Communication'), (13, 'Agile'), (14, 'Teamwork'), (15, 'Leadership');

-- Người dùng
INSERT IGNORE INTO Users (id, username, email, password, role, company_id, is_active, is_verified) VALUES  
(200, 'hr_nextgen', 'hr@nextgen.vn', '$2a$10$dummy', 'employer', 200, 1, 1),
(201, 'hr_alpha', 'tuyendung@alpha.com', '$2a$10$dummy', 'employer', 201, 1, 1),
(210, 'cand_1', 'cand1@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1),
(211, 'cand_2', 'cand2@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1),
(212, 'cand_3', 'cand3@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1);

-- Hồ sơ
INSERT IGNORE INTO Profiles (user_id, full_name, phone, gender, bio) VALUES  
(210, 'Bùi Trọng Tài', '0911111111', 'male', 'Chuyên viên quản lý dự án Agile.'),
(211, 'Đinh Tố Như', '0922222222', 'female', 'Sinh viên IT năm cuối tìm chỗ thực tập.'),
(212, 'Vũ Hải Đăng', '0933333333', 'male', 'Data Analyst với 5 năm kinh nghiệm.');

-- Việc làm
ALTER TABLE Jobs ADD COLUMN benefit TEXT NULL AFTER requirements;
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(200, 200, 200, 1, 2, 'AI Engineer (Python, TensorFlow)', 'ai-engineer-200', 30000000, 50000000, 'full-time', 'senior', 'Nghiên cứu và phát triển các mô hình AI.', '• Kinh nghiệm làm việc với Python, TensorFlow', '• Bảo hiểm đầy đủ', 'approved'),
(201, 200, 200, 1, 2, 'Blockchain Developer', 'blockchain-dev-201', 40000000, 80000000, 'full-time', 'senior', 'Phát triển Smart Contract và các ứng dụng phi tập trung.', '• Kinh nghiệm lập trình Solidity, Rust', '• Thưởng dự án', 'approved'),
(202, 201, 201, 6, 1, 'B2B Sales Executive', 'b2b-sales-202', 15000000, 30000000, 'full-time', 'middle', 'Tìm kiếm và duy trì mối quan hệ với đối tác doanh nghiệp.', '• Kinh nghiệm B2B Sales', '• Hoa hồng cao', 'approved'),
(203, 202, 201, 1, 1, 'Senior Frontend Engineer', 'senior-frontend-engineer', 120000, 150000, 'full-time', 'senior', 'Build beautiful, highly scalable web applications using React.', '• 5+ years experience with React', '• Thưởng hiệu suất cuối năm', 'approved'),
(204, 203, 200, 2, 2, 'Product Manager', 'product-manager', 110000, 140000, 'full-time', 'middle', 'Drive the roadmap and execution of our software platforms.', '• 3+ years experience as a PM', '• Môi trường làm việc remote', 'approved'),
(205, 204, 200, 4, 4, 'UX/UI Designer', 'uxui-designer', 90000, 120000, 'contract', 'middle', 'Craft engaging interfaces and user flows.', '• Proficiency in Figma', '• Giờ làm việc linh hoạt', 'approved'),
(206, 205, 200, 1, 5, 'Data Scientist', 'data-scientist', 130000, 160000, 'full-time', 'senior', 'Build statistical models and machine learning pipelines.', '• Skills in Python and SQL', '• Thưởng tháng lộc phát', 'approved'),
(207, 206, 200, 1, 5, 'Backend Developer', 'backend-developer', 115000, 145000, 'full-time', 'middle', 'Build high-performance, distributed backend services.', '• Strong background in Node.js', '• Review lương 2 lần/năm', 'approved');

INSERT IGNORE INTO Job_Skills (job_id, skill_id) VALUES (200, 3), (200, 11);
INSERT IGNORE INTO Applications (candidate_id, job_id, cover_letter, status) VALUES (210, 200, 'Tôi rất quan tâm đến vị trí AI.', 'pending');

ALTER TABLE Profiles ADD COLUMN location VARCHAR(255) AFTER title;

-- ==========================================================
-- DATABASE: job_finder_db (Phát hành: Version 2.1 - Clean & Optimized)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS job_finder_db;
CREATE DATABASE job_finder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_finder_db;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. DANH MỤC HỆ THỐNG
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. THỰC THỂ CHÍNH (Companies & Users)
CREATE TABLE Companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255) NULL,
    website VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    slug VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

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
    display_name VARCHAR(100) NULL,
    avatar_url VARCHAR(255) NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE SET NULL
);

-- 3. HỒ SƠ CHI TIẾT
CREATE TABLE Profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100),
    title VARCHAR(255),
    phone VARCHAR(20),
    gender ENUM('male', 'female', 'other'),
    dob DATE,
    cv_url VARCHAR(255),
    avatar_url LONGTEXT,
    cover_url LONGTEXT,
    bio TEXT,
    social_links JSON NULL COMMENT 'Lưu link mạng xã hội',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    gpa VARCHAR(10),
    start_date DATE,
    end_date DATE,
    description TEXT,
    period_text VARCHAR(100),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

CREATE TABLE Work_Experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    period_text VARCHAR(100),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

-- 4. QUẢN LÝ VIỆC LÀM
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
    experience_level ENUM('intern', 'fresher', 'junior', 'middle', 'senior'),
    description TEXT NOT NULL,
    requirements TEXT,
    status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
);

-- Bảng trung gian
CREATE TABLE User_Skills (
    profile_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (profile_id, skill_id),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

CREATE TABLE Job_Skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

-- 5. NGHIỆP VỤ KẾT NỐI & TƯƠNG TÁC
CREATE TABLE Applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    cover_letter TEXT,
    cv_snapshot_url VARCHAR(255),
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Favorite_Jobs (
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    job_id INT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE SET NULL
);

CREATE TABLE Notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type ENUM('application_status', 'new_job', 'system') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    job_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'resolved', 'ignored') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES Users(id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

-- 6. INDEXES TỐI ƯU
CREATE INDEX idx_job_status ON Jobs(status);
CREATE INDEX idx_job_type ON Jobs(job_type);
CREATE INDEX idx_application_status ON Applications(status);

-- ==========================================
-- 7. CHÈN DỮ LIỆU MẪU (SEED DATA - GIỮ NGUYÊN)
-- ==========================================

-- Công ty (ID 200-209)
INSERT IGNORE INTO Companies (id, name, slug, logo_url, banner_url, website, address, description, is_verified) VALUES  
(200, 'NextGen Tech', 'nextgen-tech', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e', NULL, 'https://nextgen.vn', 'Hồ Chí Minh', 'Phát triển phần mềm AI và Blockchain', 1),
(201, 'Alpha Commerce', 'alpha-commerce', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab', NULL, 'https://alpha.com', 'Hà Nội', 'Sàn thương mại điện tử xuyên biên giới', 1),
(202, 'Global Logistics VN', 'global-logistics-vn', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36', NULL, 'https://globallogistics.vn', 'Hải Phòng', 'Vận tải và chuỗi cung ứng quốc tế', 1),
(203, 'Creative Pulse', 'creative-pulse', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(204, 'MetricsCorp', 'metricscorp', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(205, 'CloudSystems 2', 'cloudsystems2', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(206, 'GrowthHackers', 'growthhackers', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1),
(207, 'TechFlow', 'techflow', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1pbmltYWxpc3QlMjB0ZWNoJTIwbG9nb3xlbnwxfHx8fDE3NzgxNzI2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://techflow.io', 'Hà Nội', 'TechFlow is a leading technology company expanding globally.', 1),
(208, 'InnovateSpace', 'innovatespace', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYnN0cmFjdCUyMGNvbXBhbnklMjBsb2dvfGVufDF8fHx8MTc3ODE3MjYwNHww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://innovatespace.com', 'Hồ Chí Minh', 'InnovateSpace focuses on product innovation and creativity.', 1),
(209, 'CreativePulse', 'creativepulse', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBicmFuZCUyMGxvZ298ZW58MXx8fHwxNzc4MTcyNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(210, 'MetricsCorp 2', 'metricscorp2', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY2lyY2xlJTIwbG9nb3xlbnwxfHx8fDE3NzgxNzI2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(211, 'CloudSystems', 'cloudsystems', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXR0ZXIlMjBsb2dvJTIwbW9kZXJufGVufDF8fHx8MTc3ODE3MjYwN3ww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(212, 'GrowthHackers 2', 'growthhackers2', 'https://images.unsplash.com/photo-1660137340590-d48549625980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGFwcCUyMGljb258ZW58MXx8fHwxNzc4MTcyNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1);

-- Danh mục, Địa điểm, Kỹ năng
INSERT IGNORE INTO Categories (id, name) VALUES (1, 'Công nghệ thông tin'), (2, 'Marketing'), (3, 'Kế toán'), (4, 'Thiết kế'), (5, 'Nhân sự'), (6, 'Kinh doanh'), (7, 'Kỹ thuật'), (8, 'Y tế'), (9, 'Giáo dục'), (10, 'Logistics');
INSERT IGNORE INTO Locations (id, name, slug) VALUES 
(1, 'Hà Nội', 'ha-noi'), 
(2, 'Hồ Chí Minh', 'ho-chi-minh'), 
(3, 'Đà Nẵng', 'da-nang'), 
(4, 'Hải Phòng', 'hai-phong'), 
(5, 'Cần Thơ', 'can-tho');
INSERT IGNORE INTO Skills (id, name) VALUES (1, 'Java'), (2, 'React'), (3, 'Python'), (10, 'Excel'), (11, 'English'), (12, 'Communication'), (13, 'Agile'), (14, 'Teamwork'), (15, 'Leadership');

-- Người dùng
INSERT IGNORE INTO Users (id, username, email, password, role, company_id, is_active, is_verified) VALUES  
(200, 'hr_nextgen', 'hr@nextgen.vn', '$2a$10$dummy', 'employer', 200, 1, 1),
(201, 'hr_alpha', 'tuyendung@alpha.com', '$2a$10$dummy', 'employer', 201, 1, 1),
(210, 'cand_1', 'cand1@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1),
(211, 'cand_2', 'cand2@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1),
(212, 'cand_3', 'cand3@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1);

-- Hồ sơ
INSERT IGNORE INTO Profiles (user_id, full_name, phone, gender, bio) VALUES  
(210, 'Bùi Trọng Tài', '0911111111', 'male', 'Chuyên viên quản lý dự án Agile.'),
(211, 'Đinh Tố Như', '0922222222', 'female', 'Sinh viên IT năm cuối tìm chỗ thực tập.'),
(212, 'Vũ Hải Đăng', '0933333333', 'male', 'Data Analyst với 5 năm kinh nghiệm.');

-- Việc làm
ALTER TABLE Jobs ADD COLUMN benefit TEXT NULL AFTER requirements;
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(200, 200, 200, 1, 2, 'AI Engineer (Python, TensorFlow)', 'ai-engineer-200', 30000000, 50000000, 'full-time', 'senior', 'Nghiên cứu và phát triển các mô hình AI.', '• Kinh nghiệm làm việc với Python, TensorFlow', '• Bảo hiểm đầy đủ', 'approved'),
(201, 200, 200, 1, 2, 'Blockchain Developer', 'blockchain-dev-201', 40000000, 80000000, 'full-time', 'senior', 'Phát triển Smart Contract và các ứng dụng phi tập trung.', '• Kinh nghiệm lập trình Solidity, Rust', '• Thưởng dự án', 'approved'),
(202, 201, 201, 6, 1, 'B2B Sales Executive', 'b2b-sales-202', 15000000, 30000000, 'full-time', 'middle', 'Tìm kiếm và duy trì mối quan hệ với đối tác doanh nghiệp.', '• Kinh nghiệm B2B Sales', '• Hoa hồng cao', 'approved'),
(203, 202, 201, 1, 1, 'Senior Frontend Engineer', 'senior-frontend-engineer', 120000, 150000, 'full-time', 'senior', 'Build beautiful, highly scalable web applications using React.', '• 5+ years experience with React', '• Thưởng hiệu suất cuối năm', 'approved'),
(204, 203, 200, 2, 2, 'Product Manager', 'product-manager', 110000, 140000, 'full-time', 'middle', 'Drive the roadmap and execution of our software platforms.', '• 3+ years experience as a PM', '• Môi trường làm việc remote', 'approved'),
(205, 204, 200, 4, 4, 'UX/UI Designer', 'uxui-designer', 90000, 120000, 'contract', 'middle', 'Craft engaging interfaces and user flows.', '• Proficiency in Figma', '• Giờ làm việc linh hoạt', 'approved'),
(206, 205, 200, 1, 5, 'Data Scientist', 'data-scientist', 130000, 160000, 'full-time', 'senior', 'Build statistical models and machine learning pipelines.', '• Skills in Python and SQL', '• Thưởng tháng lộc phát', 'approved'),
(207, 206, 200, 1, 5, 'Backend Developer', 'backend-developer', 115000, 145000, 'full-time', 'middle', 'Build high-performance, distributed backend services.', '• Strong background in Node.js', '• Review lương 2 lần/năm', 'approved');

INSERT IGNORE INTO Job_Skills (job_id, skill_id) VALUES (200, 3), (200, 11);
INSERT IGNORE INTO Applications (candidate_id, job_id, cover_letter, status) VALUES (210, 200, 'Tôi rất quan tâm đến vị trí AI.', 'pending');

ALTER TABLE Profiles ADD COLUMN location VARCHAR(255) AFTER title;

-- ==========================================================
-- DATABASE: job_finder_db (Phát hành: Version 2.1 - Clean & Optimized)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS job_finder_db;
CREATE DATABASE job_finder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_finder_db;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. DANH MỤC HỆ THỐNG
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. THỰC THỂ CHÍNH (Companies & Users)
CREATE TABLE Companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255) NULL,
    website VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    slug VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

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
    display_name VARCHAR(100) NULL,
    avatar_url VARCHAR(255) NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE SET NULL
);

-- 3. HỒ SƠ CHI TIẾT
CREATE TABLE Profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100),
    title VARCHAR(255),
    phone VARCHAR(20),
    gender ENUM('male', 'female', 'other'),
    dob DATE,
    cv_url VARCHAR(255),
    avatar_url LONGTEXT,
    cover_url LONGTEXT,
    bio TEXT,
    social_links JSON NULL COMMENT 'Lưu link mạng xã hội',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    gpa VARCHAR(10),
    start_date DATE,
    end_date DATE,
    description TEXT,
    period_text VARCHAR(100),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

CREATE TABLE Work_Experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    period_text VARCHAR(100),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

-- 4. QUẢN LÝ VIỆC LÀM
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
    experience_level ENUM('intern', 'fresher', 'junior', 'middle', 'senior'),
    description TEXT NOT NULL,
    requirements TEXT,
    status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
);

-- Bảng trung gian
CREATE TABLE User_Skills (
    profile_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (profile_id, skill_id),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

CREATE TABLE Job_Skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

-- 5. NGHIỆP VỤ KẾT NỐI & TƯƠNG TÁC
CREATE TABLE Applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    cover_letter TEXT,
    cv_snapshot_url VARCHAR(255),
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Favorite_Jobs (
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    job_id INT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE SET NULL
);

CREATE TABLE Notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type ENUM('application_status', 'new_job', 'system') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    job_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'resolved', 'ignored') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES Users(id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

-- 6. INDEXES TỐI ƯU
CREATE INDEX idx_job_status ON Jobs(status);
CREATE INDEX idx_job_type ON Jobs(job_type);
CREATE INDEX idx_application_status ON Applications(status);

-- ==========================================
-- 7. CHÈN DỮ LIỆU MẪU (SEED DATA - GIỮ NGUYÊN)
-- ==========================================

-- Công ty (ID 200-209)
INSERT IGNORE INTO Companies (id, name, slug, logo_url, banner_url, website, address, description, is_verified) VALUES  
(200, 'NextGen Tech', 'nextgen-tech', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e', NULL, 'https://nextgen.vn', 'Hồ Chí Minh', 'Phát triển phần mềm AI và Blockchain', 1),
(201, 'Alpha Commerce', 'alpha-commerce', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab', NULL, 'https://alpha.com', 'Hà Nội', 'Sàn thương mại điện tử xuyên biên giới', 1),
(202, 'Global Logistics VN', 'global-logistics-vn', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36', NULL, 'https://globallogistics.vn', 'Hải Phòng', 'Vận tải và chuỗi cung ứng quốc tế', 1),
(203, 'Creative Pulse', 'creative-pulse', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(204, 'MetricsCorp', 'metricscorp', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(205, 'CloudSystems 2', 'cloudsystems2', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(206, 'GrowthHackers', 'growthhackers', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1),
(207, 'TechFlow', 'techflow', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1pbmltYWxpc3QlMjB0ZWNoJTIwbG9nb3xlbnwxfHx8fDE3NzgxNzI2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://techflow.io', 'Hà Nội', 'TechFlow is a leading technology company expanding globally.', 1),
(208, 'InnovateSpace', 'innovatespace', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYnN0cmFjdCUyMGNvbXBhbnklMjBsb2dvfGVufDF8fHx8MTc3ODE3MjYwNHww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://innovatespace.com', 'Hồ Chí Minh', 'InnovateSpace focuses on product innovation and creativity.', 1),
(209, 'CreativePulse', 'creativepulse', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBicmFuZCUyMGxvZ298ZW58MXx8fHwxNzc4MTcyNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(210, 'MetricsCorp 2', 'metricscorp2', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY2lyY2xlJTIwbG9nb3xlbnwxfHx8fDE3NzgxNzI2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(211, 'CloudSystems', 'cloudsystems', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXR0ZXIlMjBsb2dvJTIwbW9kZXJufGVufDF8fHx8MTc3ODE3MjYwN3ww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(212, 'GrowthHackers 2', 'growthhackers2', 'https://images.unsplash.com/photo-1660137340590-d48549625980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGFwcCUyMGljb258ZW58MXx8fHwxNzc4MTcyNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1);

-- Danh mục, Địa điểm, Kỹ năng
INSERT IGNORE INTO Categories (id, name) VALUES (1, 'Công nghệ thông tin'), (2, 'Marketing'), (3, 'Kế toán'), (4, 'Thiết kế'), (5, 'Nhân sự'), (6, 'Kinh doanh'), (7, 'Kỹ thuật'), (8, 'Y tế'), (9, 'Giáo dục'), (10, 'Logistics');
INSERT IGNORE INTO Locations (id, name, slug) VALUES 
(1, 'Hà Nội', 'ha-noi'), 
(2, 'Hồ Chí Minh', 'ho-chi-minh'), 
(3, 'Đà Nẵng', 'da-nang'), 
(4, 'Hải Phòng', 'hai-phong'), 
(5, 'Cần Thơ', 'can-tho');
INSERT IGNORE INTO Skills (id, name) VALUES (1, 'Java'), (2, 'React'), (3, 'Python'), (10, 'Excel'), (11, 'English'), (12, 'Communication'), (13, 'Agile'), (14, 'Teamwork'), (15, 'Leadership');

-- Người dùng
INSERT IGNORE INTO Users (id, username, email, password, role, company_id, is_active, is_verified) VALUES  
(200, 'hr_nextgen', 'hr@nextgen.vn', '$2a$10$dummy', 'employer', 200, 1, 1),
(201, 'hr_alpha', 'tuyendung@alpha.com', '$2a$10$dummy', 'employer', 201, 1, 1),
(210, 'cand_1', 'cand1@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1),
(211, 'cand_2', 'cand2@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1),
(212, 'cand_3', 'cand3@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1);

-- Hồ sơ
INSERT IGNORE INTO Profiles (user_id, full_name, phone, gender, bio) VALUES  
(210, 'Bùi Trọng Tài', '0911111111', 'male', 'Chuyên viên quản lý dự án Agile.'),
(211, 'Đinh Tố Như', '0922222222', 'female', 'Sinh viên IT năm cuối tìm chỗ thực tập.'),
(212, 'Vũ Hải Đăng', '0933333333', 'male', 'Data Analyst với 5 năm kinh nghiệm.');

-- Việc làm
ALTER TABLE Jobs ADD COLUMN benefit TEXT NULL AFTER requirements;
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(200, 200, 200, 1, 2, 'AI Engineer (Python, TensorFlow)', 'ai-engineer-200', 30000000, 50000000, 'full-time', 'senior', 'Nghiên cứu và phát triển các mô hình AI.', '• Kinh nghiệm làm việc với Python, TensorFlow', '• Bảo hiểm đầy đủ', 'approved'),
(201, 200, 200, 1, 2, 'Blockchain Developer', 'blockchain-dev-201', 40000000, 80000000, 'full-time', 'senior', 'Phát triển Smart Contract và các ứng dụng phi tập trung.', '• Kinh nghiệm lập trình Solidity, Rust', '• Thưởng dự án', 'approved'),
(202, 201, 201, 6, 1, 'B2B Sales Executive', 'b2b-sales-202', 15000000, 30000000, 'full-time', 'middle', 'Tìm kiếm và duy trì mối quan hệ với đối tác doanh nghiệp.', '• Kinh nghiệm B2B Sales', '• Hoa hồng cao', 'approved'),
(203, 202, 201, 1, 1, 'Senior Frontend Engineer', 'senior-frontend-engineer', 120000, 150000, 'full-time', 'senior', 'Build beautiful, highly scalable web applications using React.', '• 5+ years experience with React', '• Thưởng hiệu suất cuối năm', 'approved'),
(204, 203, 200, 2, 2, 'Product Manager', 'product-manager', 110000, 140000, 'full-time', 'middle', 'Drive the roadmap and execution of our software platforms.', '• 3+ years experience as a PM', '• Môi trường làm việc remote', 'approved'),
(205, 204, 200, 4, 4, 'UX/UI Designer', 'uxui-designer', 90000, 120000, 'contract', 'middle', 'Craft engaging interfaces and user flows.', '• Proficiency in Figma', '• Giờ làm việc linh hoạt', 'approved'),
(206, 205, 200, 1, 5, 'Data Scientist', 'data-scientist', 130000, 160000, 'full-time', 'senior', 'Build statistical models and machine learning pipelines.', '• Skills in Python and SQL', '• Thưởng tháng lộc phát', 'approved'),
(207, 206, 200, 1, 5, 'Backend Developer', 'backend-developer', 115000, 145000, 'full-time', 'middle', 'Build high-performance, distributed backend services.', '• Strong background in Node.js', '• Review lương 2 lần/năm', 'approved');

INSERT IGNORE INTO Job_Skills (job_id, skill_id) VALUES (200, 3), (200, 11);
INSERT IGNORE INTO Applications (candidate_id, job_id, cover_letter, status) VALUES (210, 200, 'Tôi rất quan tâm đến vị trí AI.', 'pending');

ALTER TABLE Profiles ADD COLUMN location VARCHAR(255) AFTER title;

-- ==========================================================
-- DATABASE: job_finder_db (Phát hành: Version 2.1 - Clean & Optimized)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS job_finder_db;
CREATE DATABASE job_finder_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_finder_db;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. DANH MỤC HỆ THỐNG
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) UNIQUE,
    image_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. THỰC THỂ CHÍNH (Companies & Users)
CREATE TABLE Companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    banner_url VARCHAR(255) NULL,
    website VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    slug VARCHAR(100) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

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
    display_name VARCHAR(100) NULL,
    avatar_url VARCHAR(255) NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE SET NULL
);

-- 3. HỒ SƠ CHI TIẾT
CREATE TABLE Profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100),
    title VARCHAR(255),
    phone VARCHAR(20),
    gender ENUM('male', 'female', 'other'),
    dob DATE,
    cv_url VARCHAR(255),
    avatar_url LONGTEXT,
    cover_url LONGTEXT,
    bio TEXT,
    social_links JSON NULL COMMENT 'Lưu link mạng xã hội',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    major VARCHAR(255),
    gpa VARCHAR(10),
    start_date DATE,
    end_date DATE,
    description TEXT,
    period_text VARCHAR(100),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

CREATE TABLE Work_Experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    period_text VARCHAR(100),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE
);

-- 4. QUẢN LÝ VIỆC LÀM
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
    experience_level ENUM('intern', 'fresher', 'junior', 'middle', 'senior'),
    description TEXT NOT NULL,
    requirements TEXT,
    status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES Companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
);

-- Bảng trung gian
CREATE TABLE User_Skills (
    profile_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (profile_id, skill_id),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

CREATE TABLE Job_Skills (
    job_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

-- 5. NGHIỆP VỤ KẾT NỐI & TƯƠNG TÁC
CREATE TABLE Applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    cover_letter TEXT,
    cv_snapshot_url VARCHAR(255),
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Favorite_Jobs (
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    job_id INT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE SET NULL
);

CREATE TABLE Notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type ENUM('application_status', 'new_job', 'system') DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reporter_id INT NOT NULL,
    job_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'resolved', 'ignored') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES Users(id),
    FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE CASCADE
);

-- 6. INDEXES TỐI ƯU
CREATE INDEX idx_job_status ON Jobs(status);
CREATE INDEX idx_job_type ON Jobs(job_type);
CREATE INDEX idx_application_status ON Applications(status);

-- ==========================================
-- 7. CHÈN DỮ LIỆU MẪU (SEED DATA - GIỮ NGUYÊN)
-- ==========================================

-- Công ty (ID 200-209)
INSERT IGNORE INTO Companies (id, name, slug, logo_url, banner_url, website, address, description, is_verified) VALUES  
(200, 'NextGen Tech', 'nextgen-tech', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e', NULL, 'https://nextgen.vn', 'Hồ Chí Minh', 'Phát triển phần mềm AI và Blockchain', 1),
(201, 'Alpha Commerce', 'alpha-commerce', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab', NULL, 'https://alpha.com', 'Hà Nội', 'Sàn thương mại điện tử xuyên biên giới', 1),
(202, 'Global Logistics VN', 'global-logistics-vn', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36', NULL, 'https://globallogistics.vn', 'Hải Phòng', 'Vận tải và chuỗi cung ứng quốc tế', 1),
(203, 'Creative Pulse', 'creative-pulse', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(204, 'MetricsCorp', 'metricscorp', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(205, 'CloudSystems 2', 'cloudsystems2', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(206, 'GrowthHackers', 'growthhackers', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1),
(207, 'TechFlow', 'techflow', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1pbmltYWxpc3QlMjB0ZWNoJTIwbG9nb3xlbnwxfHx8fDE3NzgxNzI2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://techflow.io', 'Hà Nội', 'TechFlow is a leading technology company expanding globally.', 1),
(208, 'InnovateSpace', 'innovatespace', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYnN0cmFjdCUyMGNvbXBhbnklMjBsb2dvfGVufDF8fHx8MTc3ODE3MjYwNHww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://innovatespace.com', 'Hồ Chí Minh', 'InnovateSpace focuses on product innovation and creativity.', 1),
(209, 'CreativePulse', 'creativepulse', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBicmFuZCUyMGxvZ298ZW58MXx8fHwxNzc4MTcyNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(210, 'MetricsCorp 2', 'metricscorp2', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwY2lyY2xlJTIwbG9nb3xlbnwxfHx8fDE3NzgxNzI2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(211, 'CloudSystems', 'cloudsystems', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZXR0ZXIlMjBsb2dvJTIwbW9kZXJufGVufDF8fHx8MTc3ODE3MjYwN3ww&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(212, 'GrowthHackers 2', 'growthhackers2', 'https://images.unsplash.com/photo-1660137340590-d48549625980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGFwcCUyMGljb258ZW58MXx8fHwxNzc4MTcyNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1);

-- Danh mục, Địa điểm, Kỹ năng
INSERT IGNORE INTO Categories (id, name) VALUES (1, 'Công nghệ thông tin'), (2, 'Marketing'), (3, 'Kế toán'), (4, 'Thiết kế'), (5, 'Nhân sự'), (6, 'Kinh doanh'), (7, 'Kỹ thuật'), (8, 'Y tế'), (9, 'Giáo dục'), (10, 'Logistics');
INSERT IGNORE INTO Locations (id, name, slug) VALUES 
(1, 'Hà Nội', 'ha-noi'), 
(2, 'Hồ Chí Minh', 'ho-chi-minh'), 
(3, 'Đà Nẵng', 'da-nang'), 
(4, 'Hải Phòng', 'hai-phong'), 
(5, 'Cần Thơ', 'can-tho');
INSERT IGNORE INTO Skills (id, name) VALUES (1, 'Java'), (2, 'React'), (3, 'Python'), (10, 'Excel'), (11, 'English'), (12, 'Communication'), (13, 'Agile'), (14, 'Teamwork'), (15, 'Leadership');

-- Người dùng
INSERT IGNORE INTO Users (id, username, email, password, role, company_id, is_active, is_verified) VALUES  
(200, 'hr_nextgen', 'hr@nextgen.vn', '$2a$10$dummy', 'employer', 200, 1, 1),
(201, 'hr_alpha', 'tuyendung@alpha.com', '$2a$10$dummy', 'employer', 201, 1, 1),
(210, 'cand_1', 'cand1@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1),
(211, 'cand_2', 'cand2@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1),
(212, 'cand_3', 'cand3@gmail.com', '$2a$10$dummy', 'candidate', NULL, 1, 1);

-- Hồ sơ
INSERT IGNORE INTO Profiles (user_id, full_name, phone, gender, bio) VALUES  
(210, 'Bùi Trọng Tài', '0911111111', 'male', 'Chuyên viên quản lý dự án Agile.'),
(211, 'Đinh Tố Như', '0922222222', 'female', 'Sinh viên IT năm cuối tìm chỗ thực tập.'),
(212, 'Vũ Hải Đăng', '0933333333', 'male', 'Data Analyst với 5 năm kinh nghiệm.');

-- Việc làm
ALTER TABLE Jobs ADD COLUMN benefit TEXT NULL AFTER requirements;
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(200, 200, 200, 1, 2, 'AI Engineer (Python, TensorFlow)', 'ai-engineer-200', 30000000, 50000000, 'full-time', 'senior', 'Nghiên cứu và phát triển các mô hình AI.', '• Kinh nghiệm làm việc với Python, TensorFlow', '• Bảo hiểm đầy đủ', 'approved'),
(201, 200, 200, 1, 2, 'Blockchain Developer', 'blockchain-dev-201', 40000000, 80000000, 'full-time', 'senior', 'Phát triển Smart Contract và các ứng dụng phi tập trung.', '• Kinh nghiệm lập trình Solidity, Rust', '• Thưởng dự án', 'approved'),
(202, 201, 201, 6, 1, 'B2B Sales Executive', 'b2b-sales-202', 15000000, 30000000, 'full-time', 'middle', 'Tìm kiếm và duy trì mối quan hệ với đối tác doanh nghiệp.', '• Kinh nghiệm B2B Sales', '• Hoa hồng cao', 'approved'),
(203, 202, 201, 1, 1, 'Senior Frontend Engineer', 'senior-frontend-engineer', 120000, 150000, 'full-time', 'senior', 'Build beautiful, highly scalable web applications using React.', '• 5+ years experience with React', '• Thưởng hiệu suất cuối năm', 'approved'),
(204, 203, 200, 2, 2, 'Product Manager', 'product-manager', 110000, 140000, 'full-time', 'middle', 'Drive the roadmap and execution of our software platforms.', '• 3+ years experience as a PM', '• Môi trường làm việc remote', 'approved'),
(205, 204, 200, 4, 4, 'UX/UI Designer', 'uxui-designer', 90000, 120000, 'contract', 'middle', 'Craft engaging interfaces and user flows.', '• Proficiency in Figma', '• Giờ làm việc linh hoạt', 'approved'),
(206, 205, 200, 1, 5, 'Data Scientist', 'data-scientist', 130000, 160000, 'full-time', 'senior', 'Build statistical models and machine learning pipelines.', '• Skills in Python and SQL', '• Thưởng tháng lộc phát', 'approved'),
(207, 206, 200, 1, 5, 'Backend Developer', 'backend-developer', 115000, 145000, 'full-time', 'middle', 'Build high-performance, distributed backend services.', '• Strong background in Node.js', '• Review lương 2 lần/năm', 'approved');

INSERT IGNORE INTO Job_Skills (job_id, skill_id) VALUES (200, 3), (200, 11);
INSERT IGNORE INTO Applications (candidate_id, job_id, cover_letter, status) VALUES (210, 200, 'Tôi rất quan tâm đến vị trí AI.', 'pending');

ALTER TABLE Profiles ADD COLUMN location VARCHAR(255) AFTER title;

CREATE TABLE Application_Notes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES Applications(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE
);
ALTER TABLE Applications 
MODIFY COLUMN status ENUM('pending', 'reviewed', 'interviewing', 'accepted', 'rejected') DEFAULT 'pending';

SET SQL_SAFE_UPDATES = 0;

-- Thực hiện cập nhật icon
UPDATE Categories SET icon_url = 'Code2' WHERE name LIKE '%Thông tin%' OR name LIKE '%IT%';
UPDATE Categories SET icon_url = 'PenTool' WHERE name LIKE '%Design%' OR name LIKE '%Thiết kế%';
UPDATE Categories SET icon_url = 'Megaphone' WHERE name LIKE '%Marketing%' OR name LIKE '%Quảng cáo%';
UPDATE Categories SET icon_url = 'Truck' WHERE name LIKE '%Logistics%' OR name LIKE '%Vận tải%';
UPDATE Categories SET icon_url = 'BarChart3' WHERE name LIKE '%Sales%' OR name LIKE '%Bán hàng%';

-- Bật lại chế độ bảo vệ Safe Updates để an toàn cho database
SET SQL_SAFE_UPDATES = 1;

-- ==========================================================
-- THÊM BẢNG JobCriteria (Tích hợp hợp lý với schema hiện tại)
-- ==========================================================
CREATE TABLE IF NOT EXISTS JobCriteria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    user_id INT NOT NULL UNIQUE,
    
    desired_position VARCHAR(255),
    job_type ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship') NULL,
    experience_level ENUM('intern', 'fresher', 'junior', 'middle', 'senior') NULL,
    
    salary_min BIGINT NULL,
    salary_max BIGINT NULL,
    
    preferred_location VARCHAR(255),
    workplace_type ENUM('office', 'remote', 'hybrid', 'onsite') NULL,
    
    skills TEXT NULL COMMENT 'Danh sách kỹ năng cách nhau bởi dấu phẩy hoặc JSON',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tạo Index hỗ trợ tìm kiếm nhanh
CREATE INDEX idx_jobcriteria_user ON JobCriteria(user_id);
CREATE INDEX idx_jobcriteria_salary ON JobCriteria(salary_min, salary_max);
CREATE INDEX idx_jobcriteria_location ON JobCriteria(preferred_location);
CREATE INDEX idx_jobcriteria_job_type ON JobCriteria(job_type);

-- ==========================================
-- DỮ LIỆU MẪU (Seed Data)
-- ==========================================

INSERT IGNORE INTO JobCriteria (user_id, desired_position, job_type, experience_level, 
                               salary_min, salary_max, preferred_location, workplace_type, skills) 
VALUES 
(210, 'Senior AI Engineer', 'full-time', 'senior', 35000000, 70000000, 'Hồ Chí Minh', 'hybrid', 'Python,TensorFlow,Deep Learning,Agile'),
(211, 'Frontend Developer Intern', 'internship', 'fresher', 5000000, 12000000, 'Hà Nội', 'office', 'React,JavaScript,HTML,CSS'),
(212, 'Data Analyst', 'full-time', 'middle', 18000000, 35000000, 'Hồ Chí Minh', 'remote', 'Python,SQL,Excel,Power BI,Tableau');



USE job_finder_db;

-- =========================================
-- UPDATE JOBCRITERIA TABLE
-- =========================================

ALTER TABLE jobcriteria
MODIFY COLUMN job_type VARCHAR(100),

MODIFY COLUMN experience_level VARCHAR(100),

MODIFY COLUMN workplace_type VARCHAR(100);



-- =========================================
-- OPTIONAL: THÊM FIELD MỚI
-- =========================================

ALTER TABLE jobcriteria

ADD COLUMN industry VARCHAR(255) NULL AFTER desired_position,

ADD COLUMN career_level VARCHAR(100) NULL AFTER experience_level,

ADD COLUMN preferred_salary_type VARCHAR(50) NULL AFTER salary_max,

ADD COLUMN languages TEXT NULL AFTER skills,

ADD COLUMN preferred_companies TEXT NULL AFTER languages,

ADD COLUMN benefits TEXT NULL AFTER preferred_companies,
ADD COLUMN available_from DATE NULL AFTER benefits,

ADD COLUMN is_open_to_work TINYINT(1) DEFAULT 1 AFTER available_from;



-- =========================================
-- INDEX TỐI ƯU SEARCH
-- =========================================

CREATE INDEX idx_jobcriteria_industry
ON jobcriteria(industry);

CREATE INDEX idx_jobcriteria_career_level
ON jobcriteria(career_level);

CREATE INDEX idx_jobcriteria_workplace
ON jobcriteria(workplace_type);

CREATE INDEX idx_jobcriteria_open_to_work
ON jobcriteria(is_open_to_work);

ALTER TABLE jobcriteria
MODIFY COLUMN is_open_to_work TINYINT DEFAULT 1;

ALTER TABLE Profiles 
  MODIFY COLUMN cv_url     LONGTEXT,
  MODIFY COLUMN avatar_url LONGTEXT,
  MODIFY COLUMN cover_url  LONGTEXT;

  -- 1. Trả các trường URL về đúng bản chất (Chỉ lưu link string, không lưu Base64)
ALTER TABLE Profiles 
  MODIFY COLUMN cv_url     VARCHAR(512) NULL,
  MODIFY COLUMN avatar_url VARCHAR(512) NULL,
  MODIFY COLUMN cover_url  VARCHAR(512) NULL;

-- 2. Xóa bỏ avatar_url ở bảng Users để tránh xung đột dữ liệu (chỉ giữ lại ở Profiles)
ALTER TABLE Users DROP COLUMN avatar_url;