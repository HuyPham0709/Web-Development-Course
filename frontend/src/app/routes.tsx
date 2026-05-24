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
import RecommendedJobsPage from "./pages/employer/RecommendedJobsPage";
import { CVSearch } from "./pages/employer/CVSearch";

// SHARED PAGES
import Settings from "./pages/shared/Settings";
import ErrorPage from "./pages/shared/ErrorPage";
import Chat from "./pages/shared/Chat";

// ======================================================
// PROTECTED ROUTE
// ======================================================

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

  if (!userStr) {
    return <Navigate to="/auth" replace />;
  }

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
    children: [
      // =========================
      // PUBLIC ROUTES
      // =========================

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
      // CANDIDATE ROUTES (Đã giữ phần xanh dương của bạn)
      // =========================

      {
        element: (
          <ProtectedRoute allowedRole="candidate" />
        ),

        children: [
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
      // EMPLOYER ROUTES (Đã bổ sung route Edit Job vào đây)
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