-- ==========================================================
-- 1. SYSTEM CATEGORIES (Bảng danh mục: >= 10 records)
-- ==========================================================

-- INSERT INTO Categories
INSERT INTO Categories (id, name, slug) VALUES
(1, 'Software Engineering', 'software-engineering'),
(2, 'Data Science & Analytics', 'data-science'),
(3, 'Product Management', 'product-management'),
(4, 'UI/UX Design', 'ui-ux-design'),
(5, 'Quality Assurance (QA/QC)', 'qa-qc'),
(6, 'DevOps & Cloud', 'devops-cloud'),
(7, 'Cybersecurity', 'cybersecurity'),
(8, 'Business Analysis', 'business-analysis'),
(9, 'IT Sales & Account Management', 'it-sales'),
(10, 'Digital Marketing', 'digital-marketing');

-- INSERT INTO Locations
INSERT INTO Locations (id, name, slug) VALUES
(1, 'Hà Nội', 'ha-noi'),
(2, 'TP. Hồ Chí Minh', 'tp-ho-chi-minh'),
(3, 'Đà Nẵng', 'da-nang'),
(4, 'Cần Thơ', 'can-tho'),
(5, 'Hải Phòng', 'hai-phong'),
(6, 'Bình Dương', 'binh-duong'),
(7, 'Đồng Nai', 'dong-nai'),
(8, 'Thừa Thiên Huế', 'thua-thien-hue'),
(9, 'Nha Trang', 'nha-trang'),
(10, 'Quy Nhơn', 'quy-nhon');

-- INSERT INTO Skills
INSERT INTO Skills (id, name) VALUES
(1, 'Java'), (2, 'Python'), (3, 'ReactJS'), (4, 'Node.js'), (5, 'AWS'),
(6, 'SQL'), (7, 'Figma'), (8, 'Scrum/Agile'), (9, 'Machine Learning'), (10, 'Docker'),
(11, 'Kubernetes'), (12, 'Golang'), (13, 'C++'), (14, 'PHP'), (15, 'Cybersecurity');

-- ==========================================================
-- 2. MAIN ENTITIES (Companies & Users)
-- ==========================================================

-- INSERT INTO Companies (>= 10 records, thực tế Việt Nam)
INSERT INTO Companies (id, name, slug, website, description, is_verified) VALUES
(1, 'FPT Software', 'fpt-software', 'https://fptsoftware.com', 'Tập đoàn công nghệ hàng đầu Việt Nam.', 1),
(2, 'Viettel Group', 'viettel-group', 'https://viettel.com.vn', 'Tập đoàn Công nghiệp - Viễn thông Quân đội.', 1),
(3, 'VNG Corporation', 'vng-corporation', 'https://vng.com.vn', 'Kỳ lân công nghệ đầu tiên của Việt Nam.', 1),
(4, 'MoMo (M-Service)', 'momo', 'https://momo.vn', 'Siêu ứng dụng thanh toán số 1 Việt Nam.', 1),
(5, 'VNPT', 'vnpt', 'https://vnpt.com.vn', 'Tập đoàn Bưu chính Viễn thông Việt Nam.', 1),
(6, 'VNPAY', 'vnpay', 'https://vnpay.vn', 'Công ty Cổ phần Giải pháp Thanh toán Việt Nam.', 1),
(7, 'Tiki', 'tiki', 'https://tiki.vn', 'Nền tảng thương mại điện tử hàng đầu.', 1),
(8, 'Shopee Vietnam', 'shopee-vn', 'https://shopee.vn', 'Nền tảng TMĐT phổ biến nhất.', 1),
(9, 'KMS Technology', 'kms-technology', 'https://kms-technology.com', 'Công ty phần mềm 100% vốn đầu tư Mỹ.', 1),
(10, 'NashTech', 'nashtech', 'https://nashtechglobal.com', 'Công ty công nghệ thuộc tập đoàn Harvey Nash.', 1);

-- INSERT INTO Users 
-- (1 Admin, 15 Employers map với các công ty, 15 Candidates - Tổng 31 Users)
-- Mật khẩu giả lập dạng hash cho tất cả: $2a$12$DummyHashStringForPassword12345
INSERT INTO Users (id, username, password, email, role, company_id, is_active, is_verified) VALUES
(1, 'admin_system', 'hashed_pwd_here', 'admin@jobfinder.vn', 'admin', NULL, 1, 1),
-- Employers của Viettel (Company 2) để gánh 30 Jobs
(2, 'viettel_hr1', 'hashed_pwd_here', 'hr1@viettel.com.vn', 'employer', 2, 1, 1),
(3, 'viettel_hr2', 'hashed_pwd_here', 'hr2@viettel.com.vn', 'employer', 2, 1, 1),
(4, 'viettel_techlead', 'hashed_pwd_here', 'techlead@viettel.com.vn', 'employer', 2, 1, 1),
-- Employers của các công ty khác
(5, 'fpt_hr', 'hashed_pwd_here', 'hr@fptsoftware.com', 'employer', 1, 1, 1),
(6, 'vng_hr', 'hashed_pwd_here', 'hr@vng.com.vn', 'employer', 3, 1, 1),
(7, 'momo_hr', 'hashed_pwd_here', 'hr@momo.vn', 'employer', 4, 1, 1),
(8, 'vnpt_hr', 'hashed_pwd_here', 'hr@vnpt.com.vn', 'employer', 5, 1, 1),
(9, 'vnpay_hr', 'hashed_pwd_here', 'hr@vnpay.vn', 'employer', 6, 1, 1),
(10, 'tiki_hr', 'hashed_pwd_here', 'hr@tiki.vn', 'employer', 7, 1, 1),
(11, 'shopee_hr', 'hashed_pwd_here', 'hr@shopee.vn', 'employer', 8, 1, 1),
(12, 'kms_hr', 'hashed_pwd_here', 'hr@kms.com', 'employer', 9, 1, 1),
(13, 'nashtech_hr', 'hashed_pwd_here', 'hr@nashtech.com', 'employer', 10, 1, 1),
(14, 'fpt_manager', 'hashed_pwd_here', 'manager@fptsoftware.com', 'employer', 1, 1, 1),
(15, 'vng_lead', 'hashed_pwd_here', 'lead@vng.com.vn', 'employer', 3, 1, 1),
(16, 'momo_lead', 'hashed_pwd_here', 'lead@momo.vn', 'employer', 4, 1, 1),
-- Candidates (15 ứng viên)
(17, 'nguyenvana', 'hashed_pwd_here', 'nguyenvana@gmail.com', 'candidate', NULL, 1, 1),
(18, 'tranthingoc', 'hashed_pwd_here', 'tranthingoc@gmail.com', 'candidate', NULL, 1, 1),
(19, 'lehoangbach', 'hashed_pwd_here', 'lehoangbach@gmail.com', 'candidate', NULL, 1, 1),
(20, 'phamminhtuan', 'hashed_pwd_here', 'phamminhtuan@gmail.com', 'candidate', NULL, 1, 1),
(21, 'vuonghaidang', 'hashed_pwd_here', 'vuonghaidang@gmail.com', 'candidate', NULL, 1, 1),
(22, 'ngochoamai', 'hashed_pwd_here', 'ngochoamai@gmail.com', 'candidate', NULL, 1, 1),
(23, 'dothanhdat', 'hashed_pwd_here', 'dothanhdat@gmail.com', 'candidate', NULL, 1, 1),
(24, 'tranthib', 'hashed_pwd_here', 'tranthib@gmail.com', 'candidate', NULL, 1, 1),
(25, 'lethic', 'hashed_pwd_here', 'lethic@gmail.com', 'candidate', NULL, 1, 1),
(26, 'nguyenvand', 'hashed_pwd_here', 'nguyenvand@gmail.com', 'candidate', NULL, 1, 1),
(27, 'vuongthie', 'hashed_pwd_here', 'vuongthie@gmail.com', 'candidate', NULL, 1, 1),
(28, 'buivans', 'hashed_pwd_here', 'buivans@gmail.com', 'candidate', NULL, 1, 1),
(29, 'dangthih', 'hashed_pwd_here', 'dangthih@gmail.com', 'candidate', NULL, 1, 1),
(30, 'hoangvank', 'hashed_pwd_here', 'hoangvank@gmail.com', 'candidate', NULL, 1, 1),
(31, 'phanthanhm', 'hashed_pwd_here', 'phanthanhm@gmail.com', 'candidate', NULL, 1, 1);

-- ==========================================================
-- 3. DETAILED PROFILES (Profiles, Education, Work_Experience)
-- ==========================================================

