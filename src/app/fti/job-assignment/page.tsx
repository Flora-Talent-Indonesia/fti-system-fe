"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Briefcase,
  LayoutList,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import PortalPageShell from "@/components/PortalPageShell";
import SearchField from "@/components/SearchField";
import type { Job } from "@/types";
import {
  deleteJob,
  nextJobId,
  seedJobsIfEmpty,
  upsertJob,
} from "@/lib/job-storage";
import { applyMensetsuToStudent } from "@/lib/placement";
import { getLpkStudentById, upsertLpkStudent } from "@/lib/lpk-student-storage";
import {
  calculateJobStatus,
  formatJobDate,
  isJobActive,
  sortJobs,
  statusBadgeClass,
  type JobSortDir,
  type JobSortField,
} from "@/lib/job-utils";
import { omitInactiveAccounts } from "@/lib/fti-student-account-storage";
import { seedLpkStudentsIfEmpty } from "@/lib/lpk-student-storage";
import type { LpkStudentRecord } from "@/types/lpk-student";
import JobFormModal, { type JobFormData } from "./components/JobFormModal";
import DeleteJobModal from "./components/DeleteJobModal";
import AssignStudentModal from "./components/AssignStudentModal";
import ViewAssignedModal from "./components/ViewAssignedModal";

function SortableTh({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string;
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
        className={`inline-flex items-center gap-1 hover:text-primary-pink transition-colors ${
          active ? "text-primary-pink" : ""
        }`}
      >
        {label}
        <Icon size={14} className={active ? "opacity-100" : "opacity-40"} />
      </button>
    </th>
  );
}

function needsMensetsuReview(job: Job): boolean {
  if (!job.tanggalMansetsu) return false;
  const when = new Date(`${job.tanggalMansetsu}T23:59:59`);
  if (Number.isNaN(when.getTime()) || when.getTime() >= Date.now()) return false;
  return job.assignedStudentIds.some((id) => !job.mensetsuResults?.[id]);
}

