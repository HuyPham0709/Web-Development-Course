# #️⃣ JobFinder - Cổng Tìm Kiếm Việc Làm Trực Tuyến

> **ĐỀ TÀI SỐ 10**
> * **Học viện:** Học viện Công nghệ Bưu chính Viễn thông (Cơ sở 2)
> * **Học phần:** Lập Trình Website
> * **Nhóm thực hiện:** 04 thành viên

---

## 📌 Giới thiệu dự án

**JobFinder** là một nền tảng kết nối ứng viên (Candidate) và nhà tuyển dụng (Employer) dưới sự quản lý và kiểm duyệt của quản trị viên (Admin). Hệ thống mô phỏng toàn diện quy trình tuyển dụng thực tế từ bước tạo CV, đăng tin, ứng tuyển, lọc hồ sơ cho đến tương tác thời gian thực thông qua Chat và thông báo.

Dự án được phát triển theo kiến trúc **Monorepo**, tách biệt rõ ràng giữa các phân hệ Front-end (Client & Admin) sử dụng **ReactJS + TypeScript + Vite** và Back-end sử dụng **NodeJS + Express + MySQL**.

---

## ✨ Các tính năng cốt lõi

### 1. Hệ thống tài khoản & Bảo mật (Auth & Security)
* Đăng ký, đăng nhập và phân quyền nghiêm ngặt 3 phân hệ: `Candidate`, `Employer`, `Admin`.
* Xác thực an toàn bằng **JSON Web Token (JWT)**, mã hóa mật khẩu ở tầng cơ sở dữ liệu.
* Tích hợp tải lên hình ảnh qua **Cloudinary** và hệ thống gửi mail thông báo tự động (**Nodemailer**).

