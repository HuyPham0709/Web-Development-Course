-- ==========================================================
-- DATABASE SEED SCRIPT: job_finder_db
-- Language: English (Full Translation)
-- ==========================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Job_Invitations;
TRUNCATE TABLE Employer_Profile_Views;
TRUNCATE TABLE Favorite_Jobs;
TRUNCATE TABLE Applications;
TRUNCATE TABLE JobCriteria;
TRUNCATE TABLE User_Skills;
TRUNCATE TABLE Job_Skills;
TRUNCATE TABLE Jobs;
TRUNCATE TABLE Work_Experience;
TRUNCATE TABLE Education;
TRUNCATE TABLE Profiles;
TRUNCATE TABLE Users;
TRUNCATE TABLE Companies;
TRUNCATE TABLE Skills;
TRUNCATE TABLE Locations;
TRUNCATE TABLE Categories;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================================
-- 1. SYSTEM CATEGORIES
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
(1, 'Hanoi', 'hanoi'),
(2, 'Ho Chi Minh City', 'ho-chi-minh-city'),
(3, 'Da Nang', 'da-nang'),
(4, 'Can Tho', 'can-tho'),
(5, 'Hai Phong', 'hai-phong'),
(6, 'Binh Duong', 'binh-duong'),
(7, 'Dong Nai', 'dong-nai'),
(8, 'Thua Thien Hue', 'thua-thien-hue'),
(9, 'Nha Trang', 'nha-trang'),
(10, 'Quy Nhon', 'quy-nhon');

-- INSERT INTO Skills
INSERT INTO Skills (id, name) VALUES
(1, 'Java'), (2, 'Python'), (3, 'ReactJS'), (4, 'Node.js'), (5, 'AWS'),
(6, 'SQL'), (7, 'Figma'), (8, 'Scrum/Agile'), (9, 'Machine Learning'), (10, 'Docker'),
(11, 'Kubernetes'), (12, 'Golang'), (13, 'C++'), (14, 'PHP'), (15, 'Cybersecurity');

-- ==========================================================
-- 2. MAIN ENTITIES (Companies & Users)
-- ==========================================================

-- INSERT INTO Companies
INSERT INTO Companies (id, name, slug, website, description, is_verified) VALUES
(1, 'FPT Software', 'fpt-software', 'https://fptsoftware.com', 'Leading technology corporation in Vietnam.', 1),
(2, 'Viettel Group', 'viettel-group', 'https://viettel.com.vn', 'Military Industry and Telecommunications Group.', 1),
(3, 'VNG Corporation', 'vng-corporation', 'https://vng.com.vn', 'The first technology unicorn in Vietnam.', 1),
(4, 'MoMo (M-Service)', 'momo', 'https://momo.vn', 'The number one digital payment super-app in Vietnam.', 1),
(5, 'VNPT', 'vnpt', 'https://vnpt.com.vn', 'Vietnam Posts and Telecommunications Group.', 1),
(6, 'VNPAY', 'vnpay', 'https://vnpay.vn', 'Vietnam Payment Solution Joint Stock Company.', 1),
(7, 'Tiki', 'tiki', 'https://tiki.vn', 'Leading local e-commerce ecosystem platform.', 1),
(8, 'Shopee Vietnam', 'shopee-vn', 'https://shopee.vn', 'The most popular e-commerce platform in the region.', 1),
(9, 'KMS Technology', 'kms-technology', 'https://kms-technology.com', 'A premier US-based software development company.', 1),
(10, 'NashTech', 'nashtech', 'https://nashtechglobal.com', 'Global technology solutions part of Harvey Nash Group.', 1);

