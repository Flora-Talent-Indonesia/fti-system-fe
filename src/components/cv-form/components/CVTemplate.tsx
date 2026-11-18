'use client';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { CVData } from '../types';
import { hubunganToJapanese } from '@/lib/cv-hubungan';
import { formatKeteranganMedis, formatSisaMasa } from '@/lib/cv-catatan';
import { pekerjaanToJapanese, sertifikatCatatan, sertifikatNamaResmi } from '@/lib/cv-referensi';
import {
  arrangePendidikan,
  formatCvYm,
  formatIsoDateJa,
  isKeluargaFilled,
  isPendidikanFilled,
  isPekerjaanFilled,
  isSertifikatFilled,
  pendidikanGakureki,
} from '@/lib/cv-slots';

interface Props {
  data: CVData;
  interviewNumber?: string;
}

const jender = (v: string) => {
  const norm = (v || '').trim().toUpperCase();
  if (norm === 'LAKI-LAKI' || norm === 'L') return '男性';
  if (norm === 'PEREMPUAN' || norm === 'P') return '女性';
  return '';
};
const statusNikah = (v: string) => ({ Lajang: '未婚', Menikah: '既婚', Cerai: '離婚' }[v] ?? '');
const ariNashi = (v: string) => {
  const norm = (v || '').trim().toLowerCase();
  if (norm === 'ya' || norm === '有' || norm === 'ada') return '有';
  if (norm === 'tidak' || norm === '無' || norm === 'tidak ada') return '無';
  return '';
};

const RULE = '1px solid #000';
const TEXT: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 400,
  lineHeight: 1.35,
  color: '#000',
  fontFamily: 'inherit',
  fontSynthesis: 'none',
};
/** Tiap garis digambar sekali (kanan + bawah). Tepi kiri dan atas ada di tabel. */
const cell = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...TEXT,
  border: 'none',
  borderRight: RULE,
  borderBottom: RULE,
  padding: '5px 6px',
  verticalAlign: 'middle',
  backgroundClip: 'padding-box',
  boxSizing: 'border-box',
  ...extra,
});
const label = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...cell(), backgroundColor: '#f2f2f2', textAlign: 'center', ...extra,
});
const secTab = (): React.CSSProperties => ({
  ...TEXT,
  backgroundColor: '#dae3f3',
  padding: '4px 16px',
  display: 'block',
  width: 'fit-content',
  borderTop: RULE,
  borderLeft: RULE,
  borderRight: RULE,
  borderBottom: 'none',
  boxSizing: 'border-box',
});
const tbl = (): React.CSSProperties => ({
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  tableLayout: 'fixed',
  borderTop: RULE,
  borderLeft: RULE,
  boxSizing: 'border-box',
});

const PAGE_HEIGHT = 1123;
const PAGE_PAD_Y = 28;
const PAGE_PAD_X = 24;
const CONTENT_WIDTH = 794 - PAGE_PAD_X * 2;
/** Sisa aman supaya baris terakhir tidak terpotong di tepi bawah. */
const PAGE_SAFETY = 20;

function packBlocks(heights: number[], headerHeight: number): number[][] {
  const budget = PAGE_HEIGHT - PAGE_PAD_Y * 2 - PAGE_SAFETY;
  const pages: number[][] = [];
  let current: number[] = [];
  let used = headerHeight;
  heights.forEach((height, index) => {
    if (current.length > 0 && used + height > budget) {
      pages.push(current);
      current = [index];
      used = headerHeight + height;
      return;
    }
    current.push(index);
    used += height;
  });
  pages.push(current);
  return pages;
}

