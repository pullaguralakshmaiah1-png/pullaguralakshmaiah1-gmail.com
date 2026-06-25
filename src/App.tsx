import React, { useState, useEffect } from "react";
import { Terminal, Flame, Clock, Code, RefreshCw, BarChart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_TOPICS } from "./data";
import { Question, QuizStats, QuizAttempt } from "./types";
import Dashboard from "./components/Dashboard";
import QuizStage from "./components/QuizStage";
import QuizResults from "./components/QuizResults";
import PythonSandbox from "./components/PythonSandbox";

const LOCAL_STATS_KEY = "python_quiz_user_stats_v1";
const LOCAL_HISTORY_KEY = "python_quiz_user_history_v1";

const INITIAL_STATS: QuizStats = {
  totalQuizzesPlayed: 0,
  totalCorrectAnswers: 0,
  totalQuestionsAnswered: 0,
  currentStreak: 0,
  highestStreak: 0,
  levelXp: 0,
};

export default function App() {
  const [view, setView] = useState<"DASHBOARD" | "QUIZ" | "RESULTS">("DASHBOARD");
  const [activeTopicName, setActiveTopicName] = useState("");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeSpent, setTimeSpent] = useState<{ [key: number]: number }>({});

  const [stats, setStats] = useState<QuizStats>(INITIAL_STATS);
  const [history, setHistory] = useState<QuizAttempt[]>([]);

  // Sandbox Overlay State
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxCode, setSandboxCode] = useState("");

  // Real-Time Dynamic Clock
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Clock updater
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize stats & history from local storage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem(LOCAL_STATS_KEY);
      const savedHistory = localStorage.getItem(LOCAL_HISTORY_KEY);

      if (savedStats) {
        setStats(JSON.parse(savedStats));
      } else {
        // First-time load: bootstrap a 1-day starter streak
        const initialWithStreak = { ...INITIAL_STATS, currentStreak: 1, highestStreak: 1 };
        setStats(initialWithStreak);
        localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(initialWithStreak));
      }

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to read local storage", e);
    }
  }, []);

  const handleStartQuiz = (topicId: string, questions: Question[], isAiGenerated = false, topicName = "") => {
    setActiveTopicName(topicName);
    setActiveQuestions(questions);
    setSelectedAnswers({});
    setTimeSpent({});
    setView("QUIZ");
  };

  const handleFinishQuiz = (finalSelectedAnswers: { [key: number]: number }, finalTimeSpent: { [key: number]: number }) => {
    setSelectedAnswers(finalSelectedAnswers);
    setTimeSpent(finalTimeSpent);

    // Calculate details
    let correct = 0;
    activeQuestions.forEach((q, idx) => {
      if (finalSelectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    const totalCount = activeQuestions.length;
    const accuracy = totalCount > 0 ? Math.round((correct / totalCount) * 100) : 0;
    const xpGained = correct * 10 + (accuracy === 100 ? 50 : 0);

    // Update statistics
    setStats((prevStats) => {
      // Streak Calculation
      let newStreak = prevStats.currentStreak || 1;
      const todayStr = new Date().toDateString();
      const lastPlayedStr = prevStats.lastPlayedDate;

      if (lastPlayedStr) {
        const lastDate = new Date(lastPlayedStr);
        const diffTime = Math.abs(new Date(todayStr).getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Increment streak if played on consecutive days
          newStreak = prevStats.currentStreak + 1;
        } else if (diffDays > 1) {
          // Reset if they missed a day
          newStreak = 1;
        }
        // If diffDays is 0, keep current streak (already played today)
      } else {
        newStreak = 1;
      }

      const updatedStats: QuizStats = {
        totalQuizzesPlayed: prevStats.totalQuizzesPlayed + 1,
        totalCorrectAnswers: prevStats.totalCorrectAnswers + correct,
        totalQuestionsAnswered: prevStats.totalQuestionsAnswered + totalCount,
        currentStreak: newStreak,
        highestStreak: Math.max(prevStats.highestStreak, newStreak),
        lastPlayedDate: todayStr,
        levelXp: prevStats.levelXp + xpGained,
      };

      localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(updatedStats));
      return updatedStats;
    });

    // Save Attempt History
    const newAttempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      date: new Date().toISOString(),
      topic: activeTopicName,
      difficulty: activeQuestions[0]?.difficulty || "Intermediate",
      score: correct,
      totalQuestions: totalCount,
      accuracy,
    };

    setHistory((prevHistory) => {
      const updatedHistory = [newAttempt, ...prevHistory].slice(0, 30); // Keep last 30 attempts
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });

    setView("RESULTS");
  };

  const handleOpenSandbox = (codeToLoad: string) => {
    setSandboxCode(codeToLoad);
    setSandboxOpen(true);
  };

  const handleResetAllData = () => {
    if (confirm("Are you sure you want to reset all your stats and game history? This action is permanent.")) {
      localStorage.removeItem(LOCAL_STATS_KEY);
      localStorage.removeItem(LOCAL_HISTORY_KEY);
      setStats({ ...INITIAL_STATS, currentStreak: 1, highestStreak: 1 });
      setHistory([]);
      alert("Performance profile and records reset successful.");
    }
  };

  return (
    <div className="min-h-screen bg-hd-bg-main text-hd-text flex flex-col font-sans">
      {/* Main Command Navigation Header */}
      <header className="sticky top-0 z-40 bg-hd-bg-panel border-b border-hd-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo Representation */}
          <div 
            onClick={() => setView("DASHBOARD")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-1.5 bg-hd-blue text-white rounded-sm flex items-center justify-center transition-all duration-300">
              <Code className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="font-mono font-bold tracking-tight text-base sm:text-lg">
                PY_CORE // <span className="text-hd-blue-light">VIRTUAL_LAB</span>
              </span>
              <span className="bg-hd-green text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ml-2 inline-block">Live Session</span>
            </div>
          </div>

          {/* Dynamic real-time widgets */}
          <div className="flex items-center gap-6 font-mono text-xs">
            {/* Session ID / Metadata widget (High density style) */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-hd-muted text-[9px] uppercase tracking-wider">Session ID</span>
              <span className="text-hd-blue-light font-semibold">QX-992-ALPHA</span>
            </div>

            {/* Current User */}
            <div className="hidden sm:flex flex-col items-end border-l border-hd-border pl-6">
              <span className="text-hd-muted text-[9px] uppercase tracking-wider">Current User</span>
              <span className="text-hd-text">dev_architect_88</span>
            </div>

            {/* Live Clock */}
            <div className="flex flex-col items-end border-l border-hd-border pl-6">
              <span className="text-hd-muted text-[9px] uppercase tracking-wider">Time (UTC)</span>
              <span className="text-hd-text font-semibold">{currentTime || "00:00:00"}</span>
            </div>

            {/* Sandbox Launcher */}
            <button
              onClick={() => handleOpenSandbox("")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-hd-bg-card hover:bg-hd-border text-hd-blue-light font-mono text-xs font-semibold rounded border border-hd-border transition-all cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Sandbox</span>
            </button>

            {/* Reset Stats trigger (Gear/Reset) */}
            <button
              onClick={handleResetAllData}
              className="p-1.5 hover:bg-hd-red/10 text-hd-muted hover:text-hd-red rounded transition-all cursor-pointer border border-transparent hover:border-hd-red/20"
              title="Reset metrics profile"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {view === "DASHBOARD" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <Dashboard
                topics={DEFAULT_TOPICS}
                stats={stats}
                history={history}
                onStartQuiz={handleStartQuiz}
              />
            </motion.div>
          )}

          {view === "QUIZ" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <QuizStage
                topicName={activeTopicName}
                questions={activeQuestions}
                onFinishQuiz={handleFinishQuiz}
                onOpenSandbox={handleOpenSandbox}
              />
            </motion.div>
          )}

          {view === "RESULTS" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <QuizResults
                topicName={activeTopicName}
                questions={activeQuestions}
                selectedAnswers={selectedAnswers}
                timeSpent={timeSpent}
                onRestart={() => handleStartQuiz(activeTopicName, activeQuestions, false, activeTopicName)}
                onGoHome={() => setView("DASHBOARD")}
                onOpenSandbox={handleOpenSandbox}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Code Sandbox Overlay Drawer */}
      <AnimatePresence>
        {sandboxOpen && (
          <PythonSandbox
            initialCode={sandboxCode}
            isOpen={sandboxOpen}
            onClose={() => setSandboxOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* High Density Footer */}
      <footer className="h-12 bg-hd-bg-card border-t border-hd-border px-6 flex items-center justify-between text-xs text-hd-muted font-mono z-10 relative">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-6 text-[10px] text-hd-muted">
            <div className="flex items-center gap-1.5">
              <span className="bg-hd-border text-hd-text px-1.5 py-0.5 rounded font-bold">ENTER</span> Submit Answer
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-hd-border text-hd-text px-1.5 py-0.5 rounded font-bold">SANDBOX</span> Run Python
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-hd-green shadow-[0_0_8px_#238636]"></span>
              LIVE COMPILE
            </span>
            <span>•</span>
            <span>v1.0.4-prod</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
