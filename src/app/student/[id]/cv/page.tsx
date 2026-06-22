import { notFound } from "next/navigation";
import { getStudentById } from "@/data/mock";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentCvPage({ params }: PageProps) {
  const { id } = await params;
  const student = getStudentById(id);

  if (!student) notFound();

  return (
    <div className="min-h-screen bg-white text-matte-black">
      <header className="border-b border-[#e5e7eb] px-6 py-5 bg-[#fdf8fa]">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-gray">
          CV & Dokumen Siswa
        </p>
        <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold mt-1">
          {student.namaLengkap}
        </h1>
        <p className="text-sm text-text-gray mt-1 font-mono">{student.noPeserta}</p>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <section className="border border-[#e5e7eb] p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-gray mb-3">
            Profil
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-text-gray text-xs uppercase tracking-wider">LPK</dt>
              <dd className="mt-1 font-medium">{student.lpkName}</dd>
            </div>
            <div>
              <dt className="text-text-gray text-xs uppercase tracking-wider">Angkatan</dt>
              <dd className="mt-1 font-medium">{student.angkatan}</dd>
            </div>
            <div>
              <dt className="text-text-gray text-xs uppercase tracking-wider">Status</dt>
              <dd className="mt-1 font-medium uppercase text-xs">{student.status}</dd>
            </div>
            {student.jobTitle && (
              <div>
                <dt className="text-text-gray text-xs uppercase tracking-wider">Job</dt>
                <dd className="mt-1 font-medium">{student.jobTitle}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="border border-[#e5e7eb] p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-gray mb-3">
            Ringkasan CV
          </h2>
          <p className="text-sm leading-relaxed">{student.cvSummary}</p>
        </section>

        <section className="border border-[#e5e7eb] p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-gray mb-3">
            Sertifikat
          </h2>
          <ul className="space-y-2">
            {student.certificates.map((cert) => (
              <li
                key={cert}
                className="text-sm border border-[#e5e7eb] px-4 py-3 flex items-center justify-between"
              >
                <span>{cert}</span>
                <span className="text-[10px] text-text-gray uppercase tracking-wider">
                  Preview (testing)
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-[#e5e7eb] p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-gray mb-3">
            Dokumen
          </h2>
          <ul className="space-y-2 text-sm text-text-gray">
            <li className="border border-dashed border-[#e5e7eb] px-4 py-3">
              KTP — placeholder (integrasi backend nanti)
            </li>
            <li className="border border-dashed border-[#e5e7eb] px-4 py-3">
              Ijazah — placeholder
            </li>
            <li className="border border-dashed border-[#e5e7eb] px-4 py-3">
              CV Lengkap PDF — placeholder
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
