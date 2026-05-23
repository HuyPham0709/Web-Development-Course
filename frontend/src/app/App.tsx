import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import MyApplications from './pages/candidate/MyApplications';
// Import Navbar và Footer từ đúng đường dẫn
import { Navbar } from './components/shared/Navbar';
import { Footer } from './components/shared/Footer';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Toaster position="top-right" />

      {/* Vùng bao ngoài cùng: 
        Sáng: nền trắng (bg-white), chữ đen (text-gray-900)
        Tối: nền xanh đen (dark:bg-[#0B0F19]), chữ trắng (dark:text-white)
      */}
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-[#0B0F19] dark:text-white font-sans">
        
        <Navbar />

        {/* Thẻ main chứa <Outlet /> sẽ tự động render Home.tsx hoặc các trang khác tùy theo URL */}
        <main>
          <Outlet />
        </main>

        <Footer />
        
      </div>
    </ThemeProvider>
  );
}