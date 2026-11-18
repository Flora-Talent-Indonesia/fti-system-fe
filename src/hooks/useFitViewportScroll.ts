import { useLayoutEffect, useRef, useState } from "react";

/**
 * Tinggi area tabel mengikuti sisa layar.
 * Isi yang lebih tinggi digulir di dalam tabel. Isi yang lebih pendek menyusut.
 */
export function useFitViewportScroll(enabled: boolean) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>();

  useLayoutEffect(() => {
    if (!enabled) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const main = scroller.closest("main");

    const measure = () => {
      const node = scrollerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      if (rect.width < 1) return;
      const scale = rect.width / node.offsetWidth || 1;
      const footerH = footerRef.current?.getBoundingClientRect().height ?? 0;
      const pad = main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 0;
      const top = rect.top + window.scrollY;
      const available = window.innerHeight - top - footerH - pad;
      const next = Math.max(160, Math.round(available / scale));
      setMaxHeight((current) => (current !== undefined && Math.abs(current - next) < 2 ? current : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (main) observer.observe(main);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled]);

  return { scrollerRef, footerRef, maxHeight };
}
