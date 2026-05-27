-- ==========================================================
-- FILE: seed.sql (Mock Data for Job Board System - APPEND ONLY)
-- Optional: Insert additional data, DO NOT delete old data
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
(200, 200, 200, 1, 2, 'AI Engineer (Python, TensorFlow)', 'ai-engineer-200', 1200, 2000, 'full-time', 'senior', 'Research and develop machine learning models for core AI systems.', '• Practical experience with Python, TensorFlow\n• Deep Learning knowledge', '• Premium healthcare insurance\n• 13th-month salary', 'approved'),
(201, 200, 200, 1, 2, 'Blockchain Developer', 'blockchain-dev-201', 1600, 3200, 'full-time', 'senior', 'Develop Smart Contracts and DeFi decentralized application architecture.', '• Solid experience with Solidity, Rust\n• Previous experience with DApps', '• High project progress bonus\n• Flexible working hours', 'approved'),
(202, 201, 201, 6, 1, 'B2B Sales Executive', 'b2b-sales-202', 600, 1200, 'full-time', 'junior', 'Find business partners and exploit large commercial market segments.', '• Over 2 years of B2B Sales experience\n• Good persuasion skills', '• High commission rate\n• Personal laptop provided', 'approved'),
(203, 202, 201, 1, 1, 'Senior Frontend Engineer', 'senior-frontend-engineer', 1400, 2200, 'full-time', 'senior', 'Build large web application interfaces, optimize smooth page loading using React.', '• Over 5 years of experience with React, Webpack\n• Small team management skills', '• Excellent year-end performance bonus\n• Daily free tea and snacks', 'approved'),
(204, 203, 200, 2, 2, 'Product Manager', 'product-manager', 1600, 2600, 'full-time', 'middle', 'Manage the roadmap and define development features of the product platform.', '• Over 3 years of PM experience in software\n• Good English communication', '• Fully remote working environment support\n• Company trip twice a year', 'approved'),
(205, 204, 200, 4, 4, 'UX/UI Designer', 'uxui-designer', 800, 1400, 'contract', 'middle', 'Design Wireframes, build seamless user experiences on Mobile App.', '• Proficient in Figma, Adobe XD\n• Good real-world product portfolio', '• Extremely flexible working hours\n• Holiday bonuses', 'approved'),
(206, 205, 200, 1, 5, 'Data Scientist', 'data-scientist', 1800, 3000, 'full-time', 'senior', 'Build complex academic statistical models, mine user data insights.', '• Proficient in Python, R, advanced SQL\n• Strong problem-solving mindset', '• Monthly lucky bonus\n• VIP periodic health check', 'approved'),
(207, 206, 200, 1, 5, 'Backend Developer (Node.js)', 'backend-developer', 1000, 1800, 'full-time', 'middle', 'Build and optimize Microservices systems handling large concurrent data.', '• In-depth Node.js / Express foundation experience\n• Database optimization skills', '• Bi-annual salary review\n• New Macbook Pro provided', 'approved');

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
    1400, 
    2400, 
    'USD',
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
    160, 
    320, 
    'USD',
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
    480, 
    720, 
    'USD',
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

USE job_finder_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================================
-- 5. JOB POSTINGS (FULLY ENGLISH TRANSLATED - 30 JOBS PER REMAINING COMPANY)
-- =========================================================================

