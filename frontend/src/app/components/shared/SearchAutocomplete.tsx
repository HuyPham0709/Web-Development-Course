// frontend/src/app/components/shared/SearchAutocomplete.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { useDebounce } from "../../../hooks/useDebounce";

export interface AutocompleteItem {
  id: string | number;
  label: string;
  description?: string;
  category?: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  initialValue?: string;
  onSelect: (item: AutocompleteItem) => void;
  onInputChange?: (value: string) => void;
  onCustomSubmit?: (value: string) => void;
  onFetchSuggestions: (query: string, signal: AbortSignal) => Promise<AutocompleteItem[]>;
}

type SearchStatus = "idle" | "loading" | "success" | "error";

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  placeholder = "Tìm kiếm việc làm, kỹ năng...",
  className = "",
  initialValue = "",
  onSelect,
  onInputChange,
  onCustomSubmit,
  onFetchSuggestions,
}) => {
  const [query, setQuery] = useState<string>(initialValue);
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  
  // THÊM CỜ NÀY: Dùng để chặn fetch API khi user click chọn item
  const skipFetchRef = useRef<boolean>(false); 
  
  const debouncedQuery = useDebounce<string>(query, 200);

  // Đồng bộ hóa khi giá trị khởi tạo thay đổi từ URL bên ngoài
  useEffect(() => {
    if (initialValue !== query) {
      skipFetchRef.current = true; // Không bật dropdown nếu chữ thay đổi do load từ URL
      setQuery(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setStatus("idle");
      setIsOpen(false);
      return;
    }

    // NẾU CỜ ĐANG BẬT (Do click chọn item hoặc load URL) -> KHÔNG LÀM GÌ CẢ
    if (skipFetchRef.current) {
      return;
    }

    const abortController = new AbortController();

    const loadSuggestions = async () => {
        setStatus("loading");
        setIsOpen(true);
        try {
            // THÊM DÒNG NÀY: Ép hệ thống delay thêm 500ms (nửa giây) để nhìn rõ Skeleton Loading
            await new Promise((resolve) => setTimeout(resolve, 200));

            const data = await onFetchSuggestions(debouncedQuery, abortController.signal);
            setSuggestions(data);
            setStatus("success");
            setActiveIndex(-1); 
        } catch (error: any) {
            if (error.name !== "AbortError" && error.name !== "CanceledError") {
            setStatus("error");
            setSuggestions([]);
            }
        }
    };

    loadSuggestions();

    return () => {
      abortController.abort();
    };
  }, [debouncedQuery, onFetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    skipFetchRef.current = false; // Tắt cờ đi để cho phép fetch API vì user ĐANG TỰ GÕ
    
    const val = e.target.value;
    setQuery(val);
    if (onInputChange) onInputChange(val);
    if (!isOpen) setIsOpen(true);
  }, [isOpen, onInputChange]);

  const handleSelectItem = useCallback((item: AutocompleteItem) => {
    skipFetchRef.current = true; // Bật cờ lên để chặn cái useEffect gọi API vô duyên
    
    setQuery(item.label);
    if (onInputChange) onInputChange(item.label);
    onSelect(item);
    
    // Tắt ngóm menu ngay lập tức
    setIsOpen(false);
    setSuggestions([]);
    setStatus("idle");
  }, [onSelect, onInputChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelectItem(suggestions[activeIndex]);
      } else {
        if (onCustomSubmit) onCustomSubmit(query);
        setIsOpen(false);
      }
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  }, [isOpen, suggestions, activeIndex, handleSelectItem, onCustomSubmit, query]);

  const renderLoadingSkeleton = useMemo(() => (
    <div className="p-3 space-y-2.5">
      <div className="space-y-1">
        <Skeleton className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-800" />
        <Skeleton className="h-3 w-1/2 rounded bg-gray-100 dark:bg-zinc-800/60" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-4 w-2/3 rounded bg-gray-200 dark:bg-zinc-800" />
        <Skeleton className="h-3 w-1/3 rounded bg-gray-100 dark:bg-zinc-800/60" />
      </div>
    </div>
  ), []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <Input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        role="combobox"
        className="w-full border-none bg-transparent shadow-none focus-visible:ring-0 text-sm text-gray-900 placeholder-gray-500 outline-none dark:text-white dark:placeholder-gray-400"
      />

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-64 w-full min-w-[14rem] overflow-y-auto rounded-2xl border border-gray-200/80 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-[#0B0F19]/95">
          {status === "loading" && renderLoadingSkeleton}

          {status === "error" && (
            <div className="p-4 text-center text-sm font-medium text-red-500 bg-red-50/50 dark:bg-red-950/20 rounded-xl m-1">
              An error occurred while loading suggestions.
            </div>
          )}

          {status === "success" && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-400 dark:text-gray-500 font-medium">
              Unable to find a suitable job.
            </div>
          )}

          {status === "success" && suggestions.length > 0 && (
            <ul role="listbox" className="space-y-0.5">
              {suggestions.map((item, index) => {
                const isSelected = index === activeIndex;
                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`group flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl cursor-pointer select-none transition-all duration-150 outline-none
                      ${isSelected 
                        ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20" 
                        : "hover:bg-gray-100/80 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300"
                      }
                    `}
                  >
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className={`font-semibold line-clamp-1 ${isSelected ? "text-white" : "text-gray-900 dark:text-zinc-100"}`}>
                        {item.label}
                      </span>
                      {item.description && (
                        <span className={`text-xs mt-0.5 line-clamp-1 transition-colors ${isSelected ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}>
                          🏢 {item.description}
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-all duration-150 shrink-0
                      ${isSelected 
                        ? "bg-white/20 text-white opacity-100 transform translate-x-0" 
                        : "bg-gray-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0"
                      }
                    `}>
                      <span>Take</span>
                      <span className="text-[10px]">→</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};