-- INSERT INTO Users
-- Password mock hash value: $2a$12$DummyHashStringForPassword12345
INSERT INTO Users (id, username, password, email, role, company_id, is_active, is_verified, ban_reason) VALUES
(1, 'admin_system', 'hashed_pwd_here', 'admin@jobfinder.com', 'admin', NULL, 1, 1, NULL),
-- Employers for Viettel Group (Company ID: 2) managing 30 jobs
(2, 'viettel_hr1', 'hashed_pwd_here', 'hr1@viettel.com.vn', 'employer', 2, 1, 1, NULL),
(3, 'viettel_hr2', 'hashed_pwd_here', 'hr2@viettel.com.vn', 'employer', 2, 1, 1, NULL),
(4, 'viettel_techlead', 'hashed_pwd_here', 'techlead@viettel.com.vn', 'employer', 2, 1, 1, NULL),
-- Employers for other companies
(5, 'fpt_hr', 'hashed_pwd_here', 'hr@fptsoftware.com', 'employer', 1, 1, 1, NULL),
(6, 'vng_hr', 'hashed_pwd_here', 'hr@vng.com.vn', 'employer', 3, 1, 1, NULL),
(7, 'momo_hr', 'hashed_pwd_here', 'hr@momo.vn', 'employer', 4, 1, 1, NULL),
(8, 'vnpt_hr', 'hashed_pwd_here', 'hr@vnpt.com.vn', 'employer', 5, 1, 1, NULL),
(9, 'vnpay_hr', 'hashed_pwd_here', 'hr@vnpay.vn', 'employer', 6, 1, 1, NULL),
(10, 'tiki_hr', 'hashed_pwd_here', 'hr@tiki.vn', 'employer', 7, 1, 1, NULL),
(11, 'shopee_hr', 'hashed_pwd_here', 'hr@shopee.vn', 'employer', 8, 1, 1, NULL),
(12, 'kms_hr', 'hashed_pwd_here', 'hr@kms.com', 'employer', 9, 1, 1, NULL),
(13, 'nashtech_hr', 'hashed_pwd_here', 'hr@nashtech.com', 'employer', 10, 1, 1, NULL),
(14, 'fpt_manager', 'hashed_pwd_here', 'manager@fptsoftware.com', 'employer', 1, 1, 1, NULL),
(15, 'vng_lead', 'hashed_pwd_here', 'lead@vng.com.vn', 'employer', 3, 1, 1, NULL),
(16, 'momo_lead', 'hashed_pwd_here', 'lead@momo.vn', 'employer', 4, 1, 1, NULL),
-- Candidates (15 accounts)
(17, 'nguyenvana', 'hashed_pwd_here', 'nguyenvana@gmail.com', 'candidate', NULL, 1, 1, NULL),
(18, 'tranthingoc', 'hashed_pwd_here', 'tranthingoc@gmail.com', 'candidate', NULL, 1, 1, NULL),
(19, 'lehoangbach', 'hashed_pwd_here', 'lehoangbach@gmail.com', 'candidate', NULL, 1, 1, NULL),
(20, 'phamminhtuan', 'hashed_pwd_here', 'phamminhtuan@gmail.com', 'candidate', NULL, 1, 1, NULL),
(21, 'vuonghaidang', 'hashed_pwd_here', 'vuonghaidang@gmail.com', 'candidate', NULL, 1, 1, NULL),
(22, 'ngochoamai', 'hashed_pwd_here', 'ngochoamai@gmail.com', 'candidate', NULL, 1, 1, NULL),
(23, 'dothanhdat', 'hashed_pwd_here', 'dothanhdat@gmail.com', 'candidate', NULL, 1, 1, NULL),
(24, 'tranthib', 'hashed_pwd_here', 'tranthib@gmail.com', 'candidate', NULL, 1, 1, NULL),
(25, 'lethic', 'hashed_pwd_here', 'lethic@gmail.com', 'candidate', NULL, 1, 1, NULL),
(26, 'nguyenvand', 'hashed_pwd_here', 'nguyenvand@gmail.com', 'candidate', NULL, 1, 1, NULL),
(27, 'vuongthie', 'hashed_pwd_here', 'vuongthie@gmail.com', 'candidate', NULL, 1, 1, NULL),
(28, 'buivans', 'hashed_pwd_here', 'buivans@gmail.com', 'candidate', NULL, 1, 1, NULL),
(29, 'dangthih', 'hashed_pwd_here', 'dangthih@gmail.com', 'candidate', NULL, 1, 1, NULL),
(30, 'hoangvank', 'hashed_pwd_here', 'hoangvank@gmail.com', 'candidate', NULL, 1, 1, NULL),
(31, 'phanthanhm', 'hashed_pwd_here', 'phanthanhm@gmail.com', 'candidate', NULL, 1, 1, NULL);

