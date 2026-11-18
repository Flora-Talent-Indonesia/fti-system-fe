import type { LpkKeluargaItem, LpkPendidikanItem, LpkPekerjaanItem, LpkSertifikatItem, LpkStudentRecord } from "@/types/lpk-student";
import { ftiStudentId, lpkPublicId, mitraStudentId } from "@/lib/participant-id";
import { createEmptyLpkStudent } from "@/types/lpk-student";
import { emojiAvatarDataUrl } from "@/lib/emoji-avatar";
import { toKatakana } from "@/lib/katakana-master";
import { JURUSAN_REFERENSI, pekerjaanToJapanese } from "@/lib/cv-referensi";

function fullStudent(partial: Partial<LpkStudentRecord>): LpkStudentRecord {
  return createEmptyLpkStudent(partial);
}

type SukabumiExample = {
  id: string;
  no: string;
  nama: string;
  kana: string;
  panggilan: string;
  gender: "L" | "P";
  emoji: string;
  lahir: string;
  umur: string;
  darah: string;
  jalan: string;
  kecamatan: string;
  pos: string;
  program: "ikusei" | "tg";
  kerja: string;
  level: string;
  hobi: string;
  status: "aktif" | "rekrut" | "match_job";
  tinggi: string;
  berat: string;
  masuk: string;
  jurusan: string;
  ayah: string;
  ibu: string;
};

/** Nama job - lokasi, supaya FTI langsung melihat penempatan contoh. */
const SUKABUMI_JOB_LABEL: Record<string, string> = {
  "dummy-007": "Care Worker - Ichikawa",
  "dummy-008": "Pengelasan - Saitama",
  "dummy-009": "Perhotelan - Chiba",
  "dummy-010": "Konstruksi - Aichi",
  "dummy-011": "Pengolahan Makanan - Osaka",
  "dummy-012": "PM - Ichikawa",
  "dummy-013": "Care Worker - Tochigi",
  "dummy-014": "Pertanian - Ibaraki",
  "dummy-015": "Building Cleaning - Kanagawa",
  "dummy-016": "Perikanan - Hiroshima",
  "dummy-017": "Care Worker - Fukuoka",
  "dummy-018": "Pengelasan - Okayama",
  "dummy-019": "Perhotelan - Gifu",
  "dummy-020": "Manufaktur - Nagoya",
};

/** 14 siswa Sukabumi + Ahmad Rizki (dummy-001) = 15 contoh di portal LPK. */
const SUKABUMI_EXAMPLES: SukabumiExample[] = [
  { id: "dummy-007", no: "LPK-2026-002", nama: "RINA KARTIKA", kana: "リナ・カルティカ", panggilan: "リナ", gender: "P", emoji: "👩", lahir: "2003-04-02", umur: "23", darah: "A", jalan: "JL. AHMAD YANI NO. 18", kecamatan: "CIKOLE", pos: "43111", program: "ikusei", kerja: "Care Worker", level: "N5", hobi: "料理", status: "aktif", tinggi: "158", berat: "52", masuk: "2026-01-15", jurusan: "Keperawatan", ayah: "KARTIKA WIJAYA", ibu: "NENENG ROMLAH" },
  { id: "dummy-008", no: "LPK-2026-003", nama: "ANDI WIJAYA", kana: "アンディ・ウィジャヤ", panggilan: "アンディ", gender: "L", emoji: "👨", lahir: "2002-08-19", umur: "24", darah: "O", jalan: "JL. SILIWANGI NO. 7", kecamatan: "CITAMIANG", pos: "43141", program: "tg", kerja: "Pengelasan", level: "N4", hobi: "スポーツ", status: "rekrut", tinggi: "170", berat: "66", masuk: "2026-02-02", jurusan: "Teknik Las", ayah: "WIJAYA KUSUMA", ibu: "TITI SUHARTI" },
  { id: "dummy-009", no: "LPK-2026-004", nama: "PUTRI AMELIA", kana: "プトリ・アメリア", panggilan: "アメリア", gender: "P", emoji: "👩", lahir: "2004-01-30", umur: "22", darah: "B", jalan: "JL. PELABUHAN II NO. 21", kecamatan: "WARUDOYONG", pos: "43135", program: "ikusei", kerja: "Perhotelan", level: "N5", hobi: "音楽", status: "aktif", tinggi: "161", berat: "50", masuk: "2026-02-10", jurusan: "Perhotelan", ayah: "AMELIA SANTOSA", ibu: "DEWI RATNASARI" },
  { id: "dummy-010", no: "LPK-2026-005", nama: "HENDRA GUNAWAN", kana: "ヘンドラ・グナワン", panggilan: "ヘンドラ", gender: "L", emoji: "👨", lahir: "2001-06-11", umur: "25", darah: "AB", jalan: "JL. BHAYANGKARA NO. 4", kecamatan: "BAROS", pos: "43161", program: "tg", kerja: "Konstruksi", level: "N4", hobi: "釣り", status: "match_job", tinggi: "174", berat: "72", masuk: "2026-01-08", jurusan: "Teknik Bangunan", ayah: "GUNAWAN SAPUTRA", ibu: "LILIS SURIANI" },
  { id: "dummy-011", no: "LPK-2026-006", nama: "MAYA SARI", kana: "マヤ・サリ", panggilan: "マヤ", gender: "P", emoji: "👩", lahir: "2005-02-14", umur: "21", darah: "O", jalan: "JL. RUMAH SAKIT NO. 9", kecamatan: "CIBEUREUM", pos: "43165", program: "ikusei", kerja: "Pengolahan Makanan", level: "N5", hobi: "料理", status: "rekrut", tinggi: "156", berat: "48", masuk: "2026-03-01", jurusan: "Tata Boga", ayah: "SARIYONO", ibu: "YUYUN YULIANI" },
  { id: "dummy-012", no: "LPK-2026-007", nama: "RIZAL FAUZI", kana: "リザル・ファウジ", panggilan: "リザル", gender: "L", emoji: "👨", lahir: "2002-11-09", umur: "24", darah: "A", jalan: "JL. VETERAN NO. 33", kecamatan: "LEMBURSITU", pos: "43168", program: "tg", kerja: "Manufaktur", level: "N4", hobi: "スポーツ", status: "aktif", tinggi: "169", berat: "64", masuk: "2026-01-20", jurusan: "Teknik Mesin", ayah: "FAUZI RAMADHAN", ibu: "SRI MULYANI" },
  { id: "dummy-013", no: "LPK-2026-008", nama: "NUR AINI", kana: "ヌル・アイニ", panggilan: "アイニ", gender: "P", emoji: "👩", lahir: "2004-09-03", umur: "22", darah: "B", jalan: "JL. OTISTA NO. 15", kecamatan: "GUNUNGPUYUH", pos: "43121", program: "ikusei", kerja: "Care Worker", level: "N4", hobi: "読書", status: "aktif", tinggi: "159", berat: "51", masuk: "2026-02-18", jurusan: "Keperawatan", ayah: "AINI SOBARI", ibu: "CUCU NURJANAH" },
  { id: "dummy-014", no: "LPK-2026-009", nama: "DIMAS PRATAMA", kana: "ディマス・プラタマ", panggilan: "ディマス", gender: "L", emoji: "👨", lahir: "2003-12-21", umur: "22", darah: "O", jalan: "JL. SUKABUMI-BOGOR NO. 88", kecamatan: "CIKOLE", pos: "43113", program: "tg", kerja: "Pertanian", level: "N5", hobi: "園芸", status: "rekrut", tinggi: "171", berat: "63", masuk: "2026-03-12", jurusan: "Agribisnis", ayah: "PRATAMA NUGRAHA", ibu: "EEN NURHAYATI" },
  { id: "dummy-015", no: "LPK-2026-010", nama: "LIA RAHMAWATI", kana: "リア・ラフマワティ", panggilan: "リア", gender: "P", emoji: "👩", lahir: "2001-03-08", umur: "25", darah: "A", jalan: "JL. CIAUL NO. 6", kecamatan: "CITAMIANG", pos: "43142", program: "ikusei", kerja: "Building Cleaning", level: "N5", hobi: "音楽", status: "aktif", tinggi: "157", berat: "49", masuk: "2026-01-27", jurusan: "Perhotelan", ayah: "RAHMAT HIDAYAT", ibu: "WATI SUMARNI" },
  { id: "dummy-016", no: "LPK-2026-011", nama: "YOGA SAPUTRA", kana: "ヨガ・サプトラ", panggilan: "ヨガ", gender: "L", emoji: "👨", lahir: "2005-07-17", umur: "21", darah: "B", jalan: "JL. TIPAR NO. 12", kecamatan: "WARUDOYONG", pos: "43132", program: "tg", kerja: "Perikanan", level: "N4", hobi: "釣り", status: "match_job", tinggi: "176", berat: "69", masuk: "2026-02-05", jurusan: "Perikanan", ayah: "SAPUTRA JAYA", ibu: "NINA MARLINA" },
  { id: "dummy-017", no: "LPK-2026-012", nama: "INTAN PERMATASARI", kana: "インタン・ペルマタサリ", panggilan: "インタン", gender: "P", emoji: "👩", lahir: "2002-05-25", umur: "24", darah: "O", jalan: "JL. PASAR BARU NO. 3", kecamatan: "BAROS", pos: "43162", program: "ikusei", kerja: "Care Worker", level: "N5", hobi: "読書", status: "rekrut", tinggi: "163", berat: "55", masuk: "2026-03-20", jurusan: "Keperawatan", ayah: "PERMANA SARI", ibu: "INTAN SARI" },
  { id: "dummy-018", no: "LPK-2026-013", nama: "FAJAR NUGROHO", kana: "ファジャル・ヌグロホ", panggilan: "ファジャル", gender: "L", emoji: "👨", lahir: "2004-10-02", umur: "22", darah: "AB", jalan: "JL. LINGKAR SELATAN NO. 40", kecamatan: "CIBEUREUM", pos: "43164", program: "tg", kerja: "Pengelasan", level: "N4", hobi: "スポーツ", status: "aktif", tinggi: "168", berat: "61", masuk: "2026-01-22", jurusan: "Teknik Las", ayah: "NUGROHO BASUKI", ibu: "SITI AISYAH" },
  { id: "dummy-019", no: "LPK-2026-014", nama: "SALSABILA PUTRI", kana: "サルサビラ・プトリ", panggilan: "サルサ", gender: "P", emoji: "👩", lahir: "2003-01-28", umur: "23", darah: "A", jalan: "JL. PABUARAN NO. 19", kecamatan: "LEMBURSITU", pos: "43169", program: "ikusei", kerja: "Perhotelan", level: "N5", hobi: "写真", status: "rekrut", tinggi: "160", berat: "53", masuk: "2026-04-01", jurusan: "Perhotelan", ayah: "PUTRA LESMANA", ibu: "SALSABILA DEWI" },
  { id: "dummy-020", no: "LPK-2026-015", nama: "ARIF HIDAYAT", kana: "アリフ・ヒダヤット", panggilan: "アリフ", gender: "L", emoji: "👨", lahir: "2001-09-30", umur: "25", darah: "O", jalan: "JL. RAYA CISAAT NO. 27", kecamatan: "GUNUNGPUYUH", pos: "43122", program: "tg", kerja: "Manufaktur", level: "N4", hobi: "外国語学習", status: "aktif", tinggi: "173", berat: "67", masuk: "2026-02-24", jurusan: "Teknik Mesin", ayah: "HIDAYATULLAH", ibu: "ROHMAH" },
];