export default function CVTemplate({ data, interviewNumber }: Props) {
  const { meta, informasi_dasar: info, fisik_kesehatan: fisik, pendidikan, pekerjaan, sertifikat, keluarga } = data;
  const catatan = data.catatan ?? {
    periode_luar_negeri: '',
    tujuan_luar_negeri: '',
    sisa_hari_tokutei: '',
    sisa_tahun: '',
    sisa_bulan: '',
    tujuan_ke_jepang: '',
    komentar_pewawancara: '',
    keterangan_medis_status: '',
    keterangan_medis: '',
  };
  const nomor = interviewNumber || info.no_peserta || '';
  const dibuat = meta.tanggal_pembuatan_cv ? formatIsoDateJa(meta.tanggal_pembuatan_cv) : '';

  const { slots: pendidikanSlots, overflow: pendidikanOverflow } = arrangePendidikan(pendidikan);
  const pendidikanRows = [...pendidikanSlots, ...pendidikanOverflow].filter(isPendidikanFilled);
  const kerjaRows = pekerjaan.filter(isPekerjaanFilled);
  const certRows = sertifikat.filter(isSertifikatFilled);
  const keluargaRows = keluarga.filter(isKeluargaFilled);
  const travelWhen = Boolean(catatan.periode_luar_negeri.trim() || catatan.tujuan_luar_negeri.trim());
  const sisaText = formatSisaMasa(catatan);
  const tujuanText = catatan.tujuan_ke_jepang.trim();
  const medisText = formatKeteranganMedis(catatan);

  const contentKey = [
    nomor, dibuat, info.nama_lengkap, info.nama_katakana, info.alamat_lengkap, info.tempat_lahir,
    info.tanggal_lahir, info.umur, info.jenis_kelamin, info.tangan_dominan, info.golongan_darah, info.status_pernikahan,
    fisik.hobi, fisik.tinggi_badan, fisik.berat_badan, fisik.visus_mata_kiri, fisik.visus_mata_kanan,
    fisik.merokok, fisik.minum_alkohol, meta.foto ? 'foto' : '',
    catatan.periode_luar_negeri, catatan.tujuan_luar_negeri, sisaText, tujuanText, medisText,
    pendidikanRows.map((row) => [row.id, row.nama_sekolah, row.jurusan, row.tahun_masuk, row.bulan_masuk, row.tahun_lulus, row.bulan_lulus].join(':')).join('|'),
    kerjaRows.map((row) => [row.id, row.nama_perusahaan, row.deskripsi_pekerjaan, row.jenis_pekerjaan, row.tahun_mulai, row.bulan_mulai, row.tahun_selesai, row.bulan_selesai].join(':')).join('|'),
    certRows.map((row) => [row.id, row.nama_sertifikat, row.keterangan_skor, row.tahun_diperoleh, row.bulan_diperoleh].join(':')).join('|'),
    keluargaRows.map((row) => [row.id, row.nama_anggota, row.hubungan, row.umur, row.pekerjaan].join(':')).join('|'),
  ].join('\n');
  const rootRef = useRef<HTMLDivElement>(null);
  const [fontEpoch, setFontEpoch] = useState(0);
  const [pages, setPages] = useState<number[][]>([[]]);
  const measureKey = `${contentKey}\n${fontEpoch}`;

  useLayoutEffect(() => {
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) setFontEpoch((value) => (value === 0 ? 1 : value));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const blockEls = [...root.querySelectorAll<HTMLElement>('[data-cv-block]')];
    const header = root.querySelector<HTMLElement>('[data-cv-header]');
    const label = root.querySelector<HTMLElement>('[data-cv-page-label]');
    const headerMargin = header ? parseFloat(getComputedStyle(header).marginBottom) || 0 : 0;
    const headerHeight = (header?.offsetHeight ?? 0) + headerMargin;
    const labelMargin = label ? parseFloat(getComputedStyle(label).marginTop) || 0 : 0;
    const labelHeight = (label?.offsetHeight ?? 0) + labelMargin;
    const heights = blockEls.map((el) => el.offsetHeight);
    let packed = packBlocks(heights, headerHeight);
    if (packed.length > 1) packed = packBlocks(heights, headerHeight + labelHeight);
    setPages((prev) => (samePages(prev, packed) ? prev : packed));
  }, [measureKey]);

  const blocks = [
      <div data-cv-block key="identitas">
      <table style={tbl()}>
        <colgroup>
          <col style={{ width: '12%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '14%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <tbody>
          <tr>
            <td style={label()}>ふりがな</td>
            <td style={cell()} colSpan={5}>{info.nama_katakana}</td>
            <td style={{ ...cell(), textAlign: 'center', verticalAlign: 'middle', padding: 0 }} rowSpan={6}>
              {meta.foto ? (
                <img
                  src={meta.foto}
                  alt="Pas foto"
                  style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'contain', objectPosition: 'center top', display: 'block', backgroundColor: '#fff', border: 'none' }}
                />
              ) : (
                <div style={{ width: '100%', aspectRatio: '3 / 4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '10px' }}>
                  Pas Foto
                </div>
              )}
            </td>
          </tr>
          <tr>
            <td style={label()}>氏名</td>
            <td style={cell()} colSpan={5}>{info.nama_lengkap}</td>
          </tr>
          <tr>
            <td style={label()}>生年月日</td>
            <td style={cell({ textAlign: 'center' })}>{formatIsoDateJa(info.tanggal_lahir)}</td>
            <td style={label()}>年齢</td>
            <td style={cell({ textAlign: 'center' })}>{info.umur ? `${info.umur}歳` : ''}</td>
            <td style={label()}>性別</td>
            <td style={cell({ textAlign: 'center' })}>{jender(info.jenis_kelamin)}</td>
          </tr>
          <tr>
            <td style={label()}>出身地</td>
            <td style={cell()} colSpan={3}>{info.tempat_lahir}</td>
            <td style={label()}>利き手</td>
            <td style={cell({ textAlign: 'center' })}>{info.tangan_dominan}</td>
          </tr>
          <tr>
            <td style={label()}>視力</td>
            <td style={cell()} colSpan={3}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <span>右 {fisik.visus_mata_kanan}</span>
                <span>左 {fisik.visus_mata_kiri}</span>
              </div>
            </td>
            <td style={label()}>身長</td>
            <td style={cell({ textAlign: 'center' })}>{fisik.tinggi_badan ? `${fisik.tinggi_badan} cm` : ''}</td>
          </tr>
          <tr>
            <td style={label()}>体重</td>
            <td style={cell({ textAlign: 'center' })}>{fisik.berat_badan ? `${fisik.berat_badan} kg` : ''}</td>
            <td style={label()}>既婚・未婚</td>
            <td style={cell({ textAlign: 'center' })}>{statusNikah(info.status_pernikahan)}</td>
            <td style={label()}>喫煙</td>
            <td style={cell({ textAlign: 'center' })}>{ariNashi(fisik.merokok)}</td>
          </tr>
          <tr>
            <td style={label()}>飲酒</td>
            <td style={cell({ textAlign: 'center' })}>{ariNashi(fisik.minum_alkohol)}</td>
            <td style={label()}>血液型</td>
            <td style={cell({ textAlign: 'center' })}>{info.golongan_darah ? `${info.golongan_darah}型` : ''}</td>
            <td style={cell()} colSpan={3} />
          </tr>
          <tr>
            <td style={label()}>現住所</td>
            <td style={cell({ whiteSpace: 'pre-wrap' })} colSpan={6}>{info.alamat_lengkap}</td>
          </tr>
          <tr>
            <td style={label()}>趣味・特技</td>
            <td style={cell({ whiteSpace: 'pre-wrap' })} colSpan={6}>{fisik.hobi}</td>
          </tr>
        </tbody>
      </table>
      </div>,
      (travelWhen || sisaText) ? (
        <div data-cv-block key="travel" style={{ paddingTop: '8px' }}>
          <div style={secTab()}>海外への渡航履歴</div>
          <table style={tbl()}>
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '36%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '36%' }} />
            </colgroup>
            <tbody>
              {travelWhen && (
                <tr>
                  <td style={label()}>渡航時期</td>
                  <td style={cell({ whiteSpace: 'pre-wrap' })}>{catatan.periode_luar_negeri}</td>
                  <td style={label()}>渡航目的</td>
                  <td style={cell({ whiteSpace: 'pre-wrap' })}>{catatan.tujuan_luar_negeri}</td>
                </tr>
              )}
              {sisaText && (
                <tr>
                  <td style={label()}>特定技能残日数</td>
                  <td style={cell({ whiteSpace: 'pre-wrap' })} colSpan={3}>{sisaText}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null,
      pendidikanRows.length > 0 ? (
        <div data-cv-block key="pendidikan" style={{ paddingTop: '8px' }}>
          <div style={secTab()}>最終学歴</div>
          <table style={tbl()}>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '40%' }} />
              <col style={{ width: '24%' }} />
            </colgroup>
            <thead>
              <tr>
                <td style={label()}>入学年月</td>
                <td style={label()}>卒業年月</td>
                <td style={label()}>学校名</td>
                <td style={label()}>学歴</td>
              </tr>
            </thead>
            <tbody>
              {pendidikanRows.map((row) => (
                <tr key={row.id}>
                  <td style={cell({ textAlign: 'center' })}>{formatCvYm(row.tahun_masuk, row.bulan_masuk)}</td>
                  <td style={cell({ textAlign: 'center' })}>{formatCvYm(row.tahun_lulus, row.bulan_lulus)}</td>
                  <td style={cell()}>{row.nama_sekolah}</td>
                  <td style={cell({ textAlign: 'center' })}>
                    {pendidikanGakureki(row.tingkat_pendidikan, row.jurusan, '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null,
      kerjaRows.length > 0 ? (
        <div data-cv-block key="kerja" style={{ paddingTop: '8px' }}>
          <div style={secTab()}>職歴</div>
          <table style={tbl()}>
            <colgroup>
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '28%' }} />
            </colgroup>
            <thead>
              <tr>
                <td style={label()}>入社年月</td>
                <td style={label()}>退職年月</td>
                <td style={label()}>会社名</td>
                <td style={label()}>仕事</td>
                <td style={label()}>仕事内容</td>
              </tr>
            </thead>
            <tbody>
              {kerjaRows.map((row) => (
                <tr key={row.id}>
                  <td style={cell({ textAlign: 'center' })}>{formatCvYm(row.tahun_mulai, row.bulan_mulai)}</td>
                  <td style={cell({ textAlign: 'center' })}>{formatCvYm(row.tahun_selesai, row.bulan_selesai)}</td>
                  <td style={cell()}>{row.nama_perusahaan}</td>
                  <td style={cell({ textAlign: 'center' })}>{pekerjaanToJapanese(row.jenis_pekerjaan || row.posisi_pekerjaan)}</td>
                  <td style={cell({ whiteSpace: 'pre-wrap' })}>{row.deskripsi_pekerjaan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null,
      certRows.length > 0 ? (
        <div data-cv-block key="sertifikat" style={{ paddingTop: '8px' }}>
          <div style={secTab()}>資格・免許</div>
          <table style={tbl()}>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '52%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr>
                <td style={label()}>取得年月</td>
                <td style={label()}>資格</td>
                <td style={label()}>備考</td>
              </tr>
            </thead>
            <tbody>
              {certRows.map((row) => (
                <tr key={row.id}>
                  <td style={cell({ textAlign: 'center' })}>{formatCvYm(row.tahun_diperoleh, row.bulan_diperoleh)}</td>
                  <td style={cell()}>{sertifikatNamaResmi(row.nama_sertifikat)}</td>
                  <td style={cell({ textAlign: 'center' })}>{sertifikatCatatan(row.nama_sertifikat, row.keterangan_skor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null,
      keluargaRows.length > 0 ? (
        <div data-cv-block key="keluarga" style={{ paddingTop: '8px' }}>
          <div style={secTab()}>家族構成</div>
          <table style={tbl()}>
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '34%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '32%' }} />
            </colgroup>
            <thead>
              <tr>
                <td style={label()}>順番</td>
                <td style={label()}>続柄</td>
                <td style={label()}>氏名</td>
                <td style={label()}>年齢</td>
                <td style={label()}>仕事内容</td>
              </tr>
            </thead>
            <tbody>
              {keluargaRows.map((row, index) => (
                <tr key={row.id}>
                  <td style={cell({ textAlign: 'center' })}>{index + 1}</td>
                  <td style={cell({ textAlign: 'center' })}>{row.hubungan ? hubunganToJapanese(row.hubungan) : ''}</td>
                  <td style={cell()}>{row.nama_anggota}</td>
                  <td style={cell({ textAlign: 'center' })}>{row.umur ? `${row.umur}歳` : ''}</td>
                  <td style={cell({ textAlign: 'center' })}>{pekerjaanToJapanese(row.pekerjaan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null,
      tujuanText ? <Essay key="tujuan" title="日本での目標" body={tujuanText} /> : null,
      medisText ? <Essay key="medis" title="追加情報" body={medisText} /> : null,
  ].filter((block): block is React.ReactElement => block != null);

  const sheetStyle: React.CSSProperties = {
    width: '794px',
    height: `${PAGE_HEIGHT}px`,
    backgroundColor: '#fff',
    padding: `${PAGE_PAD_Y}px ${PAGE_PAD_X}px`,
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  return (
    <div id="cv-template" style={{
      width: '794px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px',
      backgroundColor: '#d1d5db',
      fontFamily: 'var(--font-noto-sans-jp), "Noto Sans JP", "Meiryo", "MS Gothic", sans-serif',
      fontSize: '11px', fontWeight: 400, lineHeight: 1.35, color: '#000', boxSizing: 'border-box', margin: '0 auto',
    }}>
      <div
        ref={rootRef}
        aria-hidden
        style={{ position: 'absolute', visibility: 'hidden', width: `${CONTENT_WIDTH}px`, top: 0, left: 0, pointerEvents: 'none' }}
      >
        <CvHeader nomor={nomor} dibuat={dibuat} page={1} total={1} />
        <div data-cv-page-label style={{ fontSize: '11px', fontWeight: 400, marginTop: '4px', lineHeight: 1.35 }}>ページ 1 / 2</div>
        {blocks.map((block, index) => React.cloneElement(block, { key: `measure-${index}` }))}
      </div>
      {pages.map((indexes, pageIndex) => (
        <div data-cv-sheet key={pageIndex} style={sheetStyle}>
          <CvHeader nomor={nomor} dibuat={dibuat} page={pageIndex + 1} total={pages.length} />
          {indexes.map((index) => blocks[index] ? React.cloneElement(blocks[index], { key: blocks[index].key ?? index }) : null)}
        </div>
      ))}
    </div>
  );
}

function samePages(left: number[][], right: number[][]): boolean {
  return left.length === right.length && left.every((page, index) =>
    page.length === right[index]?.length && page.every((value, item) => value === right[index][item]),
  );
}

const metaBox: React.CSSProperties = {
  ...TEXT,
  backgroundColor: '#f2f2f2',
  border: RULE,
  padding: '4px 8px',
  width: '168px',
  textAlign: 'center',
  boxSizing: 'border-box',
  backgroundClip: 'padding-box',
};

function CvHeader({ nomor, dibuat, page, total }: { nomor: string; dibuat: string; page: number; total: number }) {
  return (
    <div data-cv-header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '12px', lineHeight: 1.15, paddingTop: '8px' }}>履歴書</div>
        {total > 1 && (
          <div style={{ ...TEXT, marginTop: '4px' }}>ページ {page} / {total}</div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 168px', columnGap: '8px', rowGap: '6px', alignItems: 'center' }}>
        <span style={{ ...TEXT, textAlign: 'right' }}>NO</span>
        <div style={metaBox}>{nomor}</div>
        <span style={{ ...TEXT, textAlign: 'right' }}>作成日</span>
        <div style={metaBox}>{dibuat}</div>
      </div>
    </div>
  );
}

function Essay({ title, body }: { title: string; body: string }) {
  return (
    <div data-cv-block style={{ paddingTop: '8px' }}>
      <div style={secTab()}>{title}</div>
      <table style={tbl()}>
        <tbody>
          <tr>
            <td style={cell({ minHeight: '72px', whiteSpace: 'pre-wrap' })}>{body}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
