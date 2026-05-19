import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/shared/Navbar';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Toaster position="top-right" />

      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Navbar />

        <main>
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}