function sukabumiExampleStudents(): LpkStudentRecord[] {
  return SUKABUMI_EXAMPLES.map((seed, index) => {
    const slug = seed.nama.toLowerCase().replace(/[^a-z]+/g, "_");
    const passed = seed.status === "match_job";
    const nikDate = seed.lahir.replaceAll("-", "");
    return fullStudent({
      id: seed.id,
      status: seed.status,
      hasil_job: passed ? "lulus" : "",
      foto: emojiAvatarDataUrl(seed.emoji),
      no_peserta: seed.no,
      nik: `320201${nikDate}${String(index + 7).padStart(2, "0")}`,
      nama_lengkap: seed.nama,
      nama_katakana: seed.kana,
      nama_panggilan: seed.panggilan,
      angkatan: "2026",
      tanggal_lahir: seed.lahir,
      umur: seed.umur,
      jenis_kelamin: seed.gender,
      golongan_darah: seed.darah,
      status_pernikahan: "Lajang",
      agama: "イスラム教",
      asal: "Sukabumi",
      alamat: `${seed.jalan}, KEC. ${seed.kecamatan}, KOTA SUKABUMI`,
      kode_pos: seed.pos,
      telepon: `+62812${String(88000000 + index).padStart(8, "0")}`,
      email: `${slug}@email.com`,
      dokumen_ktp: `ktp_${slug}.pdf`,
      dokumen_ktp_ortu: `ktp_ortu_${slug}.pdf`,
      dokumen_kk: `kk_${slug}.pdf`,
      dokumen_akte: `akte_${slug}.pdf`,
      dokumen_ijazah: `ijazah_${slug}.pdf`,
      dokumen_skck: `skck_${slug}.pdf`,
      mcu_pdf: `mcu_${slug}.pdf`,
      dokumen_perjanjian: passed ? `perjanjian_${slug}.pdf` : "",
      tinggi_badan: seed.tinggi,
      berat_badan: seed.berat,
      mata_kiri: "6/6",
      kondisi_mata_kiri: "Normal",
      mata_kanan: "6/6",
      kondisi_mata_kanan: "Normal",
      berkacamata: "Tidak",
      tato: "Tidak Ada",
      merokok: "Tidak",
      buta_warna: "Tidak Buta Warna",
      patah_tulang: "Tidak Ada",
      hobi: seed.hobi,
      kontak_darurat_nama: seed.ibu,
      kontak_darurat_hubungan: "Ibu",
      kontak_darurat_telepon: `+62813${String(77000000 + index).padStart(8, "0")}`,
      program: seed.program,
      tingkatan_pembelajaran: seed.level,
      jenis_pekerjaan: SUKABUMI_JOB_LABEL[seed.id] ?? seed.kerja,
      asal_lpk: "LPK Mitra Sukabumi",
      tanggal_masuk_pelatihan: seed.masuk,
      tanggal_kelulusan: passed ? "2026-11-01" : "",
      perkiraan_masuk_jepang: passed ? "2027-04-01" : "",
      sertifikat: [
        {
          nama_sertifikat: `JLPT ${seed.level}`,
          status_kelulusan: 1,
          score: seed.level === "N4" ? "112" : "90",
          sertifikat: `jlpt_${seed.level.toLowerCase()}_${slug}.pdf`,
        },
      ],
      sertifikat_dimiliki: [`JLPT ${seed.level}`],
      keluarga: [
        { hubungan: "Ayah", nama: seed.ayah, umur: "50", status_pekerjaan: "Wiraswasta" },
        { hubungan: "Ibu", nama: seed.ibu, umur: "47", status_pekerjaan: "Ibu Rumah Tangga" },
      ],
      pendidikan: [
        {
          nama_sekolah: "SMK NEGERI 1 SUKABUMI",
          tingkat_pendidikan: "SMK",
          jurusan: seed.jurusan,
          tahun_masuk: "2019",
          tahun_lulus: "2022",
        },
      ],
    });
  });
}

