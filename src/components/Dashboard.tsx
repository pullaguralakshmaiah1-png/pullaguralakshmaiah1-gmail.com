import React, { useState } from "react";
import { 
  Flame, Award, BookOpen, Clock, ArrowRight, Sparkles, Plus, 
  Terminal, BarChart2, Shield, Play, HelpCircle, History 
} from "lucide-react";
import { motion } from "motion/react";
import { QuizStats, PythonTopic, QuizAttempt, DifficultyType } from "../types";

interface DashboardProps {
  topics: PythonTopic[];
  stats: QuizStats;
  history: QuizAttempt[];
  onStartQuiz: (topicId: string, questions: any[], isAiGenerated?: boolean, customTopicName?: string) => void;
}

export default function Dashboard({ topics, stats, history, onStartQuiz }: DashboardProps) {
  const [customTopic, setCustomTopic] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState<DifficultyType>("Intermediate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const level = Math.floor(stats.levelXp / 100) + 1;
  const currentLevelXp = stats.levelXp % 100;

  const handleGenerateAiQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGenerating(true);
    setGenError(null);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: customTopic,
          difficulty: customDifficulty,
          count: 5
        })
      });

      const data = await response.json();
      if (response.ok && data.success && data.questions && data.questions.length > 0) {
        onStartQuiz(
          `ai_${Date.now()}`,
          data.questions,
          true,
          `${customTopic} (${customDifficulty})`
        );
      } else {
        setGenError(data.error || "The AI generated an invalid format. Please try again.");
      }
    } catch (err: any) {
      setGenError("Failed to connect to the AI model. Please verify your connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartStaticQuiz = (topic: PythonTopic) => {
    onStartQuiz(topic.id, topic.defaultQuestions, false, topic.name);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4 px-2">
      {/* Hero Welcome Banner */}
      <div className="relative rounded bg-hd-bg-panel border border-hd-border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-3 max-w-xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-hd-blue/10 text-hd-blue-light text-[10px] font-mono font-bold uppercase rounded border border-hd-blue/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Engine Activated // LIVE
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono text-hd-text tracking-tight leading-tight">
            Elevate Your <span className="text-hd-blue-light">Python Mastery</span> Real-Time
          </h1>
          <p className="text-hd-muted text-xs md:text-sm leading-relaxed">
            Test your understanding with compiler-grade output challenges, review with deep AI breakdowns, and practice inside our interactive sandbox.
          </p>
        </div>

        {/* Level XP Widget */}
        <div className="bg-hd-bg-card border border-hd-border p-5 rounded w-full max-w-[280px] space-y-3 shadow z-10">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[10px] font-bold text-hd-muted uppercase tracking-wider">Your Profile</span>
            <span className="text-[10px] font-bold text-hd-yellow px-2 py-0.5 bg-hd-yellow/10 rounded border border-hd-yellow/20">LVL {level}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-hd-muted">
              <span>XP Progression</span>
              <span>{currentLevelXp} / 100 XP</span>
            </div>
            <div className="w-full h-1.5 bg-hd-bg-main rounded overflow-hidden border border-hd-border">
              <motion.div 
                className="h-full bg-hd-blue"
                initial={{ width: 0 }}
                animate={{ width: `${currentLevelXp}%` }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 text-center border-t border-hd-border font-mono">
            <div>
              <div className="text-base font-bold text-hd-text">{stats.totalQuizzesPlayed}</div>
              <div className="text-[9px] text-hd-muted uppercase tracking-wider">Quizzes</div>
            </div>
            <div>
              <div className="text-base font-bold text-hd-yellow flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-hd-yellow/10 text-hd-yellow" />
                {stats.currentStreak}
              </div>
              <div className="text-[9px] text-hd-muted uppercase tracking-wider">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: AI Quiz Generator & stats overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI Generator Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-hd-bg-panel border border-hd-border rounded p-6 space-y-5 relative shadow">
            <div className="absolute top-4 right-4 text-[9px] font-mono text-hd-blue-light/30 uppercase tracking-widest font-bold">GEN-AI</div>
            <div>
              <h2 className="text-base font-bold font-mono text-hd-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-hd-yellow" />
                AI Custom Quiz Generator
              </h2>
              <p className="text-[11px] text-hd-muted mt-1">
                Generate tailored multiple-choice programming exercises for any specific Python package or methodology.
              </p>
            </div>

            <form onSubmit={handleGenerateAiQuiz} className="space-y-3 font-mono">
              <div>
                <label className="text-[10px] font-bold text-hd-muted block mb-1">
                  Python Topic or Keyword
                </label>
                <input
                  type="text"
                  required
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. List Comprehensions, Decorators, Pandas, FastAPI, async/await"
                  className="w-full bg-hd-bg-main border border-hd-border rounded px-3 py-2 text-xs text-hd-text placeholder-hd-muted/60 focus:outline-none focus:ring-1 focus:ring-hd-blue"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-hd-muted block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value as DifficultyType)}
                    className="w-full bg-hd-bg-main border border-hd-border rounded px-3 py-2 text-xs text-hd-text focus:outline-none focus:ring-1 focus:ring-hd-blue"
                  >
                    <option value="Beginner">Beginner (Basics & Simple print)</option>
                    <option value="Intermediate">Intermediate (Logic, lists, classes)</option>
                    <option value="Expert">Expert (Meta programming, complexity)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isGenerating || !customTopic.trim()}
                    className="w-full bg-hd-green hover:bg-hd-green-hover text-white font-bold text-xs uppercase px-4 py-2.5 rounded transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Compiling Quiz...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-hd-yellow" />
                        Generate Quiz (5 Qs)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {genError && (
                <div className="p-2.5 bg-hd-red/10 border border-hd-red/20 rounded text-[11px] text-hd-red flex items-start gap-2 animate-shake">
                  <span className="font-bold">Error:</span>
                  <span>{genError}</span>
                </div>
              )}
            </form>
          </div>

          {/* Core Categories (Prebuilt) */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold font-mono text-hd-text flex items-center gap-2 pl-1">
              <BookOpen className="w-4 h-4 text-hd-blue-light" />
              Standard Training Modules
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {topics.map((topic) => (
                <div 
                  key={topic.id}
                  className="bg-hd-bg-card hover:bg-[#1C2128] border border-hd-border rounded p-4 flex flex-col justify-between gap-3 transition-all hover:border-hd-muted group"
                >
                  <div className="space-y-1.5">
                    <div className="p-1.5 bg-hd-blue/10 text-hd-blue-light rounded w-fit">
                      {topic.id === "basics" && <Terminal className="w-3.5 h-3.5" />}
                      {topic.id === "data_structures" && <BarChart2 className="w-3.5 h-3.5" />}
                      {topic.id === "oop" && <Shield className="w-3.5 h-3.5" />}
                      {topic.id === "advanced" && <Sparkles className="w-3.5 h-3.5" />}
                    </div>
                    <h3 className="font-bold text-sm text-hd-text group-hover:text-hd-blue-light transition-colors">{topic.name}</h3>
                    <p className="text-hd-muted text-xs leading-relaxed">{topic.description}</p>
                  </div>
                  <button
                    onClick={() => handleStartStaticQuiz(topic)}
                    className="mt-1 text-xs font-semibold text-hd-blue-light hover:text-hd-blue transition-colors flex items-center gap-1 w-full text-left"
                  >
                    Launch Core Training
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Analytics, Streak & Attempt History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Metrics */}
          <div className="bg-hd-bg-panel border border-hd-border rounded p-5 space-y-3">
            <h3 className="text-[10px] font-bold font-mono text-hd-muted uppercase tracking-wider">Performance Analytics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-hd-bg-card p-3 rounded border border-hd-border">
                <div className="text-[10px] text-hd-muted uppercase tracking-wider font-semibold font-mono">Overall Accuracy</div>
                <div className="text-xl font-bold font-mono text-hd-green mt-1">
                  {stats.totalQuestionsAnswered > 0 
                    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100) 
                    : 0}%
                </div>
                <div className="text-[10px] font-mono text-hd-muted mt-0.5">
                  {stats.totalCorrectAnswers} of {stats.totalQuestionsAnswered} correct
                </div>
              </div>

              <div className="bg-hd-bg-card p-3 rounded border border-hd-border">
                <div className="text-[10px] text-hd-muted uppercase tracking-wider font-semibold font-mono">Highest Streak</div>
                <div className="text-xl font-bold font-mono text-hd-yellow mt-1 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-hd-yellow/10" />
                  {stats.highestStreak}
                </div>
                <div className="text-[10px] font-mono text-hd-muted mt-0.5">
                  Continuous days active
                </div>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          <div className="bg-hd-bg-panel border border-hd-border rounded p-5 flex flex-col h-[340px]">
            <h3 className="text-[10px] font-bold font-mono text-hd-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-hd-muted" />
              Recent Quiz History
            </h3>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-hd-muted">
                <Award className="w-6 h-6 mb-1.5 opacity-35" />
                <p className="text-xs">No records found yet. Complete a core training or generate an AI quiz to begin!</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar font-mono text-[11px]">
                {history.map((attempt) => (
                  <div 
                    key={attempt.id}
                    className="p-2.5 bg-hd-bg-card rounded border border-hd-border flex items-center justify-between"
                  >
                    <div className="space-y-0.5 max-w-[200px]">
                      <div className="font-semibold text-hd-text truncate">{attempt.topic}</div>
                      <div className="text-[10px] text-hd-muted flex items-center gap-2">
                        <span>{new Date(attempt.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="text-hd-yellow font-semibold">{attempt.difficulty}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-hd-text text-xs">
                        {attempt.score}/{attempt.totalQuestions}
                      </div>
                      <div className={`text-[10px] font-bold ${attempt.accuracy >= 80 ? 'text-hd-green' : attempt.accuracy >= 50 ? 'text-hd-yellow' : 'text-hd-red'}`}>
                        {attempt.accuracy}% Acc
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
