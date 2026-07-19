'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Download, BookOpen, Pencil, Calculator, ChevronDown } from 'lucide-react';
import LoadingOverlay from '@/components/LoadingOverlay';
import StickyHorizontalScroll from '@/components/StickyHorizontalScroll';
import ProgressEditModal from './components/ProgressEditModal';
import PrintTableModal from './components/PrintTableModal';
import { aspectsConfig, AspectKey, AspectScores, ProgressRow, ScoreValue, mapApiUserToProgressRow, NilaiSaveScope, MATERI_ASPECTS, MateriAspect } from './data';
import { toast } from 'react-hot-toast';
import TablePagination from '@/components/TablePagination';
import { useTablePagination } from '@/hooks/useTablePagination';

// Helper component for scores
const ScoreCell = ({ score }: { score: ScoreValue }) => {
  if (score === null || score === '-') return <span className="text-gray-400">-</span>;

  const numScore = typeof score === 'string' ? parseInt(score) : score;

  if (isNaN(numScore)) return <span className="text-gray-700">{score}</span>;

  if (numScore >= 85) return <span className="font-semibold text-green-600">{score}</span>;
  if (numScore >= 75) return <span className="font-semibold text-yellow-600">{score}</span>;
  return <span className="font-semibold text-red-600">{score}</span>;
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

// Helper component for Progress Bar
const ProgressBar = ({ percentage }: { percentage: number }) => {
  return (
    <div className="flex items-center gap-2 w-40">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 40 ? 'bg-[#fc809f]/100' : 'bg-yellow-500'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-xs font-medium text-gray-600">{percentage}%</span>
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
  const [activeAspect, setActiveAspect] = useState<AspectKey>('kotoba');
  const [selectedClass, setSelectedClass] = useState<string>('Semua Kelas');

  useEffect(() => {
    const savedClass = localStorage.getItem('progressBelajar_selectedClass');
    if (savedClass) {
      setSelectedClass(savedClass);
    }
  }, []);

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    localStorage.setItem('progressBelajar_selectedClass', val);
  };
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Frontend-only: no API connection yet
  const reloadProgressRows = async (): Promise<ProgressRow[] | null> => {
    return null;
  };

  useEffect(() => {
    // Dummy data — 30 siswa
    const ratings = ['Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Sangat Kurang'];
    const classes = ['Kelas A', 'Kelas B', 'Kelas C'];
    const namaList = [
      'Andi Prasetyo', 'Budi Santoso', 'Citra Dewi', 'Dian Rahayu', 'Eka Putra',
      'Fajar Nugroho', 'Gita Permata', 'Hendra Wijaya', 'Indah Sari', 'Joko Susilo',
      'Kartika Wulandari', 'Lukman Hakim', 'Maya Anggraini', 'Nanda Pratama', 'Okta Rizky',
      'Putri Ayu', 'Qori Maulana', 'Rizal Fauzi', 'Sari Kusuma', 'Taufik Hidayat',
      'Ulfa Nadya', 'Vino Rahardjo', 'Winda Lestari', 'Xena Safira', 'Yusuf Ardianto',
      'Zahra Nabilah', 'Agus Setiawan', 'Bella Puspita', 'Cahyo Dwi', 'Dita Amelia',
    ];

    const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const rndScore = () => {
      const r = Math.random();
      if (r < 0.05) return null;
      if (r < 0.15) return rnd(60, 74);
      if (r < 0.55) return rnd(75, 84);
      return rnd(85, 100);
    };
    const rndRating = () => {
      const r = Math.random();
      if (r < 0.1) return null;
      return ratings[Math.floor(r * ratings.length)];
    };

    const buildBabScores = (prefix: string, count: number): AspectScores => {
      const scores: AspectScores = {};
      for (let i = 1; i <= count; i++) {
        const v = rndScore();
        scores[`${prefix}_${i}`] = v === null ? '-' : v;
      }
      return scores;
    };

    const rows: ProgressRow[] = namaList.map((nama, idx) => {
      const n5Score = rnd(0, 10) < 3 ? null : rnd(65, 100);
      const n4Score = rnd(0, 10) < 5 ? null : rnd(70, 100);

      const ujian_n5_score: ScoreValue = n5Score;
      const ujian_n4_score: ScoreValue = n4Score;

      const ujian_n5 = n5Score === null ? 'Belum' : n5Score >= 85 ? 'Lulus' : 'Remedial';
      const ujian_n4 = n4Score === null ? 'Belum' : n4Score >= 90 ? 'Lulus' : 'Remedial';

      const kotoba = buildBabScores('kotoba', 50);
      const bunpou = buildBabScores('bunpou', 50);
      const choukai = buildBabScores('choukai', 50);
      const kaiwa = buildBabScores('kaiwa', 50);
      const kanji = buildBabScores('kanji', 50);

      const kepribadian: AspectScores = {
        kedisiplinan: rndRating() ?? '-',
        kepribadian_diri: rndRating() ?? '-',
        cara_komunikasi: rndRating() ?? '-',
        kesopanan: rndRating() ?? '-',
        kontrol_emosi: rndRating() ?? '-',
        inisiatif: rndRating() ?? '-',
        percaya_diri: rndRating() ?? '-',
      };

      const calcPct = (scores: AspectScores) => {
        const vals = Object.values(scores);
        const passed = vals.filter(v => {
          if (!v || v === '-') return false;
          const n = typeof v === 'string' ? parseInt(v) : v;
          return !isNaN(n) && n >= 75;
        }).length;
        return vals.length === 0 ? 0 : Math.ceil((passed / vals.length) * 100);
      };

      const kepFilled = Object.values(kepribadian).filter(v => v && v !== '-').length;

      return {
        id: idx + 1,
        no_peserta: `FTI-${String(idx + 1).padStart(3, '0')}`,
        nama_lengkap: nama,
        kelas: classes[idx % 3],
        ujian_n5,
        ujian_n4,
        ujian_masuk: rnd(60, 100),
        ujian_n5_score,
        ujian_n4_score,
        keterangan: '-',
        keterangans: {
          kotoba: 'Perlu latihan lebih intensif',
          bunpou: '-',
          choukai: '-',
          kaiwa: 'Komunikasi cukup baik',
          kanji: '-',
          kepribadian: 'Sikap baik dan kooperatif',
        },
        progress_percentages: {
          kotoba: calcPct(kotoba),
          bunpou: calcPct(bunpou),
          choukai: calcPct(choukai),
          kaiwa: calcPct(kaiwa),
          kanji: calcPct(kanji),
          kepribadian: Math.ceil((kepFilled / 7) * 100),
        },
        revisions: { aspects: {}, sub_nilai: '', kepribadian: '' },
        kotoba,
        bunpou,
        choukai,
        kaiwa,
        kanji,
        kepribadian,
      };
    });

    setProgressRows(rows);
    setIsLoading(false);
  }, []);

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    progressRows.forEach(r => {
      if (r.kelas && r.kelas !== '-') {
        classes.add(r.kelas);
      }
    });
    return Array.from(classes).sort();
  }, [progressRows]);

  const filteredRows = useMemo(() => {
    let result = progressRows;

    if (selectedClass !== 'Semua Kelas') {
      result = result.filter((r) => r.kelas === selectedClass);
    }

    if (statusFilter === 'Lulus N5') {
      result = result.filter((r) => r.ujian_n5 === 'Lulus');
    } else if (statusFilter === 'Lulus N4') {
      result = result.filter((r) => r.ujian_n4 === 'Lulus');
    } else if (statusFilter === 'Belum N5') {
      result = result.filter((r) => r.ujian_n5 === 'Belum');
    } else if (statusFilter === 'Belum N4') {
      result = result.filter((r) => r.ujian_n4 === 'Belum');
    } else if (statusFilter === 'Remedial N5') {
      result = result.filter((r) => r.ujian_n5 === 'Remedial');
    } else if (statusFilter === 'Remedial N4') {
      result = result.filter((r) => r.ujian_n4 === 'Remedial');
    } else if (statusFilter === 'Kritis') {
      result = result.filter((r) => (r.progress_percentages?.[activeAspect] || 0) < 50);
    } else if (statusFilter === 'Sangat Baik') {
      result = result.filter((r) => (r.progress_percentages?.[activeAspect] || 0) >= 80);
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) => s.nama_lengkap.toLowerCase().includes(q) || s.no_peserta.toLowerCase().includes(q),
      );
    }

    return result;
  }, [progressRows, searchTerm, selectedClass, statusFilter, activeAspect]);

  const {
    paginatedItems: paginatedRows,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
    minPageSize,
    presetPageSizes,
    isCustomPageSize,
    setCurrentPage,
    setPageSize,
    setIsCustomPageSize,
  } = useTablePagination(filteredRows, {
    storageKey: 'progressBelajar_pageSize',
  });

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

    const parseScore = (val: any) => {
      if (val === undefined || val === null || val === '-' || val === '') return null;
      const parsed = parseInt(val, 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    try {
      // Frontend-only: derive ujian status from scores and update local state
      const updatedRow = { ...draftRow };

      const n5Score = parseScore(draftRow.ujian_n5_score);
      if (n5Score === null) updatedRow.ujian_n5 = 'Belum';
      else if (n5Score >= 85) updatedRow.ujian_n5 = 'Lulus';
      else updatedRow.ujian_n5 = 'Remedial';

      const n4Score = parseScore(draftRow.ujian_n4_score);
      if (n4Score === null) updatedRow.ujian_n4 = 'Belum';
      else if (n4Score >= 90) updatedRow.ujian_n4 = 'Lulus';
      else updatedRow.ujian_n4 = 'Remedial';

      setProgressRows((prev) => prev.map((r) => (r.id === editingRowId ? updatedRow : r)));
      closeEdit();
      toast.success('Penilaian siswa berhasil diperbarui');
    } catch (e) {
      console.error(e);
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const setDraftField = (field: string, value: any, aspect?: AspectKey) => {
    setDraftRow((prev) => {
      if (!prev) return prev;
      let newDraft;
      if (aspect) {
        newDraft = {
          ...prev,
          [aspect]: {
            ...prev[aspect],
            [field]: value
          }
        };
      } else {
        newDraft = { ...prev, [field]: value };
      }

      // Recalculate progress dynamically
      newDraft.progress_percentages = newDraft.progress_percentages || {};
      (Object.keys(aspectsConfig) as AspectKey[]).forEach(a => {
        let passed = 0;
        let total = 0;
        const scores = newDraft[a];
        if (scores) {
          aspectsConfig[a].columns.forEach(col => {
            total++;
            const val = scores[col.key];
            if (a === 'kepribadian') {
              if (val !== null && val !== undefined && val !== '-' && val !== '') {
                passed++;
              }
            } else {
              if (val !== null && val !== undefined && val !== '-' && val !== '') {
                const num = typeof val === 'string' ? parseInt(val) : val;
                if (!isNaN(num) && num >= 75) {
                  passed++;
                }
              }
            }
          });
        }
        newDraft.progress_percentages[a] = total === 0 ? 0 : Math.ceil((passed / total) * 100);
      });

      return newDraft;
    });
  };

  const currentConfig = aspectsConfig[activeAspect];
  const n5Columns = currentConfig.columns.filter(c => c.nLevel === 5);
  const n4Columns = currentConfig.columns.filter(c => c.nLevel === 4);

  return (
    <main className="min-h-screen bg-[#fdf8fa] font-sans text-gray-800 p-4 md:p-8 relative">
      {isLoading && <LoadingOverlay text="MEMUAT DATA..." fixed={true} />}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/guru-dashboard"
            className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <BookOpen className="text-[#fc809f]" size={28} strokeWidth={1.5} />
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">Progress Belajar <span className="text-lg text-gray-400 font-sans ml-2 tracking-normal font-normal">(学習進捗)</span></h1>
            </div>
            <p className="text-xs font-medium text-gray-500 tracking-widest uppercase mt-1">Pantau nilai ujian, bab materi, dan perkembangan belajar siswa.</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#fc809f] transition-colors" size={18} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-[#fc809f] w-full md:w-64 transition-colors"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className={`flex items-center gap-2 px-5 py-2.5 bg-transparent border text-xs tracking-widest uppercase transition-colors duration-300 ${statusFilter !== 'Semua' ? 'border-[#fc809f] text-[#fc809f] bg-[#fc809f]/10' : 'border-gray-300 text-gray-600 hover:border-[#fc809f] hover:text-[#fc809f]'}`}
              >
                <Filter size={16} strokeWidth={1.5} />
                Filter {statusFilter !== 'Semua' && `(${statusFilter})`}
              </button>

              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl z-50 py-1">
                    <button onClick={() => { setStatusFilter('Semua'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Semua' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Semua Status</button>
                    <button onClick={() => { setStatusFilter('Lulus N5'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Lulus N5' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Lulus N5</button>
                    <button onClick={() => { setStatusFilter('Lulus N4'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Lulus N4' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Lulus N4</button>
                    <button onClick={() => { setStatusFilter('Belum N5'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Belum N5' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Belum N5</button>
                    <button onClick={() => { setStatusFilter('Belum N4'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Belum N4' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Belum N4</button>
                    <button onClick={() => { setStatusFilter('Remedial N5'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Remedial N5' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Remedial N5</button>
                    <button onClick={() => { setStatusFilter('Remedial N4'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Remedial N4' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Remedial N4</button>
                    <button onClick={() => { setStatusFilter('Kritis'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Kritis' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Progress Kritis (&lt; 50%)</button>
                    <button onClick={() => { setStatusFilter('Sangat Baik'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm ${statusFilter === 'Sangat Baik' ? 'bg-[#fc809f]/10 text-[#fc809f] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>Progress Baik (&ge; 80%)</button>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setShowPrintModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-transparent border border-emerald-700 text-xs tracking-widest uppercase text-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors duration-300">
              <Download size={16} strokeWidth={1.5} />
              Print Laporan
            </button>

          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <label htmlFor="class-select" className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                Pilih Kelas:
              </label>
              <div className="relative">
                <select
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:border-[#fc809f] hover:border-gray-400 transition-colors cursor-pointer w-40"
                >
                  <option value="Semua Kelas">Semua Kelas</option>
                  {uniqueClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 border-l border-gray-200">
                  <ChevronDown size={16} strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="aspect-select" className="text-xs font-semibold tracking-widest uppercase text-gray-500">
                Pilih Aspek:
              </label>
              <div className="relative">
                <select
                  id="aspect-select"
                  value={activeAspect}
                  onChange={(e) => setActiveAspect(e.target.value as AspectKey)}
                  className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:border-[#fc809f] hover:border-gray-400 transition-colors cursor-pointer w-56"
                >
                  {(Object.entries(aspectsConfig) as [AspectKey, { label: string }][]).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 border-l border-gray-200">
                  <ChevronDown size={16} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border border-gray-300 relative z-10 shadow-sm">
        <StickyHorizontalScroll trackInsetLeft="calc((140px + 180px) * 0.9)">
          <table className="admin-data-table w-full text-sm text-center whitespace-nowrap" style={{ zoom: '90%' }}>
            {activeAspect === 'kepribadian' ? (
              <>
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-0 z-20 min-w-[140px]">
                      実習生番号<br /><span className="text-[10px] text-gray-500 normal-case">No. Peserta</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-[140px] z-20 min-w-[180px] admin-sticky-split-right">
                      実習生本名<br /><span className="text-[10px] text-gray-500 normal-case">Nama Peserta</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      規律性<br /><span className="text-[10px] text-gray-500 normal-case">Kedisiplinan</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      性格<br /><span className="text-[10px] text-gray-500 normal-case">Kepribadian</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[140px] border-r">
                      意思疎通<br /><span className="text-[10px] text-gray-500 normal-case">Cara Komunikasi</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      礼儀正しさ<br /><span className="text-[10px] text-gray-500 normal-case">Kesopanan</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      感情管理<br /><span className="text-[10px] text-gray-500 normal-case">Kontrol Emosi</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 min-w-[130px] border-r">
                      積極性<br /><span className="text-[10px] text-gray-500 normal-case">Inisiatif</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r min-w-[130px]">
                      自信<br /><span className="text-[10px] text-gray-500 normal-case">Percaya Diri</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r min-w-[200px]">
                      備考<br /><span className="text-[10px] text-gray-500 normal-case">Keterangan</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 sticky right-0 bg-gray-100 admin-sticky-split-left">Aksi</th>
                  </tr>
                </thead>
                {paginatedRows.length > 0 && (
                  <tbody>
                    {paginatedRows.map((student) => {
                      const aspectScores = student.kepribadian || {};
                      return (
                        <tr key={student.id} className="bg-white hover:bg-gray-50 transition-colors group">
                          <td className="px-4 py-3 font-semibold text-indigo-600 border-r bg-white group-hover:bg-gray-50 sticky left-0 z-10 text-left">{student.no_peserta}</td>
                          <td className="px-4 py-3 font-medium text-gray-800 border-r bg-white group-hover:bg-gray-50 sticky left-[140px] z-10 admin-sticky-split-right text-left animate-fade-in">
                            <div>{student.nama_lengkap}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold">KELAS: {student.kelas || '-'}</div>
                          </td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.kedisiplinan)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.kepribadian_diri)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.cara_komunikasi)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.kesopanan)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.kontrol_emosi)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.inisiatif)}</td>
                          <td className="px-4 py-3 align-middle border-r">{renderRatingBadge(aspectScores.percaya_diri)}</td>
                          <td className="px-4 py-3 text-gray-600 text-left max-w-[200px] truncate border-r" title={student.keterangans?.kepribadian || '-'}>
                            {student.keterangans?.kepribadian || '-'}
                          </td>
                          <td className="px-4 py-3 sticky right-0 bg-white admin-sticky-split-left group-hover:bg-gray-50 transition-colors">
                            <button
                              onClick={() => openEdit(student)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#fc809f] hover:text-white bg-[#fc809f]/10 hover:bg-[#fc809f] rounded-lg transition-colors border border-[#fc809f]/20"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </>
            ) : (
              <>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th colSpan={2} className="px-4 py-2 border-r border-gray-200 text-gray-600 font-semibold bg-gray-100 sticky left-0 z-20 admin-sticky-split-right">Informasi Umum</th>
                    <th colSpan={3} className="px-4 py-2 border-r border-gray-200 text-gray-600 font-semibold bg-gray-100">Ringkasan</th>
                    {n5Columns.length > 0 && (
                      <th colSpan={n5Columns.length} className="px-4 py-2 border-r border-gray-200 text-[#fc809f] font-semibold bg-[#fc809f]/10/50">
                        Materi N5
                      </th>
                    )}
                    {n4Columns.length > 0 && (
                      <th colSpan={n4Columns.length} className="px-4 py-2 border-r border-gray-200 text-purple-700 font-semibold bg-purple-50/50">Materi N4</th>
                    )}
                    <th colSpan={2} className="px-4 py-2 text-rose-700 font-semibold bg-rose-50/50">Ujian Utama</th>
                  </tr>
                </thead>

                <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-0 z-20 min-w-[140px]">
                      実習生番号<br /><span className="text-[10px] text-gray-500 normal-case">No. Peserta</span>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r bg-gray-100 sticky left-[140px] z-20 min-w-[180px] admin-sticky-split-right">
                      実習生本名<br /><span className="text-[10px] text-gray-500 normal-case">Nama Peserta</span>
                    </th>


                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r">
                      PROGRESS<br /><span className="text-[10px] text-gray-500 normal-case">Persentase</span>
                    </th>

                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-amber-50">
                      <div className="flex flex-col items-center gap-1">
                        <Calculator size={14} className="text-amber-700" />
                        <span>Rata-rata</span>
                        <span className="text-[10px] text-amber-600 normal-case">{currentConfig.label}</span>
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 border-r">
                      備考<br /><span className="text-[10px] text-gray-500 normal-case">Keterangan</span>
                    </th>

                    {/* N5 columns */}
                    {n5Columns.map(col => (
                      <th key={col.key} scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-[#fc809f]/10/30">
                        <span className="text-[10px] text-[#fc809f]/80 normal-case">{col.label}</span>
                      </th>
                    ))}

                    {/* N4 Progress */}
                    {n4Columns.map(col => (
                      <th key={col.key} scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 bg-purple-50/30">
                        <span className="text-[10px] text-purple-600/80 normal-case">{col.label}</span>
                      </th>
                    ))}

                    {/* Ujian Utama */}
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-rose-200 bg-rose-50/50">
                      Ujian N5
                    </th>
                    <th scope="col" className="px-4 py-4 font-bold border-b border-rose-200 bg-rose-100/60 text-rose-900">
                      Ujian N4/JFT
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold border-b border-gray-200 sticky right-0 bg-gray-100 admin-sticky-split-left">Aksi</th>
                  </tr>
                </thead>
                {paginatedRows.length > 0 && (
                  <tbody>
                    {paginatedRows.map((student) => {
                      const aspectScores = student[activeAspect];
                      const avgScore = calculateAverage(aspectScores);

                      return (
                        <tr key={student.id} className="bg-white hover:bg-gray-50 transition-colors group">
                          <td className="px-4 py-3 font-semibold text-indigo-600 border-r bg-white group-hover:bg-gray-50 sticky left-0 z-10 text-left">{student.no_peserta}</td>
                          <td className="px-4 py-3 font-medium text-gray-800 border-r bg-white group-hover:bg-gray-50 sticky left-[140px] z-10 admin-sticky-split-right text-left">
                            <div>{student.nama_lengkap}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 font-bold">KELAS: {student.kelas || '-'}</div>
                          </td>


                          <td className="px-4 py-3 border-r min-w-40">
                            <ProgressBar percentage={student.progress_percentages?.[activeAspect] || 0} />
                          </td>

                          <td className="px-4 py-3 bg-amber-50/30 font-bold border-r">
                            <ScoreCell score={avgScore} />
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-left max-w-[200px] truncate border-r" title={student.keterangans?.[activeAspect] || '-'}>{student.keterangans?.[activeAspect] || '-'}</td>

                          {/* N5 Progress */}
                          {n5Columns.map(col => (
                            <td key={col.key} className="px-4 py-3 border-r">
                              <ScoreCell score={aspectScores[col.key]} />
                            </td>
                          ))}

                          {/* N4 Progress */}
                          {n4Columns.map(col => (
                            <td key={col.key} className="px-4 py-3 border-r">
                              <ScoreCell score={aspectScores[col.key]} />
                            </td>
                          ))}

                          {/* Exams */}
                          <td className="px-4 py-3 bg-rose-50/30 border-r"><ScoreCell score={student.ujian_n5_score} /></td>
                          <td className="px-4 py-3 bg-rose-100/30 text-lg border-r"><ScoreCell score={student.ujian_n4_score} /></td>

                          <td className="px-4 py-3 sticky right-0 bg-white admin-sticky-split-left group-hover:bg-gray-50 transition-colors">
                            <button
                              onClick={() => openEdit(student)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#fc809f] hover:text-white bg-[#fc809f]/10 hover:bg-[#fc809f] rounded-lg transition-colors border border-[#fc809f]/20"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </>
            )}
          </table>
        </StickyHorizontalScroll>
        {filteredRows.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            pageSize={pageSize}
            minPageSize={minPageSize}
            presetPageSizes={presetPageSizes}
            isCustomPageSize={isCustomPageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onCustomModeChange={setIsCustomPageSize}
          />
        )}
        {filteredRows.length === 0 && (
          <div className="w-full py-12 flex items-center justify-center bg-gray-50/30">
            <p className="text-gray-700 font-semibold text-base tracking-wide">Tidak ada data siswa ditemukan</p>
          </div>
        )}
      </div>


      <ProgressEditModal
        draft={draftRow}
        activeAspect={activeAspect}
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
  );
}
