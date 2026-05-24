// src/app/components/public/home/ScrollTrack.tsx
import React, { useEffect, useRef } from "react";

interface ScrollTrackProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

export const ScrollTrack: React.FC<ScrollTrackProps> = ({ onLoadMore, hasMore, isLoading, children }) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Chỉ cần chạm vào vùng rootMargin là kích hoạt
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { 
        threshold: 0, // Đổi từ 1.0 thành 0
        rootMargin: "200px" // Load trước khi cuộn chạm đáy 200px cho mượt
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div className="w-full">
      {children}
      
      {/* Vùng theo dõi nằm dưới cùng của danh sách */}
      <div ref={observerTarget} className="h-20 w-full mt-4 flex items-center justify-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-current"></span>
            </span>
            <span className="text-sm font-medium">Loading more jobs...</span>
          </div>
        )}
        {!hasMore && !isLoading && (
          <p className="text-gray-500 dark:text-gray-400 text-sm py-4">You've reached the end of the feed.</p>
        )}
      </div>
    </div>
  );
};