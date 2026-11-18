'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Download, Pencil } from 'lucide-react';
import SearchField from '@/components/SearchField';
import LoadingOverlay from '@/components/LoadingOverlay';
import PortalPageShell from '@/components/PortalPageShell';
import StickyHorizontalScroll from '@/components/StickyHorizontalScroll';
import { guruJalurMode, kelasSelectLabel, loadKelasList, studentMatchesOpenKelas, visibleKelas } from '@/lib/fti-kelas-storage';
import type { KelasJalur, KelasRecord } from '@/types/student-account';
import ProgressEditModal from './components/ProgressEditModal';
import PrintTableModal from './components/PrintTableModal';
import { aspectsConfig, AspectKey, ASPECTS_BY_JALUR, examStatus, gradeBand, GuruJalurMode, NilaiSaveScope, numericProgress, ProgressRow, ScoreValue, sikapProgress, SikapPeriod, SIKAP_PERIODS } from './data';
import { assignedLpkGuruSiswa } from '../lpk-members';
import { GURU_PUSAT_OPTIONS, GURU_SISWA } from '../siswa';
import { toast } from 'react-hot-toast';
import { omitInactiveByNumber } from '@/lib/fti-student-account-storage';

const FILTER_SELECT =
  "h-10 cursor-pointer border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-primary-pink focus:outline-none";
const HEAD = "px-4 py-2 font-semibold border-b border-gray-200 bg-gray-100";
const CELL = "px-4 py-1 text-gray-700";

const ScoreCell = ({ score }: { score: ScoreValue }) => {
  if (score === null || score === '-' || score === '') return <span className="text-gray-400">-</span>;

  const numScore = typeof score === 'string' ? parseInt(score, 10) : score;

  if (Number.isNaN(numScore)) return <span className="text-gray-700">{score}</span>;

  const band = gradeBand(numScore);
  return (
    <span className={band.className}>
      {score}
      {band.letter ? <span className="ml-1 text-[10px]">{band.letter}</span> : null}
    </span>
  );
};

const renderRatingBadge = (rating: ScoreValue) => {
  if (!rating || rating === '-') return <span className="text-gray-400 font-medium">-</span>;

  let val = String(rating);
  if (val === 'sangat_baik' || val.toLowerCase() === 'sangat baik') val = 'Sangat Baik';
  else if (val === 'baik' || val.toLowerCase() === 'baik') val = 'Baik';
  else if (val === 'cukup' || val.toLowerCase() === 'cukup') val = 'Cukup';
  else if (val === 'kurang' || val.toLowerCase() === 'kurang') val = 'Kurang';
  else if (val === 'sangat_kurang' || val.toLowerCase() === 'sangat kurang') val = 'Sangat Kurang';
  const ratingMap: Record<string, { jp: string; id: string }> = {
    'Sangat Baik': { jp: '非常に良い', id: 'Sangat Baik' },
    'Baik': { jp: '良い', id: 'Baik' },
    'Cukup': { jp: '普通', id: 'Cukup' },
    'Kurang': { jp: '悪い', id: 'Kurang' },
    'Sangat Kurang': { jp: '非常に悪い', id: 'Sangat Kurang' },
  };

  const info = ratingMap[val];
  if (!info) return <span className="text-gray-700 font-semibold">{val}</span>;

  return (
    <div className="flex flex-col items-center text-gray-800">
      <span className="text-[12px] leading-tight font-bold">{info.jp}</span>
      <span className="text-[10px] leading-none uppercase mt-0.5 tracking-wider font-semibold text-gray-500">{info.id}</span>
    </div>
  );
};

// Helper to calculate average
const calculateAverage = (scores: Record<string, ScoreValue>) => {
  let total = 0;
  let count = 0;
  Object.values(scores).forEach(score => {
    if (score !== null && score !== '-') {
      const num = typeof score === 'string' ? parseInt(score) : score;
      if (!isNaN(num)) {
        total += num;
        count++;
      }
    }
  });
  return count === 0 ? '-' : Math.round(total / count);
};

