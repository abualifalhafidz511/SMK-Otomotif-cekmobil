import React, { useState } from 'react';
import { SchoolConfig, Applicant } from '../types';
import { generateNextRegNumber, registerApplicant } from '../services/storage';
import { CheckCircle2, UserPlus, ArrowRight, Printer, AlertCircle } from 'lucide-react';
import PrintableSlip from './PrintableSlip';

interface RegisterPageProps {
  config: SchoolConfig;
  onRegisteredSuccess: (applicant: Applicant) => void;
  onNavigate: (tab: string) => void;
}

export default function RegisterPage({
  config,
  onRegisteredSuccess,
  onNavigate,
}: RegisterPageProps) {
  const [nextReg] = useState(() => generateNextRegNumber());

  const [formData, setFormData] = useState({
    fullName: '',
    nisn: '',
    birthPlace: '',
    birthDate: '',
    gender: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    previousSchool: '',
    targetGrade: 'Kelas X - Teknik Kendaraan Ringan Otomotif (TKRO)',
    address: '',
    parentPhone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [createdApplicant, setCreatedApplicant] = useState<Applicant | null>(null);
  const [showPrintSlip, setShowPrintSlip] = useState(false);

  const gradeOptions = [
    'Kelas X - Teknik Kendaraan Ringan Otomotif (TKRO)',
    'Kelas X - Teknik & Bisnis Sepeda Motor (TBSM)',
    'Kelas X - Teknik Ototronik (Elektronika Mobil & Kendaraan Listrik)',
    'Kelas X - Teknik Perbaikan Bodi Otomotif (TPBO)',
    'Kelas X - Manajemen Bengkel & Purna Jual Otomotif',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }
    if (!formData.birthPlace.trim() || !formData.birthDate) {
      setErrorMsg('Tempat dan tanggal lahir wajib diisi.');
      return;
    }
    if (!formData.previousSchool.trim()) {
      setErrorMsg('Asal sekolah jenjang sebelumnya wajib diisi.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Alamat tempat tinggal wajib diisi.');
      return;
    }
    if (!formData.parentPhone.trim()) {
      setErrorMsg('Nomor WhatsApp orang tua/wali wajib diisi untuk koordinasi pengumuman.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      const newApp = registerApplicant({
        fullName: formData.fullName.trim(),
        nisn: formData.nisn.trim(),
        birthPlace: formData.birthPlace.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        previousSchool: formData.previousSchool.trim(),
        targetGrade: formData.targetGrade,
        address: formData.address.trim(),
        parentPhone: formData.parentPhone.trim(),
        email: formData.email.trim() || `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@siswa.local`,
        password: formData.password,
      });

      setCreatedApplicant(newApp);
    } catch {
      setErrorMsg('Terjadi kendala saat menyimpan pendaftaran. Silakan coba kembali.');
    }
  };

  // If successfully registered, show confirmation screen
  if (createdApplicant) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
              Pendaftaran Berhasil Terverifikasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Selamat, Data Anda Telah Terdaftar!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto">
              Simpan Nomor Pendaftaran dan Kata Sandi berikut untuk login mengerjakan tes seleksi online (CBT) dan memeriksa pengumuman.
            </p>
          </div>

          {/* Account credentials box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500">Nomor Pendaftaran Resmi:</span>
              <span className="font-mono text-base font-extrabold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                {createdApplicant.regNumber}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500">Nama Lengkap:</span>
              <span className="text-xs font-bold text-slate-800">{createdApplicant.fullName}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500">Pilihan Kelas:</span>
              <span className="text-xs text-slate-800">{createdApplicant.targetGrade}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Kata Sandi:</span>
              <span className="font-mono text-xs text-slate-600">•••••••• (Tersimpan)</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowPrintSlip(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 w-full sm:w-auto transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu Tanda Peserta</span>
            </button>

            <button
              onClick={() => onRegisteredSuccess(createdApplicant)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md w-full sm:w-auto transition-colors"
            >
              <span>Masuk ke Dashboard Ujian</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showPrintSlip && (
          <PrintableSlip
            applicant={createdApplicant}
            config={config}
            type="kartu_peserta"
            onClose={() => setShowPrintSlip(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header Info */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-semibold text-blue-900 tracking-wider uppercase">
            Formulir Pendaftaran
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Pendaftaran Calon Peserta Didik Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Tahun Ajaran {config.academicYear} · {config.name}
          </p>
        </div>

        {/* Auto Reg Number Badge */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl sm:text-right">
          <span className="text-[11px] text-amber-800 block">Perkiraan No. Pendaftaran:</span>
          <span className="font-mono text-sm font-extrabold text-amber-950">{nextReg}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        {/* Section 1: Data Pribadi */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-900" />
            1. Identitas Calon Peserta Didik
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap Sesuai Akta Kelahiran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Raihan Pratama"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NISN (Nomor Induk Siswa Nasional)
              </label>
              <input
                type="text"
                placeholder="10 digit nomor (opsional)"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Laki-laki' | 'Perempuan' })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tempat Lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Jakarta"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Asal Sekolah & Pilihan Jurusan */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            2. Asal Sekolah & Peminatan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Asal Sekolah (SMP / MTs) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: SMP Negeri 1 Jakarta"
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jenjang / Pilihan Kelas Tujuan <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.targetGrade}
                onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              >
                {gradeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Kontak & Alamat */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            3. Alamat & Kontak Orang Tua/Wali
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Tempat Tinggal Lengkap <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nomor WhatsApp Orang Tua/Wali (Aktif) <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="08xxxxxxxxxx"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat Email (Opsional)
              </label>
              <input
                type="email"
                placeholder="contoh@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Akun & Kata Sandi */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            4. Kata Sandi Akun Peserta
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ulangi Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Ketik ulang kata sandi"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Dengan mendaftar, Anda menyatakan data yang diisikan adalah benar dan sah.
          </p>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors w-full sm:w-auto whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Kirim Pendaftaran & Buat Akun</span>
          </button>
        </div>
      </form>

      {/* Switch to login */}
      <div className="text-center mt-6 text-xs text-slate-600">
        Sudah memiliki akun atau nomor pendaftaran?{' '}
        <button
          onClick={() => onNavigate('login')}
          className="font-bold text-blue-900 hover:underline"
        >
          Masuk Akun di sini
        </button>
      </div>
    </div>
  );
}