-- INSERT INTO Profiles
INSERT INTO Profiles (id, user_id, full_name, title, location, phone, gender, dob, bio, allow_employer_search) VALUES
(1, 17, 'Nguyễn Văn A', 'Senior Backend Developer', 'Hà Nội', '0901234567', 'male', '1995-05-12', '5 năm kinh nghiệm Java/Spring Boot.', 1),
(2, 18, 'Trần Thị Ngọc', 'Data Scientist', 'TP. Hồ Chí Minh', '0912345678', 'female', '1996-08-20', 'Đam mê AI, Machine Learning và Big Data.', 1),
(3, 19, 'Lê Hoàng Bách', 'Product Manager', 'Đà Nẵng', '0923456789', 'male', '1992-11-05', 'Kinh nghiệm quản lý sản phẩm fintech.', 1),
(4, 20, 'Phạm Minh Tuấn', 'DevOps Engineer', 'Hà Nội', '0934567890', 'male', '1994-02-15', 'Chuyên gia AWS, Docker, K8s.', 1),
(5, 21, 'Vương Hải Đăng', 'UI/UX Designer', 'TP. Hồ Chí Minh', '0945678901', 'male', '1998-07-30', 'Thiết kế giao diện hướng người dùng.', 1),
(6, 22, 'Ngô Chợ Mai', 'QA Engineer', 'Cần Thơ', '0956789012', 'female', '1997-04-25', 'Manual và Automation testing với Selenium.', 1),
(7, 23, 'Đỗ Thành Đạt', 'Business Analyst', 'Hà Nội', '0967890123', 'male', '1995-09-10', 'Phân tích yêu cầu hệ thống enterprise.', 1),
(8, 24, 'Trần Thị B', 'Frontend Developer', 'TP. Hồ Chí Minh', '0978901234', 'female', '1999-12-01', 'Chuyên ReactJS và VueJS.', 1),
(9, 25, 'Lê Thị C', 'Digital Marketing Specialist', 'Hà Nội', '0989012345', 'female', '1996-03-18', 'Tối ưu hóa SEO, SEM.', 1),
(10, 26, 'Nguyễn Văn D', 'Cybersecurity Specialist', 'Đà Nẵng', '0990123456', 'male', '1993-06-22', 'CEH, bảo mật hệ thống mạng.', 1),
(11, 27, 'Vương Thị E', 'IT Recruiter', 'Hà Nội', '0801234567', 'female', '1994-10-14', 'Tìm kiếm nhân tài IT.', 1),
(12, 28, 'Bùi Văn S', 'Node.js Developer', 'TP. Hồ Chí Minh', '0812345678', 'male', '1997-01-09', 'Lập trình viên backend Node.js.', 1),
(13, 29, 'Đặng Thị H', 'System Administrator', 'Bình Dương', '0823456789', 'female', '1995-11-28', 'Quản trị hệ thống Linux.', 1),
(14, 30, 'Hoàng Văn K', 'Android Developer', 'Hà Nội', '0834567890', 'male', '1998-05-16', 'Kotlin và Android SDK.', 1),
(15, 31, 'Phan Thanh M', 'Fullstack Developer', 'TP. Hồ Chí Minh', '0845678901', 'male', '1996-12-25', 'MERN Stack developer.', 1);

-- INSERT INTO Education
INSERT INTO Education (profile_id, school_name, major, gpa, start_date, end_date) VALUES
(1, 'Đại học Bách Khoa Hà Nội', 'Công nghệ thông tin', '3.5', '2013-09-01', '2018-06-30'),
(2, 'Đại học Khoa học Tự nhiên TP.HCM', 'Khoa học máy tính', '3.8', '2014-09-01', '2018-07-15'),
(3, 'Đại học Kinh tế Quốc dân', 'Hệ thống thông tin quản lý', '3.2', '2010-09-01', '2014-06-30'),
(4, 'Học viện Công nghệ Bưu chính Viễn thông', 'An toàn thông tin', '3.4', '2012-09-01', '2017-06-30'),
(5, 'Đại học Mỹ thuật Công nghiệp', 'Thiết kế đồ họa', '3.6', '2016-09-01', '2020-06-30'),
(6, 'Đại học Cần Thơ', 'Kỹ thuật phần mềm', '3.3', '2015-09-01', '2019-06-30'),
(7, 'Đại học FPT', 'Kỹ thuật phần mềm', '3.7', '2013-09-01', '2017-06-30'),
(8, 'Đại học Công nghệ thông tin TP.HCM', 'Khoa học máy tính', '3.5', '2017-09-01', '2021-06-30'),
(9, 'Đại học Ngoại thương', 'Kinh tế đối ngoại', '3.4', '2014-09-01', '2018-06-30'),
(10, 'Học viện Kỹ thuật Quân sự', 'Công nghệ thông tin', '3.6', '2011-09-01', '2016-06-30'),
(11, 'Đại học Khoa học Xã hội và Nhân văn', 'Tâm lý học', '3.2', '2012-09-01', '2016-06-30'),
(12, 'Đại học Tôn Đức Thắng', 'Mạng máy tính', '3.4', '2015-09-01', '2019-06-30'),
(13, 'Đại học Quốc tế - ĐHQG TP.HCM', 'Khoa học máy tính', '3.5', '2013-09-01', '2017-06-30'),
(14, 'Đại học Bách Khoa Đà Nẵng', 'Công nghệ thông tin', '3.3', '2016-09-01', '2020-06-30'),
(15, 'Đại học Sư phạm Kỹ thuật TP.HCM', 'Công nghệ thông tin', '3.6', '2014-09-01', '2018-06-30');

-- INSERT INTO Work_Experience
INSERT INTO Work_Experience (profile_id, company_name, position, start_date, end_date) VALUES
(1, 'FPT Software', 'Backend Developer', '2018-08-01', '2023-01-01'),
(2, 'VNG', 'Data Analyst', '2018-09-01', '2022-12-31'),
(3, 'MoMo', 'Associate Product Manager', '2015-01-01', '2020-06-30'),
(4, 'Viettel', 'System Admin', '2017-07-01', '2021-12-31'),
(5, 'Tiki', 'Junior UX Designer', '2020-08-01', '2023-05-30'),
(6, 'KMS Technology', 'QC Engineer', '2019-07-01', '2023-08-01'),
(7, 'VNPAY', 'Business Analyst', '2017-08-01', '2022-04-30'),
(8, 'Shopee', 'Frontend Intern', '2021-07-01', '2022-06-30'),
(9, 'VNG', 'Marketing Executive', '2018-07-01', '2021-12-31'),
(10, 'VNPT', 'Security Analyst', '2016-08-01', '2022-09-30'),
(11, 'NashTech', 'HR Executive', '2016-07-01', '2021-05-30'),
(12, 'FPT Software', 'Node.js Developer', '2019-08-01', '2023-02-28'),
(13, 'Viettel', 'IT Support', '2017-07-01', '2020-12-31'),
(14, 'MoMo', 'Android Intern', '2020-07-01', '2021-12-31'),
(15, 'Tiki', 'Fullstack Developer', '2018-08-01', '2023-07-30');

-- ==========================================================
-- 4. JOB MANAGEMENT (Jobs >= 30, skills)
-- Yêu cầu: VIETTEL (Company ID = 2) sở hữu 30 công việc.
-- Sử dụng Employers ID: 2, 3, 4 (thuộc Viettel) làm posted_by.
-- ==========================================================

INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, status) VALUES
-- Batch 1: Posted by Employer 2 (10 jobs)
(1, 2, 2, 1, 1, 'Senior Java Developer (Spring Boot)', 'viettel-senior-java', 1200, 2400, 'full-time', 'senior', 'Phát triển các hệ thống lõi viễn thông.', 'approved'),
(2, 2, 2, 1, 2, 'Junior Python Backend Developer', 'viettel-junior-python', 600, 1000, 'full-time', 'junior', 'Xây dựng API cho các dịch vụ VAS.', 'approved'),
(3, 2, 2, 2, 1, 'Data Scientist (Machine Learning)', 'viettel-data-scientist', 1600, 3200, 'full-time', 'senior', 'Nghiên cứu AI cho Big Data viễn thông.', 'approved'),
(4, 2, 2, 3, 1, 'Product Manager (Viettel Money)', 'viettel-pm-money', 2000, 3600, 'full-time', 'senior', 'Quản lý roadmap sản phẩm Fintech.', 'approved'),
(5, 2, 2, 4, 1, 'Senior UI/UX Designer', 'viettel-senior-ui-ux', 1000, 1800, 'full-time', 'senior', 'Thiết kế app MyViettel.', 'approved'),
(6, 2, 2, 5, 2, 'Automation QA Engineer', 'viettel-automation-qa', 800, 1600, 'full-time', 'middle', 'Viết kịch bản test tự động cho web/app.', 'approved'),
(7, 2, 2, 6, 1, 'Cloud DevOps Engineer', 'viettel-cloud-devops', 1400, 2800, 'full-time', 'middle', 'Quản trị hệ thống Viettel Cloud.', 'approved'),
(8, 2, 2, 7, 1, 'Cybersecurity Specialist', 'viettel-cybersecurity', 1600, 3200, 'full-time', 'senior', 'Bảo vệ an toàn thông tin mạng lưới.', 'approved'),
(9, 2, 2, 8, 2, 'IT Business Analyst', 'viettel-it-ba', 800, 1400, 'full-time', 'middle', 'Phân tích yêu cầu hệ thống ERP.', 'approved'),
(10, 2, 2, 1, 1, 'Fresher Golang Developer', 'viettel-fresher-golang', 400, 600, 'full-time', 'fresher', 'Đào tạo và tham gia dự án High Performance.', 'approved'),

