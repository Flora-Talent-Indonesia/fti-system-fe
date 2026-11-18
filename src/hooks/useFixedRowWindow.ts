import { useLayoutEffect, useRef, useState } from "react";

/** Tinggi jendela tabel tetap setinggi header + N baris. Baris selebihnya di-scroll di dalam tabel. */
export function useFixedRowWindow(rowCount: number, visibleRows = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const head = root.querySelector("thead");
    const row = root.querySelector("tbody tr");
    if (!(head instanceof HTMLElement) || !(row instanceof HTMLElement)) {
      setMaxHeight(undefined);
      return;
    }
    const horizontalBar = root.scrollWidth > root.clientWidth ? 10 : 0;
    const next = head.offsetHeight + row.offsetHeight * visibleRows + horizontalBar;
    setMaxHeight((current) => (current === next ? current : next));
  }, [rowCount, visibleRows]);

  return { ref, maxHeight };
}
