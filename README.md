# JobFinder - Cổng Tìm Kiếm Việc Làm Trực Tuyến

> **ĐỀ TÀI SỐ 10**
> * **Học viện:** Học viện Công nghệ Bưu chính Viễn thông (Cơ sở 2)
> * **Học phần:** Lập Trình Website
> * **Nhóm thực hiện:** 04 thành viên

---

## 📌 Giới thiệu dự án
JobFinder là một nền tảng kết nối ứng viên (Candidate) và nhà tuyển dụng (Employer) dưới sự quản lý và kiểm duyệt của quản trị viên (Admin). Hệ thống mô phỏng toàn diện quy trình tuyển dụng thực tế từ bước tạo CV, đăng tin, ứng tuyển, lọc hồ sơ cho đến tương tác thời gian thực thông qua Chat và thông báo.

Dự án được phát triển theo kiến trúc Monorepo, tách biệt rõ ràng giữa các phân hệ Front-end (Client & Admin) sử dụng **ReactJS + TypeScript + Vite** và Back-end sử dụng **NodeJS + Express + MySQL**.

---

## ✨ Các tính năng cốt lõi

### 1. Hệ thống tài khoản & Bảo mật (Auth & Security)
* Đăng ký, đăng nhập và phân quyền nghiêm ngặt 3 phân hệ: Candidate, Employer, Admin.
* Xác thực an toàn bằng **JSON Web Token (JWT)**, mã hóa mật khẩu ở tầng cơ sở dữ liệu.
* Tích hợp tải lên hình ảnh qua Cloudinary và hệ thống gửi mail thông báo tự động (Nodemailer).

### 2. Phân hệ Ứng viên (Candidate)
* **CV Builder:** Công cụ tạo hồ sơ cá nhân trực tuyến và xuất file CV định dạng PDF (`jsPDF`).
* **Quản lý ứng tuyển:** Nộp hồ sơ, theo dõi trạng thái lịch sử xử lý (Chờ duyệt, Phỏng vấn, Từ chối).
* **Job Criteria & Gợi ý:** Thiết lập bộ tiêu chí công việc mong muốn để nhận gợi ý việc làm phù hợp.
* **Tương tác nâng cao:** Lưu việc làm yêu thích, xem danh sách các nhà tuyển dụng đã ghé thăm hồ sơ.

### 3. Phân hệ Nhà tuyển dụng (Employer)
* **Quản lý tin tuyển dụng:** Tạo mới, chỉnh sửa, đóng hoặc gia hạn các chiến dịch tuyển dụng.
* **Săn ứng viên (CV Search):** Chủ động tìm kiếm, lọc danh sách ứng viên công khai theo kỹ năng/vị trí và gửi lời mời ứng tuyển trực tiếp (`Invitation System`).
* **Quản lý quy trình ứng tuyển:** Xét duyệt hồ sơ, chuyển trạng thái ứng viên trực quan.

### 4. Phân hệ Quản trị viên độc lập (Admin Dashboard)
* **Thống kê chuyên sâu:** Biểu đồ hóa số lượng người dùng, tin tuyển dụng, và tỷ lệ tương tác hệ thống (`Recharts`).
* **Kiểm duyệt nội dung:** Phê duyệt/từ chối các bài đăng tuyển dụng mới để tránh tin rác.
* **Quản trị hệ thống:** Khóa/mở khóa tài khoản người dùng và xử lý các báo cáo vi phạm.

### 5. Tính năng bổ trợ nâng cao
* **Realtime Chat & Notification:** Hệ thống nhắn tin và thông báo tức thời giữa Ứng viên - Nhà tuyển dụng nhờ **Socket.io**.
* **AI Chatbot Assistant:** Hỗ trợ tư vấn tìm việc, giải đáp thắc mắc tự động 24/7.
* **Đa ngôn ngữ (i18n):** Chuyển đổi giao diện Anh - Việt linh hoạt thông qua `i18next`.

---

## 📂 Cấu trúc thư mục dự án (Project Structure)