-- Batch 2: Posted by Employer 3 (10 jobs)
(11, 2, 3, 1, 3, 'ReactJS Frontend Developer', 'viettel-reactjs-danang', 720, 1400, 'full-time', 'middle', 'Làm việc tại trung tâm R&D Đà Nẵng.', 'approved'),
(12, 2, 3, 1, 1, 'C/C++ Embedded Engineer', 'viettel-embedded-cpp', 1000, 2200, 'full-time', 'senior', 'Lập trình nhúng thiết bị 5G.', 'approved'),
(13, 2, 3, 6, 1, 'Kubernetes Administrator', 'viettel-k8s-admin', 1200, 2400, 'full-time', 'middle', 'Vận hành cụm K8s quy mô lớn.', 'approved'),
(14, 2, 3, 2, 2, 'Data Engineer (Big Data)', 'viettel-data-engineer', 1400, 2800, 'full-time', 'senior', 'Xây dựng data pipeline xử lý log viễn thông.', 'approved'),
(15, 2, 3, 9, 1, 'B2B IT Sales Executive', 'viettel-b2b-sales', 600, 2000, 'full-time', 'middle', 'Bán các giải pháp Cloud/B2B.', 'approved'),
(16, 2, 3, 8, 1, 'Senior System Analyst', 'viettel-system-analyst', 1200, 2000, 'full-time', 'senior', 'Phân tích thiết kế hệ thống lớn.', 'approved'),
(17, 2, 3, 5, 1, 'Manual Tester (Intern)', 'viettel-manual-tester-intern', 120, 200, 'contract', 'intern', 'Thực tập sinh kiểm thử.', 'approved'),
(18, 2, 3, 10, 1, 'Digital Marketing Manager', 'viettel-digital-mkt-manager', 1600, 2800, 'full-time', 'senior', 'Quản lý chiến dịch quảng cáo số.', 'approved'),
(19, 2, 3, 4, 1, 'UX Researcher', 'viettel-ux-researcher', 800, 1400, 'full-time', 'middle', 'Nghiên cứu hành vi người dùng.', 'approved'),
(20, 2, 3, 1, 2, 'Node.js Backend Developer', 'viettel-nodejs-hcm', 880, 1600, 'full-time', 'middle', 'Xây dựng hệ thống chat OTT.', 'approved'),

-- Batch 3: Posted by Employer 4 (10 jobs)
(21, 2, 4, 1, 1, 'Android Developer (Kotlin)', 'viettel-android-kotlin', 800, 1800, 'full-time', 'middle', 'Phát triển app nội bộ trên nền tảng Android.', 'approved'),
(22, 2, 4, 1, 1, 'iOS Developer (Swift)', 'viettel-ios-swift', 1000, 2000, 'full-time', 'middle', 'Phát triển ứng dụng iOS khách hàng.', 'approved'),
(23, 2, 4, 1, 1, 'Fullstack Developer (Java/React)', 'viettel-fullstack-java-react', 1200, 2600, 'full-time', 'senior', 'Tham gia dự án chuyển đổi số.', 'approved'),
(24, 2, 4, 7, 2, 'Penetration Tester (Pentester)', 'viettel-pentester', 1400, 3000, 'full-time', 'senior', 'Đánh giá an toàn thông tin.', 'approved'),
(25, 2, 4, 3, 1, 'Associate Product Manager', 'viettel-apm', 600, 1000, 'full-time', 'junior', 'Hỗ trợ PM quản lý sản phẩm số.', 'approved'),
(26, 2, 4, 2, 1, 'Business Intelligence (BI) Analyst', 'viettel-bi-analyst', 1000, 1800, 'full-time', 'middle', 'Xây dựng dashboard và báo cáo quản trị.', 'approved'),
(27, 2, 4, 6, 1, 'Site Reliability Engineer (SRE)', 'viettel-sre', 1600, 3400, 'full-time', 'senior', 'Đảm bảo uptime hệ thống 99.99%.', 'approved'),
(28, 2, 4, 1, 3, 'PHP/Laravel Developer', 'viettel-php-laravel', 600, 1200, 'full-time', 'junior', 'Bảo trì các hệ thống web cũ.', 'approved'),
(29, 2, 4, 5, 1, 'QA Lead / Test Manager', 'viettel-qa-lead', 1800, 3200, 'full-time', 'senior', 'Quản lý đội ngũ kiểm thử chất lượng phần mềm.', 'approved'),
(30, 2, 4, 1, 1, 'Technical Architect', 'viettel-tech-architect', 2800, 4800, 'full-time', 'senior', 'Thiết kế kiến trúc tổng thể cho siêu hệ thống.', 'approved');

-- INSERT INTO Job_Skills (Map Skills cho Jobs)
INSERT INTO Job_Skills (job_id, skill_id) VALUES
(1, 1), (1, 6), (2, 2), (2, 6), (3, 2), (3, 9), (4, 8), (5, 7),
(6, 1), (6, 6), (7, 5), (7, 10), (7, 11), (8, 15), (9, 8), (10, 12),
(11, 3), (12, 13), (13, 10), (13, 11), (14, 2), (14, 6), (15, 8),
(16, 6), (16, 8), (17, 6), (18, 8), (19, 7), (20, 4), (20, 6),
(21, 1), (22, 1), (23, 1), (23, 3), (24, 15), (25, 8), (26, 6),
(27, 5), (27, 10), (28, 14), (28, 6), (29, 8), (30, 1), (30, 5);

-- INSERT INTO User_Skills (Map Skills cho Profiles)
INSERT INTO User_Skills (profile_id, skill_id) VALUES
(1, 1), (1, 6), (2, 2), (2, 9), (3, 8), (4, 5), (4, 10), (4, 11),
(5, 7), (6, 1), (7, 8), (8, 3), (10, 15), (12, 4), (13, 10), (14, 1), (15, 4), (15, 3);

-- INSERT INTO JobCriteria (15 ứng viên)
INSERT INTO JobCriteria (user_id, desired_position, salary_min, preferred_location) VALUES
(17, 'Senior Backend Developer', 1600, 'Hà Nội'),
(18, 'Data Scientist', 2000, 'TP. Hồ Chí Minh'),
(19, 'Product Manager', 2400, 'Hà Nội'),
(20, 'DevOps Engineer', 1800, 'Hà Nội'),
(21, 'UI/UX Designer', 1200, 'TP. Hồ Chí Minh'),
(22, 'QA Engineer', 1000, 'Cần Thơ'),
(23, 'Business Analyst', 1200, 'Hà Nội'),
(24, 'Frontend Developer', 800, 'TP. Hồ Chí Minh'),
(25, 'Digital Marketing', 1000, 'Hà Nội'),
(26, 'Cybersecurity', 1600, 'Đà Nẵng'),
(27, 'IT Recruiter', 800, 'Hà Nội'),
(28, 'Node.js Developer', 1200, 'TP. Hồ Chí Minh'),
(29, 'System Admin', 1000, 'Bình Dương'),
(30, 'Android Developer', 1200, 'Hà Nội'),
(31, 'Fullstack Developer', 1600, 'TP. Hồ Chí Minh');

-- ==========================================================
-- 5. CONNECTION & INTERACTION OPERATIONS (>= 30 records)
-- ==========================================================

-- INSERT INTO Applications (Ứng viên ứng tuyển công việc - 30 records)
INSERT INTO Applications (candidate_id, job_id, cover_letter, status) VALUES
(17, 1, 'Tôi có 5 năm kinh nghiệm Java.', 'pending'),
(17, 23, 'Tôi làm được cả Backend Java và Frontend React.', 'reviewed'),
(18, 3, 'Chuyên gia phân tích dữ liệu AI.', 'interviewing'),
(18, 14, 'Kinh nghiệm pipeline Big Data 4 năm.', 'pending'),
(19, 4, 'Đã từng làm Fintech tại Momo.', 'accepted'),
(19, 25, 'Ứng tuyển vị trí quản lý.', 'pending'),
(20, 7, 'Sẵn sàng vận hành hệ thống Cloud.', 'reviewed'),
(20, 13, 'Quản trị K8s là thế mạnh của tôi.', 'pending'),
(20, 27, 'Từng làm SRE đảm bảo hệ thống lớn.', 'interviewing'),
(21, 5, 'Portfolio của tôi có thiết kế app tương tự.', 'pending'),
(21, 19, 'Tôi cũng có kinh nghiệm UX Research.', 'reviewed'),
(22, 6, 'Biết sử dụng Selenium cho Automation.', 'pending'),
(22, 17, 'Ứng tuyển manual testing.', 'rejected'),
(22, 29, 'Kinh nghiệm quản lý nhóm QC.', 'pending'),
(23, 9, 'Từng làm BA hệ thống ERP.', 'interviewing'),
(23, 16, 'Sẵn sàng làm System Analyst.', 'pending'),
(24, 11, 'Thành thạo ReactJS.', 'accepted'),
(25, 18, 'Nắm rõ các công cụ SEO/SEM.', 'reviewed'),
(26, 8, 'Có chứng chỉ CEH quốc tế.', 'pending'),
(26, 24, 'Chuyên thực hiện Pentest.', 'interviewing'),
(27, 15, 'Chuyển hướng sang Sale IT B2B.', 'pending'),
(28, 20, 'Kinh nghiệm làm API bằng Nodejs.', 'reviewed'),
(29, 7, 'Vận hành hệ thống Linux chuyên sâu.', 'pending'),
(30, 21, 'Thông thạo Kotlin.', 'accepted'),
(31, 23, 'MERN Stack 3 năm.', 'pending'),
(31, 2, 'Biết làm Python API.', 'reviewed'),
(17, 30, 'Ứng tuyển vai trò Architect dự án lớn.', 'pending'),
(18, 26, 'Làm BI dashboard bằng Tableau.', 'interviewing'),
(19, 9, 'Đã từng làm BA cho dự án trước.', 'pending'),
(28, 28, 'Có biết qua PHP Laravel.', 'rejected');

