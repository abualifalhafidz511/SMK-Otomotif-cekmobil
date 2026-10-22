import React, { useState } from 'react';
import {
  SchoolConfig,
  Question,
  Applicant,
  QuestionCategory,
} from '../types';
import {
  saveSchoolConfig,
  saveQuestions,
  resetQuestionsToDefault,
  saveApplicants,
  resetApplicantExam,
  exportApplicantsToCSV,
  downloadCSVFile,
  resetAllDataToDefault,
} from '../services/storage';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Settings,
  Download,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  AlertTriangle,
  Printer,
  ChevronDown,
} from 'lucide-react';
import PrintableSlip from './PrintableSlip';

interface AdminDashboardProps {
  config: SchoolConfig;
  onUpdateConfig: (cfg: SchoolConfig) => void;
  questions: Question[];
  onUpdateQuestions: (qs: Question[]) => void;
  applicants: Applicant[];
  onUpdateApplicants: (apps: Applicant[]) => void;
}

export default function AdminDashboard({
  config,
  onUpdateConfig,
  questions,
  onUpdateQuestions,
  applicants,
  onUpdateApplicants,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'applicants' | 'questions' | 'settings'>('overview');

  // Search & filter states for applicants
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'not_started' | 'passed' | 'failed'>('all');
  const [selectedApplicantForDetail, setSelectedApplicantForDetail] = useState<Applicant | null>(null);
  const [printSlipApplicant, setPrintSlipApplicant] = useState<Applicant | null>(null);

  // Question bank state
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState<Omit<Question, 'id'>>({
    category: 'Matematika',
    questionText: '',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
      { key: 'E', text: '' },
    ],
    correctAnswer: 'A',
    explanation: '',
    points: 10,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SchoolConfig>(config);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Statistics calculation
  const totalApplicants = applicants.length;
  const completedCount = applicants.filter((a) => a.examStatus === 'completed').length;
  const notStartedCount = applicants.filter((a) => a.examStatus !== 'completed').length;
  const passedCount = applicants.filter((a) => a.examResult?.passed).length;
  const failedCount = applicants.filter((a) => a.examStatus === 'completed' && !a.examResult?.passed).length;

  const totalScores = applicants
    .filter((a) => a.examResult)
    .map((a) => a.examResult!.percentage);
  const averageScore = totalScores.length > 0 ? Math.round(totalScores.reduce((acc, curr) => acc + curr, 0) / totalScores.length) : 0;

  // Applicant filter logic
  const filteredApplicants = applicants.filter((a) => {
    const q = applicantSearch.toLowerCase();
    const matchSearch =
      a.fullName.toLowerCase().includes(q) ||
      a.regNumber.toLowerCase().includes(q) ||
      (a.nisn && a.nisn.includes(q)) ||
      a.previousSchool.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (applicantFilter === 'not_started') return a.examStatus !== 'completed';
    if (applicantFilter === 'passed') return a.examStatus === 'completed' && a.examResult?.passed;
    if (applicantFilter === 'failed') return a.examStatus === 'completed' && !a.examResult?.passed;
    return true;
  });

  // Question filter logic
  const filteredQuestions = questions.filter((q) => {
    if (questionCategoryFilter === 'all') return true;
    return q.category === questionCategoryFilter;
  });

  // Export CSV handler
  const handleExportCSV = () => {
    const csvContent = exportApplicantsToCSV();
    const filename = `Rekap_PPDB_${config.name.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    downloadCSVFile(csvContent, filename);
  };

  // Reset exam for candidate handler
  const handleResetExam = (regNum: string) => {
    if (confirm(`Apakah Anda yakin ingin mereset ujian untuk peserta ${regNum}? Peserta akan dapat mengikuti ujian kembali dari awal.`)) {
      resetApplicantExam(regNum);
      const updated = applicants.map((a) => {
        if (a.regNumber === regNum) {
          const copy = { ...a, examStatus: 'not_started' as const };
          delete copy.examResult;
          return copy;
        }
        return a;
      });
      onUpdateApplicants(updated);
      setSelectedApplicantForDetail(null);
    }
  };

  // Delete applicant handler
  const handleDeleteApplicant = (id: string, name: string) => {
    if (confirm(`Hapus data pendaftar "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      const updated = applicants.filter((a) => a.id !== id);
      onUpdateApplicants(updated);
      saveApplicants(updated);
      setSelectedApplicantForDetail(null);
    }
  };

  // Manual toggle passed status
  const handleTogglePassedOverride = (app: Applicant) => {
    if (!app.examResult) return;
    const currentPassed = app.examResult.passed;
    const updatedResult = { ...app.examResult, passed: !currentPassed };
    const updatedApplicant = { ...app, examResult: updatedResult };

    const updatedList = applicants.map((a) => (a.id === app.id ? updatedApplicant : a));
    onUpdateApplicants(updatedList);
    saveApplicants(updatedList);
    setSelectedApplicantForDetail(updatedApplicant);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(settingsForm);
    saveSchoolConfig(settingsForm);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  // Question Bank operations
  const handleOpenAddQuestion = () => {
    setQuestionForm({
      category: 'Matematika',
      questionText: '',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
        { key: 'E', text: '' },
      ],
      correctAnswer: 'A',
      explanation: '',
      points: 10,
    });
    setEditingQuestion(null);
    setIsAddingQuestion(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setQuestionForm({
      category: q.category,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      points: q.points,
    });
    setIsAddingQuestion(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      const updatedList = questions.map((q) =>
        q.id === editingQuestion.id ? { ...questionForm, id: editingQuestion.id } : q
      );
      onUpdateQuestions(updatedList);
      saveQuestions(updatedList);
    } else {
      const newQuestion: Question = {
        ...questionForm,
        id: 'q-' + Date.now(),
      };
      const updatedList = [newQuestion, ...questions];
      onUpdateQuestions(updatedList);
      saveQuestions(updatedList);
    }
    setIsAddingQuestion(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Hapus butir soal ini dari bank soal?')) {
      const updatedList = questions.filter((q) => q.id !== id);
      onUpdateQuestions(updatedList);
      saveQuestions(updatedList);
    }
  };

  const handleResetQuestions = () => {
    if (confirm('Kembalikan bank soal ke contoh standar? Perubahan soal kustom akan ditimpa.')) {
      const restored = resetQuestionsToDefault();
      onUpdateQuestions(restored);
    }
  };

  const handleResetAllDemo = () => {
    if (confirm('PERINGATAN: Ini akan mereset seluruh data konfigurasi sekolah, bank soal, dan peserta ke data awal demo. Lanjutkan?')) {
      resetAllDataToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-amber-700 tracking-wider uppercase">
            Panel Administrator PPDB
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Dashboard Pengelolaan Seleksi & Ujian
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {config.name} · Tahun Ajaran {config.academicYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Ringkasan Statistik</span>
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'applicants'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Kelola Peserta ({totalApplicants})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bank Soal ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Sistem</span>
        </button>
      </div>

      {/* ================= TAB 1: RINGKASAN ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">Total Pendaftar</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
                {totalApplicants}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Calon Peserta Didik</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">Sudah Ikut Tes</span>
              <span className="text-2xl font-black font-mono text-blue-900 mt-1 block">
                {completedCount}
              </span>
              <span className="text-[11px] text-blue-700 mt-1 block">Ujian Terkumpul</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">Belum Ujian</span>
              <span className="text-2xl font-black font-mono text-amber-700 mt-1 block">
                {notStartedCount}
              </span>
              <span className="text-[11px] text-amber-700 mt-1 block">Menunggu Giliran</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">Peserta Lulus (≥KKM)</span>
              <span className="text-2xl font-black font-mono text-emerald-700 mt-1 block">
                {passedCount}
              </span>
              <span className="text-[11px] text-emerald-700 mt-1 block">
                {completedCount > 0 ? `${Math.round((passedCount / completedCount) * 100)}% Lulus` : '0%'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 col-span-2 lg:col-span-1">
              <span className="text-xs text-slate-500 font-medium block">Rata-rata Skor</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
                {averageScore}%
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                KKM: {config.passingGrade}%
              </span>
            </div>
          </div>

          {/* Quick Notice about Announcement State */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            config.isAnnounced
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div>
              <p className="font-bold text-xs uppercase tracking-wide">
                Status Publikasi Pengumuman Kelulusan: {config.isAnnounced ? 'DIBUKA (PUBLIK DAPAT MELIHAT HASIL)' : 'DITUTUP (STATUS: MENUNGGU PENGUMUMAN)'}
              </p>
              <p className="text-xs mt-0.5 opacity-90">
                {config.isAnnounced
                  ? 'Peserta dan masyarakat dapat langsung mengecek status lulus/tidak lulus di portal pencarian.'
                  : `Hasil seleksi masih disembunyikan dari peserta hingga waktu publikasi resmi (${config.announceDate}).`}
              </p>
            </div>
            <button
              onClick={() => {
                const nextConfig = { ...config, isAnnounced: !config.isAnnounced };
                onUpdateConfig(nextConfig);
                saveSchoolConfig(nextConfig);
                setSettingsForm(nextConfig);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs whitespace-nowrap ${
                config.isAnnounced
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
              }`}
            >
              {config.isAnnounced ? 'Tutup Publikasi Hasil' : 'Buka & Publikasikan Hasil Sekarang'}
            </button>
          </div>

          {/* Recent Applicants Preview Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Aktivitas Pendaftar Terbaru
              </h3>
              <button
                onClick={() => setActiveTab('applicants')}
                className="text-xs text-blue-900 font-bold hover:underline"
              >
                Lihat Semua Peserta →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="py-2.5 px-3">No. Reg</th>
                    <th className="py-2.5 px-3">Nama Lengkap</th>
                    <th className="py-2.5 px-3">Asal Sekolah</th>
                    <th className="py-2.5 px-3">Pilihan Kelas</th>
                    <th className="py-2.5 px-3">Status Ujian</th>
                    <th className="py-2.5 px-3 text-right">Nilai Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applicants.slice(0, 5).map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {a.regNumber}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {a.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {a.previousSchool}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {a.targetGrade}
                      </td>
                      <td className="py-2.5 px-3">
                        {a.examStatus === 'completed' ? (
                          <span className="text-emerald-700 font-semibold">Selesai Tes</span>
                        ) : (
                          <span className="text-slate-500">Belum Ujian</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                        {a.examResult ? `${a.examResult.percentage}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: KELOLA PESERTA ================= */}
      {activeTab === 'applicants' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama, no. reg, atau sekolah..."
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
            </div>

            {/* Segmented status filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full md:w-auto">
              <button
                type="button"
                onClick={() => setApplicantFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  applicantFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({applicants.length})
              </button>
              <button
                type="button"
                onClick={() => setApplicantFilter('not_started')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  applicantFilter === 'not_started'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Belum Tes ({notStartedCount})
              </button>
              <button
                type="button"
                onClick={() => setApplicantFilter('passed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  applicantFilter === 'passed'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lulus ({passedCount})
              </button>
              <button
                type="button"
                onClick={() => setApplicantFilter('failed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  applicantFilter === 'failed'
                    ? 'bg-white text-rose-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tidak Lulus ({failedCount})
              </button>
            </div>
          </div>

          {/* Applicants Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">No. Pendaftaran</th>
                    <th className="py-3 px-4">Nama Peserta</th>
                    <th className="py-3 px-4">Asal Sekolah</th>
                    <th className="py-3 px-4">No. WA Ortu</th>
                    <th className="py-3 px-4">Status Ujian</th>
                    <th className="py-3 px-4 text-center">Nilai (%)</th>
                    <th className="py-3 px-4 text-center">Keputusan</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplicants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Tidak ada data pendaftar yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredApplicants.map((a) => {
                      const res = a.examResult;
                      return (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {a.regNumber}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div>{a.fullName}</div>
                            <span className="text-[11px] text-slate-500 font-normal">
                              {a.targetGrade}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {a.previousSchool}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {a.parentPhone}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {a.examStatus === 'completed' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Selesai
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Belum Tes
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-blue-900">
                            {res ? `${res.percentage}%` : '-'}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {res ? (
                              res.passed ? (
                                <span className="px-2 py-0.5 rounded font-bold text-emerald-800 bg-emerald-100 text-[11px]">
                                  LULUS
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded font-bold text-rose-800 bg-rose-100 text-[11px]">
                                  TIDAK LULUS
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => setSelectedApplicantForDetail(a)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Detail
                            </button>
                            {a.examStatus === 'completed' && (
                              <button
                                onClick={() => handleResetExam(a.regNumber)}
                                title="Izinkan ujian ulang"
                                className="p-1 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteApplicant(a.id, a.fullName)}
                              title="Hapus pendaftar"
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: BANK SOAL ================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-slate-500 font-semibold shrink-0">Filter Mapel:</span>
              {['all', 'Dasar Otomotif & Mesin', 'Matematika', 'Bahasa Indonesia', 'Pengetahuan Umum', 'Tes Logika', 'Pendidikan Agama'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setQuestionCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                    questionCategoryFilter === cat
                      ? 'bg-blue-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? 'Semua Soal' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetQuestions}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Soal Standar</span>
              </button>

              <button
                onClick={handleOpenAddQuestion}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Butir Soal</span>
              </button>
            </div>
          </div>

          {/* Question List Cards */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-700">{q.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-mono">Bobot: {q.points} Poin</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Soal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-900 leading-relaxed">
                  {q.questionText}
                </p>

                {/* Options Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs pt-1">
                  {q.options.map((opt) => {
                    const isKey = q.correctAnswer === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          isKey
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {opt.key}
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong>Kunci & Pembahasan:</strong> {q.correctAnswer} - {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: PENGATURAN SEKOLAH & UJIAN ================= */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Konfigurasi Sekolah & Pelaksanaan Ujian
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuaikan identitas lembaga pendidikan, batas kelulusan (KKM), dan durasi tes seleksi.
            </p>
          </div>

          {settingsSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan berhasil disimpan dan langsung diterapkan ke seluruh sistem!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Resmi Sekolah / Lembaga
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenjang Lembaga
                </label>
                <select
                  value={settingsForm.level}
                  onChange={(e) => setSettingsForm({ ...settingsForm, level: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900"
                >
                  <option value="SMK Otomotif">SMK Otomotif</option>
                  <option value="SD / MI">SD / MI</option>
                  <option value="SMP / MTs">SMP / MTs</option>
                  <option value="SMA / SMK / MA">SMA / SMK / MA</option>
                  <option value="Pondok Pesantren">Pondok Pesantren</option>
                  <option value="Lembaga Pendidikan">Lembaga Pendidikan Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Ajaran
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.academicYear}
                  onChange={(e) => setSettingsForm({ ...settingsForm, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Helpdesk
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.whatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Panitia
                </label>
                <input
                  type="email"
                  required
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Durasi Ujian CBT (Menit)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  required
                  value={settingsForm.examDurationMinutes}
                  onChange={(e) => setSettingsForm({ ...settingsForm, examDurationMinutes: parseInt(e.target.value, 10) || 45 })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Minimum Kelulusan / KKM (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={settingsForm.passingGrade}
                  onChange={(e) => setSettingsForm({ ...settingsForm, passingGrade: parseInt(e.target.value, 10) || 75 })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pengumuman Kelulusan
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.announceDate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announceDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.isAnnounced}
                  onChange={(e) => setSettingsForm({ ...settingsForm, isAnnounced: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-900"
                />
                <span className="text-xs text-slate-800 font-medium">
                  Publikasikan Hasil Seleksi (Bila dicentang, peserta dapat melihat status Lulus/Tidak Lulus)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.randomizeQuestions}
                  onChange={(e) => setSettingsForm({ ...settingsForm, randomizeQuestions: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-900"
                />
                <span className="text-xs text-slate-800 font-medium">
                  Acak Urutan Soal Ujian untuk Setiap Peserta
                </span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleResetAllDemo}
                className="px-4 py-2.5 text-xs text-rose-700 hover:bg-rose-50 rounded-xl transition-colors font-semibold"
              >
                Reset Semua Data Demo
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: DETAIL PESERTA ================= */}
      {selectedApplicantForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-blue-900">
                  {selectedApplicantForDetail.regNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedApplicantForDetail.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApplicantForDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Biodata */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Asal Sekolah:</span>
                <span className="font-semibold text-slate-900">{selectedApplicantForDetail.previousSchool}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pilihan Kelas:</span>
                <span className="font-semibold text-slate-900">{selectedApplicantForDetail.targetGrade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tempat, Tgl Lahir:</span>
                <span className="text-slate-800">{selectedApplicantForDetail.birthPlace}, {selectedApplicantForDetail.birthDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. WhatsApp Wali:</span>
                <span className="font-mono text-slate-800">{selectedApplicantForDetail.parentPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alamat:</span>
                <span className="text-slate-800 text-right max-w-xs">{selectedApplicantForDetail.address}</span>
              </div>
            </div>

            {/* Exam Results if completed */}
            {selectedApplicantForDetail.examResult ? (
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Hasil Nilai Tes CBT
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-700 block">Nilai Akhir</span>
                    <span className="text-lg font-black font-mono text-blue-950">
                      {selectedApplicantForDetail.examResult.percentage}%
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block">Benar</span>
                    <span className="text-lg font-black font-mono text-emerald-950">
                      {selectedApplicantForDetail.examResult.correctCount}
                    </span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <span className="text-[10px] text-rose-700 block">Salah / Kosong</span>
                    <span className="text-lg font-black font-mono text-rose-950">
                      {selectedApplicantForDetail.examResult.wrongCount + selectedApplicantForDetail.examResult.emptyCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Status Kelulusan:</span>
                    <strong className={selectedApplicantForDetail.examResult.passed ? 'text-emerald-700' : 'text-rose-700'}>
                      {selectedApplicantForDetail.examResult.passed ? 'LULUS SELEKSI' : 'TIDAK LULUS'}
                    </strong>
                  </div>
                  <button
                    onClick={() => handleTogglePassedOverride(selectedApplicantForDetail)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                  >
                    Ubah Status Manual
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-2">
                Peserta belum menyelesaikan ujian CBT.
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setPrintSlipApplicant(selectedApplicantForDetail);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Dokumen</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedApplicantForDetail.examStatus === 'completed' && (
                  <button
                    onClick={() => handleResetExam(selectedApplicantForDetail.regNumber)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Ujian</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteApplicant(selectedApplicantForDetail.id, selectedApplicantForDetail.fullName)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH / EDIT SOAL ================= */}
      {isAddingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingQuestion ? 'Edit Butir Soal' : 'Tambah Soal Ujian Baru'}
              </h3>
              <button
                onClick={() => setIsAddingQuestion(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran / Kategori
                  </label>
                  <select
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value as QuestionCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  >
                    <option value="Dasar Otomotif & Mesin">Dasar Otomotif & Mesin</option>
                    <option value="Matematika">Matematika</option>
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="Pengetahuan Umum">Pengetahuan Umum</option>
                    <option value="Tes Logika">Tes Logika</option>
                    <option value="Pendidikan Agama">Pendidikan Agama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bobot Poin
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value, 10) || 10 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teks Pertanyaan
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ketikkan butir soal secara jelas..."
                  value={questionForm.questionText}
                  onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Options A - E */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Pilihan Jawaban (A, B, C, D, E) & Tentukan Kunci Jawaban
                </label>

                {questionForm.options.map((opt, optIdx) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                      {opt.key}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Pilihan ${opt.key}`}
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[optIdx] = { ...newOpts[optIdx], text: e.target.value };
                        setQuestionForm({ ...questionForm, options: newOpts });
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                    <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="correctAnswerRadio"
                        checked={questionForm.correctAnswer === opt.key}
                        onChange={() => setQuestionForm({ ...questionForm, correctAnswer: opt.key })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Kunci</span>
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penjelasan / Pembahasan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Keterangan singkat solusi atau rujukan..."
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingQuestion(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Slip from Admin */}
      {printSlipApplicant && (
        <PrintableSlip
          applicant={printSlipApplicant}
          config={config}
          type={printSlipApplicant.examStatus === 'completed' ? 'surat_hasil' : 'kartu_peserta'}
          onClose={() => setPrintSlipApplicant(null)}
        />
      )}
    </div>
  );
}