const JURUSAN_HINTS: Array<[RegExp, string]> = [
  [/rawat|nurse|care|perawat/i, "看護婦"],
  [/hotel/i, "おもてなし専攻"],
  [/boga|makanan|food/i, "料理科学"],
  [/bangun|arsitek|konstruksi/i, "建築学"],
  [/ikan|kapal|fisher/i, "漁船クルーズ科学"],
  [/akun/i, "会計学"],
  [/listrik|elektr/i, "エレクツロニク科学"],
  [/komputer|rpl/i, "コンピュータ科学"],
  [/agri|tani|pertanian/i, "理科"],
  [/las|mesin|otomotif|manufaktur|teknik|cnc|pm/i, "自動車科学"],
];

function jurusanJa(raw: string | undefined, blob: string): string {
  const text = (raw ?? "").trim();
  const known = JURUSAN_REFERENSI.find(
    (item) => item.ja === text || item.id.toLowerCase() === text.toLowerCase(),
  );
  if (known) return known.ja;
  const source = `${text} ${blob}`;
  return JURUSAN_HINTS.find(([pattern]) => pattern.test(source))?.[1] ?? "自動車科学";
}

function workStory(blob: string): { jenis: string; deskripsi: string; company: string } {
  if (/weld|las|pengelasan/i.test(blob)) {
    return { jenis: "会社員", deskripsi: "鉄工所で溶接と仕上げを行う", company: "PT LAS MITRA" };
  }
  if (/care|rawat/i.test(blob)) {
    return { jenis: "会社員", deskripsi: "介護施設で利用者の食事と移動を補助する", company: "PT MITRA CARE" };
  }
  if (/hotel/i.test(blob)) {
    return { jenis: "会社員", deskripsi: "ホテルで客室の準備と接客を行う", company: "PT MITRA HOTEL" };
  }
  if (/tani|agri|pertanian/i.test(blob)) {
    return { jenis: "農家", deskripsi: "野菜の栽培、水やり、収穫を行う", company: "KEBUN KELUARGA" };
  }
  if (/ikan|kapal|fisher/i.test(blob)) {
    return { jenis: "会社員", deskripsi: "水産加工で選別と梱包を行う", company: "PT NUSA IKAN" };
  }
  if (/clean/i.test(blob)) {
    return { jenis: "会社員", deskripsi: "建物の清掃と備品の整理を行う", company: "PT BERSIH JAYA" };
  }
  if (/boga|makanan|food/i.test(blob)) {
    return { jenis: "会社員", deskripsi: "食品工場で加工と衛生管理を補助する", company: "PT MITRA FOOD" };
  }
  if (/konstruksi|bangun/i.test(blob)) {
    return { jenis: "建設", deskripsi: "建設現場で資材の運搬と作業を補助する", company: "PT BANGUN MITRA" };
  }
  return { jenis: "会社員", deskripsi: "製造ラインで機械の操作と製品検査を行う", company: "PT MITRA MANUFAKTUR" };
}

function goalJa(blob: string): string {
  if (/care|rawat/i.test(blob)) return "日本の介護現場で、利用者に丁寧に接しながら長く働きたいです。";
  if (/weld|las|pengelasan/i.test(blob)) return "日本で溶接の技術を高め、安全に仕事を続けたいです。";
  if (/hotel/i.test(blob)) return "日本のホテルで接客を学び、日本語でお客様に対応したいです。";
  if (/tani|agri|pertanian/i.test(blob)) return "日本の農場で作物の栽培を学び、真面目に働きたいです。";
  if (/ikan|kapal|fisher/i.test(blob)) return "日本の水産現場で経験を積み、家族を支えたいです。";
  if (/clean/i.test(blob)) return "日本で清掃の仕事を丁寧にこなし、信頼される人材になりたいです。";
  if (/boga|makanan|food/i.test(blob)) return "日本の食品工場で衛生を守りながら、長く働きたいです。";
  if (/konstruksi|bangun/i.test(blob)) return "日本の建設現場で安全に働き、技術を身につけたいです。";
  return "日本で製造の仕事に就き、学んだ技術を活かして長く働きたいです。";
}

function fillEducation(student: LpkStudentRecord, city: string, jurusan: string): LpkPendidikanItem[] {
  const birthYear = Number((student.tanggal_lahir ?? "").slice(0, 4)) || 2002;
  const existing = student.pendidikan ?? [];
  const upper = existing.find((item) =>
    ["SMK", "SMA", "D3", "S1"].includes((item.tingkat_pendidikan ?? "").toUpperCase()),
  );
  const start = Number(upper?.tahun_masuk) || birthYear + 15;
  const withDates = (
    item: LpkPendidikanItem | undefined,
    tingkat: string,
    yearIn: number,
    yearOut: number,
    school: string,
    major: string,
  ): LpkPendidikanItem => ({
    ...item,
    tingkat_pendidikan: item?.tingkat_pendidikan || tingkat,
    nama_sekolah: item?.nama_sekolah || school,
    jurusan: ["SMK", "SMA", "D3", "S1"].includes(tingkat) ? (item?.jurusan && JURUSAN_REFERENSI.some((opt) => opt.ja === item.jurusan) ? item.jurusan : major) : "",
    tahun_masuk: item?.tahun_masuk || String(yearIn),
    bulan_masuk: item?.bulan_masuk || "7",
    tanggal_masuk: "",
    tahun_lulus: item?.tahun_lulus || String(yearOut),
    bulan_lulus: item?.bulan_lulus || "6",
    tanggal_lulus: "",
  });
  const rows = [
    withDates(existing.find((item) => (item.tingkat_pendidikan ?? "").toUpperCase() === "SD"), "SD", start - 9, start - 3, `SD NEGERI 1 ${city}`, ""),
    withDates(existing.find((item) => (item.tingkat_pendidikan ?? "").toUpperCase() === "SMP"), "SMP", start - 3, start, `SMP NEGERI 1 ${city}`, ""),
    withDates(upper, (upper?.tingkat_pendidikan ?? "SMK").toUpperCase(), start, Number(upper?.tahun_lulus) || start + 3, `SMK NEGERI 1 ${city}`, jurusan),
  ];
  const extra = existing.filter((item) => !["SD", "SMP", "SMK", "SMA", "D3", "S1"].includes((item.tingkat_pendidikan ?? "").toUpperCase()));
  return [...rows, ...extra];
}

function fillWork(student: LpkStudentRecord, story: { jenis: string; deskripsi: string; company: string }): LpkPekerjaanItem[] {
  const birthYear = Number((student.tanggal_lahir ?? "").slice(0, 4)) || 2002;
  const current = (student.pekerjaan ?? []).filter((item) => (item.nama_perusahaan ?? "").trim() || (item.posisi_pekerjaan ?? "").trim());
  const source = current.length ? current : [{ nama_perusahaan: story.company, status_pekerjaan: "Magang" }];
  return source.map((item) => ({
    ...item,
    nama_perusahaan: item.nama_perusahaan || story.company,
    jenis_pekerjaan: pekerjaanToJapanese(item.jenis_pekerjaan ?? "") || story.jenis,
    deskripsi_pekerjaan: item.deskripsi_pekerjaan || story.deskripsi,
    status_pekerjaan: item.status_pekerjaan || "Magang",
    tahun_mulai: item.tahun_mulai || String(birthYear + 19),
    bulan_mulai: item.bulan_mulai || "1",
    tanggal_mulai: "",
    tahun_selesai: item.tahun_selesai || item.tahun_mulai || String(birthYear + 19),
    bulan_selesai: item.bulan_selesai || "6",
    tanggal_selesai: "",
  }));
}