```text
├── 📁 admin
│   ├── 📁 src
│   │   ├── 📁 app
│   │   │   ├── 📁 components
│   │   │   │   └── 📁 ui          # Hệ thống giao diện nguyên tử (Shadcn UI)
│   │   │   ├── 📁 layouts         # Giao diện khung cố định (AdminLayout)
│   │   │   ├── 📁 pages           # Các trang chức năng của Admin
│   │   │   └── 📄 App.tsx / routes.tsx
│   │   ├── 📁 services            # Tầng gọi API dành riêng cho admin
│   │   ├── 📁 styles              # Cấu hình Tailwind CSS & Fonts
│   │   └── 📄 main.tsx
│   └── 📄 vite.config.ts
├── 📁 backend
│   ├── 📁 config                  # Cấu hình DB, Cloudinary, Mailer
│   ├── 📁 controllers             # Xử lý logic nghiệp vụ (Admin, Auth, Core, Jobs, Social)
│   ├── 📁 middlewares             # Kiểm tra Token, Upload file, Bắt lỗi tập trung
│   ├── 📁 models                  # Định nghĩa cấu trúc thực thể (Chat, Message, Notification)
│   ├── 📁 routes                  # Định tuyến API phân tách theo nghiệp vụ
│   ├── 📁 uploads                 # Thư mục lưu trữ tệp tạm thời
│   ├── 📁 utils                   # Trợ năng bổ trợ & Cấu hình Socket.io
│   └── 📄 app.js                  # Điểm khởi chạy Server trung tâm
├── 📁 frontend
│   ├── 📁 src
│   │   ├── 📁 app
│   │   │   ├── 📁 components      # Component chia theo luồng chức năng (Candidate, Home, Shared)
│   │   │   ├── 📁 ui              # Giao diện nền tảng đồng bộ (Shadcn UI)
│   │   │   └── 📁 pages           # Các trang chính (Candidate Dashboard, Employer, Public Home)
│   │   ├── 📁 hooks               # Các Custom Hooks tối ưu logic (useDebounce, useProfile)
│   │   ├── 📁 services            # Quản lý các lệnh gọi API tích hợp Axios
│   │   └── 📄 App.tsx / routes.tsx
│   └── 📄 vite.config.ts
├── 📄 schema.sql                  # Cấu trúc khởi tạo cơ sở dữ liệu MySQL
└── 📄 seed.sql                    # Dữ liệu mẫu phục vụ kiểm thử hệ thống
⚙️ Công nghệ & Thư viện sử dụng

* Khối Front-end (Client & Admin)
- Core: ReactJS (v18/v19), TypeScript, Vite (v6).
- Styling & UI: Tailwind CSS (v4), Radix UI Primitives, Material-UI (MUI Icons).
- State & Routing: React Router v7, React Hook Form.
- Libraries: Axios (Kết nối API), Framer Motion (Hiệu ứng chuyển động), Recharts (Biểu đồ), jsPDF (Xuất file), i18next (Đa ngôn ngữ), Socket.io-client (Realtime).

* Khối Back-end (Server)
- Core: NodeJS, ExpressJS.
- Database: MySQL.
- Realtime: Socket.io.
- Services: Cloudinary API (Lưu trữ ảnh), Multer (Xử lý Multipart/form-data), Nodemailer (Gửi Mail OTP).
🛠️ Hướng dẫn cài đặt và khởi chạy dưới Local
1. Khởi tạo Cơ sở dữ liệu
- Cài đặt MySQL Server (hoặc sử dụng XAMPP).
- Tạo một cơ sở dữ liệu mới tên là jobfinder_db.
- Khởi chạy tệp schema.sql để tạo cấu trúc bảng.
- Khởi chạy tệp seed.sql để nạp dữ liệu chạy thử.
2. Cấu hình và chạy Back-end
cd backend
npm install
# Tạo tệp .env tại thư mục gốc backend và điền các tham số cấu hình kết nối DB, JWT_SECRET, CLOUDINARY
npm run dev
3. Khởi chạy ứng dụng Frontend (Candidate & Employer)
cd frontend
npm install
npm run dev
4. Khởi chạy ứng dụng Admin Dashboard
cd admin
npm install
npm run dev
👥 Phân chia công việc trong nhóm
| Thành viên | Vai trò                | Nhiệm vụ                     |
| ---------- | ---------------------- | ---------------------------- |
| Phạm Hoàng Quốc Huy          | Leader / Frontend Lead | Setup project, UI/UX, Deploy |
| Nguyễn Trung Hiếu            | Backend Lead           | Database, JWT, API           |
| Nguyễn Hữu Đức               | Candidate Logic        | CV, ứng tuyển, PDF           |
| Trương Đình Tấn Tài          | Admin & Employer       | Dashboard, Notification      |
🔄 Quy trình Git Workflow của nhóm
Tạo nhánh tính năng mới từ main:
Bash
git checkout main
git pull origin main
git checkout -b <ten_nhánh_hoặc_mssv>
Cam kết mã nguồn (Commit) theo chuẩn:

Bash
git add .
git commit -m "feat: tích hợp tính năng xuất file hồ sơ pdf"
Đẩy mã nguồn và tạo Pull Request (PR):

Bash
git push origin <ten_nhánh_hoặc_mssv>
