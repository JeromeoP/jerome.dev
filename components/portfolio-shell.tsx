"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CommandPalette } from "@/components/command-palette";
import { CursorTrail } from "@/components/cursor-trail";
import { KonamiToast } from "@/components/konami-toast";
import { Nav } from "@/components/nav";
import { ProgressBar } from "@/components/progress-bar";
import { TimeWidget } from "@/components/time-widget";
import { useDarkMode } from "@/lib/use-dark-mode";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function PortfolioShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { toggle: toggleDarkMode } = useDarkMode();

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const dismissToast = useCallback(() => setToastMessage(null), []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let idx = 0;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const expected = KONAMI_CODE[idx];
      const keyMatches =
        e.key === expected || e.key.toLowerCase() === expected.toLowerCase();
      if (keyMatches) {
        idx += 1;
        if (idx === KONAMI_CODE.length) {
          const nowDark = toggleDarkMode();
          showToast(
            nowDark
              ? "You found it. Welcome to dark mode."
              : "Back to the light.",
          );
          idx = 0;
        }
      } else {
        idx = 0;
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggleDarkMode, showToast]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const section = document.querySelector(href);
      if (!section) return;
      e.preventDefault();
      section.scrollIntoView({ behavior: "smooth" });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const paletteContext = useMemo(
    () => ({ toggleDarkMode, showToast }),
    [toggleDarkMode, showToast],
  );

  return (
    <>
      <ProgressBar />
      <CursorTrail />
      <Nav onOpenPalette={openPalette} />
      <CommandPalette
        isOpen={paletteOpen}
        onClose={closePalette}
        context={paletteContext}
      />
      <TimeWidget />
      <KonamiToast message={toastMessage} onDismiss={dismissToast} />
    </>
  );
}
