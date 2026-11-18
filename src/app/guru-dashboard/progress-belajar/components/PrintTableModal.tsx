'use client';

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, ArrowLeft, CheckSquare, Square, Info, Eye } from 'lucide-react';
import { ProgressRow, aspectsConfig, averageScore, gradeBand, NumericAspect } from '../data';

interface PrintTableModalProps {
  rows: ProgressRow[];
  onClose: () => void;
}

const SUBJECTS: { key: NumericAspect; ja: string; id: string }[] = [
  { key: 'kotoba', ja: '言葉', id: 'Kosakata' },
  { key: 'bunpou', ja: '文法', id: 'Tata Bahasa' },
  { key: 'choukai', ja: '聴解', id: 'Chokai' },
  { key: 'kanji', ja: '漢字', id: 'Kanji' },
  { key: 'kaiwa', ja: '会話', id: 'Kaiwa' },
  { key: 'praktek', ja: '実技', id: 'Praktek' },
  { key: 'praktek_kaigo', ja: '介護実技', id: 'Praktek Kaigo' },
];

const mean = (values: number[]) => values.length === 0 ? null : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

const levelAverage = (student: ProgressRow, aspect: NumericAspect, level: 5 | 4) =>
  averageScore(student[aspect], aspectsConfig[aspect].columns.filter((column) => column.nLevel === level));

const showScore = (value: number | null) => (value === null ? '—' : String(value));

const letterOf = (value: number | null) => (value === null ? '' : gradeBand(value).letter);

function buildReport(student: ProgressRow) {
  const subjects = SUBJECTS.map((subject) => {
    const n5 = levelAverage(student, subject.key, 5);
    const n4 = levelAverage(student, subject.key, 4);
    const nilai = mean([n5, n4].filter((value): value is number => value !== null));
    return { ...subject, n5, n4, nilai };
  });
  const n5Avg = mean(subjects.map((subject) => subject.n5).filter((value): value is number => value !== null));
  const n4Avg = mean(subjects.map((subject) => subject.n4).filter((value): value is number => value !== null));
  const globalAvg = mean(subjects.map((subject) => subject.nilai).filter((value): value is number => value !== null));
  const progressValues = Object.values(student.progress_percentages ?? {});
  const progress = progressValues.length === 0 ? 0 : Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length);
  const sikap = aspectsConfig.sikap.columns.map((column) => {
    const raw = student.sikap?.akhir?.[column.key];
    const value = raw === null || raw === undefined || raw === '-' || raw === '' ? '—' : String(raw);
    return { label: column.label, value };
  });
  return { subjects, n5Avg, n4Avg, globalAvg, letter: letterOf(globalAvg), progress, sikap };
}

const getCurrentDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
};

const esc = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

type ReportSections = {
  nilai: boolean;
  sikap: boolean;
  ujian: boolean;
  catatan: boolean;
};

function ScoreMark({ value }: { value: number | null }) {
  const letter = letterOf(value);
  return (
    <span>
      {showScore(value)}
      {letter ? <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 500 }}>{letter}</span> : null}
    </span>
  );
}

