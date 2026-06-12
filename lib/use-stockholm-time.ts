"use client";

import { useEffect, useState } from "react";

export function useStockholmTime(withSeconds = false): string | null {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...(withSeconds ? { second: "2-digit" } : {}),
      timeZone: "Europe/Stockholm",
      hour12: false,
    };
    function update() {
      setTime(new Date().toLocaleTimeString("en-SE", opts));
    }
    update();
    const id = setInterval(update, withSeconds ? 1000 : 10_000);
    return () => clearInterval(id);
  }, [withSeconds]);

  return time;
}
