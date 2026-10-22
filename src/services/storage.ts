import {
  SchoolConfig,
  Question,
  Applicant,
  ExamResult,
  ExamDraft,
  StudentExamQuestion,
  CategoryBreakdown,
} from '../types';
import { initialSchoolConfig, initialQuestions, initialApplicants } from '../data/initialData';

const CONFIG_KEY = 'ppdb_school_config_v1';
const QUESTIONS_KEY = 'ppdb_questions_v1';
const APPLICANTS_KEY = 'ppdb_applicants_v1';
const DRAFT_PREFIX = 'ppdb_exam_draft_';

// ---------------- CONFIG ----------------
export function getSchoolConfig(): SchoolConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(initialSchoolConfig));
      return initialSchoolConfig;
    }
    const parsed = JSON.parse(raw);
    // Auto-migrate if previous old name, outdated level, old logo, or old whatsapp is present
    if (
      parsed.name.includes('Nusantara') ||
      !parsed.name.includes('Cekmobil') ||
      parsed.level !== 'SMK Otomotif' ||
      parsed.logoUrl !== initialSchoolConfig.logoUrl ||
      parsed.whatsapp !== initialSchoolConfig.whatsapp
    ) {
      parsed.name = initialSchoolConfig.name;
      parsed.level = initialSchoolConfig.level;
      parsed.badge = initialSchoolConfig.badge;
      parsed.logoUrl = initialSchoolConfig.logoUrl;
      parsed.email = initialSchoolConfig.email;
      parsed.address = initialSchoolConfig.address;
      parsed.whatsapp = initialSchoolConfig.whatsapp;
      localStorage.setItem(CONFIG_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return initialSchoolConfig;
  }
}

export function formatWhatsAppLink(phone: string, text?: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  const international = digits.startsWith('0')
    ? '62' + digits.slice(1)
    : digits.startsWith('62')
    ? digits
    : '62' + digits;
  const message = text || 'Halo Panitia PPDB SMK Otomotif Cekmobil, saya ingin bertanya informasi pendaftaran dan ujian seleksi.';
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

export function saveSchoolConfig(config: SchoolConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// ---------------- QUESTIONS ----------------
export function getQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(initialQuestions));
      return initialQuestions;
    }
    const parsed = JSON.parse(raw) as Question[];
    // If questions don't have automotive questions, refresh with new initial questions
    if (!parsed.some((q) => q.category === 'Dasar Otomotif & Mesin')) {
      localStorage.setItem(QUESTIONS_KEY, JSON.stringify(initialQuestions));
      return initialQuestions;
    }
    return parsed;
  } catch {
    return initialQuestions;
  }
}

export function saveQuestions(questions: Question[]): void {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
}

export function resetQuestionsToDefault(): Question[] {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(initialQuestions));
  return initialQuestions;
}

// Sanitized questions for students (prevents client inspect element cheating)
export function getStudentExamQuestions(): StudentExamQuestion[] {
  const allQuestions = getQuestions();
  const config = getSchoolConfig();

  let list = allQuestions.map((q) => ({
    id: q.id,
    category: q.category,
    questionText: q.questionText,
    options: q.options,
    points: q.points,
  }));

  if (config.randomizeQuestions) {
    list = [...list].sort(() => Math.random() - 0.5);
  }

  return list;
}

// ---------------- APPLICANTS ----------------
export function getApplicants(): Applicant[] {
  try {
    const raw = localStorage.getItem(APPLICANTS_KEY);
    if (!raw) {
      localStorage.setItem(APPLICANTS_KEY, JSON.stringify(initialApplicants));
      return initialApplicants;
    }
    return JSON.parse(raw);
  } catch {
    return initialApplicants;
  }
}

export function saveApplicants(applicants: Applicant[]): void {
  localStorage.setItem(APPLICANTS_KEY, JSON.stringify(applicants));
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(initialSchoolConfig));
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(initialQuestions));
  localStorage.setItem(APPLICANTS_KEY, JSON.stringify(initialApplicants));
  // Clear any existing drafts
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(DRAFT_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
}

export function generateNextRegNumber(): string {
  const applicants = getApplicants();
  const year = new Date().getFullYear();
  let maxSeq = 0;

  applicants.forEach((a) => {
    const parts = a.regNumber.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  });

  const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
  return `REG-${year}-${nextSeq}`;
}

export function registerApplicant(data: Omit<Applicant, 'id' | 'regNumber' | 'registeredAt' | 'examStatus'>): Applicant {
  const applicants = getApplicants();
  const regNumber = generateNextRegNumber();
  const newApplicant: Applicant = {
    ...data,
    id: 'app-' + Date.now(),
    regNumber,
    registeredAt: new Date().toISOString(),
    examStatus: 'not_started',
  };

  applicants.unshift(newApplicant);
  saveApplicants(applicants);
  return newApplicant;
}

export function findApplicantByRegNumber(regNumber: string): Applicant | undefined {
  const applicants = getApplicants();
  return applicants.find(
    (a) => a.regNumber.trim().toUpperCase() === regNumber.trim().toUpperCase()
  );
}

