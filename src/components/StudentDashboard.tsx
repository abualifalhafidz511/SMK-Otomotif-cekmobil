import { useState } from 'react';
import { Applicant, SchoolConfig } from '../types';
import { getExamDraft, formatWhatsAppLink } from '../services/storage';
import {
  Printer,
  PlayCircle,
  RotateCcw,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import PrintableSlip from './PrintableSlip';

interface StudentDashboardProps {
  applicant: Applicant;
  config: SchoolConfig;
  onStartExam: () => void;
  onNavigate: (tab: string) => void;
}

export default function StudentDashboard({
  applicant,
  config,
  onStartExam,
  onNavigate,
}: StudentDashboardProps) {
  const [printType, setPrintType] = useState<'kartu_peserta' | 'surat_hasil' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const draft = getExamDraft(applicant.regNumber);
  const isCompleted = applicant.examStatus === 'completed';
  const isInProgress = !isCompleted && draft !== null;
  const result = applicant.examResult;
  const isAnnounced = config.isAnnounced;

  const handleShareResult = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Saya calon peserta didik ${applicant.fullName} (${applicant.regNumber}) telah menyelesaikan tes seleksi di ${config.name}.`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
            {applicant.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="font-mono text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-bold">
                {applicant.regNumber}
              </span>
              <span aria-hidden="true">·</span>
              <span>Terverifikasi Online</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              {applicant.fullName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Pilihan: <strong className="text-slate-800">{applicant.targetGrade}</strong> · Asal: {applicant.previousSchool}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setPrintType('kartu_peserta')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Kartu Peserta</span>
          </button>

          {isCompleted && isAnnounced && result && (
            <button
              onClick={() => setPrintType('surat_hasil')}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak Bukti Kelulusan</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Exam Action Card + Status Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Exam Launch / Completed Status */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-blue-900" />
                <h3 className="font-bold text-slate-900 text-base">
                  Ujian Seleksi Berbasis Komputer (CBT)
                </h3>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : isInProgress
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {isCompleted
                  ? 'Ujian Selesai'
                  : isInProgress
                  ? 'Sedang Berlangsung'
                  : 'Siap Dikerjakan'}
              </span>
            </div>

            {/* If NOT completed: Show launch prompt */}
            {!isCompleted ? (
              <div className="py-6 space-y-6">
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900 mb-2">
                    Tes Kemampuan Akademik & Skolastik
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ujian mencakup 4 bidang kompetensi: Matematika, Bahasa Indonesia, Pengetahuan Umum, dan Logika Penalaran. Sistem akan menghitung waktu secara otomatis saat Anda menekan tombol mulai.
                  </p>
                </div>

                {/* Exam specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Durasi Pengerjaan</span>
                    <span className="text-sm font-extrabold font-mono text-slate-900">
                      {config.examDurationMinutes} Menit
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Bentuk Soal</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      Pilihan Ganda
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Passing Grade (KKM)</span>
                    <span className="text-sm font-extrabold font-mono text-blue-900">
                      {config.passingGrade}%
                    </span>
                  </div>
                </div>

                {/* Integrity Notice */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <span>Petunjuk Pengerjaan:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                    <li>Pastikan Anda berada di ruangan yang tenang dengan koneksi internet lancar.</li>
                    <li>Waktu akan terus berjalan sejak Anda mengklik tombol "Mulai Ujian".</li>
                    <li>Jawaban tersimpan otomatis secara berkala ke database.</li>
                    <li>Selesaikan semua soal sebelum durasi waktu berakhir.</li>
                  </ul>
                </div>

                <button
                  onClick={onStartExam}
                  className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  {isInProgress ? (
                    <>
                      <RotateCcw className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
                      <span>Lanjutkan Ujian (Tersedia Draft Tersimpan)</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>Mulai Kerjakan Tes Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* If COMPLETED */
              <div className="py-6 space-y-6">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Ujian Telah Berhasil Dikumpulkan
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Waktu pengumpulan: {result ? new Date(result.submittedAt).toLocaleString('id-ID') : '-'}
                    </p>
                  </div>
                </div>

                {/* Decision Banner based on isAnnounced */}
                {isAnnounced && result ? (
                  <div className={`p-6 rounded-2xl border-2 text-center space-y-2 ${
                    result.passed
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950'
                      : 'border-rose-400 bg-rose-50/50 text-rose-950'
                  }`}>
                    <p className="text-xs font-bold tracking-wider uppercase">
                      Status Kelulusan Seleksi:
                    </p>
                    <div className="text-3xl font-black tracking-wide">
                      {result.passed ? 'LULUS SELEKSI' : 'BELUM MEMENUHI SYARAT'}
                    </div>
                    <p className="text-xs max-w-md mx-auto pt-1 text-slate-700">
                      {result.passed
                        ? 'Selamat atas kelulusan Anda! Anda berhak melakukan daftar ulang dan verifikasi berkas fisik sesuai jadwal panitia.'
                        : 'Nilai seleksi Anda belum mencapai batas KKM minimal. Tetap semangat dan jangan putus asa.'}
                    </p>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-amber-300 bg-amber-50/60 text-amber-950 text-center space-y-2">
                    <Clock className="w-8 h-8 text-amber-600 mx-auto" />
                    <h4 className="text-base font-bold">
                      Menunggu Pengumuman Resmi
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      Seluruh jawaban ujian Anda telah tersimpan dan dinilai di server panitia seleksi. Hasil kelulusan akan diumumkan secara serentak pada{' '}
                      <strong>{config.announceDate}</strong>.
                    </p>
                  </div>
                )}

                {/* Result Breakdown (if announced) */}
                {isAnnounced && result && (
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Rincian Capaian Ujian
                    </h5>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[11px] text-slate-500 block">Nilai Akhir</span>
                        <span className="text-xl font-black font-mono text-blue-900">
                          {result.percentage}%
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[11px] text-slate-500 block">Jawaban Benar</span>
                        <span className="text-xl font-bold font-mono text-emerald-700">
                          {result.correctCount} Soal
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[11px] text-slate-500 block">Salah / Kosong</span>
                        <span className="text-xl font-bold font-mono text-slate-700">
                          {result.wrongCount + result.emptyCount} Soal
                        </span>
                      </div>
                    </div>

                    {/* Category Breakdown Bars */}
                    <div className="space-y-2.5 pt-2">
                      {Object.entries(result.categoryBreakdown).map(([cat, val]) => (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-700">{cat}</span>
                            <span className="font-mono text-slate-500">
                              {val.correct} / {val.total} Benar ({val.score} Poin)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-900 rounded-full transition-all"
                              style={{ width: `${val.total > 0 ? (val.correct / val.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        onClick={handleShareResult}
                        className="flex-1 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{copiedLink ? 'Disalin ke Clipboard!' : 'Bagikan Info'}</span>
                      </button>
                      <button
                        onClick={() => setPrintType('surat_hasil')}
                        className="flex-1 py-2.5 px-3 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cetak Surat Hasil</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Profile & School Helpdesk */}
        <div className="lg:col-span-5 space-y-6">
          {/* Biodata Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Data Pendaftaran Terdaftar
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Pendaftaran:</span>
                <span className="font-mono font-bold text-slate-900">{applicant.regNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NISN:</span>
                <span className="font-mono text-slate-800">{applicant.nisn || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tempat, Tgl Lahir:</span>
                <span className="text-slate-800 text-right">{applicant.birthPlace}, {applicant.birthDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jenis Kelamin:</span>
                <span className="text-slate-800">{applicant.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Asal Sekolah:</span>
                <span className="text-slate-800 text-right">{applicant.previousSchool}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. WA Orang Tua:</span>
                <span className="font-mono text-slate-800">{applicant.parentPhone}</span>
              </div>
            </div>

            <button
              onClick={() => setPrintType('kartu_peserta')}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh / Cetak Kartu Peserta</span>
            </button>
          </div>

          {/* Quick Help Desk */}
          <div className="bg-blue-950 text-white rounded-3xl p-6 border border-blue-900 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Award className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Panitia Seleksi {config.academicYear}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Jika terdapat ketidaksesuaian data identitas atau pertanyaan seputar teknis ujian, segera hubungi sekretariat PPDB melalui WhatsApp resmi sekolah.
            </p>
            <a
              href={formatWhatsAppLink(
                config.whatsapp,
                `Halo Panitia PPDB SMK Otomotif Cekmobil, saya peserta atas nama ${applicant.fullName} (${applicant.regNumber}), ingin bertanya bantuan teknis.`
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-white transition-colors pt-1"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Chat WhatsApp Panitia ({config.whatsapp})</span>
            </a>
          </div>
        </div>
      </div>

      {/* Printable Slip Modal */}
      {printType && (
        <PrintableSlip
          applicant={applicant}
          config={config}
          type={printType}
          onClose={() => setPrintType(null)}
        />
      )}
    </div>
  );
}
