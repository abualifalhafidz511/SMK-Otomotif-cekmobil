import { useState, useEffect, useRef } from 'react';
import {
  Applicant,
  SchoolConfig,
  StudentExamQuestion,
  ExamResult,
  ExamDraft,
} from '../types';
import {
  getStudentExamQuestions,
  getExamDraft,
  saveExamDraft,
  gradeAndSubmitExam,
} from '../services/storage';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  HelpCircle,
} from 'lucide-react';

interface ExamScreenProps {
  applicant: Applicant;
  config: SchoolConfig;
  onFinishExam: (result: ExamResult) => void;
  onExit: () => void;
}

export default function ExamScreen({
  applicant,
  config,
  onFinishExam,
  onExit,
}: ExamScreenProps) {
  // 1. Load questions (sanitized, no correctAnswer)
  const [questions] = useState<StudentExamQuestion[]>(() => getStudentExamQuestions());

  // 2. Load draft if exists, else initialize
  const initialDraft = getExamDraft(applicant.regNumber);
  const totalSeconds = config.examDurationMinutes * 60;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => initialDraft?.answers || {});
  const [flaggedIds, setFlaggedIds] = useState<string[]>(() => initialDraft?.flaggedQuestionIds || []);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (initialDraft && initialDraft.remainingSeconds > 0) {
      return initialDraft.remainingSeconds;
    }
    return totalSeconds;
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = questions[currentIndex];
  const isFlagged = currentQ ? flaggedIds.includes(currentQ.id) : false;
  const currentAnswer = currentQ ? answers[currentQ.id] || '' : '';

  // Timer reference to avoid stale closures
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save draft helper
  const persistDraft = (currAnswers: Record<string, string>, currFlags: string[], currSecs: number) => {
    const draft: ExamDraft = {
      regNumber: applicant.regNumber,
      startedAt: initialDraft?.startedAt || new Date().toISOString(),
      remainingSeconds: currSecs,
      answers: currAnswers,
      flaggedQuestionIds: currFlags,
    };
    saveExamDraft(draft);
  };

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        const next = prev - 1;
        // Save draft every 10 seconds
        if (next % 10 === 0) {
          persistDraft(answers, flaggedIds, next);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [answers, flaggedIds]);

  const handleTimeExpired = () => {
    alert('Waktu ujian telah berakhir! Sistem akan mengumpulkan jawaban Anda secara otomatis.');
    finalizeSubmission();
  };

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (!currentQ) return;
    const updated = { ...answers, [currentQ.id]: optionKey };
    setAnswers(updated);
    persistDraft(updated, flaggedIds, remainingSeconds);
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    let updatedFlags: string[];
    if (flaggedIds.includes(currentQ.id)) {
      updatedFlags = flaggedIds.filter((id) => id !== currentQ.id);
    } else {
      updatedFlags = [...flaggedIds, currentQ.id];
    }
    setFlaggedIds(updatedFlags);
    persistDraft(answers, updatedFlags, remainingSeconds);
  };

  const finalizeSubmission = () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const result = gradeAndSubmitExam(applicant.regNumber, answers);
      onFinishExam(result);
    } catch {
      alert('Terjadi kendala saat mengumpulkan ujian. Silakan coba kembali.');
      setIsSubmitting(false);
    }
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds <= 300; // < 5 mins
  const isCriticalTime = remainingSeconds <= 60; // < 1 min

  // Calculate statistics for confirmation
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = flaggedIds.length;

  const fontClasses = {
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-relaxed',
    xlarge: 'text-lg sm:text-xl leading-relaxed',
  };

  if (!currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <p className="text-sm text-slate-700">Bank soal tidak tersedia atau kosong.</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-blue-900 text-white text-xs font-bold rounded-lg"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Top Proctor Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Candidate identity */}
          <div className="flex items-center gap-3">
            <img
              src={config.logoUrl}
              alt={config.name}
              className="w-8 h-8 rounded-full object-cover border border-red-500/60 p-0.5 bg-black hidden sm:block"
            />
            <div>
              <span className="text-xs font-bold text-white block">
                {applicant.fullName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {applicant.regNumber} · {currentQ.category}
              </span>
            </div>
          </div>

          {/* Central Countdown Timer */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition-colors ${
                isCriticalTime
                  ? 'bg-rose-900 text-white border-rose-600 animate-pulse'
                  : isLowTime
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-slate-800 text-slate-100 border-slate-700'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Sisa Waktu: {formatTime(remainingSeconds)}</span>
            </div>
          </div>

          {/* Actions & Resizer */}
          <div className="flex items-center gap-2">
            {/* Font size toggle */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                title="Ukuran Normal"
                className={`p-1 rounded text-xs ${fontSize === 'normal' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                title="Ukuran Sedang"
                className={`p-1 rounded text-xs ${fontSize === 'large' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                <span className="text-[11px] font-bold">A</span>
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xlarge')}
                title="Ukuran Besar"
                className={`p-1 rounded text-xs ${fontSize === 'xlarge' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kumpulkan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main CBT Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Question Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-blue-900 text-white px-2.5 py-1 rounded-lg">
                  Soal Nomor {currentIndex + 1} / {totalQuestions}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Kategori: <strong className="text-slate-800">{currentQ.category}</strong>
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Bobot: {currentQ.points} Poin
              </span>
            </div>

            {/* Question Text */}
            <div className={`text-slate-900 font-medium mb-8 ${fontClasses[fontSize]}`}>
              {currentQ.questionText}
            </div>

            {/* Options List A - E */}
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = currentAnswer === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 group ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70 text-blue-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="text-xs sm:text-sm font-medium pt-0.5 leading-relaxed">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Navigation Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {/* Flag / Ragu-ragu Checkbox */}
            <button
              type="button"
              onClick={handleToggleFlag}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                isFlagged
                  ? 'bg-amber-100 text-amber-950 border-amber-400'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'text-amber-700 fill-amber-700' : 'text-slate-400'}`} />
              <span>{isFlagged ? 'Telah Ditandai Ragu-ragu' : 'Tandai Ragu-ragu'}</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <span>Selesai Ujian</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Question Palette & Overview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
              Navigasi Nomor Soal
            </h4>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-[11px] mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-900 block" />
                <span className="text-slate-600">Terjawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 block" />
                <span className="text-slate-600">Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 block" />
                <span className="text-slate-600">Kosong</span>
              </div>
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {questions.map((q, idx) => {
                const hasAnswer = Boolean(answers[q.id]);
                const isItemFlagged = flaggedIds.includes(q.id);
                const isCurrent = idx === currentIndex;

                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                if (isItemFlagged) {
                  btnStyle = 'bg-amber-400 border-amber-500 text-slate-950 font-bold';
                } else if (hasAnswer) {
                  btnStyle = 'bg-blue-900 border-blue-900 text-white font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-mono border transition-all flex items-center justify-center relative ${btnStyle} ${
                      isCurrent ? 'ring-2 ring-amber-400 ring-offset-2' : ''
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {hasAnswer && (
                      <span className="text-[9px] absolute top-0.5 right-1 opacity-70">
                        {answers[q.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress Counter Summary */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Soal Terjawab:</span>
                <span className="font-bold text-blue-900 font-mono">
                  {answeredCount} dari {totalQuestions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Belum Dijawab:</span>
                <span className="font-bold text-slate-700 font-mono">
                  {unansweredCount} Soal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ditandai Ragu:</span>
                <span className="font-bold text-amber-700 font-mono">
                  {flaggedCount} Soal
                </span>
              </div>
            </div>
          </div>

          {/* Help box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HelpCircle className="w-3.5 h-3.5 text-blue-900" />
              <span>Auto-Save Aktif</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Jawaban Anda disimpan otomatis ke server setiap kali pilihan diklik. Jika koneksi terputus, muat ulang halaman untuk melanjutkan.
            </p>
          </div>
        </div>
      </main>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Konfirmasi Pengumpulan Ujian
                </h3>
                <p className="text-xs text-slate-500">Pastikan seluruh jawaban telah Anda periksa</p>
              </div>
            </div>

            {/* Rekapitulasi pengerjaan */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Soal:</span>
                <span className="font-mono font-bold text-slate-900">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sudah Terjawab:</span>
                <span className="font-mono font-bold text-emerald-700">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Belum Terjawab:</span>
                <span className="font-mono font-bold text-rose-700">{unansweredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Masih Ragu-ragu:</span>
                <span className="font-mono font-bold text-amber-700">{flaggedCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
                Peringatan: Masih ada <strong>{unansweredCount} soal</strong> yang belum Anda jawab. Soal kosong tidak mendapatkan poin.
              </p>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              Setelah dikumpulkan, jawaban tidak dapat diubah kembali dan nilai akan segera diproses oleh server panitia.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                onClick={finalizeSubmission}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Menilai...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Ya, Kumpulkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
