"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Briefcase,
  LayoutList,
  Users,
} from "lucide-react";
import YsPortalShell from "@/components/ys/YsPortalShell";
import type { Job } from "@/types";
import { loadJobs, seedJobsIfEmpty } from "@/lib/job-storage";
import {
  calculateJobStatus,
  formatJobDate,
  isJobActive,
  sortJobs,
  statusBadgeClass,
  type JobSortDir,
  type JobSortField,
} from "@/lib/job-utils";
import { loadLpkStudents, seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";
import YsViewAssignedModal from "./components/YsViewAssignedModal";

function SortableTh({
  labelJa,
  labelEn,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  labelJa: string;
  labelEn: string;
  field: JobSortField;
  sortField: JobSortField;
  sortDir: JobSortDir;
  onSort: (field: JobSortField) => void;
}) {
  const active = sortField === field;
  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th scope="col" className="px-6 py-4 font-semibold">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex flex-col items-start gap-0.5 hover:text-primary-pink transition-colors text-left ${
          active ? "text-primary-pink" : ""
        }`}
      >
        <span className="inline-flex items-center gap-1">
          {labelJa}
          <Icon size={14} className={active ? "opacity-100" : "opacity-40"} />
        </span>
        <span className="text-[10px] font-normal text-gray-400 normal-case tracking-normal">{labelEn}</span>
      </button>
    </th>
  );
}

function refreshJobData() {
  seedJobsIfEmpty();
  seedLpkStudentsIfEmpty();
  return {
    jobs: loadJobs(),
    students: loadLpkStudents(),
  };
}

export default function YsJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [students, setStudents] = useState<LpkStudentRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"aktif" | "nonaktif">("aktif");
  const [sortField, setSortField] = useState<JobSortField>("tanggalMansetsu");
  const [sortDir, setSortDir] = useState<JobSortDir>("asc");
  const [viewJobId, setViewJobId] = useState<string | null>(null);
  const [descModal, setDescModal] = useState<{
    titleJa: string;
    titleEn: string;
    description: string;
  } | null>(null);

  const syncData = () => {
    const { jobs: j, students: s } = refreshJobData();
    setJobs(j);
    setStudents(s);
  };

  useEffect(() => {
    syncData();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "flora_fti_jobs_v1" ||
        e.key === "flora_lpk_mitra_students_v1" ||
        e.key === null
      ) {
        syncData();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncData);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncData);
    };
  }, []);

  const handleSort = (field: JobSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const displayedJobs = useMemo(() => {
    const pool = jobs.filter((j) => (activeTab === "aktif" ? isJobActive(j) : !isJobActive(j)));
    return sortJobs(pool, sortField, sortDir);
  }, [jobs, activeTab, sortField, sortDir]);

  const viewJob = jobs.find((j) => j.id === viewJobId);

  const getAssignedStudents = (job: Job) =>
    students.filter((s) => job.assignedStudentIds.includes(s.id));

  return (
    <YsPortalShell>
      <main className="p-4 md:p-8 max-w-[1400px] mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/ys"
              className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900 rounded-lg"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">ジョブ管理</h1>
              <p className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                Job Management · FTI割り当てデータ
              </p>
              <p className="mt-2 text-sm text-gray-600 max-w-xl">
                FTIが割り当てた求人と学生一覧。割り当て人数をクリックして詳細を確認できます。
              </p>
              <p className="mt-1 text-xs text-gray-500 max-w-xl">
                Jobs and students assigned by FTI. Click occupancy to view assigned candidates.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-pink border border-primary-pink/30 bg-primary-pink-light px-2.5 py-1 self-start">
            日本のパートナー · Japan Partner
          </span>
        </header>

        <div className="bg-white border border-gray-200/60 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 gap-4 pt-2">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTab("aktif")}
                className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "aktif"
                    ? "border-primary-pink text-primary-pink"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <LayoutList size={18} />
                <span>
                  アクティブな求人
                  <span className="block text-[10px] font-normal text-gray-400">Active Jobs</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("nonaktif")}
                className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "nonaktif"
                    ? "border-primary-pink text-primary-pink"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Briefcase size={18} />
                <span>
                  非アクティブな求人
                  <span className="block text-[10px] font-normal text-gray-400">Inactive Jobs</span>
                </span>
              </button>
            </div>
            <p className="text-sm text-gray-500 pb-4 sm:pb-0">
              合計 {displayedJobs.length} 件 · {displayedJobs.length} Job{" "}
              {activeTab === "aktif" ? "Aktif" : "Nonaktif"}
            </p>
          </div>

          <div className="overflow-x-auto">
            {displayedJobs.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                  <Briefcase size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {activeTab === "aktif" ? "アクティブな求人がありません" : "非アクティブな求人がありません"}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm px-4">
                  {activeTab === "aktif"
                    ? "FTIが求人を作成し、学生を割り当てるとここに表示されます。"
                    : "面接日を過ぎた求人がここに表示されます。"}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-gray-600 uppercase bg-gray-100/80 border-b border-gray-200/80">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold w-12">
                      No
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      <span>求人名</span>
                      <span className="block text-[10px] font-normal text-gray-400 normal-case">Job Title</span>
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      <span>ステータス</span>
                      <span className="block text-[10px] font-normal text-gray-400 normal-case">Status</span>
                    </th>
                    <SortableTh
                      labelJa="作成日"
                      labelEn="Created"
                      field="createdAt"
                      sortField={sortField}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                    <SortableTh
                      labelJa="書類締切"
                      labelEn="Doc. Deadline"
                      field="deadlineDokumen"
                      sortField={sortField}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                    <SortableTh
                      labelJa="面接日"
                      labelEn="Mansetsu"
                      field="tanggalMansetsu"
                      sortField={sortField}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                    <th scope="col" className="px-6 py-4 font-semibold text-center">
                      <span>定員</span>
                      <span className="block text-[10px] font-normal text-gray-400 normal-case">Quota</span>
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">
                      <span>割り当て</span>
                      <span className="block text-[10px] font-normal text-gray-400 normal-case">Assigned</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedJobs.map((job, index) => {
                    const assigned = job.assignedStudentIds.length;
                    const full = job.kuota != null && assigned >= job.kuota;
                    const status = calculateJobStatus(job.deadlineDokumen, job.tanggalMansetsu);
                    const inactiveTab = activeTab === "nonaktif";

                    return (
                      <tr key={job.id} className="hover:bg-primary-pink-light/20 transition-colors">
                        <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{job.titleJa ?? job.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{job.title}</div>
                          {job.company && (
                            <p className="text-xs text-gray-400 mt-1">{job.company}</p>
                          )}
                          {job.description && (
                            <button
                              type="button"
                              onClick={() =>
                                setDescModal({
                                  titleJa: job.titleJa ?? job.title,
                                  titleEn: job.title,
                                  description: job.description,
                                })
                              }
                              className="text-xs text-gray-500 mt-1 max-w-xs truncate block text-left hover:text-primary-pink"
                            >
                              {job.description}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusBadgeClass(
                              status,
                              inactiveTab
                            )}`}
                          >
                            {inactiveTab ? "Inactive" : status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{formatJobDate(job.createdAt, "-")}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatJobDate(job.deadlineDokumen)}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatJobDate(job.tanggalMansetsu)}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-700">
                          {job.kuota ?? "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setViewJobId(job.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
                              assigned === 0
                                ? "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-500"
                                : full
                                  ? "bg-red-50 hover:bg-red-100 border-red-200/80 text-red-700"
                                  : "bg-blue-50 hover:bg-blue-100 border-blue-200/80 text-blue-700"
                            }`}
                          >
                            <Users size={14} />
                            <span className="font-medium">
                              {assigned} / {job.kuota ?? "-"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          FTI Job Assignmentと同期 · データはlocalStorage · 日付ヘッダーで並び替え
        </p>
      </main>

      {viewJob && (
        <YsViewAssignedModal
          jobTitleJa={viewJob.titleJa ?? viewJob.title}
          jobTitleEn={viewJob.title}
          students={getAssignedStudents(viewJob)}
          onClose={() => setViewJobId(null)}
        />
      )}

      {descModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="absolute inset-0" onClick={() => setDescModal(null)} aria-hidden />
          <div className="relative z-10 max-w-lg w-full bg-white rounded-xl p-6 border border-gray-200 shadow-xl">
            <h3 className="font-serif text-lg text-gray-900">{descModal.titleJa}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{descModal.titleEn}</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap mt-4">{descModal.description}</p>
            <button
              type="button"
              onClick={() => setDescModal(null)}
              className="mt-4 px-4 py-2 text-sm border border-gray-300 rounded-lg"
            >
              閉じる · Close
            </button>
          </div>
        </div>
      )}
    </YsPortalShell>
  );
}
