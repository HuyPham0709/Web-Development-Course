// frontend/src/app/routes.tsx

import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import App from "./App";
import Home from "./pages/public/Home";
import JobDetail from "./pages/public/JobDetail";
import Auth from "./pages/auth/Auth";
import ProfileDashboard from "./pages/candidate/ProfileDashboard";
import MyApplications from "./pages/candidate/MyApplications";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import CandidateManagement from "./pages/employer/CandidateManagement";
import CandidateDetail from "./pages/employer/CandidateDetail";
import { JobForm } from './pages/employer/JobForm';
import Settings from "./pages/shared/Settings";
import ErrorPage from "./pages/shared/ErrorPage";
import CompanyProfile from './pages/employer/CompanyProfile'; // Import vẫn giữ nguyên
import { CVSearch } from "./pages/employer/CVSearch";
import Chat from "./pages/shared/Chat";

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ allowedRole }: { allowedRole: string }) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/auth" replace />;

  try {
    const user = JSON.parse(userStr);
    if (user.role?.toLowerCase() !== allowedRole.toLowerCase()) {
      console.warn("Sai role! User role:", user.role, "Yêu cầu:", allowedRole);
      return <Navigate to="/" replace />; 
    }
    return <Outlet />;
  } catch (error) {
    console.error("Lỗi parse user:", error);
    return <Navigate to="/auth" replace />;
  }
};

// --- REQUIRE AUTH ---
const RequireAuth = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/auth" replace />;
  return <Outlet />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    errorElement: <ErrorPage />, 
    children: [
      { index: true, element: <Home /> },
      { path: "auth", element: <Auth /> },
      { path: "job/:id", element: <JobDetail /> },
      
      // ✅ BỔ SUNG Ở ĐÂY: Bất kỳ ai (Kể cả Candidate) click vào xem công ty đều dùng route này
      { path: "companies/:id", element: <CompanyProfile /> }, 
      
      {
        element: <RequireAuth />,
        children: [
          { path: "chat", element: <Chat /> }
        ]
      },

      // --- ROUTES CHO ỨNG VIÊN (CANDIDATE) ---
      {
        element: <ProtectedRoute allowedRole="candidate" />,
        children: [
          { path: "profile", element: <ProfileDashboard /> }, 
          { path: "applications", element: <MyApplications /> },
          { path: "settings", element: <Settings /> },        
        ],
      },

      // --- ROUTES CHO NHÀ TUYỂN DỤNG (EMPLOYER) ---
      {
        element: <ProtectedRoute allowedRole="employer" />,
        children: [
          { path: "employer/dashboard", element: <EmployerDashboard /> }, 
          { path: "employer/candidates", element: <CandidateManagement /> }, 
          { path: "employer/candidate/:id", element: <CandidateDetail /> },  
          { path: "employer/jobs/new", element: <JobForm /> },
          { path: "employer/cv-search", element: <CVSearch /> },
          
          // ✅ SỬA LẠI Ở ĐÂY: Dành riêng cho Employer khi họ muốn tự sửa Profile của công ty họ
          { path: "employer/profile", element: <CompanyProfile /> }
        ],
      }
    ],
  },
]);