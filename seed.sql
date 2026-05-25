-- ==========================================================
-- FILE: seed.sql (Mock Data for Job Board System - APPEND ONLY)
-- Tùy chọn: Chèn thêm dữ liệu, KHÔNG xóa dữ liệu cũ
-- ==========================================================

USE job_finder_db;

-- Configure character set
SET NAMES utf8mb4;

-- Temporarily disable foreign key checks to avoid insertion conflicts
SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- 1. SYSTEM CATEGORIES
-- ==========================================
INSERT IGNORE INTO Categories (id, name, slug) VALUES 
(1, 'Information Technology', 'information-technology'), 
(2, 'Marketing', 'marketing'), 
(3, 'Accounting', 'accounting'), 
(4, 'Design', 'design'), 
(5, 'Human Resources', 'human-resources'), 
(6, 'Business', 'business'), 
(7, 'Engineering', 'engineering'), 
(8, 'Healthcare', 'healthcare'), 
(9, 'Education', 'education'), 
(10, 'Logistics', 'logistics');

INSERT IGNORE INTO Locations (id, name, slug) VALUES 
(1, 'Hanoi', 'hanoi'), 
(2, 'Ho Chi Minh City', 'ho-chi-minh-city'), 
(3, 'Da Nang', 'da-nang'), 
(4, 'Hai Phong', 'hai-phong'), 
(5, 'Can Tho', 'can-tho');

INSERT IGNORE INTO Skills (id, name) VALUES 
(1, 'Java'), 
(2, 'React'), 
(3, 'Python'), 
(10, 'Excel'), 
(11, 'English'), 
(12, 'Communication'), 
(13, 'Agile'), 
(14, 'Teamwork'), 
(15, 'Leadership');

