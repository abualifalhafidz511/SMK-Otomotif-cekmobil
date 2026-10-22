import React, { useState } from 'react';
import { SchoolConfig, UserSession, Applicant } from '../types';
import { findApplicantByCredentials, getApplicants } from '../services/storage';
import { LogIn, Shield, User, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  config: SchoolConfig;
  onLoginSuccess: (session: UserSession) => void;
  onNavigate: (tab: string) => void;
}

export default function LoginPage({
  config,
  onLoginSuccess,
  onNavigate,
}: LoginPageProps) {
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const applicants = getApplicants();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (role === 'admin') {
      if (loginId.trim() === 'admin' && password === 'admin123') {
        onLoginSuccess({
          role: 'admin',
          username: 'Administrator PPDB',
        });
      } else {
        setErrorMsg('Kredensial admin salah. Gunakan username "admin" dan password "admin123".');
      }
    } else {
      // Student login
      const found = findApplicantByCredentials(loginId, password);
      if (found) {
        onLoginSuccess({
          role: 'student',
          applicant: found,
        });
      } else {
        setErrorMsg('Nomor pendaftaran / email atau kata sandi tidak cocok.');
      }
    }
  };

  const handleQuickStudentLogin = (app: Applicant) => {
    onLoginSuccess({
      role: 'student',
      applicant: app,
    });
  };

  const handleQuickAdminLogin = () => {
    onLoginSuccess({
      role: 'admin',
      username: 'Administrator PPDB',
    });
  };

  const sampleNotStarted = applicants.find((a) => a.examStatus === 'not_started');
  const sampleCompleted = applicants.find((a) => a.examStatus === 'completed' && a.examResult?.passed);

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <img
            src={config.logoUrl}
            alt={config.name}
            className="w-16 h-16 object-cover rounded-full border border-red-500/60 p-0.5 bg-black mx-auto mb-3"
          />
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Masuk Portal PPDB
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {config.name} · Tahun Ajaran {config.academicYear}
          </p>
        </div>

        {/* Segmented Control / Role Selector (Functional buttons, anti-slop) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setErrorMsg('');
              setLoginId('');
              setPassword('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              role === 'student'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Peserta Ujian</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('admin');
              setErrorMsg('');
              setLoginId('');
              setPassword('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              role === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Administrator</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {role === 'admin' ? 'Username Admin' : 'Nomor Pendaftaran / Email'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'admin' ? 'admin' : 'Contoh: REG-2025-001'}
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{role === 'admin' ? 'Masuk ke Panel Admin' : 'Masuk Dashboard Ujian'}</span>
          </button>
        </form>

        {/* Quick Demo Test Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Akses Cepat Pengujian Demo:
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {sampleNotStarted && (
              <button
                type="button"
                onClick={() => handleQuickStudentLogin(sampleNotStarted)}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block">{sampleNotStarted.fullName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {sampleNotStarted.regNumber} · Status: Belum Ujian
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {sampleCompleted && (
              <button
                type="button"
                onClick={() => handleQuickStudentLogin(sampleCompleted)}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block">{sampleCompleted.fullName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {sampleCompleted.regNumber} · Status: Selesai (Lulus)
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            <button
              type="button"
              onClick={handleQuickAdminLogin}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-lg text-left transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-semibold block">Masuk Sebagai Administrator</span>
                <span className="text-[10px] text-amber-700 font-mono">
                  User: admin · Pass: admin123
                </span>
              </div>
              <Shield className="w-3.5 h-3.5 text-amber-700" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Belum mendaftar sebagai peserta?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-blue-900 hover:underline"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
