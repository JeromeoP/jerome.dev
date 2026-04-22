"use client";

import { useCallback, useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggle = useCallback(() => {
    let next = false;
    setIsDark((prev) => {
      next = !prev;
      return next;
    });
    return next;
  }, []);

  return { isDark, toggle };
}