function fillFamily(student: LpkStudentRecord, index: number): LpkKeluargaItem[] {
  const last = student.nama_lengkap.trim().split(/\s+/).at(-1) || "KELUARGA";
  const current = student.keluarga ?? [];
  const ayah = current.find((item) => /ayah|bapak|父/i.test(item.hubungan ?? ""));
  const ibu = current.find((item) => /ibu|母/i.test(item.hubungan ?? ""));
  const rest = current.filter((item) => item !== ayah && item !== ibu);
  const parents: LpkKeluargaItem[] = [
    ayah ?? { hubungan: "Ayah", nama: `BAPAK ${last}`, umur: "52", status_pekerjaan: index % 2 === 0 ? "Petani / Pekebun" : "Wiraswasta" },
    ibu ?? { hubungan: "Ibu", nama: `IBU ${last}`, umur: "48", status_pekerjaan: "Mengurus Rumah Tangga" },
  ];
  return [...parents, ...rest].map((item) => ({
    ...item,
    umur: item.umur == null || item.umur === "" ? "50" : String(item.umur),
    status_pekerjaan: pekerjaanToJapanese(item.status_pekerjaan ?? "") || "自営業",
  }));
}

function normalizeCertName(name: string): string {
  const key = name.trim().toLowerCase();
  if (key === "care worker basic") return "SSW Kaigo Bahasa Indonesia";
  if (key === "ssw manufaktur") return "JFT Basic A2";
  if (key === "sertifikat welding") return "溶接技能講習";
  return name.trim();
}

function fillCertificates(student: LpkStudentRecord, index: number): LpkSertifikatItem[] {
  const current = (student.sertifikat ?? []).filter((item) => (item.nama_sertifikat ?? "").trim());
  const source = current.length
    ? current
    : [{
        nama_sertifikat: (student.tingkatan_pembelajaran ?? "").includes("5") ? "JLPT N5" : "JLPT N4",
        status_kelulusan: 1,
        score: String(95 + (index % 35)),
        sertifikat: "jlpt.pdf",
      }];
  return source.map((item, certIndex) => ({
    ...item,
    nama_sertifikat: normalizeCertName(item.nama_sertifikat ?? ""),
    tahun_diperoleh: item.tahun_diperoleh || String(2024 + (certIndex % 2)),
    bulan_diperoleh: item.bulan_diperoleh || "12",
    tanggal_diperoleh: "",
  }));
}

/** Melengkapi field CV yang kosong supaya preview dummy tidak terlihat belum jadi. */
function completeDummyCv(student: LpkStudentRecord, index: number): LpkStudentRecord {
  const city = (student.asal || "Sukabumi").toUpperCase();
  const blob = `${student.jenis_pekerjaan ?? ""} ${(student.pekerjaan ?? []).map((item) => `${item.posisi_pekerjaan ?? ""} ${item.jenis_pekerjaan ?? ""}`).join(" ")}`;
  const story = workStory(blob);
  const traveled = index % 3 === 0;
  const hasSisa = index % 7 === 0;
  const onMedicine = index % 11 === 0;
  return {
    ...student,
    kewarganegaraan: student.kewarganegaraan || "インドネシア",
    status_pernikahan: student.status_pernikahan || "Lajang",
    tempat_lahir: student.tempat_lahir || student.asal || "Sukabumi",
    tangan_dominan: student.tangan_dominan || (index % 8 === 0 ? "左" : "右"),
    minum_alkohol: student.minum_alkohol || "Tidak",
    mata_kiri: student.mata_kiri || "6/6",
    mata_kanan: student.mata_kanan || "6/6",
    hobi: student.hobi || "読書",
    pendidikan: fillEducation(student, city, jurusanJa(student.pendidikan?.find((item) => item.jurusan)?.jurusan ?? "", blob)),
    pekerjaan: fillWork(student, story),
    keluarga: fillFamily(student, index),
    sertifikat: fillCertificates(student, index),
    periode_luar_negeri: student.periode_luar_negeri || (traveled ? "2024年6月" : "なし"),
    tujuan_luar_negeri: student.tujuan_luar_negeri || (traveled ? "観光" : "なし"),
    sisa_hari_tokutei: student.sisa_hari_tokutei || (hasSisa ? "あり" : "なし"),
    sisa_tahun: student.sisa_tahun || (hasSisa ? "1" : ""),
    sisa_bulan: student.sisa_bulan || (hasSisa ? "4" : ""),
    tujuan_ke_jepang: student.tujuan_ke_jepang || goalJa(blob),
    keterangan_medis_status: student.keterangan_medis_status || (onMedicine ? "あり" : "なし"),
    keterangan_medis: student.keterangan_medis || (onMedicine ? "ビタミン剤" : ""),
  };
}