-- ==========================================================
-- COMPANY 207: TechFlow (Global IT & Technology Expert)
-- Job IDs: 300 - 329
-- ==========================================================
INSERT IGNORE INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(300, 207, 200, 1, 1, 'Senior Java Backend Engineer', 'techflow-java-senior-300', 1800, 2800, 'full-time', 'senior', 'Develop high-throughput microservices systems.', '4+ years of experience with Spring Boot, Hibernate.', '14th-month salary, premium PVI health insurance.', 'approved'),
(301, 207, 200, 1, 1, 'Frontend Developer (ReactJS)', 'techflow-react-junior-301', 800, 1300, 'full-time', 'junior', 'Build web interfaces for enterprise management applications.', 'Proficient in ReactJS, HTML5, CSS3, JavaScript.', 'Provided with a dedicated Macbook Pro, salary review twice a year.', 'approved'),
(302, 207, 200, 1, 2, 'Mobile App Developer (Flutter)', 'techflow-flutter-mid-302', 1200, 1900, 'full-time', 'middle', 'Develop hybrid applications running on both iOS & Android.', '2 years of Flutter experience, deep understanding of State Management.', 'Quarterly project bonuses, annual team building.', 'approved'),
(303, 207, 200, 1, 2, 'DevOps Engineer (AWS/Kubernetes)', 'techflow-devops-senior-303', 2000, 3500, 'full-time', 'senior', 'Set up CI/CD pipelines, operate AWS infrastructure architecture.', 'Experience with Docker, K8s, Jenkins, Ansible.', '100% financial support for international certification exams.', 'approved'),
(304, 207, 200, 1, 3, 'QA/QC Automation Engineer', 'techflow-qa-auto-304', 1000, 1600, 'full-time', 'middle', 'Write automated test scripts for Web and API systems.', 'Experience with Selenium, Cypress, or RestAssured.', 'Hybrid work model (2 days remote/week).', 'approved'),
(305, 207, 200, 1, 3, 'Python Data Engineer', 'techflow-data-eng-305', 1300, 2200, 'full-time', 'middle', 'Build and optimize data pipelines (ETL/ELT).', 'Proficient in Python, SQL, Apache Spark, or Airflow.', 'Attractive year-end bonus, international environment.', 'approved'),
(306, 207, 200, 1, 1, 'IT Support Technician', 'techflow-it-support-306', 500, 800, 'full-time', 'fresher', 'Provide hardware and internal network technical support for employees.', 'Graduated in IT, enthusiastic, and hard-working.', 'Free lunch at the company pantry.', 'approved'),
(307, 207, 200, 1, 2, 'Solutions Architect', 'techflow-solutions-arch-307', 3500, 5000, 'full-time', 'senior', 'Design overall software architecture for foreign partners.', '10+ years of industry experience, fluent in English communication.', 'Employee Stock Ownership Plan (ESOP), overseas travel.', 'approved'),
(308, 207, 200, 1, 4, 'Embedded Systems Engineer', 'techflow-embedded-308', 900, 1500, 'full-time', 'junior', 'Program circuit boards and microcontrollers for IoT devices.', 'C/C++, knowledge of STM32, ESP32 microcontrollers.', 'Hazard pay allowance and full research equipment provided.', 'approved'),
(309, 207, 200, 1, 5, 'Network Security Specialist', 'techflow-security-309', 1500, 2500, 'full-time', 'middle', 'Monitor and secure network security across the entire system.', 'CCNA/CEH certification, deep understanding of OWASP vulnerabilities.', 'Spot bonuses for detecting and fixing major incidents.', 'approved'),
(310, 207, 200, 7, 1, 'Hardware Engineering Intern', 'techflow-hardware-intern-310', 200, 400, 'part-time', 'intern', 'Support main engineers in testing hardware circuit boards.', 'Final-year student in Electronics and Telecommunications.', 'Opportunity to become a full-time employee after 3 months.', 'approved'),
(311, 207, 200, 1, 2, 'Scrum Master', 'techflow-scrum-master-311', 1400, 2100, 'full-time', 'middle', 'Coordinate and optimize Agile/Scrum workflows for teams.', 'CSM/PSM I certification, good conflict resolution skills.', 'Free English classes with native speakers.', 'approved'),
(312, 207, 200, 1, 1, 'Manual Tester', 'techflow-manual-test-312', 600, 1000, 'full-time', 'junior', 'Create test cases, perform UI and business workflow testing.', 'Careful, meticulous, with good logical thinking.', 'Annual VIP health check-up.', 'approved'),
(313, 207, 200, 1, 2, 'Golang Developer', 'techflow-golang-mid-313', 1300, 2200, 'full-time', 'middle', 'Build high-performance backend services using Go.', 'Experience with Gin, gRPC, Redis, Kafka.', '14 days of paid annual leave.', 'approved'),
(314, 207, 200, 1, 2, 'AI Research Intern', 'techflow-ai-intern-314', 300, 500, 'full-time', 'intern', 'Support research on natural language processing (NLP) algorithms.', 'Student majoring in Data Science / Mathematical Informatics.', 'Guided by leading PhD experts in the field.', 'approved'),
(315, 207, 200, 1, 3, 'VueJS Web Developer', 'techflow-vue-junior-315', 700, 1100, 'full-time', 'junior', 'Develop functional modules on Vue2/Vue3 platforms.', 'Over 1 year of hands-on experience with VueJS, Vuex.', 'Free tea, coffee, and pastries at the office.', 'approved'),
(316, 207, 200, 1, 1, 'PHP Laravel Developer', 'techflow-php-mid-316', 900, 1400, 'full-time', 'junior', 'Maintain and upgrade e-commerce website systems.', 'Solid working experience with Laravel, MySQL.', 'Project completion bonuses on matching deadlines.', 'approved'),
(317, 207, 200, 1, 2, 'Cloud Solutions Engineer', 'techflow-cloud-solutions-317', 2200, 3300, 'full-time', 'senior', 'Consult and migrate infrastructure to Cloud (Azure/GCP).', 'Deep understanding of Cloud architecture, professional certification.', '13th, 14th, 15th-month performance-based bonuses.', 'approved'),
(318, 207, 200, 1, 1, 'Node.js Team Lead', 'techflow-node-lead-318', 2500, 3800, 'full-time', 'senior', 'Technical management and leadership of the backend development team.', '3+ years as a Lead, deep knowledge of distributed systems.', 'Family health care package support.', 'approved'),
(319, 207, 200, 1, 2, 'Cyber Security Analyst', 'techflow-cyber-analyst-319', 1100, 1800, 'full-time', 'middle', 'Analyze malware and respond to network security incidents.', 'Graduated in Information Security, ability to analyze software logs.', 'Youthful environment, flexible check-in policy.', 'approved'),
(320, 207, 200, 1, 2, 'Freelance Android Developer', 'techflow-android-freelance-320', 1000, 2000, 'freelance', 'middle', 'Develop separate feature modules for Android application by project.', 'Proficient in Kotlin, strong independent working skills.', 'Payment based on project milestones.', 'approved'),
(321, 207, 200, 1, 1, 'Technical Writer', 'techflow-tech-writer-321', 800, 1200, 'full-time', 'junior', 'Write technical user guides and documentation for developers and users.', 'Excellent English (IELTS 6.5+), understanding of IT concepts.', 'Creative and modern workspace.', 'approved'),
(322, 207, 200, 1, 3, 'Ruby on Rails Engineer', 'techflow-ror-mid-322', 1200, 2000, 'full-time', 'middle', 'Develop Web CRM applications for the Japanese market.', 'Experience with Ruby on Rails, Japanese language skill preferred.', 'Monthly Japanese language allowance with JLPT certificate.', 'approved'),
(323, 207, 200, 5, 1, 'IT Recruiter Specialist', 'techflow-it-recruiter-323', 800, 1300, 'full-time', 'junior', 'Headhunt high-quality IT talent for the company.', 'Wide network within the developer community.', 'Attractive commission for each successful onboarded case.', 'approved'),
(324, 207, 200, 1, 2, 'Systems Administrator (Linux)', 'techflow-sysadmin-324', 900, 1500, 'full-time', 'middle', 'Manage physical and virtualized server systems running Linux OS.', 'Proficient in CentOS, Ubuntu Server, Bash Scripting.', 'Night shift allowance for unexpected incidents.', 'approved'),
(325, 207, 200, 1, 1, 'Data Warehouse Architect', 'techflow-dwh-arch-325', 2600, 4000, 'full-time', 'senior', 'Design data warehouse models for Business Intelligence.', 'Experience with BigQuery, Redshift, Snowflake.', 'Flexible working arrangements, results-oriented management.', 'approved'),
(326, 207, 200, 1, 4, 'Fresher .NET Developer', 'techflow-net-fresher-326', 500, 750, 'full-time', 'fresher', 'Participate in developing ERP software projects using C# .NET.', 'Strong graduation project in .NET, solid OOP knowledge.', 'Structured and comprehensive training from scratch.', 'approved'),
(327, 207, 200, 1, 2, 'Blockchain Security Auditor', 'techflow-blockchain-audit-327', 3000, 4500, 'contract', 'senior', 'Audit smart contracts for security vulnerabilities.', 'Deep knowledge of EVM, Solidity security.', 'High-value project contract, fully remote work.', 'approved'),
(328, 207, 200, 1, 1, 'Product Owner', 'techflow-po-328', 1600, 2500, 'full-time', 'middle', 'Define product backlog and work closely with development teams.', 'Strong product management skills, excellent stakeholder communication.', 'Premium comprehensive healthcare package.', 'approved'),
(329, 207, 200, 1, 2, 'Fullstack Developer (Node/React)', 'techflow-fullstack-329', 1400, 2300, 'full-time', 'middle', 'Build end-to-end features from user interface to API and storage.', 'Experience with ReactJS and NodeJS (Express/NestJS).', '0% interest installment support for purchasing personal laptops.', 'approved');

