import { RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"
import { router } from "./routes"
import { ThemeProvider } from "next-themes" // 1. Import ThemeProvider

export default function App() {
  return (
    // 2. Bọc ứng dụng bằng ThemeProvider với cấu hình attribute="class"
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  )
}