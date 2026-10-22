import { Applicant, SchoolConfig } from '../types';
import { Printer, X } from 'lucide-react';

interface PrintableSlipProps {
  applicant: Applicant;
  config: SchoolConfig;
  type: 'kartu_peserta' | 'surat_hasil';
  onClose: () => void;
}

export default function PrintableSlip({
  applicant,
  config,
  type,
  onClose,
}: PrintableSlipProps) {
  const handlePrint = () => {
    window.print();
  };

  const isResult = type === 'surat_hasil';
  const examResult = applicant.examResult;
  const isLulus = examResult?.passed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Toolbar - Hidden during print */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              {isResult ? 'Surat Keterangan Hasil Seleksi' : 'Kartu Tanda Peserta Ujian Seleksi'}
            </h3>
            <p className="text-xs text-slate-500">Klik cetak untuk mencetak atau simpan sebagai PDF</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 font-serif text-slate-900 bg-white">
          {/* Kop Surat Sekolah */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center gap-5">
            <img
              src={config.logoUrl}
              alt={config.name}
              className="w-20 h-20 object-cover rounded-full border border-red-600/40 p-0.5 bg-black"
            />
            <div className="flex-1 text-center font-sans">
              <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
                {config.name}
              </h2>
              <p className="text-xs font-semibold text-amber-700 tracking-wider uppercase mt-0.5">
                {config.badge}
              </p>
              <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
                {config.address}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Email: {config.email} | WhatsApp: {config.whatsapp}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold uppercase tracking-wider underline">
              {isResult ? 'SURAT KETERANGAN HASIL TES SELEKSI' : 'KARTU TANDA PESERTA UJIAN SELEKSI'}
            </h3>
            <p className="text-xs font-sans text-slate-600 mt-1">
              Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran {config.academicYear}
            </p>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Nomor: {applicant.regNumber}/PPDB/{new Date().getFullYear()}
            </p>
          </div>

          {/* Candidate Biodata Table */}
          <div className="font-sans text-sm mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <table className="w-full text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-500 w-44">Nomor Pendaftaran</td>
                  <td className="py-1.5 font-mono font-bold text-slate-900">: {applicant.regNumber}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-500">Nama Lengkap</td>
                  <td className="py-1.5 font-semibold text-slate-900">: {applicant.fullName}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-500">NISN</td>
                  <td className="py-1.5 font-mono text-slate-800">: {applicant.nisn || '-'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-500">Tempat, Tanggal Lahir</td>
                  <td className="py-1.5 text-slate-800">: {applicant.birthPlace}, {applicant.birthDate}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-500">Jenis Kelamin</td>
                  <td className="py-1.5 text-slate-800">: {applicant.gender}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 text-slate-500">Asal Sekolah</td>
                  <td className="py-1.5 text-slate-800">: {applicant.previousSchool}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-500">Pilihan Jenjang / Kelas</td>
                  <td className="py-1.5 font-medium text-slate-900">: {applicant.targetGrade}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Conditional Result Section */}
          {isResult && examResult ? (
            <div className="mb-6 font-sans">
              <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 font-semibold text-xs text-slate-700">
                  RINCIAN CAPAIAN SKOR SELEKSI
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Skor</span>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      {examResult.totalScore} / {examResult.maxPossibleScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Nilai Akhir</span>
                    <span className="text-lg font-bold font-mono text-blue-900">
                      {examResult.percentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Passing Grade (KKM)</span>
                    <span className="text-lg font-bold font-mono text-slate-700">
                      {config.passingGrade}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Jawaban Benar</span>
                    <span className="text-lg font-bold font-mono text-emerald-800">
                      {examResult.correctCount} Soal
                    </span>
                  </div>
                </div>
              </div>

              {/* Decision Box */}
              <div className={`p-4 rounded-lg border-2 text-center mb-4 ${
                isLulus
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                  : 'border-rose-600 bg-rose-50 text-rose-950'
              }`}>
                <p className="text-xs font-semibold tracking-wide uppercase">Berdasarkan Keputusan Panitia Seleksi, dinyatakan:</p>
                <p className="text-2xl font-black tracking-widest mt-1">
                  {isLulus ? 'LULUS SELEKSI' : 'TIDAK LULUS SELEKSI'}
                </p>
                <p className="text-xs mt-1.5 opacity-90 max-w-md mx-auto">
                  {isLulus
                    ? 'Selamat! Calon peserta didik berhak melanjutkan ke tahap verifikasi berkas dan daftar ulang sesuai jadwal yang telah ditetapkan.'
                    : 'Terima kasih atas partisipasi Anda. Kami mendoakan yang terbaik untuk masa depan pendidikan Anda.'}
                </p>
              </div>
            </div>
          ) : (
            /* Exam Card Guide */
            <div className="font-sans text-xs bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
              <p className="font-bold text-amber-950 mb-1">Tata Tertib Peserta Ujian:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-900">
                <li>Kartu ini wajib dibawa/disimpan saat mengikuti tes seleksi.</li>
                <li>Ujian berlangsung selama {config.examDurationMinutes} menit secara mandiri dan jujur.</li>
                <li>Gunakan perangkat dengan koneksi internet yang stabil selama pengerjaan.</li>
                <li>Hasil kelulusan akan diumumkan pada tanggal {config.announceDate}.</li>
              </ul>
            </div>
          )}

          {/* Signature & Verification Seal */}
          <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-200 font-sans text-xs">
            <div className="text-center">
              <div className="w-20 h-20 border border-slate-300 rounded flex items-center justify-center p-1 bg-slate-50 mb-1">
                <div className="w-full h-full border border-dashed border-slate-400 flex flex-col items-center justify-center text-[9px] text-slate-500">
                  <span className="font-mono font-bold">VERIFIKASI</span>
                  <span className="font-mono text-[8px]">QR CODE</span>
                  <span className="text-[7px] text-slate-400 mt-1">{applicant.regNumber}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block">Dokumen Resmi Digital</span>
            </div>

            <div className="text-right">
              <p className="text-slate-600">Ditetapkan di: Jakarta</p>
              <p className="text-slate-600 mb-12">
                Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="font-bold text-slate-900 underline">Dr. H. Ahmad Sudrajat, M.Pd.</p>
              <p className="text-slate-500 text-[11px]">Ketua Panitia PPDB {config.academicYear}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