-- ==========================================================
-- COMPANY 208: InnovateSpace (Product Innovation & Creativity)
-- Job IDs: 330 - 359
-- ==========================================================
INSERT IGNORE INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(330, 208, 200, 4, 2, 'Senior Product Designer', 'innovatespace-prod-designer-330', 1500, 2400, 'full-time', 'senior', 'Responsible for overall user experience design across the application ecosystem.', 'Portfolio proving capability in complex UI/UX design.', 'Highly creative environment, open workspace.', 'approved'),
(331, 208, 200, 6, 2, 'Business Analyst (BA)', 'innovatespace-ba-mid-331', 1100, 1700, 'full-time', 'middle', 'Gather customer requirements, write SRS documentation and wireframes.', '2 years of experience as a BA in software product projects.', 'Year-end bonus based on product launch performance.', 'approved'),
(332, 208, 200, 4, 1, 'UX Researcher', 'innovatespace-ux-research-332', 1000, 1500, 'full-time', 'middle', 'Conduct user behavior research via interviews and A/B testing.', 'Strong analytical thinking, sensitive to data and human psychology.', 'Travel allowance for market research surveys.', 'approved'),
(333, 208, 200, 2, 2, 'Growth Hacking Specialist', 'innovatespace-growth-hack-333', 1300, 2100, 'full-time', 'middle', 'Develop strategies to optimize organic user acquisition for products.', 'Experience driving exponential user growth at startups.', 'Percentage commission directly on user growth metrics.', 'approved'),
(334, 208, 200, 6, 2, 'Product Operations Manager', 'innovatespace-prod-ops-334', 1800, 2800, 'full-time', 'senior', 'Operate and connect supporting departments to ensure seamless product operation.', '3+ years of tech product operations management experience.', 'Premium international health insurance.', 'approved'),
(335, 208, 200, 4, 1, 'UI Designer (Design System)', 'innovatespace-ui-ds-335', 900, 1400, 'full-time', 'junior', 'Build and standardize the corporate design system library.', 'Proficient in advanced Figma (Auto-layout, Components, Variables).', 'Equipped with a dedicated Dell monitor for graphics.', 'approved'),
(336, 208, 200, 2, 2, 'Content Strategy Lead', 'innovatespace-content-lead-336', 1200, 1800, 'full-time', 'middle', 'Define content direction for all new product lines.', 'Excellent writing skills, experience managing content teams.', 'Company team building at 5-star resorts twice a year.', 'approved'),
(337, 208, 200, 4, 3, 'Creative Concept Intern', 'innovatespace-concept-intern-337', 250, 400, 'part-time', 'intern', 'Support brainstorming visual concepts and creative marketing scripts.', 'Students from Fine Arts, Architecture, or Multimedia universities.', 'Lunch and free parking allowance.', 'approved'),
(338, 208, 200, 6, 2, 'Strategy & Planning Executive', 'innovatespace-strategy-exec-338', 1000, 1600, 'full-time', 'junior', 'Conduct market research and propose long-term strategic directions.', 'Graduated with honors from Foreign Trade University, Economics, or RMIT.', 'Fast-track promotion path to Manager.', 'approved'),
(339, 208, 200, 4, 2, 'Interaction Designer', 'innovatespace-interaction-339', 1100, 1750, 'full-time', 'middle', 'Create smooth transitions and interactive motion animations for the app.', 'Proficient in ProtoPie, After Effects, or Principle.', 'Flexible working hours, casual dress code.', 'approved'),
(340, 208, 200, 2, 1, 'Brand Manager', 'innovatespace-brand-mgr-340', 1600, 2500, 'full-time', 'senior', 'Manage brand equity and corporate public image for InnovateSpace.', '4+ years of equivalent experience at large corporations.', 'Business phone and call expense allowance.', 'approved'),
(341, 208, 200, 6, 2, 'Customer Experience Specialist', 'innovatespace-cx-spec-341', 700, 1100, 'full-time', 'junior', 'Optimize customer journeys and handle customer complaints.', 'Top-tier listening and communication skills, empathetic voice.', 'Monthly service KPI bonuses.', 'approved'),
(342, 208, 200, 4, 4, 'Freelance Graphic Designer', 'innovatespace-graphic-freelance-342', 600, 1200, 'freelance', 'middle', 'Design media assets for upcoming launch events.', 'Proficient with Photoshop, Illustrator, meet deadlines strictly.', '100% remote work from home.', 'approved'),
(343, 208, 200, 6, 5, 'Junior Business Analyst', 'innovatespace-ba-junior-343', 600, 950, 'full-time', 'fresher', 'Support main BAs in documentation and working with stakeholders.', 'Solid understanding of basic Agile software development lifecycle.', 'Assigned 1-1 Mentor support.', 'approved'),
(344, 208, 200, 2, 2, 'Digital Marketing Executive', 'innovatespace-digital-mkt-344', 800, 1300, 'full-time', 'junior', 'Implement multi-channel advertising campaigns (Facebook, Google, TikTok).', 'Minimum 1 year of ad budget optimization experience.', 'Unlimited testing budget for new campaigns.', 'approved'),
(345, 208, 200, 4, 1, 'Design Team Lead', 'innovatespace-design-lead-345', 2000, 3000, 'full-time', 'senior', 'Manage performance and guide design aesthetic for the team.', 'Strong team management skills, modern and sophisticated aesthetic sense.', 'Luxury health check-up package.', 'approved'),
(346, 208, 200, 6, 2, 'Data Analyst (Product Metrics)', 'innovatespace-product-da-346', 1100, 1800, 'full-time', 'middle', 'Analyze usage metrics to discover feature bottlenecks.', 'Proficient in Mixpanel, Amplitude, SQL.', 'Free afternoon snacks at the company buffet counter.', 'approved'),
(347, 208, 200, 5, 2, 'HR Generalist Manager', 'innovatespace-hr-generalist-347', 1400, 2200, 'full-time', 'senior', 'Comprehensive management of HR, compensation & benefits (C&B), and culture.', 'Solid grasp of labor laws, experience handling labor relations.', '13th-month salary and annual KPI bonus.', 'approved'),
(348, 208, 200, 2, 1, 'Copywriter (Creative Content)', 'innovatespace-copywriter-348', 700, 1100, 'full-time', 'junior', 'Create slogans and scripts for viral short videos on social networks.', 'Witty and trendy writing mindset.', 'Spot bonuses for highly viral articles or videos.', 'approved'),
(349, 208, 200, 6, 3, 'Partnership Development Executive', 'innovatespace-partnership-349', 900, 1500, 'full-time', 'middle', 'Identify and negotiate strategic partnerships with corporate clients.', 'Excellent communication skills, neat appearance, professional manner.', 'Entertainment and cafe expenses covered for negotiations.', 'approved'),
(350, 208, 200, 4, 2, '3D Motion Designer', 'innovatespace-3d-motion-350', 1400, 2200, 'full-time', 'middle', 'Model and animate 3D assets for promotional videos of tech solutions.', 'Proficient in Blender or Cinema 4D.', 'Workspace equipped with high-end ergonomic chairs.', 'approved'),
(351, 208, 200, 6, 1, 'Agile Project Manager', 'innovatespace-agile-pm-351', 1600, 2600, 'full-time', 'senior', 'Responsible for delivering products on schedule as committed.', 'PMP certification is a huge plus, experience in large-scale projects.', 'Fixed Saturdays and Sundays off.', 'approved'),
(352, 208, 200, 2, 2, 'SEO Specialist', 'innovatespace-seo-spec-352', 800, 1200, 'full-time', 'junior', 'Optimize keyword rankings for product pages on search engines.', 'Clear understanding of Google algorithms, skilled in On-page/Off-page SEO.', 'Licensed enterprise accounts for tools like Ahrefs, Semrush provided.', 'approved'),
(353, 208, 200, 4, 2, 'Packaging Designer', 'innovatespace-packaging-353', 900, 1400, 'contract', 'middle', 'Design packaging and gift boxes for limited edition tech products.', 'Experience in print design, deep understanding of paper materials and ink.', 'Guaranteed income with bonuses based on actual product items.', 'approved'),
(354, 208, 200, 6, 2, 'Product Marketing Manager', 'innovatespace-pmm-354', 1800, 2700, 'full-time', 'senior', 'Position products in the market and execute successful Go-To-Market campaigns.', 'Managed successful product launches in the Tech sector.', 'Stock options based on tenure.', 'approved'),
(355, 208, 200, 2, 4, 'Social Media Coordinator', 'innovatespace-social-media-355', 600, 900, 'full-time', 'fresher', 'Manage and engage with communities on Fanpages, Groups, LinkedIn.', 'Dynamic, quick-witted, frequently active on social media.', 'Participate in advanced marketing skill training courses.', 'approved'),
(356, 208, 200, 5, 2, 'Internal Communications Executive', 'innovatespace-internal-comm-356', 750, 1200, 'full-time', 'junior', 'Organize internal events to engage employees and promote company culture.', 'Good MC skills, enthusiastic entertainer, beautiful slide design.', 'Annual personal wellness fund (gym, books, learning).', 'approved'),
(357, 208, 200, 4, 1, 'UI/UX Design Intern', 'innovatespace-design-intern-357', 200, 350, 'part-time', 'intern', 'Basic foundation knowledge of Figma, eager to learn.', 'Basic foundation knowledge of Figma, eager to learn.', 'Opportunity to tackle real-world product design problems at scale.', 'approved'),
(358, 208, 200, 6, 2, 'Chief Product Officer (CPO)', 'innovatespace-cpo-358', 5000, 8000, 'full-time', 'senior', 'Lead the entire product division, shaping the digital future.', '10+ years of experience, strategic mindset at multinational scales.', 'Company profit-sharing + private chauffeur service.', 'approved'),
(359, 208, 200, 2, 2, 'Public Relations (PR) Specialist', 'innovatespace-pr-spec-359', 1100, 1700, 'full-time', 'middle', 'Build relationships with press and handle media crisis management.', 'Existing connections with editors at major tech publications.', 'Entertainment and relationship building budget sponsored.', 'approved');

