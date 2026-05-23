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
// PROTECTED ROUTE (ROLE REQUIRED)
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

// Hàm phụ dọn dẹp storage khi lỗi parse
const value_cleanup = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// ======================================================
// REQUIRE LOGIN ONLY (ANY ROLE)
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
      // PUBLIC ROUTES (Ai cũng vào được)
      // ==========================================
      { index: true, element: <Home /> },
      { path: "auth", element: <Auth /> },
      { path: "job/:id", element: <JobDetail /> },
      
      // Bất kỳ ai (Kể cả Candidate) click vào xem công ty đều dùng route này
      { path: "companies/:id", element: <CompanyProfile /> }, 

      // ==========================================
      // LOGIN REQUIRED (Cứ Đăng nhập là vào được - Chat, Settings...)
      // ==========================================
      {
        element: <RequireAuth />,
        children: [
          { path: "chat", element: <Chat /> },
          { path: "settings", element: <Settings /> },
        ],
      },

      // ==========================================
      // CANDIDATE ROUTES (Chỉ Candidate được vào)
      // ==========================================
      {
        element: <ProtectedRoute allowedRole="candidate" />,
        children: [
          { path: "profile", element: <ProfileDashboard /> },
          { path: "applications", element: <MyApplications /> },
          
          // Hứng cái link thông báo "/profile/applications" bị lệch
          { path: "profile/applications", element: <MyApplications /> },
        ],
      },

      // ==========================================
      // EMPLOYER ROUTES (Chỉ Employer được vào)
      // ==========================================
      {
        element: <ProtectedRoute allowedRole="employer" />,
        children: [
          { path: "employer/dashboard", element: <EmployerDashboard /> },
          { path: "employer/candidates", element: <CandidateManagement /> },
          { path: "employer/candidate/:id", element: <CandidateDetail /> },
          { path: "employer/jobs/new", element: <JobForm /> },
          { path: "employer/cv-search", element: <CVSearch /> },
          
          // Dành riêng cho Employer khi họ muốn tự sửa Profile của công ty họ
          { path: "employer/profile", element: <CompanyProfile /> },
        ],
      },
    ],
  },
]);