export function findApplicantByCredentials(loginId: string, pass: string): Applicant | undefined {
  const applicants = getApplicants();
  const cleanId = loginId.trim().toLowerCase();
  return applicants.find((a) => {
    const matchId =
      a.regNumber.toLowerCase() === cleanId ||
      a.email.toLowerCase() === cleanId ||
      (a.nisn && a.nisn.toLowerCase() === cleanId);
    const matchPass = !a.password || a.password === pass;
    return matchId && matchPass;
  });
}

export function updateApplicant(updated: Applicant): void {
  const applicants = getApplicants();
  const idx = applicants.findIndex((a) => a.id === updated.id);
  if (idx !== -1) {
    applicants[idx] = updated;
    saveApplicants(applicants);
  }
}

export function deleteApplicant(id: string): void {
  const applicants = getApplicants();
  const filtered = applicants.filter((a) => a.id !== id);
  saveApplicants(filtered);
}

export function resetApplicantExam(regNumber: string): void {
  const applicants = getApplicants();
  const target = applicants.find((a) => a.regNumber === regNumber);
  if (target) {
    target.examStatus = 'not_started';
    delete target.examResult;
    saveApplicants(applicants);
    clearExamDraft(regNumber);
  }
}

// ---------------- EXAM DRAFT & RECOVERY ----------------
export function getExamDraft(regNumber: string): ExamDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + regNumber);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveExamDraft(draft: ExamDraft): void {
  localStorage.setItem(DRAFT_PREFIX + draft.regNumber, JSON.stringify(draft));
}

export function clearExamDraft(regNumber: string): void {
  localStorage.removeItem(DRAFT_PREFIX + regNumber);
}

// ---------------- SERVER-AUTHORITATIVE GRADING ----------------
export function gradeAndSubmitExam(regNumber: string, submittedAnswers: Record<string, string>): ExamResult {
  const questions = getQuestions();
  const config = getSchoolConfig();
  const applicants = getApplicants();
  const applicant = applicants.find((a) => a.regNumber === regNumber);

  if (!applicant) {
    throw new Error('Peserta tidak ditemukan.');
  }

  let totalScore = 0;
  let maxPossibleScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let emptyCount = 0;

  const categoryBreakdown: Record<string, CategoryBreakdown> = {};

  questions.forEach((q) => {
    const qPoints = q.points || 10;
    maxPossibleScore += qPoints;

    if (!categoryBreakdown[q.category]) {
      categoryBreakdown[q.category] = { correct: 0, total: 0, score: 0 };
    }
    categoryBreakdown[q.category].total += 1;

    const chosen = submittedAnswers[q.id];
    if (!chosen) {
      emptyCount++;
    } else if (chosen.toUpperCase() === q.correctAnswer.toUpperCase()) {
      correctCount++;
      totalScore += qPoints;
      categoryBreakdown[q.category].correct += 1;
      categoryBreakdown[q.category].score += qPoints;
    } else {
      wrongCount++;
    }
  });

  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  const passed = percentage >= config.passingGrade;

  const result: ExamResult = {
    submittedAt: new Date().toISOString(),
    totalScore,
    maxPossibleScore,
    percentage,
    correctCount,
    wrongCount,
    emptyCount,
    passed,
    categoryBreakdown,
    answers: submittedAnswers,
  };

  applicant.examStatus = 'completed';
  applicant.examResult = result;
  saveApplicants(applicants);
  clearExamDraft(regNumber);

  return result;
}

// ---------------- EXPORT TO CSV ----------------
export function exportApplicantsToCSV(): string {
  const applicants = getApplicants();
  const config = getSchoolConfig();

  const headers = [
    'No. Pendaftaran',
    'Nama Lengkap',
    'NISN',
    'Jenis Kelamin',
    'Asal Sekolah',
    'Pilihan Jenjang/Kelas',
    'No. WA Orang Tua',
    'Email',
    'Status Ujian',
    'Nilai Akhir (%)',
    'Benar',
    'Salah',
    'Kosong',
    'Status Kelulusan',
    'Waktu Selesai',
  ];

  const rows = applicants.map((a) => {
    const res = a.examResult;
    const statusExam =
      a.examStatus === 'completed'
        ? 'Selesai'
        : a.examStatus === 'in_progress'
        ? 'Sedang Mengerjakan'
        : 'Belum Ujian';

    const lulusStatus = res
      ? config.isAnnounced
        ? res.passed
          ? 'LULUS'
          : 'TIDAK LULUS'
        : 'Menunggu Pengumuman'
      : '-';

    return [
      `"${a.regNumber}"`,
      `"${a.fullName}"`,
      `"${a.nisn || '-'}"`,
      `"${a.gender}"`,
      `"${a.previousSchool}"`,
      `"${a.targetGrade}"`,
      `"${a.parentPhone}"`,
      `"${a.email}"`,
      `"${statusExam}"`,
      `"${res ? res.percentage : '-'}"`,
      `"${res ? res.correctCount : '-'}"`,
      `"${res ? res.wrongCount : '-'}"`,
      `"${res ? res.emptyCount : '-'}"`,
      `"${lulusStatus}"`,
      `"${res ? new Date(res.submittedAt).toLocaleString('id-ID') : '-'}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSVFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