-- ==========================================================
-- 3. DETAILED PROFILES (Profiles, Education, Work_Experience)
-- ==========================================================

-- INSERT INTO Profiles
INSERT INTO Profiles (id, user_id, full_name, title, location, gender, dob, bio, allow_employer_search) VALUES
(1, 17, 'Nguyen Van A', 'Senior Backend Developer', 'Hanoi', 'male', '1995-05-12', '5 years of enterprise experience in Java and Spring Boot ecosystems.', 1),
(2, 18, 'Tran Thi Ngoc', 'Data Scientist', 'Ho Chi Minh City', 'female', '1996-08-20', 'Passionate about Deep Learning, predictive models, and Big Data setups.', 1),
(3, 19, 'Le Hoang Bach', 'Product Manager', 'Da Nang', 'male', '1992-11-05', 'Experienced in driving financial technology and payment gateway product roadmaps.', 1),
(4, 20, 'Pham Minh Tuan', 'DevOps Engineer', 'Hanoi', 'male', '1994-02-15', 'Cloud architecture engineer specialized in AWS, Docker containers, and Kubernetes orchestration.', 1),
(5, 21, 'Vuong Hai Dang', 'UI/UX Designer', 'Ho Chi Minh City', 'male', '1998-07-30', 'Dedicated to constructing user-centric, elegant mobile and web product interfaces.', 1),
(6, 22, 'Ngo Cho Mai', 'QA Engineer', 'Can Tho', 'female', '1997-04-25', 'Expertise in running manual test structures and coding automated Selenium test suites.', 1),
(7, 23, 'Do Thanh Dat', 'Business Analyst', 'Hanoi', 'male', '1995-09-10', 'Skilled in extracting business logic requirements for distributed enterprise portals.', 1),
(8, 24, 'Tran Thi B', 'Frontend Developer', 'Ho Chi Minh City', 'female', '1999-12-01', 'Core competency focused on client-side architectures like ReactJS and VueJS platforms.', 1),
(9, 25, 'Le Thi C', 'Digital Marketing Specialist', 'Hanoi', 'female', '1996-03-18', 'Driven by direct consumer growth hacking, search optimization metrics (SEO/SEM).', 1),
(10, 26, 'Nguyen Van D', 'Cybersecurity Specialist', 'Da Nang', 'male', '1993-06-22', 'Certified CEH focused on web penetration audits and security hardiness operations.', 1),
(11, 27, 'Vuong Thi E', 'IT Recruiter', 'Hanoi', 'female', '1994-10-14', 'Passionate talent acquisition professional tracking top tier technical engineers.', 1),
(12, 28, 'Bui Van S', 'Node.js Developer', 'Ho Chi Minh City', 'male', '1997-01-09', 'Backend systems engineer constructing fast REST APIs via JavaScript runtime ecosystems.', 1),
(13, 29, 'Dang Thi H', 'System Administrator', 'Binh Duong', 'female', '1995-11-28', 'Ensuring system stability via deep Linux distribution setup and monitoring.', 1),
(14, 30, 'Hoang Van K', 'Android Developer', 'Hanoi', 'male', '1998-05-16', 'Native mobile engineer deploying high quality client experiences with Kotlin SDK.', 1),
(15, 31, 'Phan Thanh M', 'Fullstack Developer', 'Ho Chi Minh City', 'male', '1996-12-25', 'Agile product developer working across the complete modern MERN technology stack.', 1);