-- INSERT INTO Favorite_Jobs (Ứng viên lưu công việc yêu thích - 30 records)
INSERT INTO Favorite_Jobs (user_id, job_id) VALUES
(17, 1), (17, 23), (17, 30), (18, 3), (18, 14), (18, 26), 
(19, 4), (19, 25), (19, 9), (20, 7), (20, 13), (20, 27), 
(21, 5), (21, 19), (22, 6), (22, 17), (22, 29), (23, 9), 
(23, 16), (24, 11), (25, 18), (26, 8), (26, 24), (27, 15), 
(28, 20), (28, 28), (29, 7), (30, 21), (31, 23), (31, 2);

-- INSERT INTO Employer_Profile_Views (NTD xem hồ sơ - 30 records)
INSERT INTO Employer_Profile_Views (employer_id, candidate_id) VALUES
(2, 17), (2, 18), (2, 19), (2, 20), (2, 21), (2, 22), (2, 23), (2, 24), (2, 25), (2, 26),
(3, 17), (3, 18), (3, 27), (3, 28), (3, 29), (3, 30), (3, 31), (3, 20), (3, 21), (3, 22),
(4, 19), (4, 20), (4, 21), (4, 22), (4, 23), (4, 24), (4, 25), (4, 26), (4, 30), (4, 31);

-- INSERT INTO Job_Invitations (Lời mời làm việc từ NTD Viettel - 30 records)
INSERT INTO Job_Invitations (employer_id, candidate_id, job_id, message, status) VALUES
(2, 17, 1, 'Chào bạn, công ty đang tuyển Senior Java, mời bạn ứng tuyển.', 'pending'),
(2, 18, 3, 'Thấy kinh nghiệm AI của bạn rất phù hợp.', 'accepted'),
(2, 19, 4, 'Bên mình đang cần PM cho Viettel Money.', 'pending'),
(2, 20, 7, 'Mời bạn tham gia team Cloud Viettel.', 'declined'),
(2, 21, 5, 'Portfolio UX của bạn rất đẹp, mời apply.', 'pending'),
(2, 22, 6, 'Bạn có kinh nghiệm Automation QC phù hợp.', 'accepted'),
(2, 23, 9, 'Mời bạn phỏng vấn vị trí IT BA.', 'pending'),
(2, 24, 11, 'Bên mình cần tuyển Frontend ở Đà Nẵng.', 'pending'),
(2, 25, 18, 'Team MKT đang cần người tối ưu SEO.', 'declined'),
(2, 26, 8, 'Mời bạn gia nhập team Bảo mật.', 'pending'),
(3, 17, 23, 'Fullstack Java là thế mạnh của bạn, thử sức nhé.', 'accepted'),
(3, 18, 14, 'Dự án Big Data mới đang cần Data Engineer.', 'pending'),
(3, 20, 13, 'Quản trị K8s cho dự án lớn, bạn quan tâm không?', 'pending'),
(3, 21, 19, 'Bên mình cần UX Researcher.', 'accepted'),
(3, 22, 29, 'Vị trí QA Lead phù hợp với kinh nghiệm của bạn.', 'pending'),
(3, 23, 16, 'Bạn có muốn thử sức vị trí System Analyst?', 'declined'),
(3, 26, 24, 'Team cần thêm 1 Pentester cứng.', 'pending'),
(3, 27, 15, 'Mời bạn làm B2B Sales IT.', 'pending'),
(3, 28, 20, 'Hệ thống cần backend Nodejs, apply nhé.', 'accepted'),
(3, 29, 7, 'Vị trí Admin hệ thống Cloud.', 'pending'),
(4, 30, 21, 'Mời bạn làm Android App nội bộ.', 'accepted'),
(4, 31, 23, 'Team ReactJS/Fullstack cần thêm người.', 'pending'),
(4, 17, 30, 'Vị trí Architect mức lương rất hấp dẫn.', 'declined'),
(4, 18, 26, 'Phân tích BI Data, rất hợp với bạn.', 'pending'),
(4, 19, 25, 'Vị trí APM cho dự án chuyển đổi số.', 'accepted'),
(4, 20, 27, 'Bạn có muốn làm SRE không?', 'pending'),
(4, 24, 28, 'Mời bạn ứng tuyển dự án dùng PHP.', 'pending'),
(4, 22, 17, 'Bên mình cũng nhận intern Manual Tester.', 'declined'),
(4, 28, 10, 'Dự án cần backend có nền tảng tốt để đào tạo Golang.', 'pending'),
(4, 26, 8, 'Bảo mật hạ tầng, mời bạn tham khảo.', 'accepted');

-- INSERT INTO Application_Notes (NTD ghi chú về ứng viên - >= 10 records)
INSERT INTO Application_Notes (application_id, author_id, content) VALUES
(1, 2, 'Ứng viên có kỹ năng Java tốt, pass vòng gửi xe.'),
(2, 2, 'Cần phỏng vấn thêm về ReactJS.'),
(3, 2, 'Thái độ tốt, hẹn phỏng vấn tuần sau.'),
(5, 2, 'Deal lương hơi cao, cần thương lượng.'),
(17, 3, 'Frontend cứng, cho pass.'),
(20, 3, 'Có chứng chỉ CEH, điểm cộng lớn.'),
(24, 4, 'Pass bài test kỹ năng Android.'),
(26, 4, 'Chưa có nhiều kinh nghiệm Python, cân nhắc.'),
(18, 4, 'Ứng viên phù hợp với yêu cầu làm BI Dashboard.'),
(8, 2, 'Đã hẹn lịch phỏng vấn online qua Teams.');

-- INSERT INTO Reports (Báo cáo vi phạm - >= 10 records)
INSERT INTO Reports (reporter_id, job_id, reason, status) VALUES
(17, 10, 'Mức lương thực tế không giống mô tả.', 'pending'),
(18, 5, 'Thông tin công ty bị sai lệch.', 'resolved'),
(19, 15, 'Job này yêu cầu đóng phí tuyển dụng.', 'ignored'),
(20, 2, 'Nội dung chứa liên kết độc hại.', 'pending'),
(21, 18, 'Mô tả công việc chung chung, không rõ ràng.', 'resolved'),
(22, 25, 'Đăng trùng lặp với công việc khác.', 'pending'),
(23, 28, 'Địa điểm làm việc ghi sai.', 'resolved'),
(24, 8, 'Yêu cầu kinh nghiệm vô lý cho level Fresher.', 'ignored'),
(25, 30, 'Có dấu hiệu lừa đảo đa cấp.', 'pending'),
(26, 4, 'Ngôn ngữ trong JD thiếu chuyên nghiệp.', 'resolved');

