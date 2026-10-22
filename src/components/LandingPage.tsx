import { SchoolConfig } from '../types';
import { formatWhatsAppLink } from '../services/storage';
import {
  FileText,
  Clock,
  Award,
  ArrowRight,
  HelpCircle,
  Phone,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  config: SchoolConfig;
  totalApplicants: number;
  totalQuestions: number;
  onNavigate: (tab: string) => void;
}

export default function LandingPage({
  config,
  totalApplicants,
  totalQuestions,
  onNavigate,
}: LandingPageProps) {
  const steps = [
    {
      num: '01',
      title: 'Pendaftaran Online',
      desc: 'Isi formulir biodata lengkap, NISN, asal sekolah, dan dapatkan Nomor Pendaftaran resmi secara otomatis.',
    },
    {
      num: '02',
      title: 'Ujian CBT Online',
      desc: `Kerjakan soal seleksi pilihan ganda secara mandiri dalam durasi ${config.examDurationMinutes} menit dengan sistem timer otomatis.`,
    },
    {
      num: '03',
      title: 'Penilaian Sistem',
      desc: `Hasil dihitung otomatis oleh server dengan standar ketuntasan minimal (KKM) ${config.passingGrade}%.`,
    },
    {
      num: '04',
      title: 'Pengumuman & Daftar Ulang',
      desc: 'Cek status kelulusan secara online, cetak surat keterangan hasil seleksi, dan lakukan verifikasi berkas.',
    },
  ];

  const subjects = [
    {
      title: 'Dasar Otomotif & Mesin',
      desc: 'Prinsip kerja mesin 4-tak, sistem pemindah tenaga (kopling & transmisi), dan alat ukur presisi.',
      tag: 'Kompetensi Kejuruan',
    },
    {
      title: 'Matematika Terapan & Teknik',
      desc: 'Perhitungan gear ratio, perbandingan daya, konversi torsi, dan kecepatan putaran roda.',
      tag: 'Kuantitatif Teknik',
    },
    {
      title: 'Bahasa Indonesia & Literasi',
      desc: 'Pemahaman SOP bengkel, keselamatan kerja (K3), kosakata baku, dan petunjuk manual servis.',
      tag: 'Literasi Teknis',
    },
    {
      title: 'Logika Mekanik & Kendaraan Listrik',
      desc: 'Arah putaran roda gigi, analogi teknis, prinsip hidrolis Pascal, dan teknologi mobil listrik (EV).',
      tag: 'Logika & Sains EV',
    },
  ];

  const faqs = [
    {
      q: 'Bagaimana jika koneksi internet terputus saat mengerjakan tes?',
      a: 'Sistem dilengkapi fitur auto-save draft otomatis. Jawaban yang telah Anda pilih tersimpan aman dan Anda dapat melanjutkan sisa waktu setelah menyambungkan kembali.',
    },
    {
      q: 'Berapa nilai minimum agar dinyatakan lulus seleksi?',
      a: `Standar Kriteria Ketuntasan Minimal (KKM) yang ditetapkan panitia adalah ${config.passingGrade}%. Peserta yang mencapai atau melampaui nilai tersebut dinyatakan LULUS.`,
    },
    {
      q: 'Apakah peserta diperbolehkan mengulang ujian?',
      a: 'Secara default setiap peserta hanya memiliki 1 kali kesempatan ujian demi objektivitas. Izin ujian ulang hanya dapat diberikan melalui pertimbangan administrator/panitia PPDB.',
    },
    {
      q: 'Kapan pengumuman hasil seleksi dipublikasikan?',
      a: `Pengumuman kelulusan resmi dijadwalkan pada ${config.announceDate} melalui portal ini dan dapat diakses menggunakan Nomor Pendaftaran.`,
    },
  ];

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-6">
              {/* Quiet unboxed kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Penerimaan Peserta Didik Baru (PPDB)</span>
                <span aria-hidden="true">·</span>
                <span>T.A {config.academicYear}</span>
                <span aria-hidden="true">·</span>
                <span>{config.level}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Sistem Tes Seleksi Calon Peserta Didik Baru
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Selamat datang di portal Computer-Based Testing (CBT) resmi{' '}
                <strong className="text-white">{config.name}</strong>. Pelaksanaan tes seleksi masuk berbasis digital yang transparan, akuntabel, dan terstandarisasi untuk menjaring generasi unggul berprestasi.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span>Daftar Peserta Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors border border-white/20 whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Mulai Tes / Masuk</span>
                </button>

                <button
                  onClick={() => onNavigate('check_result')}
                  className="flex items-center gap-2 px-5 py-3.5 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
                >
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>Cek Hasil Seleksi</span>
                </button>
              </div>

              {/* Quick specs metadata line */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Durasi Ujian: <strong className="text-slate-200">{config.examDurationMinutes} Menit</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Nilai KKM Kelulusan: <strong className="text-slate-200">{config.passingGrade}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Status Bank Soal: <strong className="text-slate-200">{totalQuestions} Butir Aktif</strong></span>
                </div>
              </div>
            </div>

            {/* School Crest Card on Hero */}
            <div className="lg:col-span-4 flex flex-col items-center text-center bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-white/10">
              <img
                src={config.logoUrl}
                alt={config.name}
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full border-2 border-red-500/80 p-0.5 bg-black shadow-2xl mb-4"
              />
              <h2 className="text-lg font-bold text-white tracking-wide">{config.name}</h2>
              <p className="text-xs text-amber-300 font-medium mt-1">{config.badge}</p>
              <div className="mt-4 pt-4 border-t border-white/10 w-full text-xs text-slate-300 space-y-1">
                <p>Status Pendaftaran: <span className="text-emerald-400 font-semibold">Sedang Dibuka</span></p>
                <p>Total Pendaftar: <span className="font-mono font-bold text-white">{totalApplicants} Calon Siswa</span></p>
                <p>Jadwal Pengumuman: <span className="text-slate-200">{config.announceDate}</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Selection Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold text-blue-900 tracking-wider uppercase">
            Petunjuk & Tahapan
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Alur Pendaftaran dan Pelaksanaan Tes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Ikuti 4 langkah mudah dari pendaftaran mandiri hingga pengecekan hasil seleksi kelulusan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-3xl font-black text-amber-500/80 block mb-3">
                  {step.num}
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-900">
                <span>Tahap Terpadu</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Materi Ujian Seleksi */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold text-amber-700 tracking-wider uppercase">
                Standarisasi Kompetensi
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Materi Mata Uji Seleksi Masuk
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Soal disusun secara berimbang mencakup kemampuan penalaran kuantitatif, literasi, logika berpikir, dan budi pekerti.
              </p>
            </div>
            <button
              onClick={() => onNavigate('register')}
              className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 shrink-0"
            >
              Daftar Sekarang untuk Mengikuti Tes
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((sub, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-1">
                    {sub.tag}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {sub.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sub.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Pilihan Ganda A - E</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jadwal Penting & Helpdesk Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Jadwal */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-900" />
              <h3 className="text-lg font-bold text-slate-900">
                Linimasa & Jadwal Pelaksanaan PPDB
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-3 border-b border-slate-100">
                <span className="font-mono text-xs font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded">
                  01 - 20 Jan 2025
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Gelombang I Pendaftaran Calon Siswa</p>
                  <p className="text-xs text-slate-500">Pengisian biodata online dan verifikasi berkas awal.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-3 border-b border-slate-100">
                <span className="font-mono text-xs font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded">
                  21 - 25 Feb 2025
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Pelaksanaan Tes Seleksi CBT Mandiri</p>
                  <p className="text-xs text-slate-500">Pengerjaan soal seleksi secara online melalui portal sistem.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="font-mono text-xs font-bold bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded">
                  {config.announceDate}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Pengumuman Kelulusan Resmi</p>
                  <p className="text-xs text-slate-500">Pengecekan hasil seleksi dan unduh surat kelulusan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Helpdesk WA */}
          <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 sm:p-8 rounded-2xl border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Layanan Bantuan & Helpdesk PPDB
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Mengalami kendala saat pengisian formulir, lupa nomor pendaftaran, atau butuh panduan tes CBT? Hubungi panitia via WhatsApp resmi.
              </p>
              <div className="text-xs font-mono font-semibold text-slate-800 bg-white/80 p-3 rounded-lg border border-amber-200/80 mb-4">
                WhatsApp Hotline: {config.whatsapp}
              </div>
            </div>

            <a
              href={formatWhatsAppLink(config.whatsapp, 'Halo Panitia PPDB SMK Otomotif Cekmobil, saya ingin bertanya seputar pendaftaran dan pelaksanaan tes seleksi CBT.')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>Chat WhatsApp Panitia Langsung</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Accordion / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-xs font-semibold text-blue-900 tracking-wider uppercase">
            Pusat Informasi
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-slate-200"
            >
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                {faq.q}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
