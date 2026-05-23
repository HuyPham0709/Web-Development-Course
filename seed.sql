-- ==========================================================
-- FILE: seed.sql (Dữ liệu mẫu cho Hệ thống Tìm việc làm)
-- ==========================================================

USE job_finder_db;

-- Cấu hình bộ chữ nhận diện Tiếng Việt có dấu
SET NAMES utf8mb4;

-- Tắt kiểm tra khóa ngoại tạm thời để tránh xung đột thứ tự chèn dữ liệu
SET FOREIGN_KEY_CHECKS = 0;

-- Làm sạch dữ liệu cũ trước khi chèn để tránh trùng lặp ID
TRUNCATE TABLE Job_Skills;
TRUNCATE TABLE Applications;
DELETE FROM JobCriteria WHERE user_id IN (210, 211, 212);
DELETE FROM Jobs WHERE id BETWEEN 200 AND 207;
DELETE FROM Profiles WHERE user_id IN (210, 211, 212);
DELETE FROM Users WHERE id IN (200, 201, 210, 211, 212);
DELETE FROM Companies WHERE id BETWEEN 200 AND 212;

-- ==========================================
-- 1. DANH MỤC HỆ THỐNG
-- ==========================================
INSERT IGNORE INTO Categories (id, name, slug) VALUES 
(1, 'Công nghệ thông tin', 'cong-nghe-thong-tin'), 
(2, 'Marketing', 'marketing'), 
(3, 'Kế toán', 'ke-toan'), 
(4, 'Thiết kế', 'thiet-ke'), 
(5, 'Nhân sự', 'nhan-su'), 
(6, 'Kinh doanh', 'kinh-doanh'), 
(7, 'Kỹ thuật', 'ky-thuat'), 
(8, 'Y tế', 'y-te'), 
(9, 'Giáo dục', 'giao-duc'), 
(10, 'Logistics', 'logistics');

