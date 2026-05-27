import React, { useRef, useState, MouseEvent, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalTrackProps {
  children: React.ReactNode;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export const HorizontalTrack: React.FC<HorizontalTrackProps> = ({ 
  children, 
  onLoadMore, 
  hasMore, 
  isLoading 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const frameId = useRef<number | null>(null);

  // Click mũi tên dịch chuyển mượt (Giữ nguyên)
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (frameId.current) cancelAnimationFrame(frameId.current);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    if (frameId.current) cancelAnimationFrame(frameId.current);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();

    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Tốc độ lướt theo tay

    if (frameId.current) cancelAnimationFrame(frameId.current);
    
    frameId.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
      }
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current || !onLoadMore || !hasMore || isLoading) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    if (scrollWidth - scrollLeft - clientWidth < 150) {
      onLoadMore();
    }
  };

  useEffect(() => {
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, []);

  return (
    <div className="relative group w-full">
      {/* Nút Mũi tên Trái */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:text-blue-600 group-hover:flex dark:border-white/10 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:text-blue-400 md:-left-6"
        aria-label="Scroll Left"
      >
        <ChevronLeft size={28} />
      </button>

      {/* CONTAINER CHÍNH - ĐÃ XOÁ BỎ HOÀN TOÀN SNAP VÀ TỐI ƯU DRAG HOVER */}
      <div
        ref={scrollRef}
        className={`flex w-full gap-6 overflow-x-auto py-6 px-4 pb-8 select-none transition-colors duration-200
          ${isDragging ? "cursor-grabbing [&>*]:pointer-events-none" : "cursor-grab"} 
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        `}
        style={{ willChange: isDragging ? "scroll-position" : "auto" }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
      >
        {children}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex w-32 shrink-0 items-center justify-center">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-600"></span>
            </span>
          </div>
        )}
      </div>

      {/* Nút Mũi tên Phải */}
      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:text-blue-600 group-hover:flex dark:border-white/10 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:text-blue-400 md:-right-6"
        aria-label="Scroll Right"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};