-- ==========================================================
-- COMPANY 209: CreativePulse (Top-tier Design & UX Agency)
-- Job IDs: 360 - 389
-- ==========================================================
INSERT IGNORE INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(360, 209, 200, 4, 3, 'Art Director', 'creativepulse-art-director-360', 2500, 4000, 'full-time', 'senior', 'Direct visual art for advertising campaigns of big brands.', 'Industry design awards or excellent Agency portfolio required.', 'Top market compensation, respect for individual personality.', 'approved'),
(361, 209, 200, 4, 3, 'Senior Motion Graphic Artist', 'creativepulse-motion-361', 1300, 2000, 'full-time', 'senior', 'Produce complex animated motion graphics for advertisements.', 'Proficient in After Effects, Premiere, Illustrator.', 'Equipped with top-spec iMac.', 'approved'),
(362, 209, 200, 4, 1, 'Graphic Designer (Branding)', 'creativepulse-branding-362', 800, 1300, 'full-time', 'junior', 'Design brand identity sets (Logo, Typography, Brand Guideline).', 'Good concept thinking, deep understanding of color theory.', 'Performance-based salary reviews every 6 months.', 'approved'),
(363, 209, 200, 4, 2, 'Senior UI/UX Consultant', 'creativepulse-ux-consultant-363', 1800, 2800, 'full-time', 'senior', 'Consult on digital experience improvements for banking and finance apps.', 'Led UI/UX projects for millions of users.', 'Flexible hours, focus on efficiency.', 'approved'),
(364, 209, 200, 2, 3, 'Creative Copywriter', 'creativepulse-copy-364', 750, 1200, 'full-time', 'junior', 'Brainstorm unique copy ideas and scripts that go viral.', 'Passionate about words, multi-dimensional life perspective.', 'Annual premium company vacation trips.', 'approved'),
(365, 209, 200, 4, 3, 'Illustrator / Concept Artist', 'creativepulse-illustrator-365', 900, 1500, 'full-time', 'middle', 'Draw manual and digital illustrations for books and digital publications.', 'Excellent hand-drawing skills, proficient with Wacom tablets.', 'Artistic and inspiring work environment.', 'approved'),
(366, 209, 200, 6, 2, 'Account Executive (Agency)', 'creativepulse-account-exec-366', 600, 1000, 'full-time', 'fresher', 'Work directly with clients, convey requirements to design teams.', 'Skilled communication, handle deadline pressures well.', 'Lucrative project commission structure.', 'approved'),
(367, 209, 200, 4, 3, 'Web Designer (Webflow/Figma)', 'creativepulse-web-designer-367', 950, 1500, 'full-time', 'middle', 'Design and directly implement smooth landing pages using Webflow.', 'Clear understanding of responsive layouts and web animations.', 'Financial support for design tool licenses.', 'approved'),
(368, 209, 200, 4, 1, 'Multimedia Design Intern', 'creativepulse-multimedia-368', 200, 350, 'part-time', 'intern', 'Support video cutting, basic photo editing for small projects.', 'Basic usage of Adobe Creative Cloud suite.', 'Internship certificate from a reputable Agency.', 'approved'),
(369, 209, 200, 6, 3, 'Account Manager', 'creativepulse-account-mgr-369', 1400, 2200, 'full-time', 'senior', 'Manage the Account team, maintain and bring sustainable revenue from clients.', '3+ years of account management experience at large agencies.', 'Comprehensive VIP health insurance package.', 'approved'),
(370, 209, 200, 4, 2, 'Video Editor / Videographer', 'creativepulse-video-editor-370', 850, 1400, 'full-time', 'middle', 'Shoot and edit post-production for short corporate promotional videos.', 'Proficient with cameras, skilled in Premiere/DaVinci Resolve.', 'Personal equipment depreciation allowance.', 'approved'),
(371, 209, 200, 4, 3, 'Storyboard Artist', 'creativepulse-storyboard-371', 800, 1300, 'contract', 'middle', 'Sketch script scenes before shooting short promotional videos.', 'Fast sketching skills, understanding of cinematic angles.', 'Paid per frame/scene block.', 'approved'),
(372, 209, 200, 2, 3, 'Social Media Designer', 'creativepulse-social-design-372', 650, 950, 'full-time', 'junior', 'Specialize in designing daily visual content for Facebook, Instagram, LinkedIn.', 'Fast trend adoption, modern youthful style.', 'Canva Pro and stock asset accounts provided.', 'approved'),
(373, 209, 200, 4, 1, 'Font Designer (Typographer)', 'creativepulse-typography-373', 1100, 1800, 'contract', 'middle', 'Create and localize exclusive font sets for branding projects.', 'Passionate about type anatomy, proficient in Glyphs or FontLab.', 'Freelance work, lump-sum project compensation.', 'approved'),
(374, 209, 200, 4, 3, 'Junior UI Designer', 'creativepulse-ui-junior-374', 600, 900, 'full-time', 'fresher', 'Design application screens based on wireframes under Senior supervision.', 'Solid grasp of UI principles (Grid, Spacing, Color).', 'Participate in internal knowledge-sharing workshops.', 'approved'),
(375, 209, 200, 6, 2, 'Creative Pitch Specialist', 'creativepulse-pitch-spec-375', 1500, 2500, 'full-time', 'senior', 'Specialize in pitching ideas to win major enterprise projects.', 'Inspirational presentation skills, fluent English.', 'Commissions based on a percentage of won contract values.', 'approved'),
(376, 209, 200, 4, 3, 'Photoshop Retoucher', 'creativepulse-retoucher-376', 700, 1100, 'full-time', 'junior', 'Edit post-production product and model images to perfection.', 'Exceptional skin, lighting, and shading retouching skills in Photoshop.', 'Professional studio environment with 24/7 air conditioning.', 'approved'),
(377, 209, 200, 4, 5, 'UI/UX Design Mentor', 'creativepulse-design-mentor-377', 1200, 1800, 'part-time', 'senior', 'Teach and lead internal or partner training courses for the agency.', 'Good pedagogical skills, extensive real-world experience.', 'Compensation based on teaching hours.', 'approved'),
(378, 209, 200, 4, 3, 'Creative Producer', 'creativepulse-producer-378', 1300, 2000, 'full-time', 'middle', 'Supervise production workflow from concept to final creative output.', 'Excellent planning and subcontractor management skills.', 'Company phone and fuel costs covered.', 'approved'),
(379, 209, 200, 4, 1, 'Presentation Designer', 'creativepulse-presentation-379', 750, 1150, 'full-time', 'junior', 'Specialize in designing high-class PowerPoint/Keynote slides for executives.', 'Proficient in slide tools, strong infographic layout mindset.', 'Tea and pastries served throughout the day.', 'approved'),
(380, 209, 200, 4, 2, 'Freelance UI/UX Tester', 'creativepulse-ux-tester-380', 500, 900, 'freelance', 'junior', 'Perform digital product user testing to discover workflow friction points.', 'Objective viewpoint, careful recording of experience logs.', 'Compensation paid after each audit report submission.', 'approved'),
(381, 209, 200, 4, 3, 'Game UI Designer', 'creativepulse-game-ui-381', 1100, 1700, 'full-time', 'middle', 'Design interfaces, control panels, and buttons for mobile games.', 'Rich aesthetic sense, understanding styles from fantasy to sci-fi.', 'Year-end bonus based on game revenue.', 'approved'),
(382, 209, 200, 2, 1, 'Digital Planner', 'creativepulse-digital-planner-382', 1000, 1600, 'full-time', 'middle', 'Plan and optimize digital ad budget allocations for clients.', 'Proficient with social listening market report data.', 'Stable 13th-month salary.', 'approved'),
(383, 209, 200, 4, 3, 'Exhibition Booth Designer', 'creativepulse-booth-design-383', 1200, 1900, 'full-time', 'middle', 'Design 3D spaces for exhibition booths and launch events.', 'Proficient in 3ds Max, SketchUp, or AutoCAD.', 'Allowances for on-site construction supervision.', 'approved'),
(384, 209, 200, 4, 4, 'Junior Motion Designer', 'creativepulse-motion-jr-384', 650, 950, 'full-time', 'fresher', 'Support animating basic intro/outro logos and graphic motion.', 'Solid grasp of the 12 basic animation principles.', 'Dedicated mentorship from Seniors.', 'approved'),
(385, 209, 200, 5, 3, 'Happiness Officer (Admin/HR)', 'creativepulse-happiness-385', 600, 900, 'full-time', 'junior', 'Take care of office life, organize birthdays, purchase snacks.', 'Cheerful, active, deeply caring about people around.', 'Discretionary budget for office utilities.', 'approved'),
(386, 209, 200, 4, 2, 'E-commerce Banner Designer', 'creativepulse-banner-ecommerce-386', 550, 850, 'full-time', 'fresher', 'Design bulk banner ads for Shopee and Lazada campaigns.', 'Fast turnaround speed, high intensity work during peak seasons.', 'Additional bonuses for volume of approved banners.', 'approved'),
(387, 209, 200, 4, 3, 'Senior UX Writer', 'creativepulse-ux-writer-387', 1400, 2200, 'full-time', 'senior', 'Shape microcopy for buttons, prompts, and notifications on apps.', 'Proficient in concise, user-centric microcopy writing.', 'Fully remote work with absolute freedom.', 'approved'),
(388, 209, 200, 4, 3, 'Design Project Coordinator', 'creativepulse-coordinator-388', 850, 1350, 'full-time', 'junior', 'Schedule meetings, track project progress between design and dev teams.', 'Proficient in Trello/Asana, precise time management.', 'Full statutory insurance benefits.', 'approved'),
(389, 209, 200, 4, 1, 'Visual Merchandiser', 'creativepulse-visual-merch-389', 1000, 1600, 'full-time', 'middle', 'Design and arrange product presentation art in physical retail stores.', 'Excellent spatial arrangement mindset, understanding shopping behaviors.', 'Full travel expense coverage for inter-provincial trips.', 'approved');

