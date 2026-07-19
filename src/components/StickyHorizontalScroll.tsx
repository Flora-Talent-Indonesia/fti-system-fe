'use client';

import { type CSSProperties, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Geser awal track scrollbar agar sejajar setelah kolom sticky kiri */
  trackInsetLeft?: number | string;
};

export default function StickyHorizontalScroll({
  children,
  className = '',
  trackInsetLeft,
}: Props) {
  const style: CSSProperties | undefined =
    trackInsetLeft !== undefined
      ? {
          ['--scroll-track-inset-left' as string]:
            typeof trackInsetLeft === 'number' ? `${trackInsetLeft}px` : trackInsetLeft,
        }
      : undefined;

  return (
    <div
      className={`overflow-x-auto custom-scrollbar ${trackInsetLeft !== undefined ? 'custom-scrollbar-inset' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
