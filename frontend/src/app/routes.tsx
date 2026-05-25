// frontend/src/app/routes.tsx

import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import App from "./App";

// PUBLIC PAGES
import Home from "./pages/public/Home";
import JobDetail from "./pages/public/JobDetail";
import Auth from "./pages/auth/Auth";

// CANDIDATE PAGES
import ProfileDashboard from "./pages/candidate/ProfileDashboard";
import MyApplications from "./pages/candidate/MyApplications";

// EMPLOYER PAGES
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import CandidateManagement from "./pages/employer/CandidateManagement";
import CandidateDetail from "./pages/employer/CandidateDetail";
import { JobForm } from './pages/employer/JobForm';
import CompanyProfile from './pages/employer/CompanyProfile';
import { CVSearch } from "./pages/employer/CVSearch";

// SHARED PAGES
import Settings from "./pages/shared/Settings";
import ErrorPage from "./pages/shared/ErrorPage";
import Chat from "./pages/shared/Chat";

// ======================================================
<<<<<<< HEAD
// PROTECTED ROUTE (Bắt buộc đúng Role cụ thể)
=======
// PROTECTED ROUTE (ROLE REQUIRED)
>>>>>>> 516238918ea5362915e0494aa5d786668f8e2ab9
// ======================================================
const ProtectedRoute = ({ allowedRole }: { allowedRole: string }) => {
  const userStr = localStorage.getItem("user");

  // Chưa login
  if (!userStr) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // Sai role
    if (user.role?.toLowerCase() !== allowedRole.toLowerCase()) {
      console.warn(
        "Sai role!",
        "User role:",
        user.role,
        "Yêu cầu:",
        allowedRole
      );
      return <Navigate to="/" replace />;
    }
    return <Outlet />;
  } catch (error) {
    console.error("Lỗi parse user:", error);

    value_cleanup();
    return <Navigate to="/auth" replace />;
  }
};

<<<<<<< HEAD
// ======================================================
// REQUIRE LOGIN ONLY (Chỉ cần đăng nhập, Role nào cũng được)
=======
// Hàm phụ dọn dẹp storage khi lỗi parse
const value_cleanup = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// ======================================================
// REQUIRE LOGIN ONLY (ANY ROLE)
>>>>>>> 516238918ea5362915e0494aa5d786668f8e2ab9
// ======================================================
const RequireAuth = () => {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

// ======================================================
// ROUTER CONFIGURATION
// ======================================================
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // ==========================================
<<<<<<< HEAD
      // 1. PUBLIC ROUTES (Ai cũng vào được)
      // ==========================================
      {
        index: true,
        element: <Home />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
      {
        path: "job/:id",
        element: <JobDetail />,
      },

      // ==========================================
      // 2. SHARED ROUTES (Đăng nhập là vào được - Cả 2 Roles)
=======
      // PUBLIC ROUTES (Ai cũng vào được)
      // ==========================================
      { index: true, element: <Home /> },
      { path: "auth", element: <Auth /> },
      { path: "job/:id", element: <JobDetail /> },

      // Bất kỳ ai (Kể cả Candidate) click vào xem công ty đều dùng route này
      { path: "companies/:id", element: <CompanyProfile /> },

      // ==========================================
      // LOGIN REQUIRED (Cứ Đăng nhập là vào được - Chat, Settings...)
>>>>>>> 516238918ea5362915e0494aa5d786668f8e2ab9
      // ==========================================
      {
        element: <RequireAuth />,
        children: [
<<<<<<< HEAD
          { path: "settings", element: <Settings /> },
          { path: "chat", element: <Chat /> }, // Chat dùng chung nên để ở đây
=======
          { path: "chat", element: <Chat /> },
          { path: "settings", element: <Settings /> },
>>>>>>> 516238918ea5362915e0494aa5d786668f8e2ab9
        ],
      },

      // ==========================================
<<<<<<< HEAD
      // 3. CANDIDATE ROUTES (Chỉ Candidate được vào)
=======
      // CANDIDATE ROUTES (Chỉ Candidate được vào)
>>>>>>> 516238918ea5362915e0494aa5d786668f8e2ab9
      // ==========================================
      {
        element: <ProtectedRoute allowedRole="candidate" />,
        children: [
          { path: "profile", element: <ProfileDashboard /> },
          { path: "applications", element: <MyApplications /> },
<<<<<<< HEAD
          // Hứng link từ thông báo cũ bị lệch nếu có
=======

          // Hứng cái link thông báo "/profile/applications" bị lệch
>>>>>>> 516238918ea5362915e0494aa5d786668f8e2ab9
          { path: "profile/applications", element: <MyApplications /> },
        ],
      },

      // ==========================================
<<<<<<< HEAD
      // 4. EMPLOYER ROUTES (Chỉ Employer được vào)
=======
      // EMPLOYER ROUTES (Chỉ Employer được vào)
>>>>>>> 516238918ea5362915e0494aa5d786668f8e2ab9
      // ==========================================
      {
        element: <ProtectedRoute allowedRole="employer" />,
        children: [
          {
            path: "employer/dashboard",
            element: <EmployerDashboard />,
          },
          {
            path: "employer/candidates",
            element: <CandidateManagement />,
          },
          {
            path: "employer/candidate/:id",
            element: <CandidateDetail />,
          },
          {
            path: "employer/jobs/new",
            element: <JobForm />,
          },
          {
            path: "employer/jobs/edit/:id",
            element: <JobForm />,
          },

          {
            path: "employer/cv-search",
            element: <CVSearch />,
          },
        ],
      },
    ],
  },
]);