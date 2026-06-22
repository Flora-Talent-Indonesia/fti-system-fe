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
import type { Job } from "@/types";
import {
  deleteJob,
  nextJobId,
  seedJobsIfEmpty,
  upsertJob,
} from "@/lib/job-storage";
import {
  calculateJobStatus,
  formatJobDate,
  isJobActive,
  sortJobs,
  statusBadgeClass,
  type JobSortDir,
  type JobSortField,
} from "@/lib/job-utils";
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

export default function FtiJobAssignmentPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<LpkStudentRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"aktif" | "nonaktif">("aktif");
  const [sortField, setSortField] = useState<JobSortField>("tanggalMansetsu");
  const [sortDir, setSortDir] = useState<JobSortDir>("asc");

  const [addOpen, setAddOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assignJobId, setAssignJobId] = useState<string | null>(null);
  const [viewJobId, setViewJobId] = useState<string | null>(null);
  const [descModal, setDescModal] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    setJobs(seedJobsIfEmpty());
    const all = seedLpkStudentsIfEmpty();
    setCandidates(all.filter((s) => s.status === "rekrut"));
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
      description: data.description,
      deadlineDokumen: data.deadlineDokumen,
      tanggalMansetsu: data.tanggalMansetsu,
      kuota: data.kuota,
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

  return (
    <PortalPageShell>
      <main className="p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <p className="text-sm text-gray-500 pb-4 sm:pb-0">
              Total {displayedJobs.length} Job {activeTab === "aktif" ? "Aktif" : "Nonaktif"}
            </p>
          </div>

          <div className="overflow-x-auto">
            {displayedJobs.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                  <Briefcase size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {activeTab === "aktif" ? "Belum ada Job Aktif" : "Belum ada Job Nonaktif"}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm px-4">
                  {activeTab === "aktif"
                    ? 'Klik "Tambah Job Baru" untuk membuat job dan assign siswa.'
                    : "Job pindah ke sini setelah melewati tanggal mansetsu."}
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
                      Job Title
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
                    const assigned = job.assignedStudentIds.length;
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

        <p className="mt-4 text-xs text-gray-500 text-center">
          Mode testing — data job disimpan di localStorage. Klik header kolom tanggal untuk sort.
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
