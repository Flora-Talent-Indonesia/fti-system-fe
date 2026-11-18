import { FTI_ANGKATAN_OPTIONS, FTI_KELAS_OPTIONS } from "@/data/dummy-fti-students";
import { GURU_PUSAT_OPTIONS, GURU_SISWA } from "../siswa";

export type AttendanceTrackId = "magang" | "ikusei" | "driver";
export type AttendanceMark = "Hadir" | "Izin" | "Sakit" | "Alpha";

export const SESSION_WINDOW = 10;

export type AbsensiStudent = {
  id: string;
  noPeserta: string;
  nama: string;
  katakana: string;
  angkatan: string;
  kelas: string;
  pusat: "Bogor" | "Jakarta";
};

export { FTI_ANGKATAN_OPTIONS, FTI_KELAS_OPTIONS, GURU_PUSAT_OPTIONS };

export type SessionRecord = {
  date: string | null;
  /** Tanggal sengaja dihapus; isi absen tetap, tanggal tidak muncul lagi sampai pertemuan dikosongkan. */
  dateDismissed?: boolean;
  marks: Record<string, AttendanceMark>;
};

export type AttendanceCounts = Record<AttendanceTrackId, number>;

export type AttendanceStore = {
  counts: AttendanceCounts;
  tracks: Record<AttendanceTrackId, SessionRecord[]>;
};

export const ATTENDANCE_TRACKS: {
  id: AttendanceTrackId;
  label: string;
  defaultSessions: number;
  min: number;
  max: number;
  hint: string;
}[] = [
  {
    id: "magang",
    label: "Magang",
    defaultSessions: 80,
    min: 10,
    max: 200,
    hint: "Default 80 pertemuan. Bisa diubah.",
  },
  {
    id: "ikusei",
    label: "Flora Ikusei",
    defaultSessions: 160,
    min: 160,
    max: 200,
    hint: "160–200 pertemuan.",
  },
  {
    id: "driver",
    label: "Driver",
    defaultSessions: 10,
    min: 10,
    max: 200,
    hint: "Jumlah masih dihitung. Angka ini sementara dan bisa diubah.",
  },
];

function buildRoster(): AbsensiStudent[] {
  return GURU_SISWA.map((siswa) => ({
    id: siswa.id,
    noPeserta: siswa.noPeserta,
    nama: siswa.nama,
    katakana: siswa.katakana,
    angkatan: siswa.angkatan,
    kelas: siswa.kelas,
    pusat: siswa.pusat,
  }));
}

export const ABSENSI_ROSTER: AbsensiStudent[] = buildRoster();

const STORAGE_KEY = "guru-dashboard-absensi";

function normalizeMark(mark: unknown): AttendanceMark | null {
  if (mark === "Alpa" || mark === "Alpha") return "Alpha";
  if (mark === "Hadir" || mark === "Izin" || mark === "Sakit") return mark;
  return null;
}

function emptySessions(count: number): SessionRecord[] {
  return Array.from({ length: count }, () => ({ date: null, marks: {} }));
}

export function defaultAttendanceCounts(): AttendanceCounts {
  return {
    magang: 80,
    ikusei: 160,
    driver: 10,
  };
}

export function emptyAttendanceStore(): AttendanceStore {
  const counts = defaultAttendanceCounts();
  return {
    counts,
    tracks: {
      magang: emptySessions(counts.magang),
      ikusei: emptySessions(counts.ikusei),
      driver: emptySessions(counts.driver),
    },
  };
}

export function clampSessionCount(trackId: AttendanceTrackId, value: number): number {
  const track = ATTENDANCE_TRACKS.find((item) => item.id === trackId) ?? ATTENDANCE_TRACKS[0];
  if (!Number.isFinite(value)) return track.defaultSessions;
  return Math.min(track.max, Math.max(track.min, Math.round(value)));
}

function sanitizeSession(row: unknown): SessionRecord {
  const date =
    row && typeof row === "object" && typeof (row as SessionRecord).date === "string"
      ? (row as SessionRecord).date
      : null;
  const rawMarks =
    row && typeof row === "object" && (row as SessionRecord).marks && typeof (row as SessionRecord).marks === "object"
      ? (row as SessionRecord).marks
      : {};
  const marks: Record<string, AttendanceMark> = {};
  Object.entries(rawMarks).forEach(([id, mark]) => {
    const normalized = normalizeMark(mark);
    if (normalized && /^[\w-]+$/.test(id)) marks[id] = normalized;
  });
  const hasMarks = Object.keys(marks).length > 0;
  const validDate = hasMarks && date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  const dateDismissed =
    hasMarks &&
    row &&
    typeof row === "object" &&
    (row as SessionRecord).dateDismissed === true &&
    validDate === null;
  return { date: validDate, dateDismissed, marks };
}

function sanitizeSessions(value: unknown, count: number): SessionRecord[] {
  const source = Array.isArray(value) ? value : [];
  const kept = source.map((row) => sanitizeSession(row));
  if (kept.length >= count) return kept;
  return [...kept, ...emptySessions(count - kept.length)];
}

export function readAttendanceStore(): AttendanceStore {
  const fresh = emptyAttendanceStore();
  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as Partial<AttendanceStore> & { N5?: unknown };
    const counts = defaultAttendanceCounts();
    (Object.keys(counts) as AttendanceTrackId[]).forEach((id) => {
      const stored = parsed.counts?.[id];
      counts[id] = clampSessionCount(id, typeof stored === "number" ? stored : counts[id]);
    });
    const legacyMagang = parsed.tracks?.magang ?? parsed.N5;
    return {
      counts,
      tracks: {
        magang: sanitizeSessions(legacyMagang, counts.magang),
        ikusei: sanitizeSessions(parsed.tracks?.ikusei, counts.ikusei),
        driver: sanitizeSessions(parsed.tracks?.driver, counts.driver),
      },
    };
  } catch {
    return fresh;
  }
}

export function writeAttendanceStore(store: AttendanceStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/** Pertemuan tetap setiap Senin, mulai 2 November 2026. Bukan tanggal yang diketik guru. */
const SCHEDULE_START_UTC = Date.UTC(2026, 10, 2, 12);

export function sessionDateISO(index: number): string {
  const date = new Date(SCHEDULE_START_UTC + index * 7 * 24 * 60 * 60 * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatSessionChip(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function formatSessionLong(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