-- INSERT INTO Education
INSERT INTO Education (profile_id, school_name, major, gpa, start_date, end_date) VALUES
(1, 'Hanoi University of Science and Technology', 'Information Technology', '3.5', '2013-09-01', '2018-06-30'),
(2, 'VNUHCM - University of Science', 'Computer Science', '3.8', '2014-09-01', '2018-07-15'),
(3, 'National Economics University', 'Management Information Systems', '3.2', '2010-09-01', '2014-06-30'),
(4, 'Posts and Telecommunications Institute of Technology', 'Information Security', '3.4', '2012-09-01', '2017-06-30'),
(5, 'University of Industrial Fine Arts', 'Graphic Design', '3.6', '2016-09-01', '2020-06-30'),
(6, 'Can Tho University', 'Software Engineering', '3.3', '2015-09-01', '2019-06-30'),
(7, 'FPT University', 'Software Engineering', '3.7', '2013-09-01', '2017-06-30'),
(8, 'VNUHCM - University of Information Technology', 'Computer Science', '3.5', '2017-09-01', '2021-06-30'),
(9, 'Foreign Trade University', 'International Economics', '3.4', '2014-09-01', '2018-06-30'),
(10, 'Military Technical Academy', 'Information Technology', '3.6', '2011-09-01', '2016-06-30'),
(11, 'VNU - University of Social Sciences and Humanities', 'Psychology', '3.2', '2012-09-01', '2016-06-30'),
(12, 'Ton Duc Thang University', 'Computer Networks', '3.4', '2015-09-01', '2019-06-30'),
(13, 'VNUHCM - International University', 'Computer Science', '3.5', '2013-09-01', '2017-06-30'),
(14, 'The University of Danang - University of Science and Technology', 'Information Technology', '3.3', '2016-09-01', '2020-06-30'),
(15, 'Ho Chi Minh City University of Technology and Education', 'Information Technology', '3.6', '2014-09-01', '2018-06-30');

-- INSERT INTO Work_Experience
INSERT INTO Work_Experience (profile_id, company_name, position, start_date, end_date) VALUES
(1, 'FPT Software', 'Backend Developer', '2018-08-01', '2023-01-01'),
(2, 'VNG Corporation', 'Data Analyst', '2018-09-01', '2022-12-31'),
(3, 'MoMo', 'Associate Product Manager', '2015-01-01', '2020-06-30'),
(4, 'Viettel Group', 'System Admin', '2017-07-01', '2021-12-31'),
(5, 'Tiki', 'Junior UX Designer', '2020-08-01', '2023-05-30'),
(6, 'KMS Technology', 'QC Engineer', '2019-07-01', '2023-08-01'),
(7, 'VNPAY', 'Business Analyst', '2017-08-01', '2022-04-30'),
(8, 'Shopee', 'Frontend Intern', '2021-07-01', '2022-06-30'),
(9, 'VNG Corporation', 'Marketing Executive', '2018-07-01', '2021-12-31'),
(10, 'VNPT', 'Security Analyst', '2016-08-01', '2022-09-30'),
(11, 'NashTech', 'HR Executive', '2016-07-01', '2021-05-30'),
(12, 'FPT Software', 'Node.js Developer', '2019-08-01', '2023-02-28'),
(13, 'Viettel Group', 'IT Support', '2017-07-01', '2020-12-31'),
(14, 'MoMo', 'Android Intern', '2020-07-01', '2021-12-31'),
(15, 'Tiki', 'Fullstack Developer', '2018-08-01', '2023-07-30');

-- ==========================================================
-- 4. JOB MANAGEMENT (30 Records owned by VIETTEL - ID = 2)
-- ==========================================================

