import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './Navbar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 flex flex-col relative transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Simple Footer */}
      <footer className="w-full border-t border-gray-100 dark:border-slate-800 py-10 bg-gray-50 dark:bg-slate-900 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} jobspot. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
