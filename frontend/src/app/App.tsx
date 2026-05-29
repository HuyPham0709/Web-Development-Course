// frontend/src/App.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

// Import Navbar và Footer
import { Navbar } from './components/shared/Navbar';
import { Footer } from './components/shared/Footer';
import ViewedByEmployers from '../app/components/candidate/profile/ViewedByEmployers';
// 🔥 IMPORT CHATBOT TẠI ĐÂY
import ChatbotFloating from './components/shared/ChatbotFloating';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Toaster position="top-right" />

      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-[#0B0F19] dark:text-white font-sans relative">
        
        <Navbar />
          
        <main>
          <Outlet />
        </main>

        <Footer />
        
        {/* 🔥 ĐẶT CHATBOT Ở ĐÂY ĐỂ NÓ XUẤT HIỆN TRÊN TOÀN BỘ HỆ THỐNG */}
        <ChatbotFloating />
        
      </div>
    </ThemeProvider>
  );
}