-- ==========================================
-- 2. COMPANIES (ID 200 - 212)
-- ==========================================
INSERT IGNORE INTO Companies (id, name, slug, logo_url, banner_url, website, address, description, is_verified) VALUES 
(200, 'NextGen Tech', 'nextgen-tech', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e', NULL, 'https://nextgen.vn', 'Ho Chi Minh City', 'AI and Blockchain software development', 1),
(201, 'Alpha Commerce', 'alpha-commerce', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab', NULL, 'https://alpha.com', 'Hanoi', 'Cross-border e-commerce platform', 1),
(202, 'Global Logistics VN', 'global-logistics-vn', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36', NULL, 'https://globallogistics.vn', 'Hai Phong', 'International transport and supply chain', 1),
(203, 'Creative Pulse', 'creative-pulse', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59', NULL, 'https://creativepulse.com', 'Da Nang', 'CreativePulse is a top-tier design and UX agency.', 1),
(204, 'MetricsCorp', 'metricscorp', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923', NULL, 'https://metricscorp.com', 'Hai Phong', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(205, 'CloudSystems 2', 'cloudsystems2', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://cloudsystems.de', 'Can Tho', 'CloudSystems develops reliable backend architectures.', 1),
(206, 'GrowthHackers', 'growthhackers', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://growthhackers.global', 'Can Tho', 'GrowthHackers is a globally distributed digital marketing firm.', 1),
(207, 'TechFlow', 'techflow', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e', NULL, 'https://techflow.io', 'Hanoi', 'TechFlow is a leading technology company expanding globally.', 1),
(208, 'InnovateSpace', 'innovatespace', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab', NULL, 'https://innovatespace.com', 'Ho Chi Minh City', 'InnovateSpace focuses on product innovation and creativity.', 1),
(209, 'CreativePulse', 'creativepulse', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36', NULL, 'https://creativepulse.com', 'Da Nang', 'CreativePulse is a top-tier design and UX agency.', 1),
(210, 'MetricsCorp 2', 'metricscorp2', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59', NULL, 'https://metricscorp.com', 'Hai Phong', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(211, 'CloudSystems', 'cloudsystems', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923', NULL, 'https://cloudsystems.de', 'Can Tho', 'CloudSystems develops reliable backend architectures.', 1),
(212, 'GrowthHackers 2', 'growthhackers2', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://growthhackers.global', 'Can Tho', 'GrowthHackers is a globally distributed digital marketing firm.', 1);

-- ==========================================
-- 3. USERS (SYSTEM ACCOUNTS)
-- ==========================================
INSERT IGNORE INTO Users (id, username, email, password, role, company_id, is_active, is_verified) VALUES 
(200, 'hr_nextgen', 'hr@nextgen.vn', '$2a$10$dummyhashpasswordhere', 'employer', 200, 1, 1),
(201, 'hr_alpha', 'tuyendung@alpha.com', '$2a$10$dummyhashpasswordhere', 'employer', 201, 1, 1),
(210, 'cand_1', 'cand1@gmail.com', '$2a$10$dummyhashpasswordhere', 'candidate', NULL, 1, 1),
(211, 'cand_2', 'cand2@gmail.com', '$2a$10$dummyhashpasswordhere', 'candidate', NULL, 1, 1),
(212, 'cand_3', 'cand3@gmail.com', '$2a$10$dummyhashpasswordhere', 'candidate', NULL, 1, 1);

-- ==========================================
-- 4. CANDIDATE PROFILES
-- ==========================================
INSERT IGNORE INTO Profiles (user_id, full_name, phone, gender, title, location, bio) VALUES 
(210, 'Bui Trong Tai', '0911111111', 'male', 'Senior Project Manager', 'Ho Chi Minh City', 'Agile Project Manager with over 5 years of operations experience at Tech-Hub.'),
(211, 'Dinh To Nhu', '0922222222', 'female', 'Frontend Intern', 'Hanoi', 'Final-year IT student at Bach Khoa University seeking an internship opportunity to develop technical skills.'),
(212, 'Vu Hai Dang', '0933333333', 'male', 'Data Analyst Specialist', 'Da Nang', 'Data Analyst passionate about analyzing complex business data for product strategy and decision-making.');

-- ==========================================
-- 5. JOB POSTINGS
-- ==========================================
INSERT IGNORE INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(200, 200, 200, 1, 2, 'AI Engineer (Python, TensorFlow)', 'ai-engineer-200', 30000000, 50000000, 'full-time', 'senior', 'Research and develop machine learning models for core AI systems.', '• Practical experience with Python, TensorFlow\n• Deep Learning knowledge', '• Premium healthcare insurance\n• 13th-month salary', 'approved'),
(201, 200, 200, 1, 2, 'Blockchain Developer', 'blockchain-dev-201', 40000000, 80000000, 'full-time', 'senior', 'Develop Smart Contracts and DeFi decentralized application architecture.', '• Solid experience with Solidity, Rust\n• Previous experience with DApps', '• High project progress bonus\n• Flexible working hours', 'approved'),
(202, 201, 201, 6, 1, 'B2B Sales Executive', 'b2b-sales-202', 15000000, 30000000, 'full-time', 'junior', 'Find business partners and exploit large commercial market segments.', '• Over 2 years of B2B Sales experience\n• Good persuasion skills', '• High commission rate\n• Personal laptop provided', 'approved'),
(203, 202, 201, 1, 1, 'Senior Frontend Engineer', 'senior-frontend-engineer', 35000000, 55000000, 'full-time', 'senior', 'Build large web application interfaces, optimize smooth page loading using React.', '• Over 5 years of experience with React, Webpack\n• Small team management skills', '• Excellent year-end performance bonus\n• Daily free tea and snacks', 'approved'),
(204, 203, 200, 2, 2, 'Product Manager', 'product-manager', 40000000, 65000000, 'full-time', 'middle', 'Manage the roadmap and define development features of the product platform.', '• Over 3 years of PM experience in software\n• Good English communication', '• Fully remote working environment support\n• Company trip twice a year', 'approved'),
(205, 204, 200, 4, 4, 'UX/UI Designer', 'uxui-designer', 20000000, 35000000, 'contract', 'middle', 'Design Wireframes, build seamless user experiences on Mobile App.', '• Proficient in Figma, Adobe XD\n• Good real-world product portfolio', '• Extremely flexible working hours\n• Holiday bonuses', 'approved'),
(206, 205, 200, 1, 5, 'Data Scientist', 'data-scientist', 45000000, 75000000, 'full-time', 'senior', 'Build complex academic statistical models, mine user data insights.', '• Proficient in Python, R, advanced SQL\n• Strong problem-solving mindset', '• Monthly lucky bonus\n• VIP periodic health check', 'approved'),
(207, 206, 200, 1, 5, 'Backend Developer (Node.js)', 'backend-developer', 25000000, 45000000, 'full-time', 'middle', 'Build and optimize Microservices systems handling large concurrent data.', '• In-depth Node.js / Express foundation experience\n• Database optimization skills', '• Bi-annual salary review\n• New Macbook Pro provided', 'approved');
-- ==========================================
-- 6. JOB SKILLS & SAMPLE APPLICATIONS
-- ==========================================
INSERT IGNORE INTO Job_Skills (job_id, skill_id) VALUES 
(200, 3), 
(200, 11);

INSERT IGNORE INTO Applications (candidate_id, job_id, cover_letter, status) VALUES 
(210, 200, 'I have a strong research orientation in AI and wish to dedicate my Python experience to the company.', 'pending');

-- =========================================================================
-- 7. JOB CRITERIA MOCK DATA
-- =========================================================================
INSERT IGNORE INTO JobCriteria (
    user_id, 
    desired_position, 
    industry,
    job_type, 
    experience_level, 
    career_level,
    salary_min, 
    salary_max, 
    preferred_salary_type,
    preferred_location, 
    workplace_type, 
    skills,
    languages,
    preferred_companies,
    benefits,
    is_open_to_work
) 
VALUES 
(
    210, 
    'Project Management Department Head', 
    'Information Technology',
    'full-time', 
    'Team Leader', 
    'Senior / Lead',
    35000000, 
    60000000, 
    'VND',
    'Ho Chi Minh City', 
    'hybrid', 
    'Agile, Scrum, JIRA, Team Management',
    'English (TOEIC 850)',
    'NextGen Tech, VNG',
    'PVI International Health Insurance, High-performance laptop provided',
    1
),
(
    211, 
    'Frontend Web Developer Intern', 
    'Information Technology',
    'internship', 
    'Intern', 
    'Intern',
    4000000, 
    8000000, 
    'VND',
    'Hanoi', 
    'office', 
    'HTML5, CSS3, JavaScript, Basic ReactJS',
    'English for reading comprehension and basic communication',
    'FPT Software, Rikkeisoft',
    'Building parking fee support, Lunch allowance at company canteen',
    1
),
(
    212, 
    'Business Data Analyst', 
    'Data Analysis / Statistics',
    'full-time', 
    'Fresh Graduate / No Experience', 
    'Fresher / Entry',
    12000000, 18000000, 
    'VND',
    'Da Nang', 
    'remote', 
    'SQL, Advanced Microsoft Excel, Power BI, Dashboard Tuning',
    'Commercial Office English',
    'Alpha Commerce, Shopee',
    'Periodic salary review, Macbook provided for working from home',
    1
);

-- Re-enable foreign key checks after safely completing data loading
SET FOREIGN_KEY_CHECKS = 1;