-- ==========================================================
-- COMPANY 210: MetricsCorp 2 (Advanced Data Analytics & Finance)
-- Job IDs: 390 - 419
-- ==========================================================
INSERT IGNORE INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(390, 210, 201, 3, 4, 'Chief Financial Officer (CFO)', 'metricscorp-cfo-390', 4000, 6500, 'full-time', 'senior', 'Formulate comprehensive financial strategies and manage large-scale investment cash flows.', '10+ years of corporate financial management, CFA/CPA certified.', 'Chauffeur service, attractive stock profit-sharing packages.', 'approved'),
(391, 210, 201, 3, 4, 'Senior Data Analyst', 'metricscorp-sr-da-391', 1400, 2200, 'full-time', 'senior', 'Process large datasets, build automated management dashboards for executives.', 'Advanced proficiency in SQL, PowerBI, Python.', 'High-spec workstation provided, international health insurance.', 'approved'),
(392, 210, 201, 3, 1, 'General Accountant', 'metricscorp-accountant-392', 800, 1200, 'full-time', 'middle', 'Perform tax reporting and periodic financial book balancing.', 'Solid grasp of tax laws, proficient in accounting software like MISA.', 'Fixed annual performance-based salary review.', 'approved'),
(393, 210, 201, 3, 2, 'Financial Risk Analyst', 'metricscorp-risk-analyst-393', 1200, 1900, 'full-time', 'middle', 'Assess credit and market risk based on quantitative models.', 'Graduated in Finance or Quantitative Economics, excellent data processing.', '5-star resort company trips, professional working environment.', 'approved'),
(394, 210, 201, 6, 4, 'Business Intelligence (BI) Developer', 'metricscorp-bi-dev-394', 1100, 1750, 'full-time', 'middle', 'Design data warehouse architectures for corporate BI reporting.', 'Experience with Tableau, SQL Server, SSIS.', 'Flexible hybrid work model.', 'approved'),
(395, 210, 201, 3, 4, 'Internal Auditor', 'metricscorp-auditor-395', 900, 1400, 'full-time', 'junior', 'Audit internal financial workflows and accounting vouchers across departments.', 'Honest, prudent, minimum 1 year of auditing experience.', 'Complimentary tea, coffee, and snacks at the pantry.', 'approved'),
(396, 210, 201, 3, 1, 'Tax Consultant Expert', 'metricscorp-tax-expert-396', 1500, 2300, 'full-time', 'senior', 'Advise partners on legal tax optimization strategies.', 'Certified tax agent practicing license.', 'Business phone and parking allowance.', 'approved'),
(397, 210, 201, 3, 4, 'Data Analytics Intern', 'metricscorp-da-intern-397', 250, 400, 'part-time', 'intern', 'Support data cleaning and system data entry workflows.', 'Final-year student in MIS or Statistics.', 'Full-time employment opportunity after internship.', 'approved'),
(398, 210, 201, 3, 2, 'Cost Accountant Specialist', 'metricscorp-cost-accountant-398', 850, 1300, 'full-time', 'junior', 'Calculate product costs and monitor warehouse operational expenses.', 'Understanding of manufacturing or logistics cost accounting.', 'Subsidized lunch at the company cafeteria.', 'approved'),
(399, 210, 201, 6, 4, 'Market Research Analyst', 'metricscorp-market-research-399', 950, 1500, 'full-time', 'middle', 'Survey national digitization trends to provide insights for Product teams.', 'Proficient in using SPSS or R analysis tools.', 'Multicultural, youthful working environment.', 'approved'),
(400, 210, 201, 3, 1, 'Senior Financial Planner', 'metricscorp-fin-planner-400', 1600, 2400, 'full-time', 'senior', 'Plan budgets and forecast long-term business cash flows.', 'Outstanding financial modeling skills on Excel.', '13th-month salary and annual business KPI bonuses.', 'approved'),
(401, 210, 201, 3, 4, 'Treasury Executive', 'metricscorp-treasury-401', 750, 1100, 'full-time', 'junior', 'Track bank balances and execute disbursement payment orders.', 'Agile, absolutely careful, handles high-pressure funds.', 'VIP standard periodic health check-ups.', 'approved'),
(402, 210, 201, 3, 3, 'Remote Data Cleanser', 'metricscorp-data-clean-remote-402', 400, 700, 'contract', 'fresher', 'Label data and audit spelling errors across system records.', 'Personal computer with stable internet connection, meticulous.', '100% remote work, paid by productivity.', 'approved'),
(403, 210, 201, 3, 4, 'Billing & Collections Specialist', 'metricscorp-billing-403', 600, 950, 'full-time', 'junior', 'Issue electronic invoices and urge partners to pay outstanding debts on time.', 'Good phone communication, skilled in debt management.', 'Commission percentages on successful debt recovery.', 'approved'),
(404, 210, 201, 3, 2, 'Quantitative Investment Analyst', 'metricscorp-quant-404', 2000, 3200, 'full-time', 'senior', 'Build algorithmic trading strategies based on historical price data.', 'Excellent background in Financial Mathematics, proficient in Python/C++.', 'Substantial investment performance bonuses at year-end.', 'approved'),
(405, 210, 201, 3, 4, 'Accounts Payable Clerk', 'metricscorp-ap-clerk-405', 550, 800, 'full-time', 'fresher', 'Verify incoming vendor invoices to prepare for payouts.', 'Graduated in economics or accounting fields.', 'Detailed training on international standard accounting processes.', 'approved'),
(406, 210, 201, 6, 1, 'Data Governance Officer', 'metricscorp-data-gov-406', 1300, 2000, 'full-time', 'middle', 'Establish security and privacy standards for internal data information.', 'Understanding of data protection laws and data catalog architecture.', 'Premium dental and healthcare packages.', 'approved'),
(407, 210, 201, 3, 4, 'Accounting Assistant (Part-time)', 'metricscorp-accounting-pt-407', 300, 500, 'part-time', 'junior', 'Support sorting, filing, and scanning confidential paper invoices.', 'Careful, strong data confidentiality skills, available in afternoons.', 'Full mid-shift meal allowance.', 'approved'),
(408, 210, 201, 3, 2, 'Senior Credit Controller', 'metricscorp-credit-ctrl-408', 1100, 1700, 'full-time', 'middle', 'Evaluate credit limits for loans or accounts receivable of large corporate clients.', '3 years of experience in banking or corporate finance.', '15 days of paid annual leave.', 'approved'),
(409, 210, 201, 3, 4, 'Payroll Specialist (C&B)', 'metricscorp-payroll-409', 850, 1300, 'full-time', 'middle', 'Responsible for accurate payroll calculation and social insurance for 500+ employees.', 'Proficient in Excel processing, strong grasp of insurance laws.', 'Bonuses on major public holidays.', 'approved'),
(410, 210, 201, 3, 5, 'Junior Data Analyst', 'metricscorp-da-junior-410', 600, 900, 'full-time', 'junior', 'Extract raw data via SQL and build charts for departments.', 'Strong grasp of SQL (Join, Subquery, Aggregate functions).', 'Company-sponsored sports clubs.', 'approved'),
(411, 210, 201, 3, 4, 'Investor Relations Director', 'metricscorp-ir-director-411', 3000, 4800, 'full-time', 'senior', 'Connect the enterprise with international venture funds and shareholders.', 'Native-level English fluency, outstanding diplomacy skills.', 'ESOP options, premium private office suite.', 'approved'),
(412, 210, 201, 3, 1, 'Asset Management Executive', 'metricscorp-asset-exec-412', 1000, 1550, 'full-time', 'middle', 'Manage fixed assets and hardware equipment depreciation schedules.', 'Experience in corporate asset auditing and inventory control.', 'Support for purchasing personal work laptops.', 'approved'),
(413, 210, 201, 3, 4, 'Fraud Analyst Specialist', 'metricscorp-fraud-spec-413', 1200, 1850, 'full-time', 'middle', 'Detect anomalous transactions, card fraud, or money laundering on systems.', 'Detective mindset, sharp at spotting patterns from data logs.', 'Flexible shift allowances.', 'approved'),
(414, 210, 201, 3, 2, 'M&A Analyst', 'metricscorp-ma-analyst-414', 1800, 2700, 'full-time', 'senior', 'Perform valuation analysis for corporate mergers and acquisitions.', 'Background in Big4 accounting or major investment funds.', 'Overseas travel package with executive management board.', 'approved'),
(415, 210, 201, 3, 4, 'Excel Expert Consultant', 'metricscorp-excel-expert-415', 500, 1000, 'freelance', 'middle', 'Optimize and fix heavy, slow-running VBA macro reporting spreadsheets.', 'Fluent in advanced VBA and Power Query on Excel.', 'Paid based on spreadsheet optimization completion.', 'approved'),
(416, 210, 201, 3, 3, 'Junior Internal Auditor', 'metricscorp-junior-auditor-416', 650, 950, 'full-time', 'junior', 'Support field visits for periodic inventory audits at regional branches.', 'Willing to travel, honest, and straightforward.', 'All accommodation and travel expenses fully covered.', 'approved'),
(417, 210, 201, 3, 4, 'Financial Modeling Intern', 'metricscorp-modeling-intern-417', 250, 350, 'part-time', 'intern', 'Support updating historical figures into corporate valuation models.', 'Excellent finance student, strong understanding of financial statements.', 'Internship stamp and high-quality mentorship.', 'approved'),
(418, 210, 201, 3, 1, 'Chief Accountant', 'metricscorp-chief-accountant-418', 2200, 3500, 'full-time', 'senior', 'Hold highest legal responsibility for the accounting books under the law.', 'Valid Chief Accountant certificate, 5+ years of manager experience.', '13th-month bonus + percentage of business revenue profits.', 'approved'),
(419, 210, 201, 3, 4, 'Data Analytics Team Lead', 'metricscorp-da-lead-419', 2000, 3000, 'full-time', 'senior', 'Lead data engineering team to optimize operational cost issues.', 'People management skills, deep understanding of Big Data architectures.', 'VIP health package for self and family.', 'approved');

