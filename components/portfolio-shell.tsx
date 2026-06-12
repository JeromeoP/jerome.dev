"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CommandPalette } from "@/components/command-palette";
import { Cursor } from "@/components/cursor";
import { Grain } from "@/components/grain";
import { KonamiToast } from "@/components/konami-toast";
import { MenuOverlay } from "@/components/menu-overlay";
import { Nav } from "@/components/nav";
import { Preloader } from "@/components/preloader";
import { ProgressBar } from "@/components/progress-bar";
import { SmoothScroll } from "@/components/smooth-scroll";
import { scrollToTarget } from "@/lib/scroll";
import { toggleWireframe } from "@/lib/wireframe";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const dismissToast = useCallback(() => setToastMessage(null), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setMenuOpen(false);
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
          const enabled = toggleWireframe();
          showToast(
            enabled
              ? "Wireframe mode — a tribute to v1"
              : "Back to the smoke",
          );
          idx = 0;
        }
      } else {
        idx = 0;
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showToast]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      if (!document.querySelector(href)) return;
      e.preventDefault();
      scrollToTarget(href);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const paletteContext = useMemo(
    () => ({ toggleWireframe: () => toggleWireframe(), showToast }),
    [showToast],
  );

  return (
    <>
      <SmoothScroll />
      <Preloader />
      <Grain />
      <Cursor />
      <ProgressBar />
      <Nav
        onOpenPalette={openPalette}
        onToggleMenu={toggleMenu}
        isMenuOpen={menuOpen}
      />
      <MenuOverlay isOpen={menuOpen} onClose={closeMenu} />
      <CommandPalette
        isOpen={paletteOpen}
        onClose={closePalette}
        context={paletteContext}
      />
      <KonamiToast message={toastMessage} onDismiss={dismissToast} />
    </>
  );
}
