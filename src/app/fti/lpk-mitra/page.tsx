import Link from "next/link";
import { Building2, ChevronRight, Users } from "lucide-react";
import { FtiPageShell } from "@/components/fti/FtiPageShell";
import { LPK_PARTNERS } from "@/data/mock";
import { countDummyStudentsByLpkId, totalDummyStudents } from "@/lib/fti-lpk-students";

export default function FtiLpkListPage() {
  const totalSiswa = totalDummyStudents();

  return (
    <FtiPageShell
      title="Daftar LPK Mitra"
      titleJa="LPKミトラ一覧"
      subtitle="Pilih mitra LPK untuk melihat data siswa yang dikirim dari portal LPK Mitra"
      stats={[
        { label: "Total LPK", value: LPK_PARTNERS.length },
        { label: "Total Siswa", value: totalSiswa },
      ]}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LPK_PARTNERS.map((lpk) => {
          const siswaCount = countDummyStudentsByLpkId(lpk.id);
          return (
            <Link
              key={lpk.id}
              href={`/fti/lpk-mitra/${lpk.id}`}
              className="group block relative bg-white p-8 border border-[#e5e7eb]/80 hover:border-primary-pink/40 transition-all duration-500 overflow-hidden fti-panel"
            >
              <div className="absolute inset-0 bg-primary-pink-light/60 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-0" />

              <div className="relative z-10">
                <div className="w-12 h-12 border border-primary-pink/25 flex items-center justify-center mb-6 text-primary-pink bg-white group-hover:bg-primary-pink group-hover:text-white transition-colors duration-500">
                  <Building2 size={22} strokeWidth={1.5} />
                </div>

                <h2 className="font-[family-name:var(--font-montserrat)] text-lg font-bold text-matte-black mb-6 group-hover:text-primary-pink transition-colors duration-300">
                  {lpk.name}
                </h2>

                <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]/80">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-gray">
                    <Users size={14} />
                    {siswaCount} siswa
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary-pink">
                    Lihat
                    <ChevronRight
                      size={14}
                      className="transform group-hover:translate-x-1 transition-transform duration-300"
                    />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </FtiPageShell>
  );
}
