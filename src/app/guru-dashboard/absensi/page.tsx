"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardCheck } from "lucide-react";
import PortalPageShell from "@/components/PortalPageShell";
import SearchField from "@/components/SearchField";
import StickyHorizontalScroll from "@/components/StickyHorizontalScroll";
import {
  attendanceTrackForJalur,
  kelasSelectLabel,
  loadKelasList,
  meetingCountForTrack,
  studentMatchesOpenKelas,
  visibleKelas,
} from "@/lib/fti-kelas-storage";
import { omitInactiveByNumber } from "@/lib/fti-student-account-storage";
import { assignedLpkGuruSiswa } from "../lpk-members";
import type { GuruSiswa } from "../siswa";
import type { KelasJalur, KelasRecord } from "@/types/student-account";
import AttendanceDial, { type DialChoice } from "./AttendanceDial";
import {
  ABSENSI_ROSTER,
  ATTENDANCE_TRACKS,
  GURU_PUSAT_OPTIONS,
  SESSION_WINDOW,
  formatSessionChip,
  readAttendanceStore,
  sessionDateISO,
  writeAttendanceStore,
  type AttendanceMark,
  type AttendanceStore,
  type AttendanceTrackId,
  type SessionRecord,
} from "./data";

const FILTER_SELECT =
  "h-10 cursor-pointer border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-primary-pink focus:outline-none";

const HEAD = "px-4 py-2 font-semibold border-b border-gray-200 bg-gray-100";
const CELL = "px-4 py-1 text-gray-700";

const MARK_GLYPH: Record<AttendanceMark, string> = {
  Hadir: "H",
  Izin: "I",
  Sakit: "S",
  Alpha: "A",
};

function markTone(mark: AttendanceMark | undefined, active: boolean) {
  if (mark === "Hadir") return "bg-emerald-500 text-white";
  if (mark === "Izin") return "bg-amber-400 text-amber-950";
  if (mark === "Sakit") return "bg-sky-500 text-white";
  if (mark === "Alpha") return "bg-rose-500 text-white";
  if (active) return "bg-primary-pink-light text-gray-300";
  return "bg-white text-gray-300 hover:bg-primary-pink-light hover:text-primary-pink";
}

function meetingPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
  }
  return Array.from(pages).sort((left, right) => left - right);
}

function stampSession(session: SessionRecord, index: number, marks: Record<string, AttendanceMark>): SessionRecord {
  const filled = Object.keys(marks).length > 0;
  if (!filled) return { ...session, marks, date: null, dateDismissed: false };
  if (session.dateDismissed) return { ...session, marks, date: null, dateDismissed: true };
  return { ...session, marks, date: session.date ?? sessionDateISO(index), dateDismissed: false };
}

function countMarks(session: SessionRecord, studentIds: string[]) {
  const values = studentIds.map((id) => session.marks[id]).filter((mark): mark is AttendanceMark => Boolean(mark));
  const hadir = values.filter((mark) => mark === "Hadir").length;
  const izin = values.filter((mark) => mark === "Izin").length;
  const sakit = values.filter((mark) => mark === "Sakit").length;
  const alpha = values.filter((mark) => mark === "Alpha").length;
  return { hadir, izin, sakit, alpha, belum: studentIds.length - hadir - izin - sakit - alpha };
}

type PickerState = {
  sessionIndex: number;
  studentId: string;
  studentName: string;
  anchorX: number;
  anchorY: number;
};