INSERT IGNORE INTO Locations (id, name, slug) VALUES 
(1, 'Hà Nội', 'ha-noi'), 
(2, 'Hồ Chí Minh', 'ho-chi-minh'), 
(3, 'Đà Nẵng', 'da-nang'), 
(4, 'Hải Phòng', 'hai-phong'), 
(5, 'Cần Thơ', 'can-tho');

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
-- 2. CÔNG TY (ID 200 - 212)
-- ==========================================
INSERT IGNORE INTO Companies (id, name, slug, logo_url, banner_url, website, address, description, is_verified) VALUES 
(200, 'NextGen Tech', 'nextgen-tech', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e', NULL, 'https://nextgen.vn', 'Hồ Chí Minh', 'Phát triển phần mềm AI và Blockchain', 1),
(201, 'Alpha Commerce', 'alpha-commerce', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab', NULL, 'https://alpha.com', 'Hà Nội', 'Sàn thương mại điện tử xuyên biên giới', 1),
(202, 'Global Logistics VN', 'global-logistics-vn', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36', NULL, 'https://globallogistics.vn', 'Hải Phòng', 'Vận tải và chuỗi cung ứng quốc tế', 1),
(203, 'Creative Pulse', 'creative-pulse', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(204, 'MetricsCorp', 'metricscorp', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(205, 'CloudSystems 2', 'cloudsystems2', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(206, 'GrowthHackers', 'growthhackers', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1),
(207, 'TechFlow', 'techflow', 'https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e', NULL, 'https://techflow.io', 'Hà Nội', 'TechFlow is a leading technology company expanding globally.', 1),
(208, 'InnovateSpace', 'innovatespace', 'https://images.unsplash.com/photo-1633796212691-0cfba2ab1dab', NULL, 'https://innovatespace.com', 'Hồ Chí Minh', 'InnovateSpace focuses on product innovation and creativity.', 1),
(209, 'CreativePulse', 'creativepulse', 'https://images.unsplash.com/photo-1773844914284-498c0e049b36', NULL, 'https://creativepulse.com', 'Đà Nẵng', 'CreativePulse is a top-tier design and UX agency.', 1),
(210, 'MetricsCorp 2', 'metricscorp2', 'https://images.unsplash.com/photo-1759588071796-7648b7569d59', NULL, 'https://metricscorp.com', 'Hải Phòng', 'MetricsCorp provides advanced data analytics and solutions.', 1),
(211, 'CloudSystems', 'cloudsystems', 'https://images.unsplash.com/photo-1758914224092-2aba0d39c923', NULL, 'https://cloudsystems.de', 'Cần Thơ', 'CloudSystems develops reliable backend architectures.', 1),
(212, 'GrowthHackers 2', 'growthhackers2', 'https://images.unsplash.com/photo-1660137340590-d48549625980', NULL, 'https://growthhackers.global', 'Cần Thơ', 'GrowthHackers is a globally distributed digital marketing firm.', 1);


-- ==========================================
-- 3. NGƯỜI DÙNG (TÀI KHOẢN HỆ THỐNG)
-- ==========================================
INSERT IGNORE INTO Users (id, username, email, password, role, company_id, is_active, is_verified) VALUES 
(200, 'hr_nextgen', 'hr@nextgen.vn', '$2a$10$dummyhashpasswordhere', 'employer', 200, 1, 1),
(201, 'hr_alpha', 'tuyendung@alpha.com', '$2a$10$dummyhashpasswordhere', 'employer', 201, 1, 1),
(210, 'cand_1', 'cand1@gmail.com', '$2a$10$dummyhashpasswordhere', 'candidate', NULL, 1, 1),
(211, 'cand_2', 'cand2@gmail.com', '$2a$10$dummyhashpasswordhere', 'candidate', NULL, 1, 1),
(212, 'cand_3', 'cand3@gmail.com', '$2a$10$dummyhashpasswordhere', 'candidate', NULL, 1, 1);


-- ==========================================
-- 4. HỒ SƠ ỨNG VIÊN CHI TIẾT
-- ==========================================
INSERT IGNORE INTO Profiles (user_id, full_name, phone, gender, title, location, bio) VALUES 
(210, 'Bùi Trọng Tài', '0911111111', 'male', 'Senior Project Manager', 'Hồ Chí Minh', 'Chuyên viên quản lý dự án Agile với hơn 5 năm điều hành tại Tech-Hub.'),
(211, 'Đinh Tố Như', '0922222222', 'female', 'Frontend Intern', 'Hà Nội', 'Sinh viên IT năm cuối Đại học Bách Khoa đang tìm kiếm cơ hội thực tập phát triển bản thân.'),
(212, 'Vũ Hải Đăng', '0933333333', 'male', 'Data Analyst Specialist', 'Đà Nẵng', 'Data Analyst đam mê phân tích dữ liệu kinh doanh phức tạp phục vụ chiến lược sản phẩm.');


-- ==========================================
-- 5. DANH SÁCH VIỆC LÀM ĐĂNG TUYỂN
--    (Đã sửa: Khớp hoàn toàn với ENUM 'internship', 'entry', 'middle', 'senior' trong DB của bạn)
-- ==========================================
INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(200, 200, 200, 1, 2, 'AI Engineer (Python, TensorFlow)', 'ai-engineer-200', 30000000, 50000000, 'full-time', 'Trưởng nhóm', 'Nghiên cứu và phát triển các mô hình học máy phục vụ lõi AI.', '• Kinh nghiệm làm việc thực tế với Python, TensorFlow\n• Am hiểu Deep Learning', '• Bảo hiểm cao cấp riêng biệt\n• Lương tháng 14', 'approved'),
(201, 200, 200, 1, 2, 'Blockchain Developer', 'blockchain-dev-201', 40000000, 80000000, 'full-time', 'Quản lý cấp cao', 'Phát triển Smart Contract và kiến trúc ứng dụng phi tập trung DeFi.', '• Kinh nghiệm vững chắc với lập trình Solidity, Rust\n• Đã làm qua ứng dụng DApp', '• Thưởng lớn theo tiến độ dự án\n• Giờ làm việc linh động', 'approved'),
(202, 201, 201, 6, 1, 'B2B Sales Executive', 'b2b-sales-202', 15000000, 30000000, 'full-time', 'Nhân viên', 'Tìm kiếm doanh nghiệp đối tác, khai thác tệp thị trường thương mại lớn.', '• Kinh nghiệm làm Sales B2B trên 2 năm\n• Kỹ năng thuyết phục tốt', '• Tỷ lệ % hoa hồng cao đột phá\n• Cấp laptop riêng', 'approved'),
(203, 202, 201, 1, 1, 'Senior Frontend Engineer', 'senior-frontend-engineer', 35000000, 55000000, 'full-time', 'Trưởng nhóm', 'Xây dựng giao diện ứng dụng web lớn, tối ưu hiển thị tải trang mượt mà bằng React.', '• Trên 5 năm chinh chiến với React, Webpack\n• Kỹ năng quản lý nhóm nhỏ', '• Thưởng hiệu suất cuối năm xuất sắc\n• Trà bánh free hàng ngày', 'approved'),
(204, 203, 200, 2, 2, 'Product Manager', 'product-manager', 40000000, 65000000, 'full-time', 'Nhân viên', 'Quản trị lộ trình và định hình tính năng phát triển của nền tảng sản phẩm ứng dụng.', '• Hơn 3 năm kinh nghiệm trong vai trò PM mảng phần mềm\n• Giao tiếp Tiếng Anh tốt', '• Hỗ trợ môi trường làm việc Remote hoàn toàn\n• Du lịch 2 lần/năm', 'approved'),
(205, 204, 200, 4, 4, 'UX/UI Designer', 'uxui-designer', 20000000, 35000000, 'contract', 'Nhân viên', 'Thiết kế Wireframe, xây dựng trải nghiệm mạch lạc cho người dùng trên Mobile App.', '• Thành thạo Figma, Adobe XD\n• Có portfolio sản phẩm thực tế tốt', '• Giờ giấc làm việc vô cùng linh hoạt\n• Thưởng ngày lễ Tết', 'approved'),
(206, 205, 200, 1, 5, 'Data Scientist', 'data-scientist', 45000000, 75000000, 'full-time', 'Quản lý cấp cao', 'Xây dựng các mô hình thống kê học thuật phức tạp, khai phá insights dữ liệu người dùng.', '• Thành thạo các kỹ năng Python, R, SQL nâng cao\n• Có tư duy giải quyết bài toán', '• Thưởng tháng may mắn lộc phát\n• Khám sức khỏe định kỳ VIP', 'approved'),
(207, 206, 200, 1, 5, 'Backend Developer (Node.js)', 'backend-developer', 25000000, 45000000, 'full-time', 'Nhân viên', 'Xây dựng và tối ưu hệ thống Microservices xử lý dữ liệu lớn đồng thời.', '• Kinh nghiệm nền tảng Node.js / Express chuyên sâu\n• Thiết kế DB tối ưu tốt', '• Xét đánh giá tăng lương định kỳ 2 lần/năm\n• Cấp Macbook Pro mới', 'approved');

-- ==========================================
-- 6. KỸ NĂNG CÔNG VIỆC & ĐƠN ỨNG TUYỂN MẪU
-- ==========================================
INSERT IGNORE INTO Job_Skills (job_id, skill_id) VALUES 
(200, 3), 
(200, 11);

INSERT IGNORE INTO Applications (candidate_id, job_id, cover_letter, status) VALUES 
(210, 200, 'Tôi có định hướng nghiên cứu sâu về AI và mong muốn cống hiến kinh nghiệm Python của mình tại công ty.', 'pending');


-- =========================================================================
-- 7. DỮ LIỆU MẪU CHO BẢNG JOBCRITERIA 
--    (Khớp 100% với ENUM Tiếng Việt có dấu bạn yêu cầu)
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
    'Trưởng phòng Quản lý Dự án', 
    'Công nghệ thông tin',
    'full-time', 
    'Trưởng nhóm', 
    'Senior / Lead',
    35000000, 
    60000000, 
    'VND',
    'Hồ Chí Minh', 
    'hybrid', 
    'Agile, Scrum, JIRA, Team Management',
    'Tiếng Anh (Toeic 850)',
    'NextGen Tech, VNG',
    'Bảo hiểm sức khỏe quốc tế PVI, Cấp máy tính xách tay cấu hình cao',
    1
),
(
    211, 
    'Thực tập sinh Lập trình Web Frontend', 
    'Công nghệ thông tin',
    'internship', 
    'Thực tập sinh', 
    'Intern',
    4000000, 
    8000000, 
    'VND',
    'Hà Nội', 
    'office', 
    'HTML5, CSS3, JavaScript, ReactJS cơ bản',
    'Tiếng Anh giao tiếp đọc hiểu tài liệu',
    'FPT Software, Rikkeisoft',
    'Hỗ trợ chi phí gửi xe tại tòa nhà, Trợ cấp ăn trưa tại căng tin công ty',
    1
),
(
    212, 
    'Chuyên viên Phân tích Dữ liệu Kinh doanh', 
    'Phân tích / Thống kê',
    'full-time', 
    'Mới tốt nghiệp/ Chưa có kinh nghiệm', 
    'Fresher / Entry',
    12000000, 18000000, 
    'VND',
    'Đà Nẵng', 
    'remote', 
    'SQL, Microsoft Excel nâng cao, Power BI, Tinh chỉnh Dashboard',
    'Tiếng Anh văn phòng thương mại',
    'Alpha Commerce, Shopee',
    'Review đánh giá tăng bậc lương định kỳ, Cung cấp Macbook làm việc tại nhà',
    1
);

-- Kích hoạt lại kiểm tra khóa ngoại sau khi hoàn tất nạp dữ liệu an toàn
SET FOREIGN_KEY_CHECKS = 1;