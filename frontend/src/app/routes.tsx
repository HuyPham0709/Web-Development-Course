// frontend/src/app/routes.tsx

import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import App from "./App";

// PUBLIC PAGES
import Home from "./pages/public/Home";
import JobDetail from "./pages/public/JobDetail";
import Auth from "./pages/auth/Auth";
import { Jobs } from "./pages/public/Jobs"; 

// CANDIDATE PAGES
import ProfileDashboard from "./pages/candidate/ProfileDashboard";
import MyApplications from "./pages/candidate/MyApplications";
import { InviteDetail } from "./pages/candidate/InviteDetail"; // ĐÃ IMPORT COMPONENT MỚI
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
import ViewedByEmployers from "./components/candidate/profile/ViewedByEmployers";

// ======================================================
// PROTECTED ROUTE (Bắt buộc đúng Role cụ thể)
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
    return <Navigate to="/auth" replace />;
  }
};

// ======================================================
// REQUIRE LOGIN ONLY (Chỉ cần đăng nhập, Role nào cũng được)
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
        path: "jobs", 
        element: <Jobs />,
      },
      {
        path: "job/:id",
        element: <JobDetail />,
      },
      {
        path: "company/:id",
        element: <CompanyProfile />,
      },

      // ==========================================
      // 2. SHARED ROUTES (Đăng nhập là vào được - Cả 2 Roles)
      // ==========================================
      {
        element: <RequireAuth />,
        children: [
          { path: "settings", element: <Settings /> },
          { path: "chat", element: <Chat /> }, 
        ],
      },

      // ==========================================
      // 3. CANDIDATE ROUTES (Chỉ Candidate được vào)
      // ==========================================
      {
        element: <ProtectedRoute allowedRole="candidate" />,
        children: [
          { path: "profile", element: <ProfileDashboard /> },
          { path: "applications", element: <MyApplications /> },
          { path: "profile/applications", element: <MyApplications /> },
          { path: "profile/viewed-by-employer", element: <ViewedByEmployers /> },
          { path: "invite-detail/:id", element: <InviteDetail /> }, // <-- THÊM ROUTE Ở ĐÂY
        ],
      },

      // ==========================================
      // 4. EMPLOYER ROUTES (Chỉ Employer được vào)
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
          {
            path: "employer/profile",
            element: <CompanyProfile />,
          },
        ],
      },
    ],
  },
]);