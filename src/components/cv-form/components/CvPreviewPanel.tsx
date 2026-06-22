"use client";

import { useEffect, useState } from "react";
import type { CVData } from "../types";
import CVTemplate from "./CVTemplate";

type Props = {
  data: CVData;
  fixedScale?: number;
  className?: string;
  exportElementId?: string;
  allowDownload?: boolean;
};

export default function CvPreviewPanel({
  data,
  fixedScale,
  className = "",
  exportElementId = "cv-export-root",
  allowDownload = false,
}: Props) {
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fitScale =
    fixedScale ?? Math.min(Math.max((viewportWidth - 64) / 794, 0.25), 1);

  return (
    <div
      className={`overflow-auto bg-[#d1d5db] ${allowDownload ? "" : "select-none"} ${className}`}
      onContextMenu={allowDownload ? undefined : (e) => e.preventDefault()}
    >
      <div className="p-4 flex justify-center min-h-full">
        <div style={{ width: 794 * fitScale, position: "relative" }}>
          <div
            id={exportElementId}
            style={{
              width: 794,
              transformOrigin: "top left",
              transform: `scale(${fitScale})`,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <CVTemplate data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