export default function FtiJobAssignmentPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<LpkStudentRecord[]>([]);
  const [visibleStudentIds, setVisibleStudentIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"aktif" | "nonaktif">("aktif");
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<JobSortField>("tanggalMansetsu");
  const [sortDir, setSortDir] = useState<JobSortDir>("asc");

  const [addOpen, setAddOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assignJobId, setAssignJobId] = useState<string | null>(null);
  const [viewJobId, setViewJobId] = useState<string | null>(null);
  const [descModal, setDescModal] = useState<{ title: string; description: string } | null>(null);
  const [reviewJob, setReviewJob] = useState<Job | null>(null);

  useEffect(() => {
    setJobs(seedJobsIfEmpty());
    const visible = omitInactiveAccounts(seedLpkStudentsIfEmpty());
    setVisibleStudentIds(new Set(visible.map((student) => student.id)));
    setCandidates(visible.filter((s) => s.status === "rekrut"));
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
    const q = query.trim().toLowerCase();
    const pool = jobs.filter((job) => {
      if (activeTab === "aktif" ? !isJobActive(job) : isJobActive(job)) return false;
      if (!q) return true;
      return [job.title, job.company, job.pengirim, job.description].some((value) =>
        (value || "").toLowerCase().includes(q),
      );
    });
    return sortJobs(pool, sortField, sortDir);
  }, [jobs, activeTab, query, sortField, sortDir]);

  const assignJob = jobs.find((j) => j.id === assignJobId);
  const viewJob = jobs.find((j) => j.id === viewJobId);
  const deleteJobItem = jobs.find((j) => j.id === deleteId);

  const getAssignedStudents = (job: Job) =>
    candidates.filter((s) => job.assignedStudentIds.includes(s.id));

  const handleAdd = (data: JobFormData) => {
    const job: Job = {
      id: nextJobId(),
      title: data.title,
      company: data.company || "-",
      pengirim: data.pengirim,
      description: data.description,
      deadlineDokumen: data.deadlineDokumen,
      tanggalMansetsu: data.tanggalMansetsu,
      kuota: data.kuota,
      kyujinPdf: data.kyujinPdf,
      visibleLpkIds: data.visibleLpkIds,
      mensetsuResults: {},
      createdAt: new Date().toISOString(),
      assignedStudentIds: [],
      interestedStudentIds: [],
    };
    setJobs(upsertJob(job));
    setAddOpen(false);
    toast.success("Job berhasil ditambahkan.");
  };

  const handleEdit = (data: JobFormData) => {
    if (!editJob) return;
    const updated: Job = {
      ...editJob,
      ...data,
      company: data.company || "-",
    };
    setJobs(upsertJob(updated));
    setEditJob(null);
    toast.success("Job berhasil diperbarui.");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setJobs(deleteJob(deleteId));
    setDeleteId(null);
    toast.success("Job dihapus.");
  };

  const handleSaveAssign = (studentIds: string[]) => {
    if (!assignJob) return;
    const updated: Job = { ...assignJob, assignedStudentIds: studentIds };
    setJobs(upsertJob(updated));
    setAssignJobId(null);
    toast.success("Assignment siswa disimpan.");
  };

  const handleUnassign = (studentId: string) => {
    if (!viewJob) return;
    const updated: Job = {
      ...viewJob,
      assignedStudentIds: viewJob.assignedStudentIds.filter((id) => id !== studentId),
    };
    setJobs(upsertJob(updated));
    toast.success("Siswa di-unassign.");
  };

  const searching = query.trim().length > 0;

  return (
    <PortalPageShell fill>
      <main className="flex h-full min-h-0 flex-col overflow-hidden px-4 pb-3 pt-4 md:px-6 md:pb-4 md:pt-5">
        <header className="mb-4 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/fti"
              className="p-3 bg-transparent hover:bg-gray-200/50 transition-colors border border-gray-300 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-gray-900 tracking-wide mb-1">Job Management</h1>
              <p className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                Kelola job, sinkronisasi, dan assign job siswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary-pink hover:bg-primary-pink-hover rounded-lg shadow-sm transition-colors"
          >
            <Plus size={18} />
            Tambah Job Baru
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm">
          <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-gray-100 bg-gray-50/50 px-6 pt-2 sm:flex-row sm:items-center">
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
                Job Aktif
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
                Job Nonaktif
              </button>
            </div>
            <div className="flex items-center gap-3 pb-3 sm:pb-0">
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Cari job"
                variant="box"
                className="w-56 sm:w-72"
              />
              <p className="text-sm text-gray-500">
                Total {displayedJobs.length} Job {activeTab === "aktif" ? "Aktif" : "Nonaktif"}
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {displayedJobs.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-100 bg-gray-50 text-gray-400">
                  <Briefcase size={32} strokeWidth={1.5} />
                </div>
                <h3 className="mb-1 text-lg font-medium text-gray-900">
                  {searching
                    ? "Job tidak ditemukan"
                    : activeTab === "aktif"
                      ? "Belum ada Job Aktif"
                      : "Belum ada Job Nonaktif"}
                </h3>
                <p className="max-w-sm px-4 text-sm text-gray-500">
                  {searching
                    ? `Tidak ada job yang cocok dengan “${query.trim()}”.`
                    : activeTab === "aktif"
                      ? 'Klik "Tambah Job Baru" untuk membuat job dan assign siswa.'
                      : "Job pindah ke sini setelah melewati tanggal mansetsu."}
                </p>
              </div>
            ) : (
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-gray-200/80 bg-gray-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold w-12">
                      No
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Job Title
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Nama Pengirim
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Status
                    </th>
                    <SortableTh
                      label="Tgl Dibuat"
                      field="createdAt"
                      sortField={sortField}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                    <SortableTh
                      label="Deadline Dokumen"
                      field="deadlineDokumen"
                      sortField={sortField}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                    <SortableTh
                      label="Tgl Mansetsu"
                      field="tanggalMansetsu"
                      sortField={sortField}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                    <th scope="col" className="px-6 py-4 font-semibold text-center">
                      Kuota
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center">
                      Occupancy
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-40">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedJobs.map((job, index) => {
                    const assigned = job.assignedStudentIds.filter((id) => visibleStudentIds.has(id)).length;
                    const full = job.kuota != null && assigned >= job.kuota;
                    const status = calculateJobStatus(job.deadlineDokumen, job.tanggalMansetsu);
                    const inactiveTab = activeTab === "nonaktif";

                    return (
                      <tr key={job.id} className="hover:bg-primary-pink-light/20 transition-colors">
                        <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{job.title}</div>
                          {job.description && (
                            <button
                              type="button"
                              onClick={() =>
                                setDescModal({ title: job.title, description: job.description })
                              }
                              className="text-xs text-gray-500 mt-1 max-w-xs truncate block text-left hover:text-primary-pink"
                            >
                              {job.description}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{job.pengirim?.trim() || "—"}</td>
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
                          {needsMensetsuReview(job) && (
                            <span className="ml-2 text-amber-600" title="Tanggal mensetsu lewat. Tentukan lulus atau tidak.">▲</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-700">
                          {job.kuota ?? "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setViewJobId(job.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
                              full
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
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAssignJobId(job.id)}
                              disabled={inactiveTab || full}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                                inactiveTab || full
                                  ? "text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
                                  : "text-primary-pink bg-primary-pink-light border-primary-pink/30 hover:bg-primary-pink/20"
                              }`}
                            >
                              <Users size={14} /> Assign
                            </button>
                            <button
                              type="button"
                              onClick={() => setReviewJob(job)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-800 bg-amber-50 border border-amber-200"
                            >
                              Hasil
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditJob(job)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-700 bg-amber-50 border border-amber-200/60 hover:bg-amber-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(job.id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-700 bg-red-50 border border-red-200/60 hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {reviewJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white w-full max-w-lg p-6">
              <h2 className="font-serif text-xl mb-1">Hasil mensetsu</h2>
              <p className="text-sm text-gray-500 mb-4">{reviewJob.title}. Yang lulus masuk antrean dokumen.</p>
              <div className="space-y-2">
                {reviewJob.assignedStudentIds.filter((id) => visibleStudentIds.has(id)).length === 0 && <p className="text-sm text-gray-500">Belum ada siswa di-assign.</p>}
                {reviewJob.assignedStudentIds.filter((id) => visibleStudentIds.has(id)).map((id) => {
                  const student = candidates.find((item) => item.id === id);
                  return (
                    <label key={id} className="flex items-center justify-between gap-3 text-sm">
                      <span>{student?.nama_lengkap || id}</span>
                      <select
                        className="border border-gray-300 px-2 py-1"
                        value={reviewJob.mensetsuResults?.[id] ?? ""}
                        onChange={(e) => {
                          const value = e.target.value as "lulus" | "tidak" | "";
                          const next = {
                            ...reviewJob,
                            mensetsuResults: { ...reviewJob.mensetsuResults, ...(value ? { [id]: value } : {}) },
                          };
                          if (!value) delete next.mensetsuResults?.[id];
                          setReviewJob(next);
                          setJobs(upsertJob(next));
                          const stored = getLpkStudentById(id);
                          if (!stored) return;
                          const updated = applyMensetsuToStudent(stored, next, value);
                          upsertLpkStudent(updated);
                          setCandidates((list) => list.map((item) => (item.id === id ? updated : item)));
                        }}
                      >
                        <option value="">Belum</option>
                        <option value="lulus">Lolos</option>
                        <option value="tidak">Tidak lolos</option>
                      </select>
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end">
                <button type="button" className="btn-primary" onClick={() => setReviewJob(null)}>Tutup</button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-2 shrink-0 text-center text-xs text-gray-500">
          Klik header kolom tanggal untuk mengurutkan.
        </p>
      </main>

      {addOpen && (
        <JobFormModal title="Tambah Job Baru" onClose={() => setAddOpen(false)} onSave={handleAdd} submitLabel="Tambah" />
      )}
      {editJob && (
        <JobFormModal
          title="Edit Job"
          initial={editJob}
          onClose={() => setEditJob(null)}
          onSave={handleEdit}
        />
      )}
      {deleteJobItem && (
        <DeleteJobModal
          jobTitle={deleteJobItem.title}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
      {assignJob && (
        <AssignStudentModal
          jobTitle={assignJob.title}
          students={candidates}
          initialSelectedIds={assignJob.assignedStudentIds}
          onClose={() => setAssignJobId(null)}
          onSave={handleSaveAssign}
        />
      )}
      {viewJob && (
        <ViewAssignedModal
          jobTitle={viewJob.title}
          students={getAssignedStudents(viewJob)}
          onClose={() => setViewJobId(null)}
          onUnassign={handleUnassign}
        />
      )}
      {descModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="absolute inset-0" onClick={() => setDescModal(null)} aria-hidden />
          <div className="relative z-10 max-w-lg w-full bg-white rounded-xl p-6 border border-gray-200 shadow-xl">
            <h3 className="font-serif text-lg text-gray-900 mb-2">{descModal.title}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{descModal.description}</p>
            <button
              type="button"
              onClick={() => setDescModal(null)}
              className="mt-4 px-4 py-2 text-sm border border-gray-300 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </PortalPageShell>
  );
}
