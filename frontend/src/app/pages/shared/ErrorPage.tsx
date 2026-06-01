import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();

  // Handle specifically for 404 Not Found error
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">Page Not Found</h2>
        <p className="mt-2 text-gray-500 max-w-md">
          The page you are trying to access does not exist or has been moved.
        </p>
        <Link 
          to="/" 
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to home
        </Link>
      </div>
    );
  }

  // Handle system errors (Component crash, API call blocking render, etc.)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">An unexpected error occurred!</h2>
      <p className="mt-2 text-gray-500 max-w-md">
        Sorry for the inconvenience. Please reload the page or return to the homepage.
      </p>
      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Reload page
        </button>
        <Link 
          to="/" 
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to home
        </Link>
      </div>
    </div>
  );
}