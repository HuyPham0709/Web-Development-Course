import React, { useRef, useState, MouseEvent } from "react";
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
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleScroll = () => {
    if (!scrollRef.current || !onLoadMore || !hasMore || isLoading) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    if (scrollWidth - scrollLeft - clientWidth < 150) {
      onLoadMore();
    }
  };

  return (
    <div className="relative group w-full">
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:text-blue-600 group-hover:flex dark:border-white/10 dark:bg-gray-900/90 dark:text-gray-300 dark:hover:text-blue-400 md:-left-6"
        aria-label="Scroll Left"
      >
        <ChevronLeft size={28} />
      </button>

      <div
        ref={scrollRef}
        // ĐIỂM MẤU CHỐT Ở ĐÂY:
        // isDragging = true: Tắt snap, tắt smooth -> Kéo tức thì, theo tay chuột 100%
        // isDragging = false: Bật lại snap và smooth -> Thả tay ra card tự động hít vào giữa mượt mà
        className={`flex w-full gap-6 overflow-x-auto py-6 px-4 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
          isDragging 
            ? "cursor-grabbing select-none [&>*]:pointer-events-none" 
            : "cursor-grab snap-x snap-mandatory scroll-smooth"
        }`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onScroll={handleScroll}
      >
        {children}

        {isLoading && (
          <div className="flex w-32 shrink-0 items-center justify-center snap-end">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-75"></span>
              <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-600"></span>
            </span>
          </div>
        )}
      </div>

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