// src/app/hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Thu dọn timer cũ nếu value hoặc delay thay đổi trước khi timer chạy xong
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}