"use client";

import { useEffect, useState } from "react";

/** Jam live untuk tampilan dashboard (FE testing — tanpa sync server). */
export function useLiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}
