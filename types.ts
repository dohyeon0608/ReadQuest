
export enum AppView {
  DASHBOARD,
  FOCUS,
  QUIZ_PREP,
  QUIZ,
  RESULTS,
}

export enum ContentCategory {
  FICTION = "소설",
  ACADEMIC = "학술 서적",
  TECHNICAL = "기술 논문",
}

export interface JournalEntry {
  date: string; // ISO string for sorting
  bookTitle: string;
  selectedSections: string[];
  goalMinutes: number;
  earnedExp: number;
  earnedRp: number; // total RP including bonus
  quizCorrect: number;
  quizTotal: number;
}

export interface UserStats {
  level: number;
  exp: number;
  expToNextLevel: number;
  rp: number;
  streak: number;
  lastQuestDate: string | null;
  titles: string[];
  progress: Record<string, string[]>; // Tracks completed sections by book title
  journal: JournalEntry[];
}

export interface Chapter {
  title: string;
  sections: string[];
}

export interface Book {
  title: string;
  category: ContentCategory;
  tableOfContents: Chapter[];
}

export interface Quest {
  bookTitle: string;
  category: ContentCategory;
  goalMinutes: number;
  potentialExp: number;
  potentialRp: number;
  selectedSections: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizResult {
  earnedExp: number;
  earnedRp: number;
  bonusRp: number;
  correctAnswers: number;
  totalQuestions: number;
  isStreakBonus: boolean;
}

export type ReadingPace = '느리게' | '보통' | '빠르게' | '직접 설정';

export interface ReadingPlan {
  pace: ReadingPace;
  sectionsPerQuest: number;
  startSection: string;
  endSection: string;
  minutesPerSection: number;
}