-- ==========================================================
-- COMPANY 211: CloudSystems (Infrastructure & Core Networks)
-- Job IDs: 420 - 449
-- ==========================================================
INSERT IGNORE INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(420, 211, 200, 1, 5, 'Cloud Infrastructure Architect', 'cloudsystems-infra-arch-420', 2800, 4500, 'full-time', 'senior', 'Design secure, multi-region distributed cloud infrastructure.', 'AWS Certified Solutions Architect Professional or CKA.', 'System performance bonuses, remote work support.', 'approved'),
(421, 211, 200, 1, 5, 'Linux System Administrator', 'cloudsystems-linux-admin-421', 1000, 1600, 'full-time', 'middle', 'Install and optimize performance for Linux server clusters hosting large databases.', 'Experience managing RHEL/Rocky Linux, strong automation scripting.', 'High-spec PC at the regional branch office.', 'approved'),
(422, 211, 200, 1, 1, 'Site Reliability Engineer (SRE)', 'cloudsystems-sre-senior-422', 2000, 3300, 'full-time', 'senior', 'Ensure 99.99% system uptime, automate network troubleshooting.', 'Strong programming background combined with top-tier sysadmin mindset.', 'Salary reviews twice a year, On-call spot bonuses.', 'approved'),
(423, 211, 200, 1, 2, 'Database Administrator (DBA)', 'cloudsystems-dba-423', 1300, 2100, 'full-time', 'middle', 'Administer and optimize large-scale PostgreSQL and MySQL clusters.', 'Experience with database sharding, master-slave backup configuration.', 'International standard health screening packages.', 'approved'),
(424, 211, 200, 1, 5, 'Network Engineer (CCNP)', 'cloudsystems-network-eng-424', 900, 1500, 'full-time', 'junior', 'Operate routing and switching hardware architectures from Cisco, Juniper.', 'CCNP certification, deep understanding of BGP and OSPF protocols.', 'Night shift allowances and food expense coverage.', 'approved'),
(425, 211, 200, 1, 5, 'Cyber Security Incident Responder', 'cloudsystems-incident-425', 1500, 2400, 'full-time', 'middle', 'Mitigate and stop active DDoS attacks or data ransomware incidents.', 'Minimum 2 years of real-world incident response experience.', 'Youthful, flat, and creative working environment.', 'approved'),
(426, 211, 200, 1, 1, 'Kubernetes Administrator', 'cloudsystems-k8s-spec-426', 1600, 2500, 'full-time', 'middle', 'Manage container orchestration at scale across thousands of pods.', 'Proficient in Kubernetes, Helm Chart, Service Mesh (Istio).', '14 days of paid annual leave.', 'approved'),
(427, 211, 200, 1, 5, 'IT Infrastructure Intern', 'cloudsystems-infra-intern-427', 200, 350, 'part-time', 'intern', 'Support racking physical servers and patching network cables.', 'Students in Computer Networking / Telecommunications, enthusiastic.', 'Hands-on learning of production Datacenter infrastructure.', 'approved'),
(428, 211, 200, 1, 2, 'Virtualization Engineer (VMware)', 'cloudsystems-vmware-428', 1200, 1900, 'full-time', 'middle', 'Administer virtualized infrastructure using VMware vSphere solutions.', 'Experience with ESXi, vCenter, SAN Storage configuration.', 'Complimentary snacks and coffee at the pantry.', 'approved'),
(429, 211, 200, 1, 5, 'Storage Engineer (SAN/NAS)', 'cloudsystems-storage-eng-429', 1400, 2200, 'full-time', 'middle', 'Manage volume storage allocations for corporate clients.', 'Deep understanding of NetApp and Dell EMC storage systems.', 'Annual company vacation trips.', 'approved'),
(430, 211, 200, 1, 1, 'Windows Server Administrator', 'cloudsystems-windows-admin-430', 800, 1300, 'full-time', 'junior', 'Administer Active Directory systems and internal user permissions.', 'Proficient in Windows Server, PowerShell Scripting.', 'Full health insurance from day one.', 'approved'),
(431, 211, 200, 1, 5, 'Helpdesk Engineer Tier 2', 'cloudsystems-helpdesk-t2-431', 600, 950, 'full-time', 'fresher', 'Troubleshoot complex system software issues escalated by clients.', 'Good problem-solving skills, active listener.', 'Clear promotion path to Sysadmin.', 'approved'),
(432, 211, 200, 1, 5, 'Freelance Cloud Migration Specialist', 'cloudsystems-migration-freelance-432', 1500, 3000, 'freelance', 'senior', 'Execute data and system migrations from legacy setups to cloud platforms.', 'Proven experience in successfully delivering complex large-scale migrations.', 'Lump-sum project compensation based on delivery.', 'approved'),
(433, 211, 200, 1, 3, 'Data Center Operations Executive', 'cloudsystems-dc-ops-433', 700, 1100, 'full-time', 'junior', 'Monitor temperature and power supply metrics for servers at the Datacenter.', 'Willing to work shifts (including holidays), meticulous.', 'Excellent night shift allowances.', 'approved'),
(434, 211, 200, 1, 5, 'DevSecOps Engineer', 'cloudsystems-devsecops-434', 1800, 2800, 'full-time', 'senior', 'Integrate automated security scanning tools (SAST/DAST) into CI/CD pipelines.', 'Understanding of code vulnerabilities, proficient in SonarQube.', 'Premium Macbook Pro with external monitor.', 'approved'),
(435, 211, 200, 1, 2, 'Senior C++ Systems Developer', 'cloudsystems-cpp-system-435', 2000, 3500, 'full-time', 'senior', 'Write optimized core driver code for hardware network connections.', 'Deep knowledge of memory management, high-performance multithreading.', 'Social insurance paid on full salary base, big Tet bonus.', 'approved'),
(436, 211, 200, 1, 5, 'Network Infrastructure Fresher', 'cloudsystems-network-fresher-436', 450, 700, 'full-time', 'fresher', 'Assist in monitoring network alert systems via Zabbix/Grafana.', 'Basic CCNA knowledge, basic Linux commands.', '100% sponsored fees for international exams.', 'approved'),
(437, 211, 200, 1, 1, 'Enterprise Cloud Sales Manager', 'cloudsystems-cloud-sales-437', 1500, 2500, 'full-time', 'senior', 'Identify and close infrastructure solution contracts with large enterprises.', 'Top-tier B2B negotiation skills within the Tech sector.', 'Uncapped percentage commission structures.', 'approved'),
(438, 211, 200, 1, 5, 'Information Security Auditor', 'cloudsystems-infosec-audit-438', 1300, 2100, 'full-time', 'middle', 'Audit compliance workflows against international security standards (ISO 27001).', 'CISA certificate or experience in information security auditing.', 'VIP dental and family health packages.', 'approved'),
(439, 211, 200, 1, 5, 'Technical Support Intern (English)', 'cloudsystems-techsupport-intern-439', 250, 400, 'part-time', 'intern', 'Support answering technical queries from international clients over email.', 'Good written and spoken English, logical IT mindset.', 'Practice English reflexes in a real environment.', 'approved'),
(440, 211, 200, 1, 2, 'IAM Specialist (Identity Management)', 'cloudsystems-iam-spec-440', 1600, 2400, 'full-time', 'middle', 'Configure centralized identity management using Okta/Keycloak.', 'Experience implementing OAuth2, OIDC, SAML protocols.', '5 working days a week, Sat-Sun off.', 'approved'),
(441, 211, 200, 1, 5, 'OpenStack Cloud Engineer', 'cloudsystems-openstack-441', 1400, 2200, 'full-time', 'middle', 'Operate private cloud infrastructure based on OpenStack open-source solutions.', 'Experience with KVM, Ceph Storage, Open vSwitch.', 'Parking and lunch subsidies.', 'approved'),
(442, 211, 200, 1, 1, 'Backup & Disaster Recovery Specialist', 'cloudsystems-dr-spec-442', 1200, 1850, 'full-time', 'middle', 'Build and execute disaster recovery drill scenarios for critical systems.', 'Proficient in Veeam Backup, cross-province replication setup.', 'Annual VIP health check-ups at major hospitals.', 'approved'),
(443, 211, 200, 1, 5, 'Automation Scripting Engineer', 'cloudsystems-script-eng-443', 950, 1500, 'full-time', 'junior', 'Write automation tools for repetitive tasks of operations engineers.', 'Proficient in Python or Go, strong automation mindset.', 'Open workspace, absolute freedom to innovate.', 'approved'),
(444, 211, 200, 1, 4, 'Hardware Tester (Server/Switch)', 'cloudsystems-hardware-test-444', 600, 950, 'contract', 'junior', 'Inspect quality of imported server RAM modules and storage drives.', 'Careful, knowledge of computer hardware architecture.', 'Competitive pay based on testing volume.', 'approved'),
(445, 211, 200, 1, 5, 'Chief Technology Officer (CTO)', 'cloudsystems-cto-445', 4500, 7500, 'full-time', 'senior', 'Define core technological directions for the entire CloudSystems enterprise.', '10+ years of technical leadership, visionary macro-level outlook.', 'Company shares, private car, and premium perks.', 'approved'),
(446, 211, 200, 1, 5, 'IT Asset & License Administrator', 'cloudsystems-license-admin-446', 700, 1100, 'full-time', 'junior', 'Manage quantity and expiry terms of distributed software licenses.', 'Careful personality, strong tracking sheets management on Excel.', 'Year-end bonus based on performance fulfillment.', 'approved'),
(447, 211, 200, 1, 2, 'Kubernetes Intern', 'cloudsystems-k8s-intern-447', 200, 300, 'part-time', 'intern', 'Support deploying sample testing apps onto lab K8s clusters under guidance.', 'Basic knowledge of Docker and Linux commands.', 'Guided by leading SRE experts.', 'approved'),
(448, 211, 200, 1, 5, 'Senior Solution Presales Engineer', 'cloudsystems-presales-448', 1700, 2600, 'full-time', 'senior', 'Accompany sales team to survey client environments and architect matching solutions.', 'Excellent technical solution presentation skills, deep infrastructure knowledge.', 'Project bonuses based on successful bids.', 'approved'),
(449, 211, 200, 1, 1, 'Technical Cloud Trainer', 'cloudsystems-cloud-trainer-449', 1100, 1700, 'full-time', 'middle', 'Compile curricula and directly teach internal cloud certification courses.', 'Strong pedagogical communication, certified in system specialties.', 'Early access to the latest technology updates.', 'approved');