INSERT INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, status) VALUES
-- Batch 1: Posted by Employer 2 (10 jobs)
(1, 2, 2, 1, 1, 'Senior Java Developer (Spring Boot)', 'viettel-senior-java', 1200, 2400, 'full-time', 'senior', 'Develop core high-throughput telecom backends and real-time ledger systems.', 'approved'),
(2, 2, 2, 1, 2, 'Junior Python Backend Developer', 'viettel-junior-python', 600, 1000, 'full-time', 'junior', 'Construct robust internal RESTful APIs for processing value-added services (VAS).', 'approved'),
(3, 2, 2, 2, 1, 'Data Scientist (Machine Learning)', 'viettel-data-scientist', 1600, 3200, 'full-time', 'senior', 'Research scalable deep learning solutions and data intelligence strategies.', 'approved'),
(4, 2, 2, 3, 1, 'Product Manager (Viettel Money)', 'viettel-pm-money', 2000, 3600, 'full-time', 'senior', 'Define features and steer product roadmaps for major fintech mobile platforms.', 'approved'),
(5, 2, 2, 4, 1, 'Senior UI/UX Designer', 'viettel-senior-ui-ux', 1000, 1800, 'full-time', 'senior', 'Map user journeys and conceptualize rich screens for the MyViettel consumer application.', 'approved'),
(6, 2, 2, 5, 2, 'Automation QA Engineer', 'viettel-automation-qa', 800, 1600, 'full-time', 'middle', 'Author structural regression and automated verification script blocks for applications.', 'approved'),
(7, 2, 2, 6, 1, 'Cloud DevOps Engineer', 'viettel-cloud-devops', 1400, 2800, 'full-time', 'middle', 'Govern high-availability systems on enterprise cloud hyper-converged hardware setups.', 'approved'),
(8, 2, 2, 7, 1, 'Cybersecurity Specialist', 'viettel-cybersecurity', 1600, 3200, 'full-time', 'senior', 'Safeguard structural nodes and critical infrastructure points from unexpected vectors.', 'approved'),
(9, 2, 2, 8, 2, 'IT Business Analyst', 'viettel-it-ba', 800, 1400, 'full-time', 'middle', 'Deconstruct structural logic requirements for internal customized ERP solutions.', 'approved'),
(10, 2, 2, 1, 1, 'Fresher Golang Developer', 'viettel-fresher-golang', 400, 600, 'full-time', 'fresher', 'Learn and contribute within internal low-latency microservice programming channels.', 'approved'),

-- Batch 2: Posted by Employer 3 (10 jobs)
(11, 2, 3, 1, 3, 'ReactJS Frontend Developer', 'viettel-reactjs-danang', 720, 1400, 'full-time', 'middle', 'Design sleek customer administration modules stationed inside the Da Nang R&D center.', 'approved'),
(12, 2, 3, 1, 1, 'C/C++ Embedded Engineer', 'viettel-embedded-cpp', 1000, 2200, 'full-time', 'senior', 'Write optimized, low-level operational code running directly inside 5G station units.', 'approved'),
(13, 2, 3, 6, 1, 'Kubernetes Administrator', 'viettel-k8s-admin', 1200, 2400, 'full-time', 'middle', 'Maintain and patch structural node states across large cluster orchestration setups.', 'approved'),
(14, 2, 3, 2, 2, 'Data Engineer (Big Data)', 'viettel-data-engineer', 1400, 2800, 'full-time', 'senior', 'Architect robust pipeline streams feeding massive datasets into log warehouses.', 'approved'),
(15, 2, 3, 9, 1, 'B2B IT Sales Executive', 'viettel-b2b-sales', 600, 2000, 'full-time', 'middle', 'Pitch tailored cloud technologies and platform-as-a-service offers to market groups.', 'approved'),
(16, 2, 3, 8, 1, 'Senior System Analyst', 'viettel-system-analyst', 1200, 2000, 'full-time', 'senior', 'Model database diagrams and logical flow connections for enterprise platforms.', 'approved'),
(17, 2, 3, 5, 1, 'Manual Tester (Intern)', 'viettel-manual-tester-intern', 120, 200, 'contract', 'intern', 'Verify bugs, record reproduction steps, and cross-reference feature checklists.', 'approved'),
(18, 2, 3, 10, 1, 'Digital Marketing Manager', 'viettel-digital-mkt-manager', 1600, 2800, 'full-time', 'senior', 'Direct multi-channel awareness pushes and analyze targeted user conversion metrics.', 'approved'),
(19, 2, 3, 4, 1, 'UX Researcher', 'viettel-ux-researcher', 800, 1400, 'full-time', 'middle', 'Conduct qualitative target surveys to extract actual core product usability insights.', 'approved'),
(20, 2, 3, 1, 2, 'Node.js Backend Developer', 'viettel-nodejs-hcm', 880, 1600, 'full-time', 'middle', 'Construct low latency backend modules handling messaging actions on OTT platforms.', 'approved'),