function StudentPagePreview({ student, sections }: { student: ProgressRow; sections: ReportSections }) {
  const report = buildReport(student);
  const note = !student.keterangan || student.keterangan === '-' ? '—' : student.keterangan;

  const cellStyle = {
    border: '1px solid #000',
    padding: '4px',
    fontWeight: 600,
  } as React.CSSProperties;

  const labelCellStyle = {
    ...cellStyle,
    textAlign: 'left' as const,
    paddingLeft: '8px',
    fontWeight: 700,
    background: '#f3f4f6',
  };

  return (
    <div
      className="report-page"
      style={{
        width: '210mm',
        height: '297mm',
        padding: '10mm 12mm 32mm',
        boxSizing: 'border-box',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Noto Sans JP', 'Meiryo', 'MS Gothic', sans-serif",
        color: '#000',
        pageBreakAfter: 'always',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.2em', borderBottom: '2.5px solid #000', display: 'inline-block', padding: '0 40px 4px' }}>
          成績表
        </div>
        <div style={{ fontSize: 10, marginTop: 4, letterSpacing: '0.18em' }}>Rapor Siswa</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8, borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 10, fontSize: 11 }}>
        <div>
          <div><b>学生番号</b> <span style={{ fontSize: 9 }}>No. Peserta</span> · {student.no_peserta}</div>
          <div style={{ marginTop: 4 }}><b>氏名</b> <span style={{ fontSize: 9 }}>Nama</span> · {student.nama_lengkap}</div>
          <div style={{ fontSize: 10, marginTop: 2 }}>{student.nama_katakana || '—'}</div>
        </div>
        <div>
          <div><b>クラス</b> · {student.kelas || '—'}</div>
          <div style={{ marginTop: 4 }}><b>TC</b> · {student.pusat || '—'}</div>
          <div style={{ marginTop: 4 }}><b>企業</b> · {student.perusahaan || '—'}</div>
        </div>
      </div>

      {sections.nilai || sections.ujian ? (
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        {sections.nilai ? (
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, borderLeft: '4px solid #000', paddingLeft: 8 }}>
            各科目の成績 <span style={{ fontSize: 9, fontWeight: 400 }}>(Nilai mata pelajaran)</span>
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', fontSize: 11, textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ ...cellStyle, textAlign: 'left', paddingLeft: 8, width: '40%' }}>科目</th>
                <th style={cellStyle}>N5</th>
                <th style={cellStyle}>N4</th>
                <th style={cellStyle}>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {report.subjects.map((subject) => (
                <tr key={subject.key}>
                  <td style={labelCellStyle}>{subject.ja} <span style={{ fontSize: 9, fontWeight: 400 }}>({subject.id})</span></td>
                  <td style={cellStyle}><ScoreMark value={subject.n5} /></td>
                  <td style={cellStyle}><ScoreMark value={subject.n4} /></td>
                  <td style={cellStyle}><ScoreMark value={subject.nilai} /></td>
                </tr>
              ))}
              <tr style={{ background: '#f9fafb' }}>
                <td style={{ ...labelCellStyle, background: '#f9fafb' }}>平均</td>
                <td style={{ ...cellStyle, fontWeight: 800 }}><ScoreMark value={report.n5Avg} /></td>
                <td style={{ ...cellStyle, fontWeight: 800 }}><ScoreMark value={report.n4Avg} /></td>
                <td style={{ ...cellStyle, fontWeight: 800 }}><ScoreMark value={report.globalAvg} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        ) : null}
        <div style={{ width: sections.nilai ? '34%' : '240px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sections.nilai ? (
          <>
          <div style={{ border: '2px solid #000', padding: 8, textAlign: 'center', background: '#f9fafb' }}>
            <div style={{ fontSize: 10, fontWeight: 700 }}>総合評価 <span style={{ fontSize: 9, fontWeight: 400 }}>(Nilai akhir)</span></div>
            <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.1 }}>{showScore(report.globalAvg)}{report.letter ? ` ${report.letter}` : ''}</div>
            <div style={{ fontSize: 9 }}>KKM 70</div>
          </div>
          <div style={{ border: '2px solid #000', padding: 8, background: '#f9fafb' }}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>進捗 <span style={{ fontSize: 9, fontWeight: 400 }}>(Progress {report.progress}%)</span></div>
            <div style={{ background: '#e5e7eb', height: 8 }}>
              <div style={{ height: '100%', width: `${report.progress}%`, background: '#000' }} />
            </div>
          </div>
          </>
          ) : null}
          {sections.ujian ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', fontSize: 11, textAlign: 'center' }}>
            <tbody>
              <tr>
                <td style={labelCellStyle}>Ujian N5</td>
                <td style={cellStyle}>{student.ujian_n5 || 'Belum'}</td>
              </tr>
              <tr>
                <td style={labelCellStyle}>Ujian N4</td>
                <td style={cellStyle}>{student.ujian_n4 || 'Belum'}</td>
              </tr>
            </tbody>
          </table>
          ) : null}
        </div>
      </div>
      ) : null}

      {sections.sikap ? (
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, borderLeft: '4px solid #000', paddingLeft: 8 }}>
          性格 <span style={{ fontSize: 9, fontWeight: 400 }}>(Sikap · Akhir)</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', border: '2px solid #000' }}>
          {report.sikap.map((item) => (
            <div key={item.label} style={{ border: '1px solid #000', padding: '4px 6px' }}>
              <div style={{ fontSize: 8, fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 11 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      ) : null}

      {sections.catatan ? (
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, borderLeft: '4px solid #000', paddingLeft: 8 }}>
          備考 <span style={{ fontSize: 9, fontWeight: 400 }}>(Catatan)</span>
        </h2>
        <div style={{ border: '2px solid #000', padding: 8, minHeight: 42, fontSize: 11, lineHeight: 1.5 }}>{note}</div>
      </div>
      ) : null}

      {/* ── Signature ── */}
      <div style={{ position: 'absolute', bottom: '12mm', right: '12mm', width: 140, textAlign: 'center' }}>
        <div style={{ fontSize: 10, marginBottom: 6, fontWeight: 600 }}>{getCurrentDateStr()}</div>
        <div style={{ borderBottom: '1px solid #000', paddingBottom: 28, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>教師</span><br />
          <span style={{ fontSize: 9 }}>Guru</span>
        </div>
        <div style={{ fontSize: 9 }}>........................</div>
      </div>

      {/* ── Footer ── */}
      <div style={{ position: 'absolute', bottom: '8mm', left: '15mm', fontSize: 8, color: '#999', letterSpacing: '0.1em' }}>
        Flora Talent Indonesia — Rapor Siswa
      </div>
    </div>
  );
}

const scoreHtml = (value: number | null) => {
  const letter = letterOf(value);
  return `${esc(showScore(value))}${letter ? ` <span style="font-size:9px;font-weight:500">${esc(letter)}</span>` : ''}`;
};

const buildStudentPageHtml = (student: ProgressRow, sections: ReportSections): string => {
  const report = buildReport(student);
  const note = !student.keterangan || student.keterangan === '-' ? '—' : student.keterangan;
  const rows = report.subjects.map((subject) => `
      <tr>
        <td style="border:1px solid #000;padding:4px 8px;font-weight:700;text-align:left;background:#f3f4f6">${esc(subject.ja)} <span style="font-size:9px;font-weight:400">(${esc(subject.id)})</span></td>
        <td style="border:1px solid #000;padding:4px;font-weight:600">${scoreHtml(subject.n5)}</td>
        <td style="border:1px solid #000;padding:4px;font-weight:600">${scoreHtml(subject.n4)}</td>
        <td style="border:1px solid #000;padding:4px;font-weight:600">${scoreHtml(subject.nilai)}</td>
      </tr>`).join('');
  const sikap = report.sikap.map((item) => `
        <div style="border:1px solid #000;padding:4px 6px">
          <div style="font-size:8px;font-weight:700">${esc(item.label)}</div>
          <div style="font-size:11px">${esc(item.value)}</div>
        </div>`).join('');

  return `
    <div style="width:210mm;height:297mm;padding:10mm 12mm 32mm;box-sizing:border-box;background:white;page-break-after:always;position:relative;overflow:hidden;font-family:'Noto Sans JP','Meiryo','MS Gothic',sans-serif;color:#000">
      <div style="text-align:center;margin-bottom:10px">
        <div style="font-size:24px;font-weight:900;letter-spacing:0.2em;border-bottom:2.5px solid #000;display:inline-block;padding:0 40px 4px">成績表</div>
        <div style="font-size:10px;margin-top:4px;letter-spacing:0.18em">Rapor Siswa</div>
      </div>
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:8px;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:10px;font-size:11px">
        <div>
          <div><b>学生番号</b> <span style="font-size:9px">No. Peserta</span> · ${esc(student.no_peserta)}</div>
          <div style="margin-top:4px"><b>氏名</b> <span style="font-size:9px">Nama</span> · ${esc(student.nama_lengkap)}</div>
          <div style="font-size:10px;margin-top:2px">${esc(student.nama_katakana || '—')}</div>
        </div>
        <div>
          <div><b>クラス</b> · ${esc(student.kelas || '—')}</div>
          <div style="margin-top:4px"><b>TC</b> · ${esc(student.pusat || '—')}</div>
          <div style="margin-top:4px"><b>企業</b> · ${esc(student.perusahaan || '—')}</div>
        </div>
      </div>
      ${sections.nilai || sections.ujian ? `<div style="display:flex;gap:12px;margin-bottom:10px">
        ${sections.nilai ? `<div style="flex:1">
          <h2 style="font-size:11px;font-weight:700;margin-bottom:6px;border-left:4px solid #000;padding-left:8px">各科目の成績 <span style="font-size:9px;font-weight:400">(Nilai mata pelajaran)</span></h2>
          <table style="width:100%;border-collapse:collapse;border:2px solid #000;font-size:11px;text-align:center">
            <thead>
              <tr style="background:#f3f4f6">
                <th style="border:1px solid #000;padding:4px 8px;text-align:left;width:40%">科目</th>
                <th style="border:1px solid #000;padding:4px">N5</th>
                <th style="border:1px solid #000;padding:4px">N4</th>
                <th style="border:1px solid #000;padding:4px">Nilai</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr style="background:#f9fafb">
                <td style="border:1px solid #000;padding:4px 8px;font-weight:700;text-align:left;background:#f9fafb">平均</td>
                <td style="border:1px solid #000;padding:4px;font-weight:800">${scoreHtml(report.n5Avg)}</td>
                <td style="border:1px solid #000;padding:4px;font-weight:800">${scoreHtml(report.n4Avg)}</td>
                <td style="border:1px solid #000;padding:4px;font-weight:800">${scoreHtml(report.globalAvg)}</td>
              </tr>
            </tbody>
          </table>
        </div>` : ''}
        <div style="width:${sections.nilai ? '34%' : '240px'};display:flex;flex-direction:column;gap:8px">
          ${sections.nilai ? `<div style="border:2px solid #000;padding:8px;text-align:center;background:#f9fafb">
            <div style="font-size:10px;font-weight:700">総合評価 <span style="font-size:9px;font-weight:400">(Nilai akhir)</span></div>
            <div style="font-size:32px;font-weight:900;line-height:1.1">${esc(showScore(report.globalAvg))}${report.letter ? ` ${esc(report.letter)}` : ''}</div>
            <div style="font-size:9px">KKM 70</div>
          </div>
          <div style="border:2px solid #000;padding:8px;background:#f9fafb">
            <div style="font-size:10px;font-weight:700;margin-bottom:6px">進捗 <span style="font-size:9px;font-weight:400">(Progress ${report.progress}%)</span></div>
            <div style="background:#e5e7eb;height:8px"><div style="height:100%;width:${report.progress}%;background:#000"></div></div>
          </div>` : ''}
          ${sections.ujian ? `<table style="width:100%;border-collapse:collapse;border:2px solid #000;font-size:11px;text-align:center">
            <tbody>
              <tr>
                <td style="border:1px solid #000;padding:4px 8px;font-weight:700;text-align:left;background:#f3f4f6">Ujian N5</td>
                <td style="border:1px solid #000;padding:4px;font-weight:600">${esc(student.ujian_n5 || 'Belum')}</td>
              </tr>
              <tr>
                <td style="border:1px solid #000;padding:4px 8px;font-weight:700;text-align:left;background:#f3f4f6">Ujian N4</td>
                <td style="border:1px solid #000;padding:4px;font-weight:600">${esc(student.ujian_n4 || 'Belum')}</td>
              </tr>
            </tbody>
          </table>` : ''}
        </div>
      </div>` : ''}
      ${sections.sikap ? `<div style="margin-bottom:8px">
        <h2 style="font-size:11px;font-weight:700;margin-bottom:6px;border-left:4px solid #000;padding-left:8px">性格 <span style="font-size:9px;font-weight:400">(Sikap · Akhir)</span></h2>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;border:2px solid #000">${sikap}</div>
      </div>` : ''}
      ${sections.catatan ? `<div style="margin-bottom:8px">
        <h2 style="font-size:11px;font-weight:700;margin-bottom:6px;border-left:4px solid #000;padding-left:8px">備考 <span style="font-size:9px;font-weight:400">(Catatan)</span></h2>
        <div style="border:2px solid #000;padding:8px;min-height:42px;font-size:11px;line-height:1.5">${esc(note)}</div>
      </div>` : ''}
      <div style="position:absolute;bottom:12mm;right:12mm;width:140px;text-align:center">
        <div style="font-size:10px;margin-bottom:8px;font-weight:600">${getCurrentDateStr()}</div>
        <div style="border-bottom:1px solid #000;padding-bottom:28px;margin-bottom:4px">
          <span style="font-size:11px;font-weight:700">教師</span><br>
          <span style="font-size:9px">Guru</span>
        </div>
        <div style="font-size:9px">........................</div>
      </div>
      <div style="position:absolute;bottom:6mm;left:12mm;font-size:8px;color:#999;letter-spacing:0.1em">Flora Talent Indonesia — Rapor Siswa</div>
    </div>`;
};

// ─── Main Component ───────────────────────────────────────────────
export default function PrintTableModal({ rows, onClose }: PrintTableModalProps) {
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [query, setQuery] = useState('');
  const [pusat, setPusat] = useState<'Semua' | 'Bogor' | 'Jakarta'>('Semua');
  const [kelasKey, setKelasKey] = useState('Semua');
  const [sections, setSections] = useState<ReportSections>({ nilai: true, sikap: true, ujian: true, catatan: true });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(rows.map(r => r.no_peserta)));

  const classOptions = useMemo(() => {
    const options = new Map<string, string>();
    rows.forEach((row) => {
      if (pusat !== 'Semua' && row.pusat !== pusat) return;
      if (!row.kelas) return;
      options.set(`${row.pusat}::${row.kelas}`, `${row.pusat} · ${row.kelas}`);
    });
    return [...options.entries()].sort((left, right) => left[1].localeCompare(right[1], 'id'));
  }, [rows, pusat]);

  const studentsInTarget = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (pusat !== 'Semua' && row.pusat !== pusat) return false;
        if (kelasKey !== 'Semua' && `${row.pusat}::${row.kelas}` !== kelasKey) return false;
        if (!needle) return true;
        return [row.nama_lengkap, row.no_peserta, row.nama_katakana, row.perusahaan, row.kelas]
          .some((value) => (value || '').toLowerCase().includes(needle));
      })
      .sort((left, right) => left.nama_lengkap.localeCompare(right.nama_lengkap, 'id'));
  }, [rows, query, pusat, kelasKey]);

  const targetRows = useMemo(() => {
    return studentsInTarget.filter(r => selectedIds.has(r.no_peserta));
  }, [studentsInTarget, selectedIds]);

  const toggleStudent = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const visibleIds = studentsInTarget.map((student) => student.no_peserta);
  const visibleSelected = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && visibleSelected === visibleIds.length;

  const toggleVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const changePusat = (value: 'Semua' | 'Bogor' | 'Jakarta') => {
    setPusat(value);
    if (kelasKey !== 'Semua' && !kelasKey.startsWith(`${value}::`)) setKelasKey('Semua');
  };

  const toggleSection = (key: keyof ReportSections) => {
    setSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const handlePreview = () => {
    if (targetRows.length === 0) {
      alert('Pilih minimal 1 siswa untuk dicetak.');
      return;
    }
    setStep('preview');
  };

  // Open blob window and auto-print
  const handlePrint = () => {
    const pagesHtml = targetRows.map((student) => buildStudentPageHtml(student, sections)).join('');
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Rapor Siswa</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 0; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm; margin: 0; padding: 0; background: #fff;
      font-family: 'Noto Sans JP', 'Meiryo', 'MS Gothic', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media screen {
      body { background: #e5e7eb; padding: 20px 0; display: flex; flex-direction: column; align-items: center; gap: 24px; }
    }
    @media print { html, body { width: 210mm; background: white; padding: 0; } }
  </style>
</head>
<body>${pagesHtml}</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');

    if (!printWindow) {
      alert('Popup diblokir browser. Izinkan popup untuk localhost lalu coba lagi.');
      URL.revokeObjectURL(blobUrl);
      return;
    }

    printWindow.addEventListener('load', () => {
      const doc = printWindow.document;
      const triggerPrint = () => setTimeout(() => { printWindow.focus(); printWindow.print(); }, 400);
      if (doc.fonts && doc.fonts.ready) {
        doc.fonts.ready.then(triggerPrint);
      } else {
        setTimeout(triggerPrint, 1500);
      }
    });

    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  };

  // ── PREVIEW STEP ── (fullscreen, like NafudaPrintPreviewModal)
  if (step === 'preview') {
    return createPortal(
      <div className="fixed inset-0 z-[200] bg-white flex flex-col">
        {/* Topbar */}
        <div className="bg-white px-6 py-3 flex items-center justify-between border-b shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('select')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
            <div>
              <h2 className="text-base font-bold text-gray-900">Preview Rapor Siswa</h2>
              <p className="text-xs text-gray-500">
                {targetRows.length} Siswa · {targetRows.length} Halaman A4
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[#fc809f] text-white hover:bg-[#fc809f] rounded-lg transition-colors shadow-sm"
            >
              <Printer size={16} />
              Print Sekarang
            </button>
          </div>
        </div>

        {/* Page indicator strip */}
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-2 flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            {targetRows.length} halaman · Kertas A4 Portrait · Skala 70%
          </span>
          <div className="flex gap-1 ml-auto">
            {targetRows.map((s, i) => (
              <button
                key={s.no_peserta}
                onClick={() => {
                  document.getElementById(`preview-page-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="w-6 h-6 text-[10px] rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-800 hover:text-white transition-colors font-mono"
                title={s.nama_lengkap}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable preview area */}
        <div className="flex-1 overflow-auto bg-gray-100 px-8 py-8 flex flex-col items-center gap-8">
          {targetRows.map((student, i) => (
            <div key={student.no_peserta} id={`preview-page-${i}`} className="relative">
              {/* Page label */}
              <div className="absolute -top-6 left-0 text-xs text-gray-500 font-mono flex items-center gap-2">
                <span className="border border-gray-300 bg-white text-gray-600 px-2 py-0.5 rounded text-[10px]">
                  Hal. {i + 1} / {targetRows.length}
                </span>
                <span className="text-gray-400">{student.nama_lengkap}</span>
              </div>

              {/* A4 page container — scaled to ~70% for screen viewing */}
              <div
                className="shadow-md ring-1 ring-gray-300"
                style={{
                  transform: 'scale(0.7)',
                  transformOrigin: 'top center',
                  // compensate for scaling so pages don't overlap
                  marginBottom: '-89mm',
                }}
              >
                <StudentPagePreview student={student} sections={sections} />
              </div>
            </div>
          ))}
          {/* Bottom spacer after last scaled page */}
          <div style={{ height: '40px' }} />
        </div>

      </div>,
      document.body
    );
  }

  // ── SELECT STEP ──
  return createPortal(
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#fc809f]/10 text-[#fc809f] rounded-lg">
              <Printer size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Unduh Rapor Siswa</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 bg-gray-50/50 overflow-y-auto flex-1">

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Cari siswa</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nama, nomor, katakana, atau perusahaan"
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#fc809f]/50"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">TC</span>
              <select
                aria-label="TC"
                value={pusat}
                onChange={(event) => changePusat(event.target.value as 'Semua' | 'Bogor' | 'Jakarta')}
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#fc809f]/50"
              >
                <option value="Semua">Semua TC</option>
                <option value="Bogor">Bogor</option>
                <option value="Jakarta">Jakarta</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">Kelas</span>
              <select
                aria-label="Kelas"
                value={classOptions.some(([key]) => key === kelasKey) ? kelasKey : 'Semua'}
                onChange={(event) => setKelasKey(event.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#fc809f]/50"
              >
                <option value="Semua">Semua kelas</option>
                {classOptions.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <span className="text-sm font-semibold text-gray-700">Isi rapor</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {([
                ['nilai', 'Nilai materi'],
                ['sikap', 'Sikap'],
                ['ujian', 'Ujian N5 dan N4'],
                ['catatan', 'Catatan'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSection(key)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${sections[key] ? 'border-[#fc809f] bg-[#fc809f]/10 text-[#be185d]' : 'border-gray-300 bg-white text-gray-500'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Student list */}
          <div className="flex h-[320px] min-h-0 flex-col rounded-md border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 shrink-0">
              <span className="text-sm font-semibold text-gray-700">
                Pilih siswa ({visibleSelected}/{studentsInTarget.length})
              </span>
              <button
                type="button"
                onClick={toggleVisible}
                disabled={studentsInTarget.length === 0}
                className="flex items-center gap-1.5 rounded-md bg-[#fc809f]/10 px-2 py-1 text-xs font-medium text-[#be185d] disabled:opacity-40"
              >
                {allVisibleSelected
                  ? <><CheckSquare size={14} /> Lepas yang tampil</>
                  : <><Square size={14} /> Pilih yang tampil</>}
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
              {studentsInTarget.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">Tidak ada siswa ditemukan.</div>
              ) : (
                studentsInTarget.map(s => (
                  <label
                    key={s.no_peserta}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.no_peserta)}
                      onChange={() => toggleStudent(s.no_peserta)}
                      className="w-4 h-4 text-[#fc809f] rounded border-gray-300 focus:ring-[#fc809f]/50"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 group-hover:text-[#fc809f] transition-colors">{s.nama_lengkap}</span>
                      <span className="text-xs text-gray-500">{s.no_peserta} · {s.pusat} · {s.kelas || 'Tanpa kelas'} · {s.perusahaan || '—'}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-[#fc809f]/20 bg-[#fc809f]/10 p-4 text-sm leading-relaxed text-[#be185d]">
            <Info className="mt-0.5 shrink-0" size={18} />
            <div>
              Satu lembar A4 untuk setiap siswa yang dicentang. Filter mempersempit daftar, dan tombol isi rapor menentukan bagian yang dicetak.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handlePreview}
            disabled={targetRows.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#fc809f] text-white hover:bg-[#fc809f] disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Eye size={16} />
            Preview ({targetRows.length} Siswa)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