-- ==========================================================
-- JOBS FOR COMPANY: FPT SOFTWARE (ID = 1 | Posted by User 5, 14)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(31, 1, 5, 1, 1, 'Senior Java Developer', 'fpt-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(32, 1, 14, 1, 2, 'Fullstack Web Developer', 'fpt-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(33, 1, 5, 2, 3, 'Data Engineer', 'fpt-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(34, 1, 14, 2, 4, 'AI Research Engineer', 'fpt-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(35, 1, 5, 3, 5, 'Technical Product Manager', 'fpt-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(36, 1, 14, 4, 6, 'UI/UX Designer', 'fpt-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(37, 1, 5, 5, 7, 'Automation Test Engineer', 'fpt-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(38, 1, 14, 6, 8, 'Cloud DevOps Engineer', 'fpt-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(39, 1, 5, 7, 9, 'Cybersecurity Specialist', 'fpt-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(40, 1, 14, 8, 10, 'IT Business Analyst', 'fpt-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(41, 1, 5, 1, 1, 'Senior Java Developer (Level 2)', 'fpt-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(42, 1, 14, 1, 2, 'Fullstack Web Developer (Level 2)', 'fpt-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(43, 1, 5, 2, 3, 'Data Engineer (Level 2)', 'fpt-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(44, 1, 14, 2, 4, 'AI Research Engineer (Level 2)', 'fpt-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(45, 1, 5, 3, 5, 'Technical Product Manager (Level 2)', 'fpt-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(46, 1, 14, 4, 6, 'UI/UX Designer (Level 2)', 'fpt-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(47, 1, 5, 5, 7, 'Automation Test Engineer (Level 2)', 'fpt-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(48, 1, 14, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'fpt-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(49, 1, 5, 7, 9, 'Cybersecurity Specialist (Level 2)', 'fpt-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(50, 1, 14, 8, 10, 'IT Business Analyst (Level 2)', 'fpt-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(51, 1, 5, 1, 1, 'Senior Java Developer (Level 3)', 'fpt-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(52, 1, 14, 1, 2, 'Fullstack Web Developer (Level 3)', 'fpt-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(53, 1, 5, 2, 3, 'Data Engineer (Level 3)', 'fpt-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(54, 1, 14, 2, 4, 'AI Research Engineer (Level 3)', 'fpt-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(55, 1, 5, 3, 5, 'Technical Product Manager (Level 3)', 'fpt-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(56, 1, 14, 4, 6, 'UI/UX Designer (Level 3)', 'fpt-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(57, 1, 5, 5, 7, 'Automation Test Engineer (Level 3)', 'fpt-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(58, 1, 14, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'fpt-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(59, 1, 5, 7, 9, 'Cybersecurity Specialist (Level 3)', 'fpt-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(60, 1, 14, 8, 10, 'IT Business Analyst (Level 3)', 'fpt-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- JOBS FOR COMPANY: VNG CORPORATION (ID = 3 | Posted by User 6, 15)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(61, 3, 6, 1, 1, 'Senior Java Developer', 'vng-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(62, 3, 15, 1, 2, 'Fullstack Web Developer', 'vng-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(63, 3, 6, 2, 3, 'Data Engineer', 'vng-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(64, 3, 15, 2, 4, 'AI Research Engineer', 'vng-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(65, 3, 6, 3, 5, 'Technical Product Manager', 'vng-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(66, 3, 15, 4, 6, 'UI/UX Designer', 'vng-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(67, 3, 6, 5, 7, 'Automation Test Engineer', 'vng-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(68, 3, 15, 6, 8, 'Cloud DevOps Engineer', 'vng-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(69, 3, 6, 7, 9, 'Cybersecurity Specialist', 'vng-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(70, 3, 15, 8, 10, 'IT Business Analyst', 'vng-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(71, 3, 6, 1, 1, 'Senior Java Developer (Level 2)', 'vng-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(72, 3, 15, 1, 2, 'Fullstack Web Developer (Level 2)', 'vng-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(73, 3, 6, 2, 3, 'Data Engineer (Level 2)', 'vng-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(74, 3, 15, 2, 4, 'AI Research Engineer (Level 2)', 'vng-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(75, 3, 6, 3, 5, 'Technical Product Manager (Level 2)', 'vng-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(76, 3, 15, 4, 6, 'UI/UX Designer (Level 2)', 'vng-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(77, 3, 6, 5, 7, 'Automation Test Engineer (Level 2)', 'vng-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(78, 3, 15, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'vng-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(79, 3, 6, 7, 9, 'Cybersecurity Specialist (Level 2)', 'vng-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(80, 3, 15, 8, 10, 'IT Business Analyst (Level 2)', 'vng-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(81, 3, 6, 1, 1, 'Senior Java Developer (Level 3)', 'vng-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(82, 3, 15, 1, 2, 'Fullstack Web Developer (Level 3)', 'vng-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(83, 3, 6, 2, 3, 'Data Engineer (Level 3)', 'vng-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(84, 3, 15, 2, 4, 'AI Research Engineer (Level 3)', 'vng-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(85, 3, 6, 3, 5, 'Technical Product Manager (Level 3)', 'vng-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(86, 3, 15, 4, 6, 'UI/UX Designer (Level 3)', 'vng-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(87, 3, 6, 5, 7, 'Automation Test Engineer (Level 3)', 'vng-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(88, 3, 15, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'vng-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(89, 3, 6, 7, 9, 'Cybersecurity Specialist (Level 3)', 'vng-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(90, 3, 15, 8, 10, 'IT Business Analyst (Level 3)', 'vng-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- JOBS FOR COMPANY: MOMO (ID = 4 | Posted by User 7, 16)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(91, 4, 7, 1, 1, 'Senior Java Developer', 'momo-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(92, 4, 16, 1, 2, 'Fullstack Web Developer', 'momo-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(93, 4, 7, 2, 3, 'Data Engineer', 'momo-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(94, 4, 16, 2, 4, 'AI Research Engineer', 'momo-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(95, 4, 7, 3, 5, 'Technical Product Manager', 'momo-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(96, 4, 16, 4, 6, 'UI/UX Designer', 'momo-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(97, 4, 7, 5, 7, 'Automation Test Engineer', 'momo-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(98, 4, 16, 6, 8, 'Cloud DevOps Engineer', 'momo-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(99, 4, 7, 7, 9, 'Cybersecurity Specialist', 'momo-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(100, 4, 16, 8, 10, 'IT Business Analyst', 'momo-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(101, 4, 7, 1, 1, 'Senior Java Developer (Level 2)', 'momo-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(102, 4, 16, 1, 2, 'Fullstack Web Developer (Level 2)', 'momo-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(103, 4, 7, 2, 3, 'Data Engineer (Level 2)', 'momo-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(104, 4, 16, 2, 4, 'AI Research Engineer (Level 2)', 'momo-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(105, 4, 7, 3, 5, 'Technical Product Manager (Level 2)', 'momo-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(106, 4, 16, 4, 6, 'UI/UX Designer (Level 2)', 'momo-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(107, 4, 7, 5, 7, 'Automation Test Engineer (Level 2)', 'momo-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(108, 4, 16, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'momo-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(109, 4, 7, 7, 9, 'Cybersecurity Specialist (Level 2)', 'momo-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(110, 4, 16, 8, 10, 'IT Business Analyst (Level 2)', 'momo-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(111, 4, 7, 1, 1, 'Senior Java Developer (Level 3)', 'momo-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(112, 4, 16, 1, 2, 'Fullstack Web Developer (Level 3)', 'momo-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(113, 4, 7, 2, 3, 'Data Engineer (Level 3)', 'momo-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(114, 4, 16, 2, 4, 'AI Research Engineer (Level 3)', 'momo-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(115, 4, 7, 3, 5, 'Technical Product Manager (Level 3)', 'momo-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(116, 4, 16, 4, 6, 'UI/UX Designer (Level 3)', 'momo-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(117, 4, 7, 5, 7, 'Automation Test Engineer (Level 3)', 'momo-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(118, 4, 16, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'momo-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(119, 4, 7, 7, 9, 'Cybersecurity Specialist (Level 3)', 'momo-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(120, 4, 16, 8, 10, 'IT Business Analyst (Level 3)', 'momo-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- JOBS FOR COMPANY: VNPT (ID = 5 | Posted by User 8)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(121, 5, 8, 1, 1, 'Senior Java Developer', 'vnpt-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(122, 5, 8, 1, 2, 'Fullstack Web Developer', 'vnpt-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(123, 5, 8, 2, 3, 'Data Engineer', 'vnpt-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(124, 5, 8, 2, 4, 'AI Research Engineer', 'vnpt-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(125, 5, 8, 3, 5, 'Technical Product Manager', 'vnpt-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(126, 5, 8, 4, 6, 'UI/UX Designer', 'vnpt-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(127, 5, 8, 5, 7, 'Automation Test Engineer', 'vnpt-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(128, 5, 8, 6, 8, 'Cloud DevOps Engineer', 'vnpt-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(129, 5, 8, 7, 9, 'Cybersecurity Specialist', 'vnpt-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(130, 5, 8, 8, 10, 'IT Business Analyst', 'vnpt-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(131, 5, 8, 1, 1, 'Senior Java Developer (Level 2)', 'vnpt-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(132, 5, 8, 1, 2, 'Fullstack Web Developer (Level 2)', 'vnpt-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(133, 5, 8, 2, 3, 'Data Engineer (Level 2)', 'vnpt-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(134, 5, 8, 2, 4, 'AI Research Engineer (Level 2)', 'vnpt-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(135, 5, 8, 3, 5, 'Technical Product Manager (Level 2)', 'vnpt-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(136, 5, 8, 4, 6, 'UI/UX Designer (Level 2)', 'vnpt-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(137, 5, 8, 5, 7, 'Automation Test Engineer (Level 2)', 'vnpt-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(138, 5, 8, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'vnpt-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(139, 5, 8, 7, 9, 'Cybersecurity Specialist (Level 2)', 'vnpt-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(140, 5, 8, 8, 10, 'IT Business Analyst (Level 2)', 'vnpt-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(141, 5, 8, 1, 1, 'Senior Java Developer (Level 3)', 'vnpt-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(142, 5, 8, 1, 2, 'Fullstack Web Developer (Level 3)', 'vnpt-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(143, 5, 8, 2, 3, 'Data Engineer (Level 3)', 'vnpt-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(144, 5, 8, 2, 4, 'AI Research Engineer (Level 3)', 'vnpt-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(145, 5, 8, 3, 5, 'Technical Product Manager (Level 3)', 'vnpt-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(146, 5, 8, 4, 6, 'UI/UX Designer (Level 3)', 'vnpt-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(147, 5, 8, 5, 7, 'Automation Test Engineer (Level 3)', 'vnpt-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(148, 5, 8, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'vnpt-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(149, 5, 8, 7, 9, 'Cybersecurity Specialist (Level 3)', 'vnpt-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(150, 5, 8, 8, 10, 'IT Business Analyst (Level 3)', 'vnpt-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- JOBS FOR COMPANY: VNPAY (ID = 6 | Posted by User 9)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(151, 6, 9, 1, 1, 'Senior Java Developer', 'vnpay-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(152, 6, 9, 1, 2, 'Fullstack Web Developer', 'vnpay-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(153, 6, 9, 2, 3, 'Data Engineer', 'vnpay-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(154, 6, 9, 2, 4, 'AI Research Engineer', 'vnpay-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(155, 6, 9, 3, 5, 'Technical Product Manager', 'vnpay-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(156, 6, 9, 4, 6, 'UI/UX Designer', 'vnpay-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(157, 6, 9, 5, 7, 'Automation Test Engineer', 'vnpay-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(158, 6, 9, 6, 8, 'Cloud DevOps Engineer', 'vnpay-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(159, 6, 9, 7, 9, 'Cybersecurity Specialist', 'vnpay-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(160, 6, 9, 8, 10, 'IT Business Analyst', 'vnpay-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(161, 6, 9, 1, 1, 'Senior Java Developer (Level 2)', 'vnpay-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(162, 6, 9, 1, 2, 'Fullstack Web Developer (Level 2)', 'vnpay-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(163, 6, 9, 2, 3, 'Data Engineer (Level 2)', 'vnpay-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(164, 6, 9, 2, 4, 'AI Research Engineer (Level 2)', 'vnpay-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(165, 6, 9, 3, 5, 'Technical Product Manager (Level 2)', 'vnpay-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(166, 6, 9, 4, 6, 'UI/UX Designer (Level 2)', 'vnpay-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(167, 6, 9, 5, 7, 'Automation Test Engineer (Level 2)', 'vnpay-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(168, 6, 9, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'vnpay-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(169, 6, 9, 7, 9, 'Cybersecurity Specialist (Level 2)', 'vnpay-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(170, 6, 9, 8, 10, 'IT Business Analyst (Level 2)', 'vnpay-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(171, 6, 9, 1, 1, 'Senior Java Developer (Level 3)', 'vnpay-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(172, 6, 9, 1, 2, 'Fullstack Web Developer (Level 3)', 'vnpay-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(173, 6, 9, 2, 3, 'Data Engineer (Level 3)', 'vnpay-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(174, 6, 9, 2, 4, 'AI Research Engineer (Level 3)', 'vnpay-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(175, 6, 9, 3, 5, 'Technical Product Manager (Level 3)', 'vnpay-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(176, 6, 9, 4, 6, 'UI/UX Designer (Level 3)', 'vnpay-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(177, 6, 9, 5, 7, 'Automation Test Engineer (Level 3)', 'vnpay-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(178, 6, 9, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'vnpay-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(179, 6, 9, 7, 9, 'Cybersecurity Specialist (Level 3)', 'vnpay-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(180, 6, 9, 8, 10, 'IT Business Analyst (Level 3)', 'vnpay-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- JOBS FOR COMPANY: TIKI (ID = 7 | Posted by User 10)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(181, 7, 10, 1, 1, 'Senior Java Developer', 'tiki-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(182, 7, 10, 1, 2, 'Fullstack Web Developer', 'tiki-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(183, 7, 10, 2, 3, 'Data Engineer', 'tiki-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(184, 7, 10, 2, 4, 'AI Research Engineer', 'tiki-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(185, 7, 10, 3, 5, 'Technical Product Manager', 'tiki-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(186, 7, 10, 4, 6, 'UI/UX Designer', 'tiki-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(187, 7, 10, 5, 7, 'Automation Test Engineer', 'tiki-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(188, 7, 10, 6, 8, 'Cloud DevOps Engineer', 'tiki-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(189, 7, 10, 7, 9, 'Cybersecurity Specialist', 'tiki-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(190, 7, 10, 8, 10, 'IT Business Analyst', 'tiki-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(191, 7, 10, 1, 1, 'Senior Java Developer (Level 2)', 'tiki-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(192, 7, 10, 1, 2, 'Fullstack Web Developer (Level 2)', 'tiki-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(193, 7, 10, 2, 3, 'Data Engineer (Level 2)', 'tiki-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(194, 7, 10, 2, 4, 'AI Research Engineer (Level 2)', 'tiki-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(195, 7, 10, 3, 5, 'Technical Product Manager (Level 2)', 'tiki-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(196, 7, 10, 4, 6, 'UI/UX Designer (Level 2)', 'tiki-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(197, 7, 10, 5, 7, 'Automation Test Engineer (Level 2)', 'tiki-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(198, 7, 10, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'tiki-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(199, 7, 10, 7, 9, 'Cybersecurity Specialist (Level 2)', 'tiki-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(200, 7, 10, 8, 10, 'IT Business Analyst (Level 2)', 'tiki-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(201, 7, 10, 1, 1, 'Senior Java Developer (Level 3)', 'tiki-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(202, 7, 10, 1, 2, 'Fullstack Web Developer (Level 3)', 'tiki-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(203, 7, 10, 2, 3, 'Data Engineer (Level 3)', 'tiki-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(204, 7, 10, 2, 4, 'AI Research Engineer (Level 3)', 'tiki-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(205, 7, 10, 3, 5, 'Technical Product Manager (Level 3)', 'tiki-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(206, 7, 10, 4, 6, 'UI/UX Designer (Level 3)', 'tiki-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(207, 7, 10, 5, 7, 'Automation Test Engineer (Level 3)', 'tiki-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(208, 7, 10, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'tiki-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(209, 7, 10, 7, 9, 'Cybersecurity Specialist (Level 3)', 'tiki-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(210, 7, 10, 8, 10, 'IT Business Analyst (Level 3)', 'tiki-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- JOBS FOR COMPANY: SHOPEE VIETNAM (ID = 8 | Posted by User 11)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(211, 8, 11, 1, 1, 'Senior Java Developer', 'shopee-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(212, 8, 11, 1, 2, 'Fullstack Web Developer', 'shopee-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(213, 8, 11, 2, 3, 'Data Engineer', 'shopee-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(214, 8, 11, 2, 4, 'AI Research Engineer', 'shopee-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(215, 8, 11, 3, 5, 'Technical Product Manager', 'shopee-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(216, 8, 11, 4, 6, 'UI/UX Designer', 'shopee-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(217, 8, 11, 5, 7, 'Automation Test Engineer', 'shopee-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(218, 8, 11, 6, 8, 'Cloud DevOps Engineer', 'shopee-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(219, 8, 11, 7, 9, 'Cybersecurity Specialist', 'shopee-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(220, 8, 11, 8, 10, 'IT Business Analyst', 'shopee-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(221, 8, 11, 1, 1, 'Senior Java Developer (Level 2)', 'shopee-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(222, 8, 11, 1, 2, 'Fullstack Web Developer (Level 2)', 'shopee-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(223, 8, 11, 2, 3, 'Data Engineer (Level 2)', 'shopee-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(224, 8, 11, 2, 4, 'AI Research Engineer (Level 2)', 'shopee-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(225, 8, 11, 3, 5, 'Technical Product Manager (Level 2)', 'shopee-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(226, 8, 11, 4, 6, 'UI/UX Designer (Level 2)', 'shopee-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(227, 8, 11, 5, 7, 'Automation Test Engineer (Level 2)', 'shopee-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(228, 8, 11, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'shopee-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(229, 8, 11, 7, 9, 'Cybersecurity Specialist (Level 2)', 'shopee-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(230, 8, 11, 8, 10, 'IT Business Analyst (Level 2)', 'shopee-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(231, 8, 11, 1, 1, 'Senior Java Developer (Level 3)', 'shopee-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(232, 8, 11, 1, 2, 'Fullstack Web Developer (Level 3)', 'shopee-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(233, 8, 11, 2, 3, 'Data Engineer (Level 3)', 'shopee-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(234, 8, 11, 2, 4, 'AI Research Engineer (Level 3)', 'shopee-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(235, 8, 11, 3, 5, 'Technical Product Manager (Level 3)', 'shopee-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(236, 8, 11, 4, 6, 'UI/UX Designer (Level 3)', 'shopee-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(237, 8, 11, 5, 7, 'Automation Test Engineer (Level 3)', 'shopee-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(238, 8, 11, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'shopee-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(239, 8, 11, 7, 9, 'Cybersecurity Specialist (Level 3)', 'shopee-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(240, 8, 11, 8, 10, 'IT Business Analyst (Level 3)', 'shopee-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- JOBS FOR COMPANY: KMS TECHNOLOGY (ID = 9 | Posted by User 12)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(241, 9, 12, 1, 1, 'Senior Java Developer', 'kms-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(242, 9, 12, 1, 2, 'Fullstack Web Developer', 'kms-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(243, 9, 12, 2, 3, 'Data Engineer', 'kms-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(244, 9, 12, 2, 4, 'AI Research Engineer', 'kms-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(245, 9, 12, 3, 5, 'Technical Product Manager', 'kms-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(246, 9, 12, 4, 6, 'UI/UX Designer', 'kms-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(247, 9, 12, 5, 7, 'Automation Test Engineer', 'kms-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(248, 9, 12, 6, 8, 'Cloud DevOps Engineer', 'kms-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(249, 9, 12, 7, 9, 'Cybersecurity Specialist', 'kms-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(250, 9, 12, 8, 10, 'IT Business Analyst', 'kms-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(251, 9, 12, 1, 1, 'Senior Java Developer (Level 2)', 'kms-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(252, 9, 12, 1, 2, 'Fullstack Web Developer (Level 2)', 'kms-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(253, 9, 12, 2, 3, 'Data Engineer (Level 2)', 'kms-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(254, 9, 12, 2, 4, 'AI Research Engineer (Level 2)', 'kms-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(255, 9, 12, 3, 5, 'Technical Product Manager (Level 2)', 'kms-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(256, 9, 12, 4, 6, 'UI/UX Designer (Level 2)', 'kms-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(257, 9, 12, 5, 7, 'Automation Test Engineer (Level 2)', 'kms-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(258, 9, 12, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'kms-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(259, 9, 12, 7, 9, 'Cybersecurity Specialist (Level 2)', 'kms-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(260, 9, 12, 8, 10, 'IT Business Analyst (Level 2)', 'kms-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(261, 9, 12, 1, 1, 'Senior Java Developer (Level 3)', 'kms-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(262, 9, 12, 1, 2, 'Fullstack Web Developer (Level 3)', 'kms-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(263, 9, 12, 2, 3, 'Data Engineer (Level 3)', 'kms-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(264, 9, 12, 2, 4, 'AI Research Engineer (Level 3)', 'kms-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(265, 9, 12, 3, 5, 'Technical Product Manager (Level 3)', 'kms-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(266, 9, 12, 4, 6, 'UI/UX Designer (Level 3)', 'kms-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(267, 9, 12, 5, 7, 'Automation Test Engineer (Level 3)', 'kms-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(268, 9, 12, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'kms-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(269, 9, 12, 7, 9, 'Cybersecurity Specialist (Level 3)', 'kms-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(270, 9, 12, 8, 10, 'IT Business Analyst (Level 3)', 'kms-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- JOBS FOR COMPANY: NASHTECH (ID = 10 | Posted by User 13)
-- ==========================================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, thumbnail_url, job_type, experience_level, description, requirements, benefit, status, created_at) VALUES
(271, 10, 13, 1, 1, 'Senior Java Developer', 'nashtech-senior-java-developer-1', 500, 1300, 'https://picsum.photos/200', 'full-time', 'intern', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(272, 10, 13, 1, 2, 'Fullstack Web Developer', 'nashtech-fullstack-web-developer-2', 550, 1380, 'https://picsum.photos/200', 'part-time', 'fresher', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(273, 10, 13, 2, 3, 'Data Engineer', 'nashtech-data-engineer-3', 600, 1460, 'https://picsum.photos/200', 'contract', 'junior', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(274, 10, 13, 2, 4, 'AI Research Engineer', 'nashtech-ai-research-engineer-4', 650, 1540, 'https://picsum.photos/200', 'freelance', 'middle', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(275, 10, 13, 3, 5, 'Technical Product Manager', 'nashtech-technical-product-manager-5', 700, 1620, 'https://picsum.photos/200', 'full-time', 'senior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(276, 10, 13, 4, 6, 'UI/UX Designer', 'nashtech-ui-ux-designer-6', 750, 1700, 'https://picsum.photos/200', 'part-time', 'intern', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(277, 10, 13, 5, 7, 'Automation Test Engineer', 'nashtech-automation-test-engineer-7', 800, 1780, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(278, 10, 13, 6, 8, 'Cloud DevOps Engineer', 'nashtech-cloud-devops-engineer-8', 850, 1860, 'https://picsum.photos/200', 'freelance', 'junior', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(279, 10, 13, 7, 9, 'Cybersecurity Specialist', 'nashtech-cybersecurity-specialist-9', 900, 1940, 'https://picsum.photos/200', 'full-time', 'middle', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(280, 10, 13, 8, 10, 'IT Business Analyst', 'nashtech-it-business-analyst-10', 950, 2020, 'https://picsum.photos/200', 'part-time', 'senior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(281, 10, 13, 1, 1, 'Senior Java Developer (Level 2)', 'nashtech-senior-java-developer-11', 1000, 2100, 'https://picsum.photos/200', 'contract', 'middle', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(282, 10, 13, 1, 2, 'Fullstack Web Developer (Level 2)', 'nashtech-fullstack-web-developer-12', 1050, 2180, 'https://picsum.photos/200', 'freelance', 'senior', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(283, 10, 13, 2, 3, 'Data Engineer (Level 2)', 'nashtech-data-engineer-13', 1100, 2260, 'https://picsum.photos/200', 'full-time', 'intern', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(284, 10, 13, 2, 4, 'AI Research Engineer (Level 2)', 'nashtech-ai-research-engineer-14', 1150, 2340, 'https://picsum.photos/200', 'part-time', 'fresher', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(285, 10, 13, 3, 5, 'Technical Product Manager (Level 2)', 'nashtech-technical-product-manager-15', 1200, 2420, 'https://picsum.photos/200', 'contract', 'junior', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00'),
(286, 10, 13, 4, 6, 'UI/UX Designer (Level 2)', 'nashtech-ui-ux-designer-16', 1250, 2500, 'https://picsum.photos/200', 'freelance', 'middle', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-10-12 08:30:00'),
(287, 10, 13, 5, 7, 'Automation Test Engineer (Level 2)', 'nashtech-automation-test-engineer-17', 1300, 2580, 'https://picsum.photos/200', 'full-time', 'senior', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-05 10:00:00'),
(288, 10, 13, 6, 8, 'Cloud DevOps Engineer (Level 2)', 'nashtech-cloud-devops-engineer-18', 1350, 2660, 'https://picsum.photos/200', 'part-time', 'intern', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-11-20 14:15:00'),
(289, 10, 13, 7, 9, 'Cybersecurity Specialist (Level 2)', 'nashtech-cybersecurity-specialist-19', 1400, 2740, 'https://picsum.photos/200', 'contract', 'fresher', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-01 09:00:00'),
(290, 10, 13, 8, 10, 'IT Business Analyst (Level 2)', 'nashtech-it-business-analyst-20', 1450, 2820, 'https://picsum.photos/200', 'freelance', 'junior', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2025-12-15 11:45:00'),
(291, 10, 13, 1, 1, 'Senior Java Developer (Level 3)', 'nashtech-senior-java-developer-21', 1500, 2900, 'https://picsum.photos/200', 'full-time', 'senior', 'Phát triển hệ thống backend enterprise.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-08 13:20:00'),
(292, 10, 13, 1, 2, 'Fullstack Web Developer (Level 3)', 'nashtech-fullstack-web-developer-22', 1550, 2980, 'https://picsum.photos/200', 'part-time', 'intern', 'Xây dựng hệ thống portal.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-01-22 16:00:00'),
(293, 10, 13, 2, 3, 'Data Engineer (Level 3)', 'nashtech-data-engineer-23', 1600, 3060, 'https://picsum.photos/200', 'contract', 'fresher', 'Xây dựng và tối ưu data pipeline.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-10 09:30:00'),
(294, 10, 13, 2, 4, 'AI Research Engineer (Level 3)', 'nashtech-ai-research-engineer-24', 1650, 3140, 'https://picsum.photos/200', 'freelance', 'junior', 'Nghiên cứu mô hình học máy deep learning.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-02-28 10:10:00'),
(295, 10, 13, 3, 5, 'Technical Product Manager (Level 3)', 'nashtech-technical-product-manager-25', 1700, 3220, 'https://picsum.photos/200', 'full-time', 'middle', 'Quản lý vòng đời phát triển sản phẩm công nghệ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-15 15:00:00'),
(296, 10, 13, 4, 6, 'UI/UX Designer (Level 3)', 'nashtech-ui-ux-designer-26', 1750, 3300, 'https://picsum.photos/200', 'part-time', 'senior', 'Thiết kế wireframe, prototype và tối ưu UI/UX.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-03-29 08:45:00'),
(297, 10, 13, 5, 7, 'Automation Test Engineer (Level 3)', 'nashtech-automation-test-engineer-27', 1800, 3380, 'https://picsum.photos/200', 'contract', 'intern', 'Xây dựng script test tự động bằng Selenium/Playwright.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-12 11:00:00'),
(298, 10, 13, 6, 8, 'Cloud DevOps Engineer (Level 3)', 'nashtech-cloud-devops-engineer-28', 1850, 3460, 'https://picsum.photos/200', 'freelance', 'fresher', 'Triển khai CI/CD, hạ tầng AWS/Azure.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-04-25 14:30:00'),
(299, 10, 13, 7, 9, 'Cybersecurity Specialist (Level 3)', 'nashtech-cybersecurity-specialist-29', 1900, 3540, 'https://picsum.photos/200', 'full-time', 'junior', 'Đánh giá ATTT và pentest hệ thống.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-10 10:20:00'),
(300, 10, 13, 8, 10, 'IT Business Analyst (Level 3)', 'nashtech-it-business-analyst-30', 1950, 3620, 'https://picsum.photos/200', 'part-time', 'middle', 'Khảo sát và phân tích yêu cầu nghiệp vụ.', 'Yêu cầu tối thiểu tương đương kinh nghiệm thực tế.', 'Phúc lợi hấp dẫn, bảo hiểm toàn phần, thưởng tháng 13.', 'approved', '2026-05-28 16:40:00');

-- ==========================================================
-- MAP SKILLS FOR NEW JOBS (Job_Skills)
-- ==========================================================
INSERT INTO Job_Skills (job_id, skill_id) VALUES
(31, 1), (31, 6), (32, 1), (32, 6), (33, 2), (33, 7), (34, 2), (34, 7), (35, 3), (35, 8), (36, 4), (36, 9), (37, 5), (37, 10), (38, 6), (38, 11), (39, 7), (39, 12), (40, 8), (40, 13),
(41, 1), (41, 6), (42, 1), (42, 6), (43, 2), (43, 7), (44, 2), (44, 7), (45, 3), (45, 8), (46, 4), (46, 9), (47, 5), (47, 10), (48, 6), (48, 11), (49, 7), (49, 12), (50, 8), (50, 13),
(51, 1), (51, 6), (52, 1), (52, 6), (53, 2), (53, 7), (54, 2), (54, 7), (55, 3), (55, 8), (56, 4), (56, 9), (57, 5), (57, 10), (58, 6), (58, 11), (59, 7), (59, 12), (60, 8), (60, 13),
(61, 1), (61, 6), (62, 1), (62, 6), (63, 2), (63, 7), (64, 2), (64, 7), (65, 3), (65, 8), (66, 4), (66, 9), (67, 5), (67, 10), (68, 6), (68, 11), (69, 7), (69, 12), (70, 8), (70, 13),
(71, 1), (71, 6), (72, 1), (72, 6), (73, 2), (73, 7), (74, 2), (74, 7), (75, 3), (75, 8), (76, 4), (76, 9), (77, 5), (77, 10), (78, 6), (78, 11), (79, 7), (79, 12), (80, 8), (80, 13),
(81, 1), (81, 6), (82, 1), (82, 6), (83, 2), (83, 7), (84, 2), (84, 7), (85, 3), (85, 8), (86, 4), (86, 9), (87, 5), (87, 10), (88, 6), (88, 11), (89, 7), (89, 12), (90, 8), (90, 13),
(91, 1), (91, 6), (92, 1), (92, 6), (93, 2), (93, 7), (94, 2), (94, 7), (95, 3), (95, 8), (96, 4), (96, 9), (97, 5), (97, 10), (98, 6), (98, 11), (99, 7), (99, 12), (100, 8), (100, 13),
(101, 1), (101, 6), (102, 1), (102, 6), (103, 2), (103, 7), (104, 2), (104, 7), (105, 3), (105, 8), (106, 4), (106, 9), (107, 5), (107, 10), (108, 6), (108, 11), (109, 7), (109, 12), (110, 8), (110, 13),
(111, 1), (111, 6), (112, 1), (112, 6), (113, 2), (113, 7), (114, 2), (114, 7), (115, 3), (115, 8), (116, 4), (116, 9), (117, 5), (117, 10), (118, 6), (118, 11), (119, 7), (119, 12), (120, 8), (120, 13),
(121, 1), (121, 6), (122, 1), (122, 6), (123, 2), (123, 7), (124, 2), (124, 7), (125, 3), (125, 8), (126, 4), (126, 9), (127, 5), (127, 10), (128, 6), (128, 11), (129, 7), (129, 12), (130, 8), (130, 13),
(131, 1), (131, 6), (132, 1), (132, 6), (133, 2), (133, 7), (134, 2), (134, 7), (135, 3), (135, 8), (136, 4), (136, 9), (137, 5), (137, 10), (138, 6), (138, 11), (139, 7), (139, 12), (140, 8), (140, 13),
(141, 1), (141, 6), (142, 1), (142, 6), (143, 2), (143, 7), (144, 2), (144, 7), (145, 3), (145, 8), (146, 4), (146, 9), (147, 5), (147, 10), (148, 6), (148, 11), (149, 7), (149, 12), (150, 8), (150, 13),
(151, 1), (151, 6), (152, 1), (152, 6), (153, 2), (153, 7), (154, 2), (154, 7), (155, 3), (155, 8), (156, 4), (156, 9), (157, 5), (157, 10), (158, 6), (158, 11), (159, 7), (159, 12), (160, 8), (160, 13),
(161, 1), (161, 6), (162, 1), (162, 6), (163, 2), (163, 7), (164, 2), (164, 7), (165, 3), (165, 8), (166, 4), (166, 9), (167, 5), (167, 10), (168, 6), (168, 11), (169, 7), (169, 12), (170, 8), (170, 13),
(171, 1), (171, 6), (172, 1), (172, 6), (173, 2), (173, 7), (174, 2), (174, 7), (175, 3), (175, 8), (176, 4), (176, 9), (177, 5), (177, 10), (178, 6), (178, 11), (179, 7), (179, 12), (180, 8), (180, 13),
(181, 1), (181, 6), (182, 1), (182, 6), (183, 2), (183, 7), (184, 2), (184, 7), (185, 3), (185, 8), (186, 4), (186, 9), (187, 5), (187, 10), (188, 6), (188, 11), (189, 7), (189, 12), (190, 8), (190, 13),
(191, 1), (191, 6), (192, 1), (192, 6), (193, 2), (193, 7), (194, 2), (194, 7), (195, 3), (195, 8), (196, 4), (196, 9), (197, 5), (197, 10), (198, 6), (198, 11), (199, 7), (199, 12), (200, 8), (200, 13),
(201, 1), (201, 6), (202, 1), (202, 6), (203, 2), (203, 7), (204, 2), (204, 7), (205, 3), (205, 8), (206, 4), (206, 9), (207, 5), (207, 10), (208, 6), (208, 11), (209, 7), (209, 12), (210, 8), (210, 13),
(211, 1), (211, 6), (212, 1), (212, 6), (213, 2), (213, 7), (214, 2), (214, 7), (215, 3), (215, 8), (216, 4), (216, 9), (217, 5), (217, 10), (218, 6), (218, 11), (219, 7), (219, 12), (220, 8), (220, 13),
(221, 1), (221, 6), (222, 1), (222, 6), (223, 2), (223, 7), (224, 2), (224, 7), (225, 3), (225, 8), (226, 4), (226, 9), (227, 5), (227, 10), (228, 6), (228, 11), (229, 7), (229, 12), (230, 8), (230, 13),
(231, 1), (231, 6), (232, 1), (232, 6), (233, 2), (233, 7), (234, 2), (234, 7), (235, 3), (235, 8), (236, 4), (236, 9), (237, 5), (237, 10), (238, 6), (238, 11), (239, 7), (239, 12), (240, 8), (240, 13),
(241, 1), (241, 6), (242, 1), (242, 6), (243, 2), (243, 7), (244, 2), (244, 7), (245, 3), (245, 8), (246, 4), (246, 9), (247, 5), (247, 10), (248, 6), (248, 11), (249, 7), (249, 12), (250, 8), (250, 13),
(251, 1), (251, 6), (252, 1), (252, 6), (253, 2), (253, 7), (254, 2), (254, 7), (255, 3), (255, 8), (256, 4), (256, 9), (257, 5), (257, 10), (258, 6), (258, 11), (259, 7), (259, 12), (260, 8), (260, 13),
(261, 1), (261, 6), (262, 1), (262, 6), (263, 2), (263, 7), (264, 2), (264, 7), (265, 3), (265, 8), (266, 4), (266, 9), (267, 5), (267, 10), (268, 6), (268, 11), (269, 7), (269, 12), (270, 8), (270, 13),
(271, 1), (271, 6), (272, 1), (272, 6), (273, 2), (273, 7), (274, 2), (274, 7), (275, 3), (275, 8), (276, 4), (276, 9), (277, 5), (277, 10), (278, 6), (278, 11), (279, 7), (279, 12), (280, 8), (280, 13),
(281, 1), (281, 6), (282, 1), (282, 6), (283, 2), (283, 7), (284, 2), (284, 7), (285, 3), (285, 8), (286, 4), (286, 9), (287, 5), (287, 10), (288, 6), (288, 11), (289, 7), (289, 12), (290, 8), (290, 13),
(291, 1), (291, 6), (292, 1), (292, 6), (293, 2), (293, 7), (294, 2), (294, 7), (295, 3), (295, 8), (296, 4), (296, 9), (297, 5), (297, 10), (298, 6), (298, 11), (299, 7), (299, 12), (300, 8), (300, 13);