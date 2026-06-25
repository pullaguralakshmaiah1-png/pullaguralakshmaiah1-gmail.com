import React, { useState } from "react";
import { Award, RotateCcw, Home, CheckCircle2, XCircle, Clock, BookOpen, Terminal, Brain, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Question } from "../types";

interface QuizResultsProps {
  topicName: string;
  questions: Question[];
  selectedAnswers: { [key: number]: number };
  timeSpent: { [key: number]: number };
  onRestart: () => void;
  onGoHome: () => void;
  onOpenSandbox: (code: string) => void;
}

export default function QuizResults({
  topicName,
  questions,
  selectedAnswers,
  timeSpent,
  onRestart,
  onGoHome,
  onOpenSandbox
}: QuizResultsProps) {
  const [explainingQuestionId, setExplainingQuestionId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<{ [questionId: string]: string }>({});
  const [isExplaining, setIsExplaining] = useState(false);

  // Calculate score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  const totalQuestions = questions.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  
  // Calculate total time
  const totalSeconds = Object.values(timeSpent).reduce((a, b) => a + b, 0);
  const formattedTime = `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`;

  // XP calculation
  const xpGained = correctCount * 10 + (accuracy === 100 ? 50 : 0);

  const fetchAiExplanation = async (qId: string, qIdx: number) => {
    if (aiExplanations[qId]) return; // Already loaded

    setExplainingQuestionId(qId);
    setIsExplaining(true);

    try {
      const q = questions[qIdx];
      const selectedText = selectedAnswers[qIdx] !== undefined && selectedAnswers[qIdx] !== -1
        ? q.options[selectedAnswers[qIdx]]
        : "Timed Out / No Answer";

      const response = await fetch("/api/quiz/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.question,
          code: q.code || "",
          selectedOption: selectedText,
          correctOption: q.options[q.correctIndex],
          options: q.options
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAiExplanations((prev) => ({
          ...prev,
          [qId]: data.explanation
        }));
      } else {
        setAiExplanations((prev) => ({
          ...prev,
          [qId]: "The AI Tutor was temporarily unable to compile an explanation. However, remember that in Python, " + q.explanation
        }));
      }
    } catch (err) {
      setAiExplanations((prev) => ({
        ...prev,
        [qId]: "Failed to contact the AI Tutor. Please verify your server connection and API key."
      }));
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 space-y-6">
      {/* Celebration Card */}
      <div className="bg-hd-bg-panel border border-hd-border rounded p-6 md:p-8 text-center relative overflow-hidden shadow-md">
        <div className="max-w-md mx-auto space-y-4">
          <div className="mx-auto w-12 h-12 bg-hd-yellow/10 rounded-full flex items-center justify-center border border-hd-yellow/20 shadow">
            <Award className="w-6 h-6 text-hd-yellow" />
          </div>

          <div className="space-y-1.5 font-mono">
            <h2 className="text-xl md:text-2xl font-bold text-hd-text tracking-tight uppercase">Session Complete // Evaluated</h2>
            <p className="text-hd-muted text-xs">
              Excellent focus! You finished the training on <span className="text-hd-yellow font-semibold">{topicName}</span>.
            </p>
          </div>

          {/* Core Metrics Row */}
          <div className="grid grid-cols-3 gap-3 bg-hd-bg-card border border-hd-border p-4 rounded font-mono text-xs">
            <div className="space-y-0.5">
              <span className="text-[9px] text-hd-muted uppercase tracking-wider block font-bold">Score</span>
              <span className="text-lg font-bold text-hd-text">{correctCount} / {totalQuestions}</span>
            </div>
            <div className="space-y-0.5 border-x border-hd-border">
              <span className="text-[9px] text-hd-muted uppercase tracking-wider block font-bold">Accuracy</span>
              <span className={`text-lg font-bold ${accuracy >= 80 ? 'text-hd-green' : accuracy >= 50 ? 'text-hd-yellow' : 'text-hd-red'}`}>
                {accuracy}%
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] text-hd-muted uppercase tracking-wider block font-bold">XP Gain</span>
              <span className="text-lg font-bold text-hd-yellow flex items-center justify-center gap-0.5">
                +{xpGained}
                <span className="text-[9px] text-hd-yellow font-bold">XP</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2 font-mono">
            <button
              onClick={onRestart}
              className="px-4 py-2 bg-hd-bg-card hover:bg-hd-border text-hd-text font-bold text-xs rounded border border-hd-border transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Training
            </button>
            <button
              onClick={onGoHome}
              className="px-5 py-2 bg-hd-green hover:bg-hd-green-hover text-white font-bold text-xs rounded transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              Return to Lab
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-mono text-hd-text flex items-center gap-2 pl-1">
          <BookOpen className="w-4 h-4 text-hd-blue-light" />
          EXECUTION LOG & WORKSPACE REVIEW
        </h3>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userAnsIdx = selectedAnswers[idx];
            const isCorrect = userAnsIdx === q.correctIndex;
            const isTimedOut = userAnsIdx === -1 || userAnsIdx === undefined;
            const userSelectedText = !isTimedOut ? q.options[userAnsIdx] : "No response / Time limit reached";

            return (
              <div 
                key={q.id}
                className="bg-hd-bg-panel border border-hd-border rounded p-5 space-y-4 relative overflow-hidden"
              >
                {/* Score Tag status */}
                <div className="absolute top-5 right-5 flex items-center gap-2">
                  <span className="text-[9px] font-mono text-hd-muted font-bold uppercase tracking-wider mr-2 hidden sm:inline">
                    T_ELAPSED: {timeSpent[idx] || 0}s
                  </span>
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-hd-green/10 text-hd-green text-[10px] font-mono font-bold rounded border border-hd-green/20 uppercase">
                      Correct
                    </span>
                  ) : isTimedOut ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-hd-yellow/10 text-hd-yellow text-[10px] font-mono font-bold rounded border border-hd-yellow/20 uppercase">
                      Timed Out
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-hd-red/10 text-hd-red text-[10px] font-mono font-bold rounded border border-hd-red/20 uppercase">
                      Incorrect
                    </span>
                  )}
                </div>

                {/* Question Info */}
                <div className="space-y-1 pr-24">
                  <span className="text-[9px] font-mono text-hd-muted uppercase tracking-widest block font-bold">CHALLENGE {String(idx + 1).padStart(2, '0')}</span>
                  <h4 className="font-bold text-hd-text text-sm md:text-base leading-relaxed">{q.question}</h4>
                </div>

                {/* Code (if exists) */}
                {q.code && (
                  <div className="relative group rounded border border-hd-border bg-hd-bg-code max-w-2xl">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-hd-bg-card text-hd-muted text-[10px] font-mono border-b border-hd-border">
                      <span>python_snippet.py</span>
                      <button
                        onClick={() => onOpenSandbox(q.code || "")}
                        className="flex items-center gap-1 hover:text-hd-text transition-colors font-bold text-hd-blue-light"
                      >
                        <Terminal className="w-3 h-3 text-hd-yellow" />
                        Playground
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs font-mono text-hd-purple leading-relaxed whitespace-pre">
                      {q.code}
                    </pre>
                  </div>
                )}

                {/* Answers block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl font-mono text-xs">
                  <div className="p-2.5 bg-hd-bg-card rounded border border-hd-border space-y-0.5">
                    <span className="text-[9px] font-bold text-hd-muted uppercase block tracking-wider">Your Selection:</span>
                    <span className={`text-xs ${isCorrect ? 'text-hd-green font-bold' : 'text-hd-text'}`}>
                      {userSelectedText}
                    </span>
                  </div>
                  <div className="p-2.5 bg-hd-bg-card rounded border border-hd-border space-y-0.5">
                    <span className="text-[9px] font-bold text-hd-muted uppercase block tracking-wider">Correct Answer:</span>
                    <span className="text-xs text-hd-green font-bold">
                      {q.options[q.correctIndex]}
                    </span>
                  </div>
                </div>

                {/* Quick logic */}
                <div className="text-xs text-hd-text leading-relaxed max-w-3xl">
                  <span className="font-bold text-hd-muted uppercase text-[9px] font-mono block mb-0.5">Explanation Matrix:</span>
                  <p className="font-medium text-hd-muted">{q.explanation}</p>
                </div>

                {/* Interactive AI Tutor Explanation trigger */}
                <div className="pt-1.5">
                  {aiExplanations[q.id] ? (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-4 bg-hd-bg-card border border-hd-border rounded space-y-2.5"
                    >
                      <div className="flex items-center gap-1.5 text-hd-blue-light text-[10px] font-mono font-bold border-b border-hd-border pb-1.5">
                        <Brain className="w-4 h-4 text-hd-yellow" />
                        AI TUTOR EXTENDED BREAKDOWN // LOGS
                      </div>
                      <div className="text-hd-text text-xs leading-relaxed whitespace-pre-wrap font-mono">
                        {aiExplanations[q.id]}
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => fetchAiExplanation(q.id, idx)}
                      disabled={isExplaining && explainingQuestionId === q.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-hd-blue/10 text-hd-blue-light hover:bg-hd-blue/20 font-bold font-mono text-[10px] rounded border border-hd-blue/15 transition-all cursor-pointer uppercase"
                    >
                      {isExplaining && explainingQuestionId === q.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-hd-blue-light border-t-transparent animate-spin rounded-full"></div>
                          Consulting AI Tutor...
                        </>
                      ) : (
                        <>
                          <Brain className="w-3.5 h-3.5 text-hd-yellow" />
                          Consult AI Tutor Breakdown
                          <ArrowUpRight className="w-3 h-3 text-hd-blue-light" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