-- ==========================================================
-- COMPANY 212: GrowthHackers 2 (Global Digital Marketing & Sales)
-- Job IDs: 450 - 479
-- ==========================================================
INSERT IGNORE INTO Jobs (id, company_id, posted_by, category_id, location_id, title, slug, salary_min, salary_max, job_type, experience_level, description, requirements, benefit, status) VALUES
(450, 212, 200, 2, 5, 'Performance Marketing Director', 'growthhackers-perf-dir-450', 2500, 4200, 'full-time', 'senior', 'Lead the team to optimize multi-channel ad spend to deliver highest ROI.', '5+ years managing large ad budgets in the E-commerce sector.', 'Substantial year-end performance package, full salary insurance base.', 'approved'),
(451, 212, 200, 2, 5, 'Facebook Ads Specialist', 'growthhackers-fb-ads-451', 800, 1400, 'full-time', 'middle', 'Directly set up campaigns, optimize bids, closely track order conversions.', '2 years of practical experience navigating ad policy shifts without downtime.', 'Direct percentage commission on generated sales.', 'approved'),
(452, 212, 200, 2, 1, 'Google Search/Display Ads Specialist', 'growthhackers-gg-ads-452', 850, 1350, 'full-time', 'middle', 'Plan Google Ads keyword sets, optimize landing page quality scores.', 'Proficient in Google Analytics, Tag Manager, conversion optimization.', 'Dedicated work computer provided.', 'approved'),
(453, 212, 200, 2, 2, 'TikTok Ads Creator & Lead', 'growthhackers-tiktok-lead-453', 1000, 1600, 'full-time', 'middle', 'Direct short video production and run ad distributions on TikTok.', 'Deep understanding of TikTok trending algorithms, endlessly creative.', 'Monthly team gathering and party budget.', 'approved'),
(454, 212, 200, 6, 5, 'B2B Sales Manager', 'growthhackers-b2b-sales-454', 1200, 2000, 'full-time', 'senior', 'Manage and motivate agency sales teams to expand corporate market reach.', 'Top-tier sales negotiation skills, highly professional appearance.', 'Private car bonus for exceeding annual targets.', 'approved'),
(455, 212, 200, 2, 5, 'SEO Content Manager', 'growthhackers-seo-content-455', 900, 1450, 'full-time', 'middle', 'Manage team of freelance writers to optimize articles for Google rankings.', 'Experience in mapping out keyword topical authority, understand search behaviors.', 'Annual company vacation trips.', 'approved'),
(456, 212, 200, 6, 5, 'Customer Retention Specialist (CRM)', 'growthhackers-crm-spec-456', 800, 1300, 'full-time', 'junior', 'Optimize customer lifecycles via automated Email/SMS workflows.', 'Proficient with CRM tools like Hubspot, Insider, or Salesforce.', 'Fixed annual salary reviews.', 'approved'),
(457, 212, 200, 2, 1, 'Digital Marketing Intern', 'growthhackers-mkt-intern-457', 200, 350, 'part-time', 'intern', 'Support copywriting and compile campaign data reports.', 'Dynamic, eager to learn, passionate about digital media advertising.', 'Lunch allowance and internship official stamp support.', 'approved'),
(458, 212, 200, 6, 5, 'Account Executive (Digital Agency)', 'growthhackers-account-exec-458', 550, 900, 'full-time', 'fresher', 'Receive requests from enterprise clients and coordinate internal tasks.', 'Good communication, hard-working, tactful in handling emergencies.', 'Commission bonuses on managed project revenues.', 'approved'),
(459, 212, 200, 2, 2, 'KOL/KOC Relationship Executive', 'growthhackers-kol-rel-459', 750, 1200, 'full-time', 'junior', 'Identify and negotiate booking contracts with influencers for product reviews.', 'Existing network contacts with youthful KOLs/KOCs, strong communication.', 'Business phone and client meeting expenses covered.', 'approved'),
(460, 212, 200, 2, 5, 'Senior Marketing Data Analyst', 'growthhackers-mkt-da-460', 1300, 2100, 'full-time', 'senior', 'Analyze multi-channel numbers to recommend optimal budget distribution.', 'Proficient in SQL, Python, connecting to ad platform APIs.', 'VIP comprehensive healthcare package.', 'approved'),
(461, 212, 200, 2, 3, 'Remote Content Writer (English)', 'growthhackers-writer-remote-461', 500, 1000, 'contract', 'junior', 'Write SEO-optimized blog posts in English for the US market.', 'Native-level English writing proficiency, engaging writing style.', '100% remote freelance work, paid per article.', 'approved'),
(462, 212, 200, 2, 5, 'Social Media Manager', 'growthhackers-social-mgr-462', 1100, 1700, 'full-time', 'middle', 'Build and develop brand image across major social networks.', 'Creative content mindset, strong media crisis management.', '14 days of paid annual leave.', 'approved'),
(463, 212, 200, 6, 5, 'Telesales Executive', 'growthhackers-telesales-463', 450, 750, 'full-time', 'junior', 'Call prospects to introduce digital marketing packages from provided warm data.', 'Clear voice, persistence, and high resilience to rejection.', 'Very high monthly sales commissions.', 'approved'),
(464, 212, 200, 2, 1, 'Creative Director (Marketing)', 'growthhackers-creative-dir-464', 2200, 3500, 'full-time', 'senior', 'Take ultimate responsibility for creative conceptualizing of major campaigns.', '5+ years at international agencies, major industry awards.', 'Luxury private office, business travel vehicle.', 'approved'),
(465, 212, 200, 6, 5, 'Business Development Executive (BD)', 'growthhackers-bd-exec-465', 700, 1150, 'full-time', 'junior', 'Proactively approach enterprises with outsourced marketing needs.', 'Excellent slide proposal pitch skills.', 'Fuel and mobile network allowances.', 'approved'),
(466, 212, 200, 2, 5, 'Affiliate Marketing Coordinator', 'growthhackers-affiliate-466', 800, 1250, 'full-time', 'middle', 'Build and operate a network of commission-based affiliates.', 'Experience managing large-scale affiliate tracking platforms.', 'Bonuses based on total network revenues.', 'approved'),
(467, 212, 200, 2, 4, 'Graphic Designer for Ads', 'growthhackers-designer-ads-467', 650, 1000, 'full-time', 'junior', 'Design eye-catching banner ads optimized for high click-through rates.', 'Fast output on Photoshop/Illustrator, understand visual psychology.', 'Comfortable work environment fully stocked with snacks.', 'approved'),
(468, 212, 200, 2, 5, 'E-mail Marketing Specialist', 'growthhackers-email-mkt-468', 700, 1100, 'full-time', 'junior', 'Design layouts and write copy for automated email newsletter campaigns.', 'Proficient with Mailchimp / GetResponse, great headline hook writer.', 'Complimentary VIP health check-ups.', 'approved'),
(469, 212, 200, 2, 2, 'Community Growth Specialist', 'growthhackers-community-469', 900, 1400, 'full-time', 'middle', 'Grow and nurture Facebook groups and Discord communities to hundreds of thousands of members.', 'Engaging conversationalist, great at moderate public community topics.', 'Workspace equipped with spine-protecting ergonomic chairs.', 'approved'),
(470, 212, 200, 2, 5, 'Video Editor (Short-form Content)', 'growthhackers-short-video-470', 600, 950, 'full-time', 'fresher', 'Cut and add sound effects/captions for TikTok/Reels/Shorts short videos.', 'Proficient in CapCut PC or Premiere, sensitive to trending audio beats.', 'VIP licensed account for stock audio assets provided.', 'approved'),
(471, 212, 200, 6, 1, 'Senior Account Manager', 'growthhackers-account-mgr-471', 1400, 2200, 'full-time', 'senior', 'Retain and grow revenue from key VIP corporate clients.', 'Years of experience managing corporate client portfolios.', 'Premium international health insurance.', 'approved'),
(472, 212, 200, 2, 5, 'Product Growth Intern', 'growthhackers-growth-intern-472', 250, 350, 'part-time', 'intern', 'Assist in user flow testing to optimize digital conversion rates.', 'Logical analytical mindset interested in digital behavior data.', 'Work directly with leading growth experts.', 'approved'),
(473, 212, 200, 2, 5, 'Freelance Copywriter (Seasonal)', 'growthhackers-copy-freelance-473', 400, 800, 'freelance', 'middle', 'Write campaign ad scripts during peak holiday and Tet seasons.', 'Fast ideation, flexible writing style across diverse tones.', 'Sober payment upon project milestone completion.', 'approved'),
(474, 212, 200, 2, 3, 'Event Marketing Executive', 'growthhackers-event-exec-474', 850, 1300, 'full-time', 'middle', 'Plan and coordinate offline seminars to attract corporate B2B clients.', 'Agile, exceptional on-site event risk management skills.', 'Full clothing and travel allowances provided.', 'approved'),
(475, 212, 200, 6, 5, 'Inside Sales Specialist', 'growthhackers-inside-sales-475', 600, 1000, 'full-time', 'junior', 'Consult online via chat to close marketing service deals on the website.', 'Fast chat response times, exceptional objection-handling skills.', 'Monthly sales conversion bonuses.', 'approved'),
(476, 212, 200, 2, 5, 'Brand Ambassador Coordinator', 'growthhackers-ambassador-476', 900, 1500, 'full-time', 'middle', 'Manage the media schedule and logistics for exclusive brand ambassadors.', 'Meticulous scheduling, highly discrete data confidentiality maintenance.', 'Full coverage of premium flights and stays.', 'approved'),
(477, 212, 200, 2, 1, 'Web Analytics Specialist', 'growthhackers-web-analytics-477', 1100, 1750, 'full-time', 'middle', 'Configure deep tracking and analyze landing page funnel conversions.', 'Proficient in GTM, GA4, Hotjar, and user identification setups.', 'Fixed Saturdays and Sundays off.', 'approved'),
(478, 212, 200, 2, 5, 'PR Lead (Public Relations)', 'growthhackers-pr-lead-478', 1500, 2300, 'full-time', 'senior', 'Manage brand equity and direct press releases for mass media distribution.', 'Broad network among journalists and news report producers.', 'Uncapped public relations entertainment allowances.', 'approved'),
(479, 212, 200, 2, 5, 'Growth Marketing Team Lead', 'growthhackers-team-lead-479', 1800, 2800, 'full-time', 'senior', 'Take full responsibility for lead generation KPIs across the entire team.', 'Outstanding capability in managing multi-channel campaign performance.', 'Full social insurance base, 13th, 14th, 15th-month bonuses.', 'approved');

SET FOREIGN_KEY_CHECKS = 1;