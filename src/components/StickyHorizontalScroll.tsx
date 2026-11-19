'use client';

import { forwardRef, useEffect, useRef, type CSSProperties, type ReactNode, type Ref } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Geser awal track scrollbar agar sejajar setelah kolom sticky kiri */
  trackInsetLeft?: number | string;
  /** Batas tinggi area tabel. Isi yang lebih panjang di-scroll di dalam area ini. */
  maxHeight?: number;
};

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

/**
 * Jarak kiri kolom sticky ditulis tetap (left: 340px, dst).
 * Kalau kolom sebelumnya melebar, jarak itu tertinggal dan koreksi zoom
 * menarik sel ke kiri, sehingga muncul celah sebelum kolom berikutnya.
 * Jarak dikunci ulang ke posisi asli tiap kolom.
 */
function syncStickyLeft(scroller: HTMLElement) {
  const head = scroller.querySelector("thead tr");
  if (!head) return;
  const lefts: number[] = [];
  let left = 0;
  for (const cell of head.children) {
    if (!(cell instanceof HTMLElement)) break;
    const specified = getComputedStyle(cell);
    const sticksLeft = specified.position === "sticky" && specified.right === "auto" && specified.left !== "auto";
    if (!sticksLeft) break;
    lefts.push(left);
    left += cell.offsetWidth;
  }
  if (!lefts.length) return;
  scroller.querySelectorAll("tr").forEach((row) => {
    lefts.forEach((left, index) => {
      const cell = row.children[index];
      if (!(cell instanceof HTMLElement)) return;
      const next = `${left}px`;
      if (cell.style.left !== next) cell.style.left = next;
    });
  });
}

/**
 * zoom pada kartu tabel menggeser kolom sticky saat area tabel digulir.
 * Koreksi ini mengukur selisihnya dan menarik sel kembali ke posisi yang benar.
 */
function pinZoomedSticky(scroller: HTMLElement) {
  const zoomRoot = scroller.closest('.profil-siswa-jukyu');
  const zoom = zoomRoot ? Number(getComputedStyle(zoomRoot).zoom) || 1 : 1;
  if (Math.abs(zoom - 1) < 0.01) return;

  const box = scroller.getBoundingClientRect();
  if (box.width < 1 || scroller.offsetWidth < 1) return;
  const scale = box.width / scroller.offsetWidth;
  const contentRight = box.left + scroller.clientWidth * scale;
  const nodes = scroller.querySelectorAll<HTMLElement>("thead, [class*='sticky']");

  nodes.forEach((el) => {
    const position = getComputedStyle(el).position;
    if (position !== 'sticky') return;
    const specified = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const appliedX = Number(el.dataset.pinX || 0);
    const appliedY = Number(el.dataset.pinY || 0);
    let nextX = 0;
    let nextY = 0;

    if (specified.left !== 'auto') {
      const expected = box.left + (parseFloat(specified.left) || 0) * scale;
      nextX = (expected - (rect.left - appliedX * scale)) / scale;
    } else if (specified.right !== 'auto') {
      nextX = (contentRight - (rect.right - appliedX * scale)) / scale;
    }

    if (specified.top !== 'auto' && el.tagName === 'THEAD') {
      const expected = box.top + (parseFloat(specified.top) || 0) * scale;
      nextY = (expected - (rect.top - appliedY * scale)) / scale;
    }

    if (Math.abs(nextX) < 1.5) nextX = 0;
    if (Math.abs(nextY) < 1.5) nextY = 0;
    if (Math.abs(nextX - appliedX) < 0.5 && Math.abs(nextY - appliedY) < 0.5) return;

    if (!nextX && !nextY) {
      el.style.translate = '';
      delete el.dataset.pinX;
      delete el.dataset.pinY;
      return;
    }

    el.style.translate = `${nextX}px ${nextY}px`;
    el.dataset.pinX = String(nextX);
    el.dataset.pinY = String(nextY);
  });
}

const StickyHorizontalScroll = forwardRef<HTMLDivElement, Props>(function StickyHorizontalScroll(
  { children, className = '', trackInsetLeft, maxHeight },
  ref,
) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const style: CSSProperties & Record<`--${string}`, string> = {};
  if (trackInsetLeft !== undefined) {
    style["--scroll-track-inset-left"] =
      typeof trackInsetLeft === "number" ? `${trackInsetLeft}px` : trackInsetLeft;
  }
  if (maxHeight) style.maxHeight = maxHeight;

  useEffect(() => {
    const scroller = localRef.current;
    if (!scroller) return;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncStickyLeft(scroller);
        pinZoomedSticky(scroller);
      });
    };
    schedule();
    scroller.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const table = scroller.querySelector("table");
    const observer = new ResizeObserver(schedule);
    if (table) observer.observe(table);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [children, maxHeight]);

  return (
    <div
      ref={(node) => {
        localRef.current = node;
        assignRef(ref, node);
      }}
      className={`overflow-x-auto overflow-y-auto custom-scrollbar ${trackInsetLeft !== undefined ? 'custom-scrollbar-inset' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
});

export default StickyHorizontalScroll;
