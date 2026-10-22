import React, { useState } from 'react';
import { SchoolConfig, Applicant } from '../types';
import { findApplicantByRegNumber, getApplicants } from '../services/storage';
import { Search, Printer, AlertCircle, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import PrintableSlip from './PrintableSlip';

interface PublicCheckResultProps {
  config: SchoolConfig;
  onNavigate: (tab: string) => void;
}

export default function PublicCheckResult({
  config,
  onNavigate,
}: PublicCheckResultProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedApplicant, setSearchedApplicant] = useState<Applicant | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  const sampleApplicants = getApplicants().slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setHasSearched(true);

    if (!searchQuery.trim()) {
      setErrorMsg('Masukkan nomor pendaftaran peserta.');
      setSearchedApplicant(null);
      return;
    }

    const found = findApplicantByRegNumber(searchQuery);
    if (!found) {
      setErrorMsg(`Nomor pendaftaran "${searchQuery}" tidak ditemukan dalam pangkalan data.`);
      setSearchedApplicant(null);
    } else {
      setSearchedApplicant(found);
    }
  };

  const handleQuickPick = (regNum: string) => {
    setSearchQuery(regNum);
    setErrorMsg('');
    setHasSearched(true);
    const found = findApplicantByRegNumber(regNum);
    setSearchedApplicant(found || null);
  };

  const examResult = searchedApplicant?.examResult;
  const isAnnounced = config.isAnnounced;
  const isCompleted = searchedApplicant?.examStatus === 'completed';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-semibold text-blue-900 tracking-wider uppercase">
          Portal Informasi Publik
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Cek Hasil Seleksi Masuk
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Masukkan Nomor Pendaftaran resmi untuk melihat status hasil tes seleksi calon peserta didik baru {config.name}.
        </p>
      </div>

      {/* Search Bar Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Contoh: REG-2025-001"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>Cari Hasil Tes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Contoh Nomor:</span>
          {sampleApplicants.map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => handleQuickPick(app.regNumber)}
              className="font-mono text-[11px] text-blue-800 hover:text-blue-950 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 transition-colors"
            >
              {app.regNumber}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Display Card */}
      {hasSearched && searchedApplicant && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          {/* Status Header Bar */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-amber-400 font-mono font-bold block">
                {searchedApplicant.regNumber}
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                {searchedApplicant.fullName}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Pilihan: {searchedApplicant.targetGrade} · Asal: {searchedApplicant.previousSchool}
              </p>
            </div>

            {/* Decision Chip */}
            <div className="sm:text-right shrink-0">
              {!isCompleted ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Belum Mengikuti Tes</span>
                </div>
              ) : !isAnnounced ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 text-amber-300 rounded-xl text-xs font-semibold border border-amber-800">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Menunggu Pengumuman</span>
                </div>
              ) : examResult?.passed ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>DITERIMA / LULUS</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>TIDAK LULUS</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {!isCompleted ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3">
                <p>
                  Peserta atas nama <strong>{searchedApplicant.fullName}</strong> belum menyelesaikan tes seleksi CBT.
                </p>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-xl"
                >
                  Login untuk Mengerjakan Ujian
                </button>
              </div>
            ) : !isAnnounced ? (
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
                <p className="font-bold text-sm">Ujian Telah Selesai Dikerjakan</p>
                <p className="text-slate-600 leading-relaxed">
                  Data ujian peserta telah tersimpan. Pengumuman kelulusan resmi baru akan dipublikasikan oleh panitia pada tanggal <strong>{config.announceDate}</strong>.
                </p>
              </div>
            ) : examResult ? (
              <div className="space-y-6">
                {/* Result stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] text-slate-500 block">Nilai Akhir</span>
                    <span className="text-lg font-bold font-mono text-blue-900">
                      {examResult.percentage}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] text-slate-500 block">Standar KKM</span>
                    <span className="text-lg font-bold font-mono text-slate-700">
                      {config.passingGrade}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] text-slate-500 block">Jawaban Benar</span>
                    <span className="text-lg font-bold font-mono text-emerald-700">
                      {examResult.correctCount} Soal
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] text-slate-500 block">Tanggal Ujian</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(examResult.submittedAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Directive instructions */}
                <div className={`p-4 rounded-2xl border ${
                  examResult.passed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <p className="font-bold text-xs uppercase tracking-wide mb-1">
                    {examResult.passed ? 'Petunjuk Daftar Ulang:' : 'Informasi Seleksi:'}
                  </p>
                  <p className="text-xs leading-relaxed">
                    {examResult.passed
                      ? 'Calon peserta didik wajib membawa cetak Surat Keterangan Hasil Seleksi, fotokopi Akta Kelahiran, dan Kartu Keluarga ke sekretariat panitia pada hari kerja pukul 08.00 - 15.00 WIB.'
                      : 'Hasil seleksi tidak memenuhi ambang batas kelulusan minimal. Panitia mengucapkan terima kasih atas partisipasi dan keikutsertaan Anda.'}
                  </p>
                </div>

                {/* Print button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowPrintSlip(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Cetak Surat Keterangan Resmi</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {showPrintSlip && searchedApplicant && (
        <PrintableSlip
          applicant={searchedApplicant}
          config={config}
          type="surat_hasil"
          onClose={() => setShowPrintSlip(false)}
        />
      )}
    </div>
  );
}
