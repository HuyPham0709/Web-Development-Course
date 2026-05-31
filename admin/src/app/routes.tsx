import { createBrowserRouter } from "react-router-dom"
import { AdminLayout } from "./layouts/AdminLayout"
import { Login } from "./pages/auth/Login"
import { Dashboard } from "./pages/admin/Dashboard"
import { Users } from "./pages/admin/Users"
import { Jobs } from "./pages/admin/Jobs"
import { Metadata } from "./pages/admin/Metadata"
import { Reports } from "./pages/admin/Reports"
import { JobManagement } from "./pages/admin/JobManagement"
import { JobDetails } from "./pages/admin/JobDetails"
import { EditJob } from "./pages/admin/EditJob"

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: AdminLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "users", Component: Users },
      { path: "jobs", Component: Jobs },
      { path: "/jobs/management", Component: JobManagement },
      { path: "/jobs/:id", Component: JobDetails },
      { path: "/jobs/:id/edit", Component: EditJob },
      { path: "metadata", Component: Metadata },
      { path: "reports", Component: Reports },
    ],
  },
])