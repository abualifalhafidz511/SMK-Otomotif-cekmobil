import { SchoolConfig, UserSession } from '../types';
import { LogIn, LogOut, LayoutDashboard, Shield, User } from 'lucide-react';

interface NavbarProps {
  config: SchoolConfig;
  session: UserSession | null;
  currentTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export default function Navbar({
  config,
  session,
  currentTab,
  onNavigate,
  onLogout,
}: NavbarProps) {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg group shrink-0"
          >
            <img
              src={config.logoUrl}
              alt={config.name}
              className="w-10 h-10 object-cover rounded-full border border-red-500/60 p-0.5 bg-black group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors whitespace-nowrap">
                {config.name}
              </span>
              <span className="text-[11px] font-medium text-amber-700 tracking-wide uppercase whitespace-nowrap">
                PPDB & CBT {config.academicYear}
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Single-line, unboxed, hover underline) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('landing')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'landing' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => onNavigate('register')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'register' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Daftar Peserta
            </button>
            <button
              onClick={() => onNavigate('check_result')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'check_result' ? 'text-blue-900 font-semibold' : ''
              }`}
            >
              Cek Hasil Seleksi
            </button>
            {session?.role === 'student' && (
              <button
                onClick={() => onNavigate('student_dashboard')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'student_dashboard' ? 'text-blue-900 font-semibold' : ''
                }`}
              >
                Dashboard Ujian
              </button>
            )}
            {session?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin_dashboard')}
                className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                  currentTab === 'admin_dashboard' ? 'text-blue-900 font-semibold' : ''
                }`}
              >
                Panel Kelola Admin
              </button>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action Area */}
          <div className="flex items-center gap-3 shrink-0">
            {session ? (
              <div className="flex items-center gap-2">
                {session.role === 'student' ? (
                  <button
                    onClick={() => onNavigate('student_dashboard')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline font-semibold">{session.applicant?.fullName.split(' ')[0]}</span>
                    <span className="text-[11px] font-mono text-blue-700">({session.applicant?.regNumber})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('admin_dashboard')}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-300 whitespace-nowrap"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Admin Mode</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