-- Batch 3: Posted by Employer 4 (10 jobs)
(21, 2, 4, 1, 1, 'Android Developer (Kotlin)', 'viettel-android-kotlin', 800, 1800, 'full-time', 'middle', 'Author responsive, state-managed native layouts across Android configurations.', 'approved'),
(22, 2, 4, 1, 1, 'iOS Developer (Swift)', 'viettel-ios-swift', 1000, 2000, 'full-time', 'middle', 'Build fluid consumer features integrated securely into core Swift codebases.', 'approved'),
(23, 2, 4, 1, 1, 'Fullstack Developer (Java/React)', 'viettel-fullstack-java-react', 1200, 2600, 'full-time', 'senior', 'Bridge technical layers to drive core platform transformation architectures.', 'approved'),
(24, 2, 4, 7, 2, 'Penetration Tester (Pentester)', 'viettel-pentester', 1400, 3000, 'full-time', 'senior', 'Conduct authorization bypass mapping and run white-hat exploits on targeted webs.', 'approved'),
(25, 2, 4, 3, 1, 'Associate Product Manager', 'viettel-apm', 600, 1000, 'full-time', 'junior', 'Collaborate across groups to manage backlogs and define minor feature cycles.', 'approved'),
(26, 2, 4, 2, 1, 'Business Intelligence (BI) Analyst', 'viettel-bi-analyst', 1000, 1800, 'full-time', 'middle', 'Generate insightful visual reports and central dashboard panels for decision groups.', 'approved'),
(27, 2, 4, 6, 1, 'Site Reliability Engineer (SRE)', 'viettel-sre', 1600, 3400, 'full-time', 'senior', 'Implement metric tracking monitors to guarantee a 99.99% system availability standard.', 'approved'),
(28, 2, 4, 1, 3, 'PHP/Laravel Developer', 'viettel-php-laravel', 600, 1200, 'full-time', 'junior', 'Refactor and extend business features living inside legacy administration applications.', 'approved'),
(29, 2, 4, 5, 1, 'QA Lead / Test Manager', 'viettel-qa-lead', 1800, 3200, 'full-time', 'senior', 'Steer quality policies, distribute validation workloads, and approve target build releases.', 'approved'),
(30, 2, 4, 1, 1, 'Technical Architect', 'viettel-tech-architect', 2800, 4800, 'full-time', 'senior', 'Establish high-level structural patterns governing massive microservices blueprints.', 'approved');

-- INSERT INTO Job_Skills
INSERT INTO Job_Skills (job_id, skill_id) VALUES
(1, 1), (1, 6), (2, 2), (2, 6), (3, 2), (3, 9), (4, 8), (5, 7),
(6, 1), (6, 6), (7, 5), (7, 10), (7, 11), (8, 15), (9, 8), (10, 12),
(11, 3), (12, 13), (13, 10), (13, 11), (14, 2), (14, 6), (15, 8),
(16, 6), (16, 8), (17, 6), (18, 8), (19, 7), (20, 4), (20, 6),
(21, 1), (22, 1), (23, 1), (23, 3), (24, 15), (25, 8), (26, 6),
(27, 5), (27, 10), (28, 14), (28, 6), (29, 8), (30, 1), (30, 5);

-- INSERT INTO User_Skills
INSERT INTO User_Skills (profile_id, skill_id) VALUES
(1, 1), (1, 6), (2, 2), (2, 9), (3, 8), (4, 5), (4, 10), (4, 11),
(5, 7), (6, 1), (7, 8), (8, 3), (10, 15), (12, 4), (13, 10), (14, 1), (15, 4), (15, 3);

-- INSERT INTO JobCriteria
INSERT INTO JobCriteria (user_id, desired_position, salary_min, preferred_location) VALUES
(17, 'Senior Backend Developer', 1600, 'Hanoi'),
(18, 'Data Scientist', 2000, 'Ho Chi Minh City'),
(19, 'Product Manager', 2400, 'Hanoi'),
(20, 'DevOps Engineer', 1800, 'Hanoi'),
(21, 'UI/UX Designer', 1200, 'Ho Chi Minh City'),
(22, 'QA Engineer', 1000, 'Can Chi'),
(23, 'Business Analyst', 1200, 'Hanoi'),
(24, 'Frontend Developer', 800, 'Ho Chi Minh City'),
(25, 'Digital Marketing Specialist', 1000, 'Hanoi'),
(26, 'Cybersecurity Specialist', 1600, 'Da Nang'),
(27, 'IT Recruiter', 800, 'Hanoi'),
(28, 'Node.js Developer', 1200, 'Ho Chi Minh City'),
(29, 'System Administrator', 1000, 'Binh Duong'),
(30, 'Android Developer', 1200, 'Hanoi'),
(31, 'Fullstack Developer', 1600, 'Ho Chi Minh City');