export default function AbsensiPage() {
  const [track, setTrack] = useState<AttendanceTrackId>("magang");
  const [openJalur, setOpenJalur] = useState<KelasJalur>("magang");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPusat, setFilterPusat] = useState("Semua");
  const [filterKelas, setFilterKelas] = useState("");
  const [store, setStore] = useState<AttendanceStore | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [sessionPage, setSessionPage] = useState(0);
  const [dateMenu, setDateMenu] = useState<{ index: number; x: number; y: number } | null>(null);
  const [kelasList, setKelasList] = useState<KelasRecord[]>([]);
  const [lpkRoster, setLpkRoster] = useState<GuruSiswa[]>([]);
  const skipSave = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionPageRef = useRef(0);
  const sessionCountRef = useRef(80);

  useEffect(() => {
    setStore(readAttendanceStore());
    const loadKelas = () => {
      setKelasList(loadKelasList());
      setLpkRoster(assignedLpkGuruSiswa());
    };
    loadKelas();
    window.addEventListener("focus", loadKelas);
    return () => window.removeEventListener("focus", loadKelas);
  }, []);

  useEffect(() => {
    if (!store) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    writeAttendanceStore(store);
  }, [store]);

  const trackInfo = ATTENDANCE_TRACKS.find((item) => item.id === track) ?? ATTENDANCE_TRACKS[0];
  const kelasOptions = useMemo(() => visibleKelas(kelasList, filterPusat), [kelasList, filterPusat]);
  const students = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const roster = [
      ...ABSENSI_ROSTER,
      ...lpkRoster.map((siswa) => ({
        id: siswa.id,
        noPeserta: siswa.noPeserta,
        nama: siswa.nama,
        katakana: siswa.katakana,
        angkatan: siswa.angkatan,
        kelas: siswa.kelas,
        pusat: siswa.pusat,
      })),
    ];
    return omitInactiveByNumber(roster, (student) => student.noPeserta).filter((student) => {
      if (!studentMatchesOpenKelas(kelasList, student, filterPusat, openJalur, filterKelas)) return false;
      if (!query) return true;
      return (
        student.nama.toLowerCase().includes(query) ||
        student.noPeserta.toLowerCase().includes(query) ||
        student.katakana.toLowerCase().includes(query)
      );
    });
  }, [kelasList, lpkRoster, filterPusat, openJalur, filterKelas, searchTerm]);
  const sessions = store?.tracks[track] ?? [];
  const sessionCount = useMemo(() => {
    if (track === "driver") return store?.counts.driver ?? trackInfo.defaultSessions;
    const jalur = track === "magang" ? "magang" : "tg";
    if (filterKelas.startsWith("id:")) {
      const kelas = kelasList.find((row) => String(row.id_kelas) === filterKelas.slice(3));
      if (kelas?.cabang) return meetingCountForTrack(kelasList, jalur, kelas.cabang, kelas.nama_kelas);
    }
    const nama = filterKelas.startsWith("nama:") ? filterKelas.slice(5) : "Semua";
    return meetingCountForTrack(kelasList, jalur, filterPusat, nama);
  }, [track, store?.counts.driver, trackInfo.defaultSessions, kelasList, filterPusat, filterKelas]);
  const sessionPageCount = Math.max(1, Math.ceil(sessionCount / SESSION_WINDOW));
  const windowStart = Math.min(sessionPage, sessionPageCount - 1) * SESSION_WINDOW;
  const windowEnd = Math.min(sessionCount, windowStart + SESSION_WINDOW);
  const visibleSessionIndexes = Array.from({ length: Math.max(0, windowEnd - windowStart) }, (_, offset) => windowStart + offset);
  sessionPageRef.current = windowStart / SESSION_WINDOW;
  sessionCountRef.current = sessionCount;
  const selectedSession = selected !== null ? sessions[selected] : undefined;
  const visibleIds = useMemo(() => students.map((student) => student.id), [students]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) < 24 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      const atStart = root.scrollLeft <= 1;
      const atEnd = root.scrollLeft + root.clientWidth >= root.scrollWidth - 2;
      const count = sessionCountRef.current;
      const last = Math.max(0, Math.ceil(count / SESSION_WINDOW) - 1);
      const page = sessionPageRef.current;
      if (event.deltaX > 0 && atEnd && page < last) {
        event.preventDefault();
        setSessionPage(page + 1);
        root.scrollTo({ left: 0 });
      } else if (event.deltaX < 0 && atStart && page > 0) {
        event.preventDefault();
        setSessionPage(page - 1);
        root.scrollTo({ left: 0 });
      }
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [students.length]);

  useEffect(() => {
    if (dateMenu === null) return;
    const close = () => setDateMenu(null);
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [dateMenu]);

  const updateSession = (index: number, recipe: (session: SessionRecord) => SessionRecord) => {
    setStore((prev) => {
      if (!prev) return prev;
      const nextSessions = prev.tracks[track].map((session, sessionIndex) =>
        sessionIndex === index ? recipe(session) : session,
      );
      return { ...prev, tracks: { ...prev.tracks, [track]: nextSessions } };
    });
  };

  const shiftSessionWindow = (delta: number) => {
    setDateMenu(null);
    setSessionPage((page) => {
      const last = Math.max(0, Math.ceil(sessionCount / SESSION_WINDOW) - 1);
      return Math.min(last, Math.max(0, page + delta));
    });
    scrollRef.current?.scrollTo({ left: 0 });
  };

  const dismissDate = (index: number) => {
    setDateMenu(null);
    updateSession(index, (session) => ({ ...session, date: null, dateDismissed: true }));
  };

  useEffect(() => {
    if (!store) return;
    if ((store.tracks[track]?.length ?? 0) >= sessionCount) return;
    setStore((prev) => {
      if (!prev) return prev;
      const current = prev.tracks[track] ?? [];
      if (current.length >= sessionCount) return prev;
      return {
        ...prev,
        tracks: {
          ...prev.tracks,
          [track]: [
            ...current,
            ...Array.from({ length: sessionCount - current.length }, () => ({ date: null, marks: {} })),
          ],
        },
      };
    });
  }, [store, track, sessionCount]);

  const openPicker = (index: number, studentId: string, studentName: string, anchor: HTMLElement) => {
    if (!store) return;
    const rect = anchor.getBoundingClientRect();
    setPicker({
      sessionIndex: index,
      studentId,
      studentName,
      anchorX: rect.left + rect.width / 2,
      anchorY: rect.top + rect.height / 2,
    });
    setSelected(index);
  };

  const chooseMark = (choice: DialChoice) => {
    if (!picker) return;
    const { sessionIndex, studentId } = picker;
    setPicker(null);
    setSelected(sessionIndex);
    updateSession(sessionIndex, (session) => {
      const marks = { ...session.marks };
      if (choice === "hapus") delete marks[studentId];
      else marks[studentId] = choice;
      return stampSession(session, sessionIndex, marks);
    });
  };

  const resetSessionView = () => {
    setSelected(null);
    setPicker(null);
    setSessionPage(0);
    setDateMenu(null);
    scrollRef.current?.scrollTo({ left: 0 });
  };

  const openTrack = (jalur: KelasJalur | null | undefined) => {
    const nextJalur: KelasJalur =
      jalur === "tg" || jalur === "reguler" || jalur === "job_matching" ? jalur : "magang";
    setOpenJalur(nextJalur);
    setTrack(attendanceTrackForJalur(nextJalur));
  };

  const changePusat = (pusat: string) => {
    setFilterPusat(pusat);
    if (filterKelas.startsWith("id:")) {
      const kelas = kelasList.find((row) => String(row.id_kelas) === filterKelas.slice(3));
      if (kelas && pusat !== "Semua" && kelas.cabang !== pusat) setFilterKelas("");
    }
    resetSessionView();
  };

  const changeKelas = (value: string) => {
    setFilterKelas(value);
    if (value.startsWith("id:")) {
      const kelas = kelasList.find((row) => String(row.id_kelas) === value.slice(3));
      if (kelas) openTrack(kelas.jalur);
    }
    resetSessionView();
  };

  const summary = selectedSession ? countMarks(selectedSession, visibleIds) : null;
  const pickerMark = picker ? sessions[picker.sessionIndex]?.marks[picker.studentId] : undefined;

  return (
    <PortalPageShell>
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden px-4 py-4 md:px-6">
        <header className="mb-4 flex shrink-0 flex-wrap items-center justify-end gap-3">
          <div className="mr-auto flex min-w-0 items-center gap-4">
            <Link
              href="/guru-dashboard"
              className="border border-gray-300 bg-transparent p-3 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
              title="Kembali ke portal sensei"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <h1 className="flex min-w-0 items-center gap-2 font-serif text-3xl tracking-wide text-gray-900">
              <ClipboardCheck className="shrink-0 text-primary-pink" size={26} strokeWidth={1.5} />
              <span className="truncate">
                Absensi{" "}
                <span className="ml-1 font-sans text-lg font-normal tracking-normal text-gray-400">(出席)</span>
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <SearchField className="w-56" variant="box" placeholder="Cari siswa" value={searchTerm} onChange={setSearchTerm} />
            <select
              value={filterPusat}
              onChange={(event) => changePusat(event.target.value)}
              className={FILTER_SELECT}
              aria-label="TC"
            >
              <option value="Semua">Semua TC</option>
              {GURU_PUSAT_OPTIONS.map((pusat) => (
                <option key={pusat} value={pusat}>
                  {pusat}
                </option>
              ))}
            </select>
            <select
              value={kelasOptions.some((kelas) => `id:${kelas.id_kelas}` === filterKelas) ? filterKelas : ""}
              onChange={(event) => changeKelas(event.target.value)}
              className={FILTER_SELECT}
              aria-label="Kelas"
            >
              <option value="">Pilih kelas</option>
              {kelasOptions.map((kelas) => (
                <option key={kelas.id_kelas} value={`id:${kelas.id_kelas}`}>
                  {kelasSelectLabel(kelas, kelasOptions)}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="profil-siswa-jukyu relative z-10 flex min-h-0 w-full max-h-full flex-col border border-gray-300 bg-white shadow-sm">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">
                {filterKelas.startsWith("id:") ? `${students.length} siswa` : "Pilih kelas"}
              </span>
              <span>
                {selected === null ? "Pilih nomor sesi, lalu isi kehadiran di sel siswa." : (
                  <>
                    Sesi {selected + 1} · Hadir {summary?.hadir} · Izin {summary?.izin} · Sakit {summary?.sakit} · Alpha{" "}
                    {summary?.alpha} · Belum {summary?.belum}
                  </>
                )}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              <span className="hidden items-center gap-1 xl:inline-flex">
                <i className="grid h-4 w-4 place-items-center bg-emerald-500 text-[10px] font-bold text-white not-italic">H</i>
                Hadir
              </span>
              <span className="hidden items-center gap-1 xl:inline-flex">
                <i className="grid h-4 w-4 place-items-center bg-amber-400 text-[10px] font-bold text-amber-950 not-italic">I</i>
                Izin
              </span>
              <span className="hidden items-center gap-1 xl:inline-flex">
                <i className="grid h-4 w-4 place-items-center bg-sky-500 text-[10px] font-bold text-white not-italic">S</i>
                Sakit
              </span>
              <span className="hidden items-center gap-1 xl:inline-flex">
                <i className="grid h-4 w-4 place-items-center bg-rose-500 text-[10px] font-bold text-white not-italic">A</i>
                Alpha
              </span>
            </div>
          </div>

          {students.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-500">{filterKelas.startsWith("id:") ? "Tidak ada siswa pada kelas ini." : "Silahkan pilih kelas."}</p>
            </div>
          ) : (
            <>
              <StickyHorizontalScroll ref={scrollRef} className="guru-absensi-scroll max-h-[calc(100dvh-16rem)] min-h-0 w-full min-w-0">
                <table className="admin-data-table guru-absensi-fill text-left text-[15px] whitespace-nowrap">
                  <thead className="sticky top-0 z-20 bg-gray-100 text-sm uppercase text-gray-700">
                    <tr>
                      <th scope="col" className={`${HEAD} sticky left-0 top-0 z-30 min-w-[64px] border-r`}>
                        NO
                      </th>
                      <th scope="col" className={`${HEAD} sticky left-[64px] top-0 z-30 min-w-[148px] border-r`}>
                        実習生番号
                        <br />
                        <span className="text-xs font-normal normal-case text-gray-500">ID Peserta</span>
                      </th>
                      <th scope="col" className={`${HEAD} admin-sticky-split-right sticky left-[212px] top-0 z-30 min-w-[220px] border-r`}>
                        実習生本名
                        <br />
                        <span className="text-xs font-normal normal-case text-gray-500">Nama</span>
                      </th>
                      {filterPusat === "Semua" ? (
                        <th scope="col" className={`${HEAD} sticky top-0 z-20`}>
                          訓練センター
                          <br />
                          <span className="text-xs font-normal normal-case text-gray-500">Pusat</span>
                        </th>
                      ) : null}
                      {filterKelas.startsWith("id:") ? null : (
                        <th scope="col" className={`${HEAD} sticky top-0 z-20`}>
                          クラス
                          <br />
                          <span className="text-xs font-normal normal-case text-gray-500">Kelas</span>
                        </th>
                      )}
                      {visibleSessionIndexes.map((index) => {
                        const active = selected === index;
                        const session = sessions[index];
                        const dateLabel = session?.date ? formatSessionChip(session.date) : "";
                        return (
                          <th
                            key={`sesi-${index}`}
                            scope="col"
                            className={`${HEAD} sticky top-0 z-20 w-[104px] min-w-[104px] px-1 text-center ${active ? "bg-primary-pink-light" : ""}`}
                          >
                            <div className="flex flex-col items-center leading-none">
                              <button
                                type="button"
                                onClick={() => setSelected(index)}
                                title={`Sesi ${index + 1}`}
                                className="w-full"
                              >
                                {index + 1}
                              </button>
                              {dateLabel ? (
                                <button
                                  type="button"
                                  title="Klik untuk hapus tanggal"
                                  onPointerDown={(event) => event.stopPropagation()}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    const rect = event.currentTarget.getBoundingClientRect();
                                    setDateMenu({ index, x: rect.left + rect.width / 2, y: rect.bottom + 6 });
                                  }}
                                  className="mt-1 min-h-[12px] text-[10px] font-medium normal-case tabular-nums tracking-normal text-gray-600 underline decoration-dotted underline-offset-2"
                                >
                                  {dateLabel}
                                </button>
                              ) : (
                                <span className="mt-1 min-h-[12px]" />
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, rowIndex) => (
                      <tr key={student.id} className="group bg-white transition-colors hover:bg-slate-50">
                        <td className={`${CELL} sticky left-0 z-10 min-w-[64px] border-r bg-white font-medium text-gray-900 transition-colors group-hover:bg-slate-50`}>
                          {rowIndex + 1}
                        </td>
                        <td className={`${CELL} sticky left-[64px] z-10 border-r bg-white text-sm font-semibold text-blue-600 transition-colors group-hover:bg-slate-50`}>
                          {student.noPeserta}
                        </td>
                        <td className={`${CELL} admin-sticky-split-right sticky left-[212px] z-10 border-r bg-white font-medium text-gray-900 transition-colors group-hover:bg-slate-50`}>
                          <span className="block text-xs font-normal leading-tight tracking-wide text-gray-500">{student.katakana}</span>
                          <span className="block leading-tight">{student.nama}</span>
                        </td>
                        {filterPusat === "Semua" ? <td className={CELL}>{student.pusat}</td> : null}
                        {filterKelas.startsWith("id:") ? null : <td className={CELL}>{student.kelas}</td>}
                        {visibleSessionIndexes.map((index) => {
                          const mark = sessions[index]?.marks[student.id];
                          const active = selected === index;
                          return (
                            <td
                              key={`${student.id}-${index}`}
                              className={`${CELL} text-center ${active ? "bg-primary-pink-light group-hover:bg-primary-pink-light" : "bg-white group-hover:bg-slate-50"}`}
                            >
                              <button
                                type="button"
                                onClick={(event) => openPicker(index, student.id, student.nama, event.currentTarget)}
                                title={
                                  mark
                                    ? `${student.nama}, sesi ${index + 1}: ${mark}`
                                    : `${student.nama}, sesi ${index + 1}: belum diisi`
                                }
                                className="mx-auto grid h-7 w-7 place-items-center text-base font-bold leading-none"
                              >
                                <span
                                  className={`grid h-7 w-7 place-items-center ${
                                    mark ? markTone(mark, false) : "border border-gray-200 bg-white text-gray-300"
                                  }`}
                                >
                                  {mark ? MARK_GLYPH[mark] : "·"}
                                </span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </StickyHorizontalScroll>
              <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Pertemuan{" "}
                  <span className="font-semibold text-gray-700">{sessionCount === 0 ? 0 : windowStart + 1}</span>
                  {" – "}
                  <span className="font-semibold text-gray-700">{windowEnd}</span>
                  {" dari "}
                  <span className="font-semibold text-gray-700">{sessionCount}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => shiftSessionWindow(-1)}
                    disabled={windowStart === 0}
                    className="inline-flex h-9 w-9 items-center justify-center border border-gray-300 bg-white text-gray-600 transition-colors hover:border-[#fc809f] hover:text-[#fc809f] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="10 pertemuan sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {meetingPageNumbers(windowStart / SESSION_WINDOW + 1, sessionPageCount).map((page, index, pages) => {
                    const previous = pages[index - 1];
                    const active = page === windowStart / SESSION_WINDOW + 1;
                    return (
                      <span key={page} className="flex items-center gap-1">
                        {previous != null && page - previous > 1 ? <span className="px-1 text-xs text-gray-400">…</span> : null}
                        <button
                          type="button"
                          onClick={() => shiftSessionWindow(page - (windowStart / SESSION_WINDOW + 1))}
                          className={`inline-flex h-9 min-w-9 items-center justify-center border px-2 text-sm transition-colors ${
                            active
                              ? "border-[#fc809f] bg-[#fc809f] text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:border-[#fc809f] hover:text-[#fc809f]"
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => shiftSessionWindow(1)}
                    disabled={windowEnd >= sessionCount}
                    className="inline-flex h-9 w-9 items-center justify-center border border-gray-300 bg-white text-gray-600 transition-colors hover:border-[#fc809f] hover:text-[#fc809f] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="10 pertemuan berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      {picker && (
        <AttendanceDial
          studentName={picker.studentName}
          sessionLabel={`Sesi ${picker.sessionIndex + 1}`}
          currentMark={pickerMark}
          anchorX={picker.anchorX}
          anchorY={picker.anchorY}
          onClose={() => setPicker(null)}
          onChoose={chooseMark}
        />
      )}
      {dateMenu && (
        <div
          className="fixed z-[80]"
          style={{ left: dateMenu.x, top: dateMenu.y, transform: "translateX(-50%)" }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => dismissDate(dateMenu.index)}
            className="border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-md hover:bg-rose-50"
          >
            Hapus tanggal
          </button>
        </div>
      )}
    </PortalPageShell>
  );
}