### 2. Phân hệ Ứng viên (Candidate)
* **CV Builder:** Công cụ tạo hồ sơ cá nhân trực tuyến và xuất file CV định dạng PDF (`jsPDF`).
* **Quản lý ứng tuyển:** Nộp hồ sơ, theo dõi trạng thái lịch sử xử lý (*Chờ duyệt, Phỏng vấn, Từ chối*).
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
```

---

## ⚙️ Công nghệ & Thư viện sử dụng

### 💻 Khối Front-end (Client & Admin)
* **Core:** ReactJS (v18/v19), TypeScript, Vite (v6).
* **Styling & UI:** Tailwind CSS (v4), Radix UI Primitives, Material-UI (MUI Icons).
* **State & Routing:** React Router v7, React Hook Form.
* **Libraries:** Axios (Kết nối API), Framer Motion (Hiệu ứng chuyển động), Recharts (Biểu đồ), jsPDF (Xuất file), i18next (Đa ngôn ngữ), Socket.io-client (Realtime).

### ⚙️ Khối Back-end (Server)
* **Core:** NodeJS, ExpressJS.
* **Database:** MySQL.
* **Realtime:** Socket.io.
* **Services:** Cloudinary API (Lưu trữ ảnh), Multer (Xử lý Multipart/form-data), Nodemailer (Gửi Mail OTP).

---
# 🏛️ Tài liệu Kiến trúc Hệ thống (System Architecture)

Tài liệu này mô tả chi tiết về các quyết định thiết kế kỹ thuật, luồng xử lý dữ liệu và các quy chuẩn lập trình được áp dụng trong dự án **JobFinder**.

---

## 1. Cơ chế giao diện sáng/tối (Dark Mode Theming System)

Hệ thống UI của JobFinder hỗ trợ chuyển đổi mượt mà giữa Light Mode và Dark Mode thông qua cấu hình của **Tailwind CSS**. 

Thay vì phụ thuộc hoàn toàn vào hệ điều hành (media query), dự án thiết lập chủ động qua thuộc tính `darkMode: 'class'` trong tệp `tailwind.config.js`. 
* **Cơ chế hoạt động:** Khi người dùng nhấn nút chuyển đổi giao diện, Frontend sẽ thêm hoặc xóa class `dark` trên thẻ gốc của cây DOM (thường là `<html>` hoặc `<body>`). 
* Tất cả các component UI đều được thiết kế với các utility classes tiền tố `dark:` (ví dụ: `bg-white dark:bg-gray-900`), giúp trình duyệt tự động áp dụng dải màu tương ứng ngay lập tức mà không cần tải lại trang.

---

## 2. Kiến trúc Backend: Domain-Driven Design (DDD) & Modular

Thay vì gom tất cả API vào một tệp khổng lồ, Backend được chia nhỏ cấu trúc thư mục theo từng **Nghiệp vụ cốt lõi (Domain)**. Việc này mang lại 3 lợi ích cực lớn cho môi trường Doanh nghiệp: Dễ mở rộng, Dễ bảo trì và Tránh xung đột mã (Conflict) khi làm việc nhóm.

### Cách tổ chức phân hệ (Modules)
Hệ thống API được chia thành 5 nhóm độc lập:
1. **Phân hệ Admin:** Quản lý người dùng, duyệt tin, thống kê (`adminRoutes.js`, `metadataRoutes.js`).
2. **Phân hệ Auth & Profile:** Xử lý xác thực JWT, hồ sơ cá nhân.
3. **Phân hệ Jobs:** Các API lõi liên quan đến công việc, danh mục, kỹ năng, địa điểm.
4. **Phân hệ Core (Nghiệp vụ chính):** Quản lý công ty, luồng tạo CV, hiển thị ứng viên và xử lý lời mời ứng tuyển (`invitationRoutes.js`).
5. **Phân hệ Social:** Các tính năng tương tác theo thời gian thực như tin nhắn (Chat), thông báo (Notification) và hệ thống gợi ý.

### Luồng xử lý Request (Request Lifecycle)
Luồng đi của một yêu cầu HTTP được kiểm soát chặt chẽ qua 3 tầng (Separation of Concerns):
1. **Tầng Router (`categoryRoutes.js`):** Chỉ làm nhiệm vụ điều phối đường dẫn HTTP (ví dụ `GET /`) tới hàm xử lý tương ứng mà không chứa logic nghiệp vụ. Tệp `index.js` tổng hợp toàn bộ Router với cơ chế `safeRegisterRoute` giúp cảnh báo và ngăn chặn sập Server nếu một tệp route bị cấu hình lỗi.
2. **Tầng Controller (`categoryController.js`):** Nơi chứa 100% logic nghiệp vụ. Tiếp nhận Request, thao tác dữ liệu, bắt lỗi `try/catch` và trả về Response JSON thống nhất.
3. **Tầng Middleware (`app.js`):** Các bộ lọc chặn trước Request như `verifyToken`, `authorizeRole` (phân quyền) hoặc xử lý lỗi tập trung ở cuối tệp `app.js`.

---

## 3. Chiến lược Đa Cơ sở dữ liệu (Polyglot Persistence)

Dự án áp dụng một chiến lược lưu trữ dữ liệu lai ghép cực kỳ linh hoạt để tối ưu hóa hiệu suất cho từng loại dữ liệu khác nhau: **MySQL + MongoDB**.

### 🛢️ Cơ sở dữ liệu quan hệ (MySQL)
* **Mục đích:** Xử lý các dữ liệu cốt lõi có cấu trúc chặt chẽ, yêu cầu tính toàn vẹn (ACID) cao như: Người dùng, Danh mục, Bài đăng tuyển dụng, Công ty.
* **Cách kết nối:** Sử dụng `db.execute(query)` để gửi các câu lệnh SQL thuần (Raw Query) tối ưu hóa truy vấn. Ví dụ: Dùng `LEFT JOIN` và `GROUP BY` để thống kê số lượng việc làm theo từng danh mục tại `categoryController.js`.

### 🍃 Cơ sở dữ liệu phi quan hệ (MongoDB)
* **Mục đích:** Xử lý các luồng dữ liệu thời gian thực (Realtime), phi cấu trúc hoặc lớn dần theo thời gian mà không cần Schema cứng nhắc. 
* **Cách kết nối:** Sử dụng `mongoose.connect` trong `app.js` kết nối tới cơ sở dữ liệu `job_finder_chat_db`. Mongo được ứng dụng chủ yếu cho phân hệ **Social** (Hệ thống Chat, Tin nhắn).
* **Độ tin cậy (Resilience):** Hệ thống có thiết lập chế độ *Fallback*. Nếu MongoDB gặp sự cố kết nối, Server Node.js vẫn khởi chạy bình thường để duy trì các tính năng chạy trên MySQL, đảm bảo hệ thống không bị "chết" hoàn toàn.

---

## 4. Quy ước Lập trình Backend (Coding Conventions)

Để duy trì chất lượng mã nguồn, toàn bộ team tuân thủ các quy ước nghiêm ngặt sau:

* **Tên biến và thư mục:** Sử dụng `camelCase` cho biến, tên file (VD: `categoryController.js`).
* **Chuẩn hóa API Response:** Mọi API đều trả về một định dạng thống nhất: `{ success: true/false, data: [...], message: "..." }`.
* **Error Handling tập trung:** Mọi hàm xử lý trong Controller đều được bọc trong khối `try/catch`. Lỗi không được trả về tùy tiện mà ném qua `next(err)` để Middleware xử lý lỗi toàn cục tại `app.js` định dạng lại thành mã HTTP Status (VD: 500) và Message an toàn.
* **Global Middlewares:** CORS được định cấu hình chuẩn xác để chỉ nhận nguồn từ `localhost:5173` / `5174` (Môi trường Dev). Kích thước Payload được mở rộng giới hạn lên `50mb` thông qua `express.json` để phục vụ upload hình ảnh lớn / CV PDF.

## 🛠️ Hướng dẫn cài đặt và khởi chạy dưới Local

### 1️⃣ Khởi tạo Cơ sở dữ liệu
* Cài đặt **MySQL Server** (hoặc sử dụng phần mềm tích hợp **XAMPP**).
* Tạo một cơ sở dữ liệu mới với tên là `jobfinder_db`.
* Khởi chạy tệp `schema.sql` để tạo cấu trúc các bảng.
* Khởi chạy tệp `seed.sql` để nạp dữ liệu mẫu chạy thử.

### 2️⃣ Cấu hình và chạy Back-end
```bash
cd backend
npm install
```
> 📝 **Lưu ý:** Tạo tệp `.env` tại thư mục gốc của phân hệ `backend` và điền đầy đủ các tham số cấu hình kết nối Database, `JWT_SECRET`, và cấu hình API `CLOUDINARY`.

Khởi động server phát triển:
```bash
npm run dev
```

### 3️⃣ Khởi chạy ứng dụng Frontend (Candidate & Employer)
```bash
cd ../frontend
npm install
npm run dev
```

### 4️⃣ Khởi chạy ứng dụng Admin Dashboard
```bash
cd ../admin
npm install
npm run dev
```

---

## 👥 Phân chia công việc trong nhóm

| Thành viên | Vai trò | Nhiệm vụ |
| :--- | :--- | :--- |
| **Phạm Hoàng Quốc Huy** | Leader / Frontend Lead | Setup project, UI/UX, Deploy |
| **Nguyễn Trung Hiếu** | Backend Lead | Database, JWT, API |
| **Nguyễn Hữu Đức** | Candidate Logic | CV, ứng tuyển, PDF |
| **Trương Đình Tấn Tài** | Admin & Employer | Dashboard, Notification |

---

## 🔄 Quy trình Git Workflow của nhóm

### 📌 Tạo nhánh tính năng mới từ nhánh `main`
```bash
git checkout main
git pull origin main
git checkout -b <ten_nhanh_hoac_mssv>
```

### ✅ Cam kết mã nguồn (Commit) theo chuẩn cấu trúc
```bash
git add .
git commit -m "feat: tích hợp tính năng xuất file hồ sơ pdf"
```

### 🚀 Đẩy mã nguồn lên hệ thống và tạo Pull Request (PR)
```bash
git push origin <ten_nhanh_hoac_mssv>
```