/** Siswa dummy lengkap untuk demo tabel LPK Mitra (FE only). */
export function getDummyLpkStudents(): LpkStudentRecord[] {
  const built = ([
    fullStudent({
      id: "dummy-001",
      status: "match_job",
      foto: emojiAvatarDataUrl("👨"),
      no_peserta: "FTI-2026-001",
      nik: "3201987654321001",
      nama_lengkap: "AHMAD RIZKI PRATAMA",
      nama_katakana: "アフマド・リズキ・プラタマ",
      nama_panggilan: "リズキ",
      angkatan: "2026",
      kewarganegaraan: "インドネシア",
      tanggal_lahir: "2002-03-12",
      umur: "23",
      jenis_kelamin: "L",
      golongan_darah: "O",
      status_pernikahan: "Lajang",
      agama: "イスラム教",
      asal: "Sukabumi",
      alamat: "JL. SUDIRMAN NO. 12, KEL. BAROS, KEC. CIKOLE, KOTA SUKABUMI",
      kode_pos: "43131",
      telepon: "+6282112345678",
      email: "ahmad.rizki@email.com",
      dokumen_ktp: "ktp_ahmad_rizki.pdf",
      dokumen_kk: "kk_pratama.pdf",
      dokumen_akte: "akte_ahmad.pdf",
      dokumen_ijazah: "ijazah_smk_ahmad.pdf",
      mcu_pdf: "mcu_ahmad_rizki.pdf",
      mcu: "mcu_lampiran_ahmad.jpg",
      tinggi_badan: "172",
      berat_badan: "65",
      mata_kiri: "6/6",
      kondisi_mata_kiri: "Normal",
      mata_kanan: "6/6",
      kondisi_mata_kanan: "Normal",
      berkacamata: "Tidak",
      tato: "Tidak Ada",
      merokok: "Tidak",
      buta_warna: "Tidak Buta Warna",
      patah_tulang: "Tidak Ada",
      hobi: "スポーツ",
      tingkatan_pembelajaran: "N4",
      program: "tg",
      jenis_pekerjaan: "PM - Gunma",
      asal_lpk: "LPK Mitra Sukabumi",
      tanggal_masuk_pelatihan: "2026-01-10",
      tanggal_kelulusan: "2026-12-15",
      perkiraan_masuk_jepang: "2027-04-01",
      tanggal_keberangkatan: "2027-03-28",
      pendidikan: [
        {
          nama_sekolah: "SMK NEGERI 2 SUKABUMI",
          tingkat_pendidikan: "SMK",
          jurusan: "Teknik Mesin",
          bulan_masuk: "7",
          tahun_masuk: "2018",
          bulan_lulus: "6",
          tahun_lulus: "2021",
        },
      ],
      pekerjaan: [
        {
          nama_perusahaan: "PT MITRA PRESISI",
          posisi_pekerjaan: "Operator CNC",
          status_pekerjaan: "Magang",
          bulan_mulai: "1",
          tahun_mulai: "2022",
          bulan_selesai: "6",
          tahun_selesai: "2022",
        },
      ],
      sertifikat: [
        {
          nama_sertifikat: "JLPT N4",
          status_kelulusan: 1,
          score: "118",
          bulan_diperoleh: "12",
          tahun_diperoleh: "2025",
          sertifikat: "sertifikat_jlpt_n4.pdf",
        },
      ],
      sertifikat_dimiliki: ["JLPT N4"],
      keluarga: [
        { hubungan: "Ayah", nama: "DADANG PRATAMA", umur: "50", status_pekerjaan: "Petani" },
        { hubungan: "Ibu", nama: "SRI WAHYUNI", umur: "48", status_pekerjaan: "Ibu Rumah Tangga" },
      ],
      timeline: [
        { label: "Masuk Pelatihan", date: "2026-01-10", status: "done" },
        { label: "Pembelajaran Bahasa", date: "2026-01-15", status: "done" },
        { label: "Matching Job #1", date: "2026-05-20", status: "done" },
        { label: "Mensetsu #1", date: "2026-06-05", status: "failed", note: "Gagal — kurang pengalaman teknis" },
        { label: "Matching Job #2", date: "2026-07-10", status: "done" },
        { label: "Mensetsu #2", date: "2026-07-25", status: "done", note: "Lulus mensetsu" },
        { label: "Pemberkasan", date: "2026-08-10", status: "done" },
        { label: "Keberangkatan", date: "2027-03-28", status: "done" },
        { label: "Tiba di Jepang", date: "2027-04-01", status: "done" },
      ],
      job_placement: {
        prefektur: "Aichi-ken (愛知県)",
        kota: "Toyota-shi (豊田市)",
        alamat_kerja: "1-2-3 Motomachi, Toyota-shi, Aichi-ken 471-0034",
        nama_perusahaan: "Toyota Boshoku Corporation",
        bidang_usaha: "Manufaktur Komponen Otomotif",
        posisi: "Operator Mesin CNC",
        gaji: "¥180,000 / bulan",
        durasi_kontrak: "3 Tahun",
        hari_libur: "8 hari / bulan (Sabtu-Minggu, hari libur nasional)",
      },
      tanggal_mensetsu: "2026-07-25",
      tanggal_naitei: "2026-08-05",
      tsk: "TSK-Aichi",
      tanggal_rekrut: "2026-01-05",
      cert_jft_basic_a2: "Lulus",
      cert_ssw_idn: "Lulus",
      cert_ssw_jpn: "Proses",
      dokumen_paspor: "C1234567",
      dokumen_visa: "2026-11-15",
      dokumen_coe: "2026-10-01",
      dokumen_ektkln: "2026-12-01",
    }),
    fullStudent({
      id: "dummy-002",
      status: "aktif",
      foto: emojiAvatarDataUrl("👩"),
      no_peserta: "FTI-2026-002",
      nik: "3201987654321002",
      nama_lengkap: "SITI NURHALIZA",
      nama_katakana: "シティ・ヌルハリザ",
      nama_panggilan: "シティ",
      angkatan: "2026",
      kewarganegaraan: "インドネシア",
      tanggal_lahir: "2003-11-05",
      umur: "22",
      jenis_kelamin: "P",
      golongan_darah: "A",
      status_pernikahan: "Lajang",
      agama: "イスラム教",
      asal: "Bandung",
      alamat: "JL. DAGO NO. 88, KEC. COBLONG, KOTA BANDUNG",
      kode_pos: "40135",
      telepon: "+6282211122334",
      email: "siti.nurhaliza@email.com",
      dokumen_ktp: "ktp_siti.pdf",
      dokumen_kk: "kk_nurhaliza.pdf",
      dokumen_akte: "akte_siti.pdf",
      dokumen_ijazah: "ijazah_smk_siti.pdf",
      mcu_pdf: "mcu_siti_nurhaliza.pdf",
      mcu: "mcu_tambahan_siti.pdf",
      tinggi_badan: "160",
      berat_badan: "54",
      mata_kiri: "6/6",
      mata_kanan: "6/6",
      berkacamata: "Tidak",
      tato: "Tidak Ada",
      merokok: "Tidak",
      buta_warna: "Tidak Buta Warna",
      patah_tulang: "Tidak Ada",
      hobi: "料理",
      tingkatan_pembelajaran: "N5",
      program: "ikusei",
      jenis_pekerjaan: "Care Worker - Saitama",
      asal_lpk: "LPK Mitra Bandung",
      tanggal_masuk_pelatihan: "2026-02-01",
      sertifikat: [
        { nama_sertifikat: "JLPT N5", status_kelulusan: 1, score: "95", sertifikat: "jlpt_n5_siti.pdf" },
        { nama_sertifikat: "Care Worker Basic", status_kelulusan: 1, score: "Lulus", sertifikat: "care_basic.pdf" },
      ],
      sertifikat_dimiliki: ["JLPT N5", "Care Worker Basic"],
      keluarga: [
        { hubungan: "Ayah", nama: "HENDRA WIJAYA", umur: "52", status_pekerjaan: "Wiraswasta" },
        { hubungan: "Ibu", nama: "NUR AISYAH", umur: "49", status_pekerjaan: "Guru" },
      ],
      pendidikan: [
        {
          nama_sekolah: "SMK KESEHATAN BANDUNG",
          tingkat_pendidikan: "SMK",
          jurusan: "Keperawatan",
          tahun_masuk: "2019",
          tahun_lulus: "2022",
        },
      ],
      timeline: [
        { label: "Masuk Pelatihan", date: "2026-02-01", status: "done" },
        { label: "Pembelajaran Bahasa", date: "2026-02-10", status: "current", note: "Sedang berlangsung — level N5" },
        { label: "Matching Job", status: "upcoming" },
        { label: "Mensetsu", status: "upcoming" },
        { label: "Pemberkasan", status: "upcoming" },
        { label: "Keberangkatan", status: "upcoming" },
        { label: "Tiba di Jepang", status: "upcoming" },
      ],
      tanggal_mensetsu: "",
      tanggal_naitei: "",
      tsk: "TSK-Bandung",
      tanggal_rekrut: "2026-01-20",
      cert_jft_basic_a2: "Proses",
      cert_ssw_idn: "-",
      cert_ssw_jpn: "-",
      dokumen_paspor: "",
      dokumen_visa: "",
      dokumen_coe: "",
      dokumen_ektkln: "",
    }),
    fullStudent({
      id: "dummy-003",
      status: "aktif",
      foto: emojiAvatarDataUrl("🧑"),
      no_peserta: "FTI-2025-011",
      nik: "3201987654321003",
      nama_lengkap: "BUDI SANTOSO",
      nama_katakana: "ブディ・サントソ",
      nama_panggilan: "ブディ",
      angkatan: "2025",
      tanggal_lahir: "2001-07-20",
      umur: "24",
      jenis_kelamin: "L",
      golongan_darah: "B",
      agama: "イスラム教",
      asal: "Cimahi",
      alamat: "JL. CIMUNI RAYA NO. 5, CIMAHI",
      kode_pos: "40535",
      telepon: "+6282312345678",
      email: "budi.santoso@email.com",
      dokumen_ktp: "ktp_budi.pdf",
      dokumen_kk: "kk_santoso.pdf",
      dokumen_akte: "akte_budi.pdf",
      dokumen_ijazah: "ijazah_budi.pdf",
      mcu_pdf: "mcu_budi_santoso.pdf",
      mcu: "mcu_scan_budi.jpg",
      tinggi_badan: "168",
      berat_badan: "70",
      mata_kiri: "6/6",
      mata_kanan: "6/6",
      berkacamata: "Tidak",
      tato: "Tidak Ada",
      merokok: "Tidak",
      buta_warna: "Tidak Buta Warna",
      patah_tulang: "Tidak Ada",
      hobi: "釣り",
      program: "tg",
      jenis_pekerjaan: "Pengelasan - Aichi",
      asal_lpk: "LPK Mitra Bandung",
      tanggal_masuk_pelatihan: "2025-08-01",
      sertifikat: [
        { nama_sertifikat: "JLPT N3", status_kelulusan: 1, score: "142", sertifikat: "jlpt_n3_budi.pdf" },
        { nama_sertifikat: "Sertifikat Welding", status_kelulusan: 1, score: "A", sertifikat: "welding_budi.pdf" },
      ],
      sertifikat_dimiliki: ["JLPT N3", "Sertifikat Welding"],
      keluarga: [{ hubungan: "Ayah", nama: "SANTOSO", umur: "55", status_pekerjaan: "Buruh" }],
      pekerjaan: [
        {
          nama_perusahaan: "PT LAS INDONESIA",
          posisi_pekerjaan: "Welder",
          status_pekerjaan: "Kontrak",
          tahun_mulai: "2020",
          tahun_selesai: "2023",
        },
      ],
      timeline: [
        { label: "Masuk Pelatihan", date: "2025-08-01", status: "done" },
        { label: "Pembelajaran Bahasa", date: "2025-08-15", status: "done" },
        { label: "Matching Job", date: "2026-04-10", status: "done" },
        { label: "Mensetsu", date: "2026-05-15", status: "current", note: "Menunggu hasil mensetsu" },
        { label: "Pemberkasan", status: "upcoming" },
        { label: "Keberangkatan", status: "upcoming" },
        { label: "Tiba di Jepang", status: "upcoming" },
      ],
      tanggal_mensetsu: "2026-05-15",
      tanggal_naitei: "",
      tsk: "TSK-Cimahi",
      tanggal_rekrut: "2025-07-15",
      cert_jft_basic_a2: "Lulus",
      cert_ssw_idn: "Lulus",
      cert_ssw_jpn: "Proses",
      dokumen_paspor: "B9876543",
      dokumen_visa: "",
      dokumen_coe: "2026-07-01",
      dokumen_ektkln: "",
    }),
    fullStudent({
      id: "dummy-004",
      status: "rekrut",
      foto: emojiAvatarDataUrl("👩‍🦱"),
      no_peserta: "FTI-2026-003",
      nik: "3201987654321004",
      nama_lengkap: "DEWI LESTARI",
      nama_katakana: "デウィ・レスタリ",
      nama_panggilan: "デウィ",
      angkatan: "2026",
      tanggal_lahir: "2002-12-01",
      umur: "23",
      jenis_kelamin: "P",
      golongan_darah: "AB",
      agama: "イスラム教",
      asal: "Garut",
      alamat: "JL. OTTO ISKANDARDINATA, GARUT",
      kode_pos: "44151",
      telepon: "+6282412345678",
      email: "dewi.lestari@email.com",
      dokumen_ktp: "ktp_dewi.pdf",
      dokumen_kk: "kk_lestari.pdf",
      dokumen_akte: "akte_dewi.pdf",
      dokumen_ijazah: "ijazah_dewi.pdf",
      mcu_pdf: "mcu_dewi_lestari.pdf",
      mcu: "mcu_dewi_lampiran.jpg",
      tinggi_badan: "155",
      berat_badan: "50",
      mata_kiri: "6/6",
      mata_kanan: "6/6",
      berkacamata: "Tidak",
      tato: "Tidak Ada",
      merokok: "Tidak",
      buta_warna: "Tidak Buta Warna",
      patah_tulang: "Tidak Ada",
      hobi: "読書",
      jenis_pekerjaan: "Magang Care Worker",
      asal_lpk: "Mandiri",
      tanggal_masuk_pelatihan: "2026-01-20",
      sertifikat: [
        { nama_sertifikat: "JLPT N4", status_kelulusan: 1, score: "120", sertifikat: "jlpt_n4_dewi.pdf" },
      ],
      sertifikat_dimiliki: ["JLPT N4", "Care Worker Basic"],
      keluarga: [
        { hubungan: "Ayah", nama: "ASEP LESTARI", umur: "51", status_pekerjaan: "Pedagang" },
        { hubungan: "Ibu", nama: "YATI SUMARNI", umur: "47", status_pekerjaan: "Pedagang" },
      ],
      timeline: [
        { label: "Masuk Pelatihan", date: "2026-01-20", status: "done" },
        { label: "Pembelajaran Bahasa", date: "2026-01-25", status: "done" },
        { label: "Matching Job #1", date: "2026-06-10", status: "done" },
        { label: "Mensetsu #1", date: "2026-06-25", status: "failed", note: "Gagal — tidak memenuhi syarat kesehatan" },
        { label: "Matching Job #2", date: "2026-08-05", status: "done" },
        { label: "Mensetsu #2", date: "2026-08-20", status: "failed", note: "Gagal — kemampuan bahasa kurang" },
        { label: "Dikeluarkan", date: "2026-09-01", status: "failed", note: "Tidak lulus setelah 2x gagal mensetsu" },
      ],
    }),
    fullStudent({
      id: "dummy-005",
      status: "rekrut",
      foto: emojiAvatarDataUrl("👦"),
      no_peserta: "FTI-2026-004",
      nik: "3201987654321005",
      nama_lengkap: "MUHAMMAD AZZAKY",
      nama_katakana: "ムハンマド・アザッキ",
      nama_panggilan: "アザッキ",
      angkatan: "2026",
      tanggal_lahir: "2004-01-18",
      umur: "21",
      jenis_kelamin: "L",
      golongan_darah: "O",
      agama: "イスラム教",
      asal: "Semarang",
      alamat: "JL. PANDANARAN NO. 22, SEMARANG",
      kode_pos: "50241",
      telepon: "+6282512345678",
      email: "azzaky.muhammad@email.com",
      dokumen_ktp: "ktp_azzaky.pdf",
      dokumen_kk: "kk_azzaky.pdf",
      dokumen_akte: "akte_azzaky.pdf",
      dokumen_ijazah: "ijazah_azzaky.pdf",
      mcu_pdf: "mcu_azzaky.pdf",
      mcu: "mcu_azzaky_tambahan.pdf",
      tinggi_badan: "175",
      berat_badan: "68",
      mata_kiri: "6/6",
      mata_kanan: "6/6",
      berkacamata: "Tidak",
      tato: "Tidak Ada",
      merokok: "Tidak",
      buta_warna: "Tidak Buta Warna",
      patah_tulang: "Tidak Ada",
      hobi: "外国語学習",
      program: "tg",
      jenis_pekerjaan: "Manufaktur - Nagoya",
      asal_lpk: "LPK Mitra Semarang",
      tanggal_masuk_pelatihan: "2026-03-01",
      sertifikat: [
        { nama_sertifikat: "JLPT N4", status_kelulusan: 1, score: "110", sertifikat: "jlpt_n4_azzaky.pdf" },
        { nama_sertifikat: "SSW Manufaktur", status_kelulusan: 1, score: "Lulus", sertifikat: "ssw_manufaktur_azzaky.pdf" },
      ],
      sertifikat_dimiliki: ["JLPT N4", "SSW Manufaktur"],
      pendidikan: [
        {
          nama_sekolah: "SMK TEKNIK SEMARANG",
          tingkat_pendidikan: "SMK",
          jurusan: "Teknik Mesin",
          tahun_masuk: "2019",
          tahun_lulus: "2022",
        },
      ],
      timeline: [
        { label: "Masuk Pelatihan", date: "2026-03-01", status: "done" },
        { label: "Pembelajaran Bahasa", date: "2026-03-10", status: "done" },
        { label: "Matching Job", date: "2026-09-15", status: "done" },
        { label: "Mensetsu", date: "2026-10-01", status: "failed", note: "Gagal — mengundurkan diri karena alasan pribadi" },
        { label: "Dikeluarkan", date: "2026-10-10", status: "failed", note: "Mengundurkan diri dari program" },
      ],
    }),
    fullStudent({
      id: "dummy-006",
      status: "rekrut",
      foto: emojiAvatarDataUrl("🧕"),
      no_peserta: "FTI-2026-005",
      nik: "3201987654321006",
      nama_lengkap: "FITRI HANDAYANI",
      nama_katakana: "フィトリ・ハンダヤニ",
      nama_panggilan: "フィトリ",
      angkatan: "2026",
      tanggal_lahir: "2003-05-22",
      umur: "22",
      jenis_kelamin: "P",
      golongan_darah: "A",
      agama: "イスラム教",
      asal: "Bogor",
      alamat: "JL. PAJAJARAN NO. 10, BOGOR",
      kode_pos: "16143",
      telepon: "+6282612345678",
      email: "fitri.handayani@email.com",
      dokumen_ktp: "ktp_fitri.pdf",
      dokumen_kk: "kk_handayani.pdf",
      dokumen_akte: "akte_fitri.pdf",
      dokumen_ijazah: "ijazah_fitri.pdf",
      mcu_pdf: "mcu_fitri.pdf",
      mcu: "mcu_fitri_scan.jpg",
      tinggi_badan: "162",
      berat_badan: "53",
      mata_kiri: "6/6",
      mata_kanan: "6/6",
      berkacamata: "Tidak",
      tato: "Tidak Ada",
      merokok: "Tidak",
      buta_warna: "Tidak Buta Warna",
      patah_tulang: "Tidak Ada",
      hobi: "園芸",
      jenis_pekerjaan: "Magang Hospitality",
      asal_lpk: "Mandiri",
      tanggal_masuk_pelatihan: "2026-02-15",
      sertifikat: [{ nama_sertifikat: "JLPT N5", status_kelulusan: 1, score: "88", sertifikat: "jlpt_n5_fitri.pdf" }],
      sertifikat_dimiliki: ["JLPT N5"],
      keluarga: [{ hubungan: "Ibu", nama: "HANDAYANI", umur: "45", status_pekerjaan: "Pedagang" }],
      timeline: [
        { label: "Masuk Pelatihan", date: "2026-02-15", status: "done" },
        { label: "Pembelajaran Bahasa", date: "2026-02-20", status: "done" },
        { label: "Matching Job", date: "2026-07-01", status: "done" },
        { label: "Mensetsu", date: "2026-07-15", status: "failed", note: "Gagal — tidak hadir saat interview" },
        { label: "Dikeluarkan", date: "2026-07-20", status: "failed", note: "Tidak lulus karena absensi buruk" },
      ],
    }),
    ...sukabumiExampleStudents(),
    ...partnerExampleStudents("LPK Mitra Bandung", "Bandung", "BDG", 21, BANDUNG_EXTRA),
    ...partnerExampleStudents("LPK Mitra Semarang", "Semarang", "SMG", 34, SEMARANG_EXTRA),
    ...alumniExampleStudents(),
  ]).map(completeDummyCv);
  return assignDemoParticipantIds(built.map(alignDemoPlacement));
}

