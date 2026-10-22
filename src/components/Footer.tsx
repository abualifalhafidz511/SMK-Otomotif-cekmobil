import { SchoolConfig } from '../types';
import { formatWhatsAppLink } from '../services/storage';
import { Phone, Mail, MapPin, Award, CheckCircle } from 'lucide-react';

interface FooterProps {
  config: SchoolConfig;
  onNavigate: (tab: string) => void;
}

export default function Footer({ config, onNavigate }: FooterProps) {
  return (
    <footer className="no-print bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Identity */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={config.logoUrl}
                alt={config.name}
                className="w-10 h-10 object-cover rounded-full border border-red-500/50 p-0.5 bg-black"
              />
              <div>
                <h4 className="font-extrabold text-white text-base tracking-tight">
                  {config.name}
                </h4>
                <p className="text-xs text-amber-400 font-medium">{config.badge}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
              Portal Resmi Penerimaan Peserta Didik Baru (PPDB) & Computer-Based Testing (CBT).
              Menjunjung tinggi objektivitas, integritas, transparansi, dan standarisasi seleksi akademik modern.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Jenjang: {config.level}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                T.A {config.academicYear}
              </span>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Tautan Seleksi
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Beranda & Informasi PPDB
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('register')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Pendaftaran Peserta Baru
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Login Akun Peserta & CBT
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('check_result')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Cek Pengumuman Hasil
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Login Administrator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Helpdesk & Kontak */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Layanan Informasi
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{config.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={formatWhatsAppLink(config.whatsapp, 'Halo Panitia PPDB SMK Otomotif Cekmobil, saya ingin bertanya informasi pendaftaran.')}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>WhatsApp: {config.whatsapp}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">Chat Langsung</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{config.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {config.name}. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="font-mono text-[11px] text-slate-400">
            Sistem CBT & Penilaian Otomatis Terverifikasi
          </p>
        </div>
      </div>
    </footer>
  );
}