export default function ProgressBelajarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [draftRow, setDraftRow] = useState<ProgressRow | null>(null);
  const [activeAspect, setActiveAspect] = useState<AspectKey>('praktek');
  const [jalur, setJalur] = useState<GuruJalurMode>('magang');
  const [selectedPusat, setSelectedPusat] = useState('Semua');
  const [sikapPeriod, setSikapPeriod] = useState<SikapPeriod>("01");
  const [selectedClass, setSelectedClass] = useState("");
  const [kelasList, setKelasList] = useState<KelasRecord[]>([]);
  const savedClassApplied = useRef(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadKelas = () => setKelasList(loadKelasList());
    loadKelas();
    window.addEventListener("focus", loadKelas);
    return () => window.removeEventListener("focus", loadKelas);
  }, []);

  useEffect(() => {
    if (savedClassApplied.current || kelasList.length === 0) return;
    savedClassApplied.current = true;
    const saved = localStorage.getItem("progressBelajar_selectedClass");
    if (!saved || saved === "Semua Kelas" || saved.startsWith("nama:")) return;
    const savedId = saved.startsWith("id:") ? saved.slice(3) : "";
    const matches = kelasList.filter((row) => row.is_active === 1 && (savedId ? String(row.id_kelas) === savedId : row.nama_kelas === saved));
    if (matches.length !== 1) return;
    const kelas = matches[0];
    setSelectedClass(`id:${kelas.id_kelas}`);
    const mode = guruJalurMode(kelas.jalur);
    if (mode === "magang") return;
    setJalur(mode);
    const allowed = ASPECTS_BY_JALUR[mode];
    setActiveAspect((current) => (allowed.includes(current) ? current : allowed[0]));
  }, [kelasList]);

  // Frontend-only: no API connection yet
  const reloadProgressRows = async (): Promise<ProgressRow[] | null> => {
    return null;
  };

  useEffect(() => {
    const ratings = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Sangat Kurang'];
    const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const rndScore = () => {
      const r = Math.random();
      if (r < 0.05) return null;
      if (r < 0.15) return rnd(55, 69);
      if (r < 0.55) return rnd(70, 84);
      return rnd(85, 100);
    };
    const rndRating = () => {
      const r = Math.random();
      if (r < 0.1) return null;
      return ratings[Math.floor(r * ratings.length)];
    };
    const fillColumns = (aspect: AspectKey) => {
      const scores: Record<string, ScoreValue> = {};
      aspectsConfig[aspect].columns.forEach((col) => {
        if (aspect === 'sikap') {
          scores[col.key] = rndRating() ?? '-';
          return;
        }
        const value = rndScore();
        scores[col.key] = value === null ? '-' : value;
      });
      return scores;
    };

    const toRow = (siswa: (typeof GURU_SISWA)[number], id: number): ProgressRow => {
      const kotoba = fillColumns('kotoba');
      const bunpou = fillColumns('bunpou');
      const choukai = fillColumns('choukai');
      const kaiwa = fillColumns('kaiwa');
      const kanji = fillColumns('kanji');
      const praktek = fillColumns('praktek');
      const praktekKaigo = fillColumns('praktek_kaigo');
      const sikap = Object.fromEntries(
        SIKAP_PERIODS.map((period) => [period.id, fillColumns('sikap')]),
      ) as ProgressRow['sikap'];

      return {
        id,
        no_peserta: siswa.noPeserta,
        nama_lengkap: siswa.nama,
        nama_katakana: siswa.katakana,
        kelas: siswa.kelas,
        pusat: siswa.pusat,
        perusahaan: siswa.perusahaan,
        program: siswa.program,
        job: siswa.job,
        ujian_n5: 'Belum',
        ujian_n4: 'Belum',
        ujian_n5_score: '-',
        ujian_n4_score: '-',
        keterangan: '-',
        keterangans: {
          kotoba: 'Perlu latihan lebih intensif',
          kaiwa: 'Komunikasi cukup baik',
          praktek: 'Praktek magang',
          praktek_kaigo: 'Praktek kaigo',
          sikap: 'Sikap baik dan kooperatif',
        },
        progress_percentages: {
          kotoba: numericProgress(kotoba, aspectsConfig.kotoba.columns),
          bunpou: numericProgress(bunpou, aspectsConfig.bunpou.columns),
          choukai: numericProgress(choukai, aspectsConfig.choukai.columns),
          kaiwa: numericProgress(kaiwa, aspectsConfig.kaiwa.columns),
          kanji: numericProgress(kanji, aspectsConfig.kanji.columns),
          praktek: numericProgress(praktek, aspectsConfig.praktek.columns),
          praktek_kaigo: numericProgress(praktekKaigo, aspectsConfig.praktek_kaigo.columns),
          sikap: sikapProgress(sikap.akhir, aspectsConfig.sikap.columns),
        },
        revisions: { aspects: {}, sub_nilai: '', sikap: '' },
        kotoba,
        bunpou,
        choukai,
        kaiwa,
        kanji,
        praktek,
        praktek_kaigo: praktekKaigo,
        sikap,
      };
    };

    const ftiRows = omitInactiveByNumber(GURU_SISWA, (siswa) => siswa.noPeserta).map((siswa, idx) => toRow(siswa, idx + 1));
    const lpkRows = omitInactiveByNumber(assignedLpkGuruSiswa(), (siswa) => siswa.noPeserta).map((siswa, idx) => toRow(siswa, 100000 + idx));
    setProgressRows([...ftiRows, ...lpkRows]);
    setIsLoading(false);
  }, []);

  const aspectOptions = ASPECTS_BY_JALUR[jalur];
  const kelasOptions = useMemo(() => visibleKelas(kelasList, selectedPusat), [kelasList, selectedPusat]);
  const selectedKelas = useMemo(
    () => kelasList.find((row) => selectedClass === `id:${row.id_kelas}`) ?? null,
    [kelasList, selectedClass],
  );
  const openKelasJalur: KelasJalur =
    selectedKelas?.jalur || (jalur === "driver" ? "job_matching" : jalur === "tg" ? "tg" : "magang");

  const progressOf = (row: ProgressRow) => {
    if (activeAspect === 'sikap') return sikapProgress(row.sikap[sikapPeriod], aspectsConfig.sikap.columns);
    return row.progress_percentages?.[activeAspect] || 0;
  };

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return progressRows
      .filter((row) => {
        if (!studentMatchesOpenKelas(kelasList, { kelas: row.kelas, pusat: row.pusat }, selectedPusat, openKelasJalur, selectedClass)) return false;
        if (!query) return true;
        return (
          row.nama_lengkap.toLowerCase().includes(query) ||
          row.no_peserta.toLowerCase().includes(query) ||
          (row.nama_katakana ?? "").toLowerCase().includes(query) ||
          row.perusahaan.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap, "id"));
  }, [progressRows, searchTerm, selectedClass, selectedPusat, openKelasJalur, kelasList]);

  const openEdit = (row: ProgressRow) => {
    setEditingRowId(row.id);
    setDraftRow(JSON.parse(JSON.stringify(row))); // deep copy
  };

  const closeEdit = () => {
    setEditingRowId(null);
    setDraftRow(null);
  };

  const saveEdit = async (dirtyScopes: NilaiSaveScope[]) => {
    if (!draftRow || editingRowId === null || dirtyScopes.length === 0) return;

    try {
      setProgressRows((prev) => prev.map((r) => (r.id === editingRowId ? { ...draftRow } : r)));
      closeEdit();
      toast.success('Penilaian siswa berhasil diperbarui');
    } catch (e) {
      console.error(e);
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const rememberClass = (value: string) => {
    if (!value.startsWith("id:")) return;
    localStorage.setItem("progressBelajar_selectedClass", value);
  };

  const followKelas = (kelas: KelasRecord) => {
    const next = guruJalurMode(kelas.jalur);
    if (next === jalur) return;
    setJalur(next);
    const allowed = ASPECTS_BY_JALUR[next];
    if (!allowed.includes(activeAspect)) {
      setActiveAspect(allowed[0]);
      scrollRef.current?.scrollTo({ left: 0 });
    }
  };

  const changePusat = (pusat: string) => {
    setSelectedPusat(pusat);
    if (!selectedClass.startsWith("id:")) return;
    const kelas = kelasList.find((row) => `id:${row.id_kelas}` === selectedClass);
    if (kelas && pusat !== "Semua" && kelas.cabang !== pusat) setSelectedClass("");
  };

  const changeKelas = (value: string) => {
    setSelectedClass(value);
    rememberClass(value);
    if (!value.startsWith("id:")) return;
    const kelas = kelasList.find((row) => `id:${row.id_kelas}` === value);
    if (kelas) followKelas(kelas);
  };

  const setDraftField = (field: string, value: any, aspect?: AspectKey) => {
    setDraftRow((prev) => {
      if (!prev) return prev;
      let newDraft: ProgressRow;
      if (aspect === 'sikap') {
        newDraft = {
          ...prev,
          sikap: {
            ...prev.sikap,
            [sikapPeriod]: { ...prev.sikap[sikapPeriod], [field]: value },
          },
        };
      } else if (aspect) {
        newDraft = { ...prev, [aspect]: { ...prev[aspect], [field]: value } };
      } else {
        newDraft = { ...prev, [field]: value };
      }

      newDraft.progress_percentages = { ...newDraft.progress_percentages };
      (Object.keys(aspectsConfig) as AspectKey[]).forEach((key) => {
        if (key === 'sikap') {
          newDraft.progress_percentages.sikap = sikapProgress(newDraft.sikap[sikapPeriod], aspectsConfig.sikap.columns);
          return;
        }
        newDraft.progress_percentages[key] = numericProgress(newDraft[key], aspectsConfig[key].columns);
      });
      return newDraft;
    });
  };

  const currentConfig = aspectsConfig[activeAspect];
  const scoreColumns = currentConfig.columns;

  return (
    <PortalPageShell>
    <main className="flex h-dvh min-h-0 flex-col overflow-hidden px-4 py-4 md:px-6">
      {isLoading && <LoadingOverlay text="MEMUAT DATA..." fixed={true} />}
      <header className="mb-4 flex shrink-0 flex-wrap items-center justify-end gap-3">
        <div className="mr-auto flex min-w-0 items-center gap-4">
          <Link
            href="/guru-dashboard"
            className="border border-gray-300 bg-transparent p-3 text-gray-500 transition-colors hover:bg-gray-200/50 hover:text-gray-900"
            title="Kembali ke portal sensei"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <h1 className="flex items-center gap-2 font-serif text-3xl tracking-wide text-gray-900">
            <BookOpen className="shrink-0 text-primary-pink" size={26} strokeWidth={1.5} />
            <span className="truncate">
              Penilaian <span className="ml-1 font-sans text-lg font-normal tracking-normal text-gray-400">(評価)</span>
            </span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <SearchField className="w-56" variant="box" placeholder="Cari siswa" value={searchTerm} onChange={setSearchTerm} />
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex h-10 items-center gap-2 border border-emerald-700 bg-white px-3 text-sm text-emerald-700 hover:bg-emerald-700 hover:text-white"
          >
            <Download size={14} strokeWidth={1.5} />
            Unduh
          </button>
          <select
            id="aspect-select"
            aria-label="Aspek"
            value={activeAspect}
            onChange={(event) => {
              setActiveAspect(event.target.value as AspectKey);
            }}
            className={FILTER_SELECT}
          >
            {aspectOptions.map((key) => (
              <option key={key} value={key}>{aspectsConfig[key].label}</option>
            ))}
          </select>
          {activeAspect === "sikap" ? (
            <select
              id="sikap-period"
              aria-label="Bulan"
              value={sikapPeriod}
              onChange={(event) => setSikapPeriod(event.target.value as SikapPeriod)}
              className={FILTER_SELECT}
            >
              {SIKAP_PERIODS.map((period) => (
                <option key={period.id} value={period.id}>{period.label}</option>
              ))}
            </select>
          ) : null}
          <select id="pusat-select" aria-label="TC" value={selectedPusat} onChange={(event) => changePusat(event.target.value)} className={FILTER_SELECT}>
            <option value="Semua">Semua TC</option>
            {GURU_PUSAT_OPTIONS.map((pusat) => (
              <option key={pusat} value={pusat}>{pusat}</option>
            ))}
          </select>
          <select
            id="class-select"
            aria-label="Kelas"
            value={kelasOptions.some((kelas) => `id:${kelas.id_kelas}` === selectedClass) ? selectedClass : ""}
            onChange={(event) => changeKelas(event.target.value)}
            className={FILTER_SELECT}
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

      <div className="profil-siswa-jukyu relative z-10 flex min-h-0 w-full max-h-full flex-col border border-gray-300 bg-white shadow-sm">
        {filteredRows.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-500">{selectedClass.startsWith("id:") ? "Tidak ada siswa pada kelas ini." : "Silahkan pilih kelas."}</p>
          </div>
        ) : (
          <>
            <StickyHorizontalScroll ref={scrollRef} className="guru-nilai-scroll max-h-[calc(100dvh-16rem)] min-h-0 w-full min-w-0">
              <table className="admin-data-table guru-nilai-fill text-left text-[15px] whitespace-nowrap">
                <thead className="sticky top-0 z-20 bg-gray-100 text-sm uppercase text-gray-700">
                  <tr>
                    <th scope="col" className={`${HEAD} sticky left-0 top-0 z-30 min-w-[64px] border-r`}>NO</th>
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
                    {selectedPusat === "Semua" ? (
                      <th scope="col" className={`${HEAD} sticky top-0 z-20`}>
                        訓練センター
                        <br />
                        <span className="text-xs font-normal normal-case text-gray-500">Pusat</span>
                      </th>
                    ) : null}
                    <th scope="col" className={`${HEAD} sticky top-0 z-20`}>
                      企業名
                      <br />
                      <span className="text-xs font-normal normal-case text-gray-500">Perusahaan</span>
                    </th>
                    {scoreColumns.map((col) => {
                      const [head, ...detail] = col.label.split(" · ");
                      return (
                        <th key={col.key} scope="col" className={`${HEAD} sticky top-0 z-20 min-w-[7.5rem] px-3 text-center`}>
                          <span className="block whitespace-nowrap font-semibold normal-case">{head}</span>
                          {detail.length > 0 ? (
                            <span className="block whitespace-nowrap text-xs font-normal normal-case text-gray-500">{detail.join(" · ")}</span>
                          ) : null}
                        </th>
                      );
                    })}
                    <th scope="col" className={`${HEAD} sticky top-0 z-20 text-center`}>
                      N5
                      <br />
                      <span className="text-xs font-normal normal-case text-gray-500">Status</span>
                    </th>
                    <th scope="col" className={`${HEAD} sticky top-0 z-20 text-center`}>
                      N4
                      <br />
                      <span className="text-xs font-normal normal-case text-gray-500">Status</span>
                    </th>
                    <th scope="col" className={`${HEAD} sticky top-0 z-20 text-center`}>
                      進捗
                      <br />
                      <span className="text-xs font-normal normal-case text-gray-500">Progress</span>
                    </th>
                    <th scope="col" className={`${HEAD} sticky top-0 z-20 text-center`}>
                      平均
                      <br />
                      <span className="text-xs font-normal normal-case text-gray-500">Rata-rata</span>
                    </th>
                    <th scope="col" className={`${HEAD} sticky top-0 z-20`}>
                      備考
                      <br />
                      <span className="text-xs font-normal normal-case text-gray-500">Keterangan</span>
                    </th>
                    <th scope="col" className={`${HEAD} admin-sticky-split-left sticky right-0 top-0 z-30 min-w-[5.5rem] bg-gray-100 text-center`}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((student, rowIndex) => {
                    const scores = activeAspect === "sikap" ? student.sikap[sikapPeriod] || {} : student[activeAspect];
                    return (
                      <tr key={student.id} className="group bg-white transition-colors hover:bg-slate-50">
                        <td className={`${CELL} sticky left-0 z-10 border-r bg-white font-medium text-gray-900 transition-colors group-hover:bg-slate-50`}>
                          {rowIndex + 1}
                        </td>
                        <td className={`${CELL} sticky left-[64px] z-10 border-r bg-white text-sm font-semibold text-blue-600 transition-colors group-hover:bg-slate-50`}>
                          {student.no_peserta}
                        </td>
                        <td className={`${CELL} admin-sticky-split-right sticky left-[212px] z-10 border-r bg-white font-medium text-gray-900 transition-colors group-hover:bg-slate-50`}>
                          <span className="block text-xs font-normal leading-tight tracking-wide text-gray-500">{student.nama_katakana || "—"}</span>
                          <span className="block leading-tight">{student.nama_lengkap}</span>
                        </td>
                        {selectedPusat === "Semua" ? <td className={CELL}>{student.pusat}</td> : null}
                        <td className={CELL}>{student.perusahaan}</td>
                        {scoreColumns.map((col) => (
                          <td key={col.key} className={`${CELL} border-r px-3 text-center`}>
                            {activeAspect === "sikap" ? renderRatingBadge(scores[col.key]) : <ScoreCell score={scores[col.key]} />}
                          </td>
                        ))}
                        <td className={`${CELL} text-center`}>{examStatus(student.ujian_n5)}</td>
                        <td className={`${CELL} text-center`}>{examStatus(student.ujian_n4)}</td>
                        <td className={`${CELL} text-center tabular-nums`}>{progressOf(student)}%</td>
                        <td className={`${CELL} text-center font-semibold`}>
                          <ScoreCell score={calculateAverage(scores)} />
                        </td>
                        <td className={`${CELL} max-w-[180px] truncate`} title={student.keterangans?.[activeAspect] || "-"}>
                          {student.keterangans?.[activeAspect] || "-"}
                        </td>
                        <td className={`${CELL} admin-sticky-split-left sticky right-0 z-10 bg-white text-center transition-colors group-hover:bg-slate-50`}>
                          <button
                            type="button"
                            onClick={() => openEdit(student)}
                            className="inline-flex items-center gap-1 border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:border-primary-pink hover:text-primary-pink"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </StickyHorizontalScroll>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50/80 px-4 py-3">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-800">{filteredRows.length} siswa</span>
                <span className="mx-2 text-gray-300">·</span>
                {aspectsConfig[activeAspect].label}
                {activeAspect === "sikap" ? (
                  <>
                    <span className="mx-2 text-gray-300">·</span>
                    {SIKAP_PERIODS.find((period) => period.id === sikapPeriod)?.label}
                  </>
                ) : null}
              </p>
            </div>
          </>
        )}
      </div>


      <ProgressEditModal
        draft={draftRow}
        activeAspect={activeAspect}
        aspectOptions={aspectOptions}
        sikapPeriod={sikapPeriod}
        onSikapPeriodChange={setSikapPeriod}
        onClose={closeEdit}
        onSave={saveEdit}
        onFieldChange={setDraftField}
      />

      {showPrintModal && (
        <PrintTableModal
          rows={progressRows}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </main>
    </PortalPageShell>
  );
}