function alignDemoPlacement(student: LpkStudentRecord): LpkStudentRecord {
  const year = (student.angkatan || student.tanggal_masuk_pelatihan || "2026").match(/20\d{2}/)?.[0] ?? "2026";
  const blob = `${student.jenis_pekerjaan} ${student.program}`;
  const kelas = /driver/i.test(blob) ? "Kelas Driver 1" : student.program === "tg" ? "Kelas TG 1" : "Kelas Magang 1";
  return { ...student, angkatan: `Angkatan ${year}`, kelas };
}

type AlumniExample = {
  id: string;
  no: string;
  nama: string;
  gender: "L" | "P";
  asal: string;
  asalLpk: string;
  program: "ikusei" | "tg";
  job: string;
  masukJepang: string;
  berangkat: string;
  tsk: string;
  n3: string;
  sim: string;
};

/** Lima alumni contoh. Tanggal masuk Jepang sudah lewat, jadi mereka tampil di Data Alumni. */
const ALUMNI_EXAMPLES: AlumniExample[] = [
  { id: "alumni-001", no: "ALM-2024-001", nama: "SITI RAHAYU", gender: "P", asal: "Sukabumi", asalLpk: "LPK Mitra Sukabumi", program: "tg", job: "Care Worker - Ichikawa", masukJepang: "2024-04-01", berangkat: "2024-03-20", tsk: "TSK Kanto", n3: "Lulus", sim: "futsuu" },
  { id: "alumni-002", no: "ALM-2024-002", nama: "BUDI HARTONO", gender: "L", asal: "Bandung", asalLpk: "LPK Mitra Bandung", program: "ikusei", job: "Pengelasan - Saitama", masukJepang: "2024-10-01", berangkat: "2024-09-18", tsk: "Kumiai Sakura", n3: "Proses", sim: "jun-chugata" },
  { id: "alumni-003", no: "ALM-2025-001", nama: "DEWI ANGGRAINI", gender: "P", asal: "Semarang", asalLpk: "LPK Mitra Semarang", program: "tg", job: "Pengolahan Makanan - Osaka", masukJepang: "2025-04-01", berangkat: "2025-03-22", tsk: "TSK Kanto", n3: "Lulus", sim: "" },
  { id: "alumni-004", no: "ALM-2023-001", nama: "AGUS SETIAWAN", gender: "L", asal: "Garut", asalLpk: "Mandiri", program: "ikusei", job: "Pertanian - Ibaraki", masukJepang: "2023-04-01", berangkat: "2023-03-15", tsk: "Kumiai Sakura", n3: "Lulus", sim: "chugata" },
  { id: "alumni-005", no: "ALM-2025-002", nama: "FITRI HANDAYANI", gender: "P", asal: "Bogor", asalLpk: "Flora Talent Indonesia", program: "tg", job: "Perhotelan - Chiba", masukJepang: "2025-07-01", berangkat: "2025-06-20", tsk: "TSK Kanto", n3: "Proses", sim: "futsuu" },
];

