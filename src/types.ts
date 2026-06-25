export interface Question {
  id: string;
  question: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: string;
}

export interface QuizStats {
  totalQuizzesPlayed: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
  currentStreak: number;
  highestStreak: number;
  lastPlayedDate?: string;
  levelXp: number;
}

export interface QuizAttempt {
  id: string;
  date: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
}

export type DifficultyType = "Beginner" | "Intermediate" | "Expert";

export interface PythonTopic {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  defaultQuestions: Question[];
}
