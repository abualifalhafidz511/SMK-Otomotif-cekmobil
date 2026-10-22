export type SchoolLevel = 'SMK Otomotif' | 'SD / MI' | 'SMP / MTs' | 'SMA / SMK / MA' | 'Pondok Pesantren' | 'Lembaga Pendidikan';

export interface SchoolConfig {
  name: string;
  badge: string;
  academicYear: string;
  level: SchoolLevel;
  address: string;
  whatsapp: string;
  email: string;
  logoUrl: string;
  examDurationMinutes: number;
  passingGrade: number;
  announceDate: string;
  isAnnounced: boolean; // true = public can see lulus/tidak lulus, false = Menunggu Pengumuman
  allowRetake: boolean;
  randomizeQuestions: boolean;
  showAnswerReviewToStudent: boolean;
}

export type QuestionCategory = 'Dasar Otomotif & Mesin' | 'Matematika' | 'Bahasa Indonesia' | 'Pengetahuan Umum' | 'Tes Logika' | 'Pendidikan Agama';

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  questionText: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E'; // Hidden from candidate during test
  explanation?: string;
  points: number;
}

// Sanitized question sent to student during test (without correctAnswer)
export type StudentExamQuestion = Omit<Question, 'correctAnswer' | 'explanation'>;

export interface CategoryBreakdown {
  correct: number;
  total: number;
  score: number;
}

export interface ExamResult {
  submittedAt: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  passed: boolean;
  categoryBreakdown: Record<string, CategoryBreakdown>;
  answers: Record<string, string>; // questionId -> chosen answer
}

export interface Applicant {
  id: string;
  regNumber: string; // e.g. "REG-2025-001"
  fullName: string;
  nisn: string;
  birthPlace: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  previousSchool: string;
  targetGrade: string; // e.g. "Kelas X - MIPA"
  address: string;
  parentPhone: string;
  email: string;
  password?: string;
  registeredAt: string;
  examStatus: 'not_started' | 'in_progress' | 'completed';
  examResult?: ExamResult;
}

export interface ExamDraft {
  regNumber: string;
  startedAt: string; // ISO string
  remainingSeconds: number;
  answers: Record<string, string>; // questionId -> key
  flaggedQuestionIds: string[]; // marked for review
}

export interface UserSession {
  role: 'student' | 'admin';
  applicant?: Applicant;
  username?: string;
}