const PARTNER_CODE: Record<string, string> = {
  "LPK Mitra Sukabumi": lpkPublicId(1),
  "LPK Mitra Bandung": lpkPublicId(2),
  "LPK Mitra Semarang": lpkPublicId(3),
};

function assignDemoParticipantIds(students: LpkStudentRecord[]): LpkStudentRecord[] {
  const partnerCount = new Map<string, number>();
  const ftiCount = new Map<string, number>();
  return students.map((student) => {
    const code = PARTNER_CODE[student.asal_lpk];
    if (code) {
      const next = (partnerCount.get(code) ?? 0) + 1;
      partnerCount.set(code, next);
      return { ...student, no_peserta: mitraStudentId(code, next) };
    }
    const yearDigits = (student.angkatan || student.tanggal_keberangkatan || "2026").replace(/\D/g, "");
    const cohort = (yearDigits.slice(-2) || "26").padStart(2, "0");
    const next = (ftiCount.get(cohort) ?? 100) + 1;
    ftiCount.set(cohort, next);
    return { ...student, no_peserta: ftiStudentId(cohort, next) };
  });
}

function alumniExampleStudents(): LpkStudentRecord[] {
  return ALUMNI_EXAMPLES.map((seed, index) => {
    const slug = seed.nama.toLowerCase().replace(/[^a-z]+/g, "_");
    const year = seed.masukJepang.slice(0, 4);
    return fullStudent({
      id: seed.id,
      status: "match_job",
      hasil_job: "lulus",
      foto: emojiAvatarDataUrl(seed.gender === "L" ? "👨" : "👩"),
      no_peserta: seed.no,
      nik: `3201${year}0101${String(index + 1).padStart(4, "0")}`,
      nama_lengkap: seed.nama,
      nama_katakana: toKatakana(seed.nama),
      nama_panggilan: toKatakana(seed.nama.split(" ")[0] ?? seed.nama),
      angkatan: `Angkatan ${year}`,
      tanggal_lahir: `${Number(year) - 24}-0${index + 1}-12`,
      umur: "24",
      jenis_kelamin: seed.gender,
      golongan_darah: ["A", "O", "B", "AB", "A"][index],
      status_pernikahan: "Lajang",
      agama: "イスラム教",
      asal: seed.asal,
      alamat: `JL. ALUMNI NO. ${index + 1}, ${seed.asal.toUpperCase()}`,
      kode_pos: "40111",
      telepon: `+62812${String(11000000 + index).padStart(8, "0")}`,
      email: `${slug}@email.com`,
      mcu_pdf: `mcu_${slug}.pdf`,
      mcu: "Fit",
      tinggi_badan: seed.gender === "L" ? "172" : "158",
      berat_badan: seed.gender === "L" ? "66" : "51",
      program: seed.program,
      jenis_pekerjaan: seed.job,
      asal_lpk: seed.asalLpk,
      nama_perusahaan: ["Sakura Seisakusho", "Himawari Care", "Fuji Foods", "Aoki Kensetsu", "Ichikawa Precision"][index],
      tingkatan_pembelajaran: seed.program === "tg" ? "N3" : "N4",
      tanggal_masuk_pelatihan: `${Number(year) - 1}-04-01`,
      tanggal_kelulusan: `${Number(year) - 1}-11-01`,
      perkiraan_masuk_jepang: seed.masukJepang,
      tanggal_keberangkatan: seed.berangkat,
      tanggal_rekrut: `${Number(year) - 1}-02-10`,
      tanggal_mensetsu: `${Number(year) - 1}-08-15`,
      tanggal_naitei: `${Number(year) - 1}-09-01`,
      tsk: seed.tsk,
      n3: seed.n3,
      sim_jepang: seed.sim,
      cert_jft_basic_a2: index % 2 === 0 ? "Lulus" : "Proses",
      cert_ssw_idn: "Lulus",
      cert_ssw_jpn: index === 1 ? "Proses" : "Lulus",
      dokumen_paspor: `C${String(1000000 + index)}`,
      dokumen_visa: `${year}-02-01`,
      dokumen_coe: `${year}-01-15`,
      dokumen_ektkln: `${year}-02-20`,
      pendidikan: [
        {
          nama_sekolah: `SMK NEGERI 1 ${seed.asal.toUpperCase()}`,
          tingkat_pendidikan: "SMK",
          jurusan: seed.program === "tg" ? "Teknik" : "Keperawatan",
          tahun_masuk: String(Number(year) - 8),
          tahun_lulus: String(Number(year) - 5),
        },
      ],
    });
  });
}

