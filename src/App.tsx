import { useState, useEffect } from 'react';
import {
  SchoolConfig,
  Question,
  Applicant,
  UserSession,
  ExamResult,
} from './types';
import {
  getSchoolConfig,
  getQuestions,
  getApplicants,
  formatWhatsAppLink,
} from './services/storage';
import { MessageCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import ExamScreen from './components/ExamScreen';
import PublicCheckResult from './components/PublicCheckResult';
import AdminDashboard from './components/AdminDashboard';

const SESSION_KEY = 'ppdb_user_session_v1';

export default function App() {
  const [config, setConfig] = useState<SchoolConfig>(() => getSchoolConfig());
  const [questions, setQuestions] = useState<Question[]>(() => getQuestions());
  const [applicants, setApplicants] = useState<Applicant[]>(() => getApplicants());

  // Restore user session if stored
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    // If student logged in, go to student dashboard; if admin, admin dashboard; else landing
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role === 'admin') return 'admin_dashboard';
        if (parsed.role === 'student') return 'student_dashboard';
      } catch {}
    }
    return 'landing';
  });

  // Keep session synced to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  // Keep applicant session updated with latest applicant record if changed
  useEffect(() => {
    if (session?.role === 'student' && session.applicant) {
      const fresh = applicants.find((a) => a.id === session.applicant?.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(session.applicant)) {
        setSession({ ...session, applicant: fresh });
      }
    }
  }, [applicants]);

  const handleNavigate = (tab: string) => {
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentTab(tab);
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    if (newSession.role === 'admin') {
      setCurrentTab('admin_dashboard');
    } else {
      setCurrentTab('student_dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setSession(null);
    setCurrentTab('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisteredSuccess = (newApplicant: Applicant) => {
    // Refresh applicants list
    const fresh = getApplicants();
    setApplicants(fresh);
    // Auto login
    setSession({
      role: 'student',
      applicant: newApplicant,
    });
    setCurrentTab('student_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartExam = () => {
    setCurrentTab('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishExam = (result: ExamResult) => {
    // Update local applicants list
    const fresh = getApplicants();
    setApplicants(fresh);

    // Update active student session
    if (session?.applicant) {
      const updatedApplicant = {
        ...session.applicant,
        examStatus: 'completed' as const,
        examResult: result,
      };
      setSession({
        ...session,
        applicant: updatedApplicant,
      });
    }

    setCurrentTab('student_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in active exam mode, show distraction-free ExamScreen full screen
  if (currentTab === 'exam' && session?.applicant) {
    return (
      <ExamScreen
        applicant={session.applicant}
        config={config}
        onFinishExam={handleFinishExam}
        onExit={() => setCurrentTab('student_dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <Navbar
        config={config}
        session={session}
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            config={config}
            totalApplicants={applicants.length}
            totalQuestions={questions.length}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'register' && (
          <RegisterPage
            config={config}
            onRegisteredSuccess={handleRegisteredSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'login' && (
          <LoginPage
            config={config}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'student_dashboard' && session?.applicant && (
          <StudentDashboard
            applicant={session.applicant}
            config={config}
            onStartExam={handleStartExam}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'student_dashboard' && !session?.applicant && (
          <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
            <p className="text-sm text-slate-600">
              Silakan masuk dengan akun peserta Anda terlebih dahulu untuk mengakses dashboard ujian.
            </p>
            <button
              onClick={() => setCurrentTab('login')}
              className="px-5 py-2.5 bg-blue-900 text-white text-xs font-bold rounded-xl"
            >
              Masuk ke Akun Peserta
            </button>
          </div>
        )}

        {currentTab === 'check_result' && (
          <PublicCheckResult
            config={config}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'admin_dashboard' && (
          <AdminDashboard
            config={config}
            onUpdateConfig={setConfig}
            questions={questions}
            onUpdateQuestions={setQuestions}
            applicants={applicants}
            onUpdateApplicants={setApplicants}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer config={config} onNavigate={handleNavigate} />

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={formatWhatsAppLink(config.whatsapp, 'Halo Admin PPDB SMK Otomotif Cekmobil, saya ingin bertanya informasi pendaftaran calon siswa baru.')}
        target="_blank"
        rel="noreferrer"
        title={`Chat Langsung via WhatsApp (${config.whatsapp})`}
        className="no-print fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 group border-2 border-white/30"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[11px] font-bold leading-tight">Chat Panitia PPDB</span>
          <span className="text-[10px] font-mono opacity-90 leading-tight">{config.whatsapp}</span>
        </div>
      </a>
    </div>
  );
}
