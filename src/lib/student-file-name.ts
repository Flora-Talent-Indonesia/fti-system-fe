/** Nama unduhan satu siswa: "Jenis file - Nama siswa". */
export function studentFileName(kind: string, studentName: string) {
  const clean = (value: string) => value.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ").trim();
  return `${clean(kind) || "File"} - ${clean(studentName) || "Siswa"}`;
}