-- ==========================================================
-- 5. CONNECTION & INTERACTION OPERATIONS (30 records each)
-- ==========================================================

-- INSERT INTO Applications
INSERT INTO Applications (candidate_id, job_id, cover_letter, status) VALUES
(17, 1, 'I possess over 5 years of professional engineering with Java.', 'pending'),
(17, 23, 'I can confidently drive both Java backends and React frontends.', 'reviewed'),
(18, 3, 'Specialized data analytics consultant matching AI requirements.', 'interviewing'),
(18, 14, 'Over 4 years orchestrating high traffic Big Data pipelines.', 'pending'),
(19, 4, 'Previously operated scale fintech logic modules at MoMo.', 'accepted'),
(19, 25, 'Applying to join the high level digital management tier.', 'pending'),
(20, 7, 'Prepared to deploy and maintain complex cloud frameworks.', 'reviewed'),
(20, 13, 'Deep orchestrator experience with production Kubernetes setups.', 'pending'),
(20, 27, 'Proven track record as an SRE guarding enterprise uptimes.', 'interviewing'),
(21, 5, 'My curated design portfolio shares equivalent mobile product interfaces.', 'pending'),
(21, 19, 'Equipped with qualitative research tools for tracking UX trends.', 'reviewed'),
(22, 6, 'Proficient with Selenium scripting for fast regression pipelines.', 'pending'),
(22, 17, 'Applying to support manual engineering validation efforts.', 'rejected'),
(22, 29, 'Experienced team lead structuring quality assurance lifecycles.', 'pending'),
(23, 9, 'Served as a technical analyst reviewing multi-module corporate ERPs.', 'interviewing'),
(23, 16, 'Ready to optimize schema links as a dedicated System Analyst.', 'pending'),
(24, 11, 'Highly focused on clean components and state management with React.', 'accepted'),
(25, 18, 'Fully capable of deploying custom organic conversion funnels.', 'reviewed'),
(26, 8, 'Holder of global certifications verifying defensive network setups.', 'pending'),
(26, 24, 'Experienced running explicit white-hat vulnerability exploration scans.', 'interviewing'),
(27, 15, 'Transitioning my industry network toward enterprise tech sales channels.', 'pending'),
(28, 20, 'Familiar with asynchronous programming patterns using Node.js.', 'reviewed'),
(29, 7, 'Dedicated system administrator ensuring container cluster health.', 'pending'),
(30, 21, 'Capable of delivering elegant architecture via Kotlin components.', 'accepted'),
(31, 23, '3 years of end-to-end web deployment utilizing the MERN stack.', 'pending'),
(31, 2, 'Familiar with generating data hooks using Python backends.', 'reviewed'),
(17, 30, 'Applying to serve as the core technical designer for top applications.', 'pending'),
(18, 26, 'Skilled at connecting data streams to compile visual panels.', 'interviewing'),
(19, 9, 'Acted as the lead business liaison for preceding platform launches.', 'pending'),
(28, 28, 'Possess foundational structural familiarity with Laravel setups.', 'rejected');

-- INSERT INTO Favorite_Jobs
INSERT INTO Favorite_Jobs (user_id, job_id) VALUES
(17, 1), (17, 23), (17, 30), (18, 3), (18, 14), (18, 26), 
(19, 4), (19, 25), (19, 9), (20, 7), (20, 13), (20, 27), 
(21, 5), (21, 19), (22, 6), (22, 17), (22, 29), (23, 9), 
(23, 16), (24, 11), (25, 18), (26, 8), (26, 24), (27, 15), 
(28, 20), (28, 28), (29, 7), (30, 21), (31, 23), (31, 2);

