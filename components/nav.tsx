"use client";

import { useEffect, useState } from "react";

interface NavProps {
  onOpenPalette: () => void;
}

export function Nav({ onOpenPalette }: NavProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } })
        .userAgentData?.platform ?? navigator.platform ?? "";
    const ua = navigator.userAgent;
    setIsMac(/mac|iphone|ipad|ipod/i.test(platform) || /mac/i.test(ua));
  }, []);

  useEffect(() => {
    let lastScroll = 0;
    function handleScroll() {
      const current = window.scrollY;
      setIsHidden(current > lastScroll && current > 100);
      lastScroll = current;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-[100] flex items-center justify-between border-b border-black/[0.04] px-12 py-5 backdrop-blur-xl transition-transform duration-300 ease-out max-md:px-6 max-md:py-4 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{ background: "color-mix(in srgb, var(--bg) 72%, transparent)" }}
    >
      <div className="font-display text-xl font-bold -tracking-[0.5px]">
        jerome<span className="text-accent">.</span>
      </div>
      <div className="flex items-center gap-8">
        <ul className="flex list-none gap-8 max-md:hidden">
          {[
            { href: "#about", label: "About" },
            { href: "#projects", label: "Projects" },
            { href: "#contact", label: "Contact" },
            { href: "#playground", label: "Playground" },
          ].map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-accent transition-[width] duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-bg px-3 py-1.5 font-mono text-xs text-text-muted transition-all duration-200 hover:border-accent-light hover:text-accent max-md:hidden"
          aria-label="Open command palette"
        >
          <kbd
            className={`rounded border border-border bg-bg-card font-mono text-[11px] ${
              isMac ? "px-1.5 py-[1px]" : "px-1 py-[1px] text-[10px]"
            }`}
          >
            {isMac ? "⌘" : "Ctrl"}
          </kbd>
          <kbd className="rounded border border-border bg-bg-card px-1.5 py-[1px] font-mono text-[11px]">
            K
          </kbd>
        </button>
      </div>
    </nav>
  );
}
