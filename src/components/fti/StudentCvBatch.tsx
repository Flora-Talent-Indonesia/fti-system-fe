"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CVTemplate from "@/components/cv-form/components/CVTemplate";
import { lpkStudentToCvData } from "@/lib/cv-to-lpk-student";
import { exportCvPages } from "@/lib/export-cv-pdf";
import { studentFileName } from "@/lib/student-file-name";
import type { LpkStudentRecord } from "@/types/lpk-student";

export const FILE_BTN =
  "inline-flex items-center border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700 hover:border-gray-500 hover:bg-gray-50";

export default function StudentCvBatch({
  students,
  onDone,
}: {
  students: LpkStudentRecord[];
  onDone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      if (cancelled || !rootRef.current) return;
      const pages = Array.from(rootRef.current.querySelectorAll<HTMLElement>("[data-cv-page]"));
      const fileName =
        students.length === 1
          ? studentFileName("CV", students[0].nama_lengkap)
          : `CV - ${students.length} siswa`;
      await exportCvPages(pages, fileName);
      if (!cancelled) onDoneRef.current();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [students]);

  return createPortal(
    <div ref={rootRef} aria-hidden className="pointer-events-none fixed top-0 -left-[12000px] w-[794px]">
      {students.map((student) => (
        <div key={student.id} data-cv-page>
          <CVTemplate data={lpkStudentToCvData(student)} />
        </div>
      ))}
    </div>,
    document.body
  );
}