-- INSERT INTO Employer_Profile_Views (Includes updated status column)
INSERT INTO Employer_Profile_Views (employer_id, candidate_id, status) VALUES
(2, 17, 'viewed'), (2, 18, 'viewed'), (2, 19, 'viewed'), (2, 20, 'viewed'), (2, 21, 'viewed'), 
(2, 22, 'viewed'), (2, 23, 'viewed'), (2, 24, 'viewed'), (2, 25, 'viewed'), (2, 26, 'viewed'),
(3, 17, 'viewed'), (3, 18, 'viewed'), (3, 27, 'viewed'), (3, 28, 'viewed'), (3, 29, 'viewed'), 
(3, 30, 'viewed'), (3, 31, 'viewed'), (3, 20, 'viewed'), (3, 21, 'viewed'), (3, 22, 'viewed'),
(4, 19, 'viewed'), (4, 20, 'viewed'), (4, 21, 'viewed'), (4, 22, 'viewed'), (4, 23, 'viewed'), 
(4, 24, 'viewed'), (4, 25, 'viewed'), (4, 26, 'viewed'), (4, 30, 'viewed'), (4, 31, 'viewed');

-- INSERT INTO Job_Invitations
INSERT INTO Job_Invitations (employer_id, candidate_id, job_id, message, status) VALUES
(2, 17, 1, 'Hello, we are recruiting for a Senior Java position, we welcome your application.', 'pending'),
(2, 18, 3, 'Your AI background matches our engineering criteria perfectly.', 'accepted'),
(2, 19, 4, 'We are looking for a PM to lead core Viettel Money system features.', 'pending'),
(2, 20, 7, 'We invite you to review our open positions inside the cloud team.', 'declined'),
(2, 21, 5, 'Your design portfolio is highly impressive, we would like to schedule a loop.', 'pending'),
(2, 22, 6, 'Your automation testing background matches our platform requirements.', 'accepted'),
(2, 23, 9, 'We welcome you to interview for our upcoming enterprise analyst role.', 'pending'),
(2, 24, 11, 'We are currently adding skilled frontend engineering assets in Da Nang.', 'pending'),
(2, 25, 18, 'Our growth group is searching for an optimization advisor.', 'declined'),
(2, 26, 8, 'We invite you to participate in our infrastructure security review cycle.', 'pending'),
(3, 17, 23, 'Fullstack Java appears to be your core strength, let us collaborate.', 'accepted'),
(3, 18, 14, 'Our new distributed data warehouse channel requires an engineer.', 'pending'),
(3, 27, 15, 'Great engineering recruitment profile, let us talk about technical sales.', 'pending'),
(3, 28, 20, 'We require a Node.js engine expert to back our instant chat systems.', 'accepted'),
(3, 29, 13, 'Your operational track record with Linux infrastructures fits our team.', 'pending'),
(3, 30, 21, 'Let us coordinate a conversational cycle tracking our active Android slot.', 'pending'),
(3, 31, 23, 'Your fullstack portfolio fits our microservices transition strategies.', 'declined'),
(3, 20, 13, 'Are you open to orchestrating high-scale elastic container instances?', 'pending'),
(3, 21, 19, 'We are extending our localized consumer testing and research teams.', 'pending'),
(3, 22, 17, 'Junior engineering test opportunities are currently open for review.', 'accepted'),
(4, 19, 25, 'Join us to assist mapping multi-platform payment roadmaps.', 'pending'),
(4, 20, 27, 'Help us guarantee system uptimes across our cloud node networks.', 'accepted'),
(4, 21, 5, 'Fresh visual design openings matching your style metrics are available.', 'pending'),
(4, 22, 29, 'Seeking an analytical manager to drive our automation quality models.', 'pending'),
(4, 23, 16, 'Seeking architecture planners to structuralize enterprise systems.', 'declined'),
(4, 24, 24, 'We need active white-hat assets to check our internal network nodes.', 'pending'),
(4, 25, 18, 'Digital optimization paths are open for candidate review.', 'pending'),
(4, 26, 24, 'Security framework administration options are ready for application.', 'accepted'),
(4, 30, 21, 'We value your Kotlin clean architecture components, please apply.', 'pending'),
(4, 31, 23, 'Let us sync up calendar availability for a technical evaluation loop.', 'pending');