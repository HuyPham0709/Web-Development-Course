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
import { JobForm } from "./pages/employer/JobForm";
<<<<<<< HEAD
import RecommendedJobsPage from "./pages/employer/RecommendedJobsPage";
=======
import Settings from "./pages/shared/Settings";
import ErrorPage from "./pages/shared/ErrorPage";

// Import CVSearch (Dạng named import vì file CVSearch dùng `export function CVSearch`)
>>>>>>> 00e2620 (Thông báo apply cho 2 bên employer và candidate)
import { CVSearch } from "./pages/employer/CVSearch";

// SHARED PAGES
import Settings from "./pages/shared/Settings";
import ErrorPage from "./pages/shared/ErrorPage";
import Chat from "./pages/shared/Chat";

<<<<<<< HEAD
// ======================================================
// PROTECTED ROUTE
// ======================================================
=======
// --- PROTECTED ROUTE (GIỮ NGUYÊN 100% CỦA BẠN) ---
const ProtectedRoute = ({ allowedRole }: { allowedRole: string }) => {
  const userStr = localStorage.getItem("user");
>>>>>>> 00e2620 (Thông báo apply cho 2 bên employer và candidate)

const ProtectedRoute = ({
  allowedRole,
}: {
  allowedRole: string;
}) => {
  const userStr = localStorage.getItem("user");

  // Chưa login
  if (!userStr) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    // Sai role
    if (
      user.role?.toLowerCase() !==
      allowedRole.toLowerCase()
    ) {
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

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return <Navigate to="/auth" replace />;
  }
};

// ======================================================
// REQUIRE LOGIN ONLY
// ======================================================

const RequireAuth = () => {
  const userStr = localStorage.getItem("user");
<<<<<<< HEAD

  if (!userStr) {
    return <Navigate to="/auth" replace />;
  }

=======
  if (!userStr) return <Navigate to="/auth" replace />;
>>>>>>> 00e2620 (Thông báo apply cho 2 bên employer và candidate)
  return <Outlet />;
};

// ======================================================
// ROUTER
// ======================================================

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
<<<<<<< HEAD

=======
>>>>>>> 00e2620 (Thông báo apply cho 2 bên employer và candidate)
    children: [
      // =========================
      // PUBLIC ROUTES
      // =========================

      {
<<<<<<< HEAD
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

      // =========================
      // LOGIN REQUIRED
      // =========================

      {
        element: <RequireAuth />,
        children: [
          {
            path: "chat",
            element: <Chat />,
          },

          {
            path: "settings",
            element: <Settings />,
          },
        ],
      },

      // =========================
      // CANDIDATE ROUTES
      // =========================

=======
        // Đảm bảo route chi tiết công việc nằm ở đây
        path: "job/:id",
        element: <JobDetail />,
      },

      // --- BỔ SUNG: ROUTE CHAT (Cả Employer và Candidate đều vào được nếu đã đăng nhập) ---
      {
        element: <RequireAuth />,
        children: [{ path: "chat", element: <Chat /> }],
      },

      // --- ROUTES CHO ỨNG VIÊN (CANDIDATE) ---
      {
        element: <ProtectedRoute allowedRole="candidate" />,
        children: [
          { path: "profile", element: <ProfileDashboard /> },
          { path: "applications", element: <MyApplications /> },

          // BỔ SUNG DÒNG NÀY: Để hứng cái link thông báo "/profile/applications" bị lệch
          { path: "profile/applications", element: <MyApplications /> },

          { path: "settings", element: <Settings /> },
        ],
      },
      // --- ROUTES CHO NHÀ TUYỂN DỤNG (EMPLOYER) ---
>>>>>>> 00e2620 (Thông báo apply cho 2 bên employer và candidate)
      {
        element: (
          <ProtectedRoute allowedRole="candidate" />
        ),

        children: [
<<<<<<< HEAD
          {
            path: "profile",
            element: <ProfileDashboard />,
          },

          {
            path: "applications",
            element: <MyApplications />,
          },

          {
            path: "recommended-jobs",
            element: <RecommendedJobsPage />,
          },
        ],
      },

      // =========================
      // EMPLOYER ROUTES
      // =========================

      {
        element: (
          <ProtectedRoute allowedRole="employer" />
        ),

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
            path: "employer/cv-search",
            element: <CVSearch />,
          },
        ],
      },
=======
          { path: "employer/dashboard", element: <EmployerDashboard /> },
          { path: "employer/candidates", element: <CandidateManagement /> },
          { path: "employer/candidate/:id", element: <CandidateDetail /> },
          { path: "employer/jobs/new", element: <JobForm /> },
          { path: "employer/cv-search", element: <CVSearch /> },
        ],
      },
>>>>>>> 00e2620 (Thông báo apply cho 2 bên employer và candidate)
    ],
  },
]);
