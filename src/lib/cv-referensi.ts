/** Kamus sheet Referensi pada FORMAT CV FTI. Nilai tersimpan bahasa Jepang. */

export type CvOption = { value: string; label: string };

export type SertifikatReferensi = {
  /** Label pendek yang disimpan di nama_sertifikat. */
  id: string;
  ja: string;
};

export const SERTIFIKAT_REFERENSI: SertifikatReferensi[] = [
  { id: "JFT Basic A2", ja: "JFT-Basic 国際交流基金日本語基礎テスト" },
  { id: "JLPT N4", ja: "日本語能力試験 N4" },
  { id: "SSW Kaigo Bahasa Indonesia", ja: "介護技能評価試験" },
  { id: "SSW Kaigo Bahasa Jepang", ja: "介護日本語評価試験" },
  { id: "SSW Pertanian", ja: "農業技能測定試験1号" },
  { id: "SSW Pengolahan Makanan", ja: "飲食料品製造業分野 特定技能1号評価試験" },
  { id: "SSW Peternakan", ja: "特定技能「畜産業」" },
  { id: "SSW Driver Truck", ja: "特定技能トラック1号試験" },
  { id: "SIM A", ja: "インドネシアの普通自動車運転免許" },
  { id: "SIM B1", ja: "インドネシアの中型自動車運転免許" },
  { id: "SIM B2", ja: "インドネシアの大型自動車運転免許" },
];

export const SERTIFIKAT_OPTIONS: CvOption[] = SERTIFIKAT_REFERENSI.map((item) => ({
  value: item.id,
  label: `${item.id} / ${item.ja}`,
}));

export const JURUSAN_REFERENSI: { id: string; ja: string }[] = [
  { id: "OTOMOTIF", ja: "自動車科学" },
  { id: "IPS", ja: "社会" },
  { id: "IPA", ja: "理科" },
  { id: "AKUTANSI", ja: "会計学" },
  { id: "ARSITEKTUR", ja: "建築学" },
  { id: "PENERBANGAN", ja: "飛行機科学" },
  { id: "KAPAL", ja: "漁船クルーズ科学" },
  { id: "ELEKTRIK", ja: "エレクツロニク科学" },
  { id: "KOMPUTER", ja: "コンピュータ科学" },
  { id: "ADMINISTRASI", ja: "管理学" },
  { id: "PERAWAT", ja: "看護婦" },
  { id: "FARMASI", ja: "製薬科学" },
  { id: "TATA BOGA", ja: "料理科学" },
  { id: "RPL", ja: "ソフトウェア工学" },
  { id: "TATA BUSANA", ja: "ファッション科学" },
  { id: "DESAIN GRAFIK", ja: "グラフィックデザイン科学" },
  { id: "PERHOTELAN", ja: "おもてなし専攻" },
];

export const JURUSAN_OPTIONS: CvOption[] = JURUSAN_REFERENSI.map((item) => ({
  value: item.ja,
  label: `${item.ja} / ${item.id}`,
}));

export const PEKERJAAN_REFERENSI: { id: string; ja: string }[] = [
  { id: "Buruh Harian Lepas", ja: "アルバイト" },
  { id: "Buruh Tani / Perkebunan", ja: "農民" },
  { id: "Pembantu Rumah Tangga", ja: "家事手伝い" },
  { id: "Tukang Cukur", ja: "理容師" },
  { id: "Tukang Listrik", ja: "電気技師" },
  { id: "Tukang Batu", ja: "石工" },
  { id: "Tukang Kayu", ja: "大工" },
  { id: "Wartawan", ja: "記者" },
  { id: "Ustadz / Mubaligh", ja: "牧師" },
  { id: "Guru", ja: "教師" },
  { id: "Sopir", ja: "運転手" },
  { id: "Pedagang", ja: "商人" },
  { id: "Perangkat Desa", ja: "役人" },
  { id: "Kepala Desa", ja: "村長" },
  { id: "Wiraswasta", ja: "自営業" },
  { id: "Pelajar", ja: "学生" },
  { id: "Security", ja: "警備員" },
  { id: "Salon", ja: "美容師" },
  { id: "Mekanik", ja: "メカニック" },
  { id: "Belum / Tidak Bekerja", ja: "未就労" },
  { id: "Mengurus Rumah Tangga", ja: "家事" },
  { id: "Pensiunan", ja: "定年" },
  { id: "Pegawai Negeri Sipil", ja: "公務員" },
  { id: "TNI", ja: "軍人" },
  { id: "Petani / Pekebun", ja: "農家" },
  { id: "Peternak", ja: "畜産" },
  { id: "Karyawan Swasta", ja: "会社員" },
  { id: "Desain Grafik", ja: "グラフィックデザイン" },
  { id: "Ojek Online", ja: "タクシーバイク" },
  { id: "Kurir", ja: "宅配便" },
  { id: "Debtcollector", ja: "借金取り" },
  { id: "Kontraktor", ja: "請負業者" },
  { id: "Konstruksi", ja: "建設" },
  { id: "Tukang Parkir", ja: "駐車監視員" },
  { id: "Marketing", ja: "マーケティング" },
];

export const PEKERJAAN_OPTIONS: CvOption[] = PEKERJAAN_REFERENSI.map((item) => ({
  value: item.ja,
  label: `${item.ja} / ${item.id}`,
}));

export function withCurrentOption(options: CvOption[], current: string | undefined): CvOption[] {
  const value = (current ?? "").trim();
  if (!value || options.some((opt) => opt.value === value)) return options;
  return [...options, { value, label: value }];
}

export function findSertifikat(nama: string | undefined): SertifikatReferensi | undefined {
  const raw = (nama ?? "").trim();
  if (!raw) return undefined;
  const norm = raw.toLowerCase();
  const listed = SERTIFIKAT_REFERENSI.find(
    (item) => item.id.toLowerCase() === norm || item.ja === raw,
  );
  if (listed) return listed;
  const jlpt = raw.match(/^JLPT\s*(N[1-5])$/i);
  if (jlpt) {
    const level = jlpt[1].toUpperCase();
    return { id: `JLPT ${level}`, ja: `日本語能力試験 ${level}` };
  }
  return undefined;
}

export function pekerjaanToJapanese(value: string | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const byJa = PEKERJAAN_REFERENSI.find((item) => item.ja === raw);
  if (byJa) return byJa.ja;
  const byId = PEKERJAAN_REFERENSI.find((item) => item.id.toLowerCase() === raw.toLowerCase());
  if (byId) return byId.ja;
  const alias: Record<string, string> = {
    petani: "農家",
    "ibu rumah tangga": "家事",
    wiraswasta: "自営業",
    guru: "教師",
    pedagang: "商人",
    buruh: "アルバイト",
  };
  return alias[raw.toLowerCase()] ?? raw;
}

/** Nama resmi Jepang untuk kolom 資格. Teks di luar kamus tampil apa adanya. */
export function sertifikatNamaResmi(nama: string | undefined): string {
  const raw = (nama ?? "").trim();
  if (!raw) return "";
  return findSertifikat(raw)?.ja ?? raw;
}

/** Label pendek + skor untuk kolom catatan. */
export function sertifikatCatatan(nama: string | undefined, skor: string | undefined): string {
  const hit = findSertifikat(nama);
  const short = hit?.id ?? "";
  return [short, (skor ?? "").trim()].filter(Boolean).join(" ");
}