const JOB_ROTATION: Array<{ kerja: string; lokasi: string; program: "ikusei" | "tg" }> = [
  { kerja: "Care Worker", lokasi: "Ichikawa", program: "ikusei" },
  { kerja: "Pengelasan", lokasi: "Saitama", program: "tg" },
  { kerja: "Perhotelan", lokasi: "Chiba", program: "ikusei" },
  { kerja: "Konstruksi", lokasi: "Aichi", program: "tg" },
  { kerja: "Pengolahan Makanan", lokasi: "Osaka", program: "ikusei" },
  { kerja: "PM", lokasi: "Gunma", program: "tg" },
  { kerja: "Pertanian", lokasi: "Ibaraki", program: "tg" },
  { kerja: "Building Cleaning", lokasi: "Kanagawa", program: "ikusei" },
];

const BANDUNG_EXTRA: Array<{ nama: string; gender: "L" | "P" }> = [
  { nama: "AGUS SALIM", gender: "L" },
  { nama: "MELATI PUTRI", gender: "P" },
  { nama: "RIZKY RAMADHAN", gender: "L" },
  { nama: "SINTA DEWI", gender: "P" },
  { nama: "FARHAN MAULANA", gender: "L" },
  { nama: "KIRANA AYU", gender: "P" },
  { nama: "BAGUS SETIAWAN", gender: "L" },
  { nama: "NADIA SAFITRI", gender: "P" },
  { nama: "ILHAM PRATAMA", gender: "L" },
  { nama: "AYU LESTARI", gender: "P" },
  { nama: "DONI KURNIAWAN", gender: "L" },
  { nama: "RATNA SARI", gender: "P" },
  { nama: "EKO WIJAYA", gender: "L" },
];

const SEMARANG_EXTRA: Array<{ nama: string; gender: "L" | "P" }> = [
  { nama: "WAHYU NUGROHO", gender: "L" },
  { nama: "DIAN PUSPITA", gender: "P" },
  { nama: "GALIH SAPUTRA", gender: "L" },
  { nama: "LINA MARLINA", gender: "P" },
  { nama: "HANAFI AHMAD", gender: "L" },
  { nama: "CITRA ANGGRAINI", gender: "P" },
  { nama: "YOGI PERMANA", gender: "L" },
  { nama: "SISKA RAHMA", gender: "P" },
  { nama: "ANDRA FIRMANSYAH", gender: "L" },
  { nama: "PUTRI WULAN", gender: "P" },
  { nama: "RENDY KUSUMA", gender: "L" },
  { nama: "AMELIA SARI", gender: "P" },
  { nama: "BAYU ADI", gender: "L" },
  { nama: "NISA KAMILA", gender: "P" },
];

function partnerExampleStudents(
  lpkName: string,
  city: string,
  code: string,
  idStart: number,
  people: Array<{ nama: string; gender: "L" | "P" }>
): LpkStudentRecord[] {
  return people.map((person, index) => {
    const job = JOB_ROTATION[index % JOB_ROTATION.length];
    const slug = person.nama.toLowerCase().replace(/[^a-z]+/g, "_");
    const month = String((index % 9) + 1).padStart(2, "0");
    const year = 2000 + (index % 5);
    const first = person.nama.split(" ")[0] ?? person.nama;
    return fullStudent({
      id: `dummy-${String(idStart + index).padStart(3, "0")}`,
      status: "aktif",
      program: job.program,
      hasil_job: index % 4 === 0 ? "lulus" : "",
      foto: emojiAvatarDataUrl(person.gender === "L" ? "👨" : "👩"),
      no_peserta: `LPK-${code}-2026-${String(index + (code === "BDG" ? 3 : 2)).padStart(3, "0")}`,
      nik: `3276${year}${month}15${String(idStart + index).padStart(4, "0")}`,
      nama_lengkap: person.nama,
      nama_katakana: toKatakana(person.nama),
      nama_panggilan: toKatakana(first),
      angkatan: "2026",
      tanggal_lahir: `${year}-${month}-15`,
      umur: String(21 + (index % 5)),
      jenis_kelamin: person.gender,
      golongan_darah: ["A", "B", "O", "AB"][index % 4],
      status_pernikahan: "Lajang",
      agama: "イスラム教",
      asal: city,
      alamat: `JL. CONTOH NO. ${index + 1}, ${city.toUpperCase()}`,
      kode_pos: city === "Bandung" ? "40111" : "50111",
      telepon: `+62813${String(55000000 + idStart + index).padStart(8, "0")}`,
      email: `${slug}@email.com`,
      dokumen_ktp: `ktp_${slug}.pdf`,
      dokumen_kk: `kk_${slug}.pdf`,
      dokumen_akte: `akte_${slug}.pdf`,
      dokumen_ijazah: `ijazah_${slug}.pdf`,
      mcu_pdf: `mcu_${slug}.pdf`,
      tinggi_badan: person.gender === "L" ? "170" : "158",
      berat_badan: person.gender === "L" ? "65" : "52",
      mata_kiri: "6/6",
      mata_kanan: "6/6",
      berkacamata: "Tidak",
      tato: "Tidak Ada",
      merokok: "Tidak",
      buta_warna: "Tidak Buta Warna",
      patah_tulang: "Tidak Ada",
      hobi: "読書",
      tingkatan_pembelajaran: job.program === "tg" ? "N4" : "N5",
      jenis_pekerjaan: `${job.kerja} - ${job.lokasi}`,
      asal_lpk: lpkName,
      tanggal_masuk_pelatihan: "2026-02-01",
    });
  });
}
