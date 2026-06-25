import React, { useState, useEffect, useRef } from "react";
import { Clock, Terminal, AlertCircle, ArrowRight, HelpCircle, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Question } from "../types";

interface QuizStageProps {
  topicName: string;
  questions: Question[];
  onFinishQuiz: (selectedAnswers: { [key: number]: number }, timeSpent: { [key: number]: number }) => void;
  onOpenSandbox: (code: string) => void;
}

const SECONDS_PER_QUESTION = 30;

export default function QuizStage({ topicName, questions, onFinishQuiz, onOpenSandbox }: QuizStageProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeSpent, setTimeSpent] = useState<{ [key: number]: number }>({});
  
  // Realtime countdown timer
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIdx];
  const hasSelected = selectedAnswers[currentIdx] !== undefined;

  // Clear and reset timer on question index change
  useEffect(() => {
    setTimeLeft(SECONDS_PER_QUESTION);
    setIsTimeUp(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimeUp(true);
          // Auto select -1 (incorrect) if they didn't select in time
          setSelectedAnswers((prevSelected) => {
            if (prevSelected[currentIdx] === undefined) {
              return { ...prevSelected, [currentIdx]: -1 };
            }
            return prevSelected;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIdx]);

  // Track total time spent per question
  useEffect(() => {
    const trackingInterval = setInterval(() => {
      if (!hasSelected && !isTimeUp) {
        setTimeSpent((prev) => ({
          ...prev,
          [currentIdx]: (prev[currentIdx] || 0) + 1
        }));
      }
    }, 1000);

    return () => clearInterval(trackingInterval);
  }, [currentIdx, hasSelected, isTimeUp]);

  const handleSelectOption = (optionIndex: number) => {
    if (hasSelected || isTimeUp) return;
    
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      onFinishQuiz(selectedAnswers, timeSpent);
    }
  };

  const progressPercent = ((currentIdx + 1) / questions.length) * 100;

  // Timer colors & pulse trigger
  const isTimeUrgent = timeLeft <= 8;

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row border border-hd-border bg-hd-bg-panel rounded overflow-hidden shadow-2xl">
      {/* Main Question & Coding Arena */}
      <section className="flex-1 flex flex-col bg-hd-bg-panel min-h-[500px]">
        {/* Module Header */}
        <div className="p-6 border-b border-hd-border bg-hd-bg-card">
          <div className="flex justify-between items-center mb-2 font-mono text-xs">
            <span className="text-hd-muted uppercase tracking-widest italic">{topicName}</span>
            <span className="text-hd-blue-light font-bold">
              {String(currentIdx + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')} CHALLENGE
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-hd-text">
            {currentQuestion.question}
          </h1>
        </div>

        {/* Global Progress Bar line */}
        <div className="w-full h-1 bg-hd-bg-main">
          <div 
            className="h-full bg-hd-blue transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 flex flex-col gap-6 justify-between">
          
          {/* Code display block */}
          {currentQuestion.code ? (
            <div className="bg-hd-bg-code border border-hd-border rounded overflow-hidden">
              <div className="bg-hd-bg-card px-4 py-2 border-b border-[#30363D] flex justify-between items-center text-xs font-mono text-hd-muted">
                <span>main.py</span>
                <button
                  onClick={() => onOpenSandbox(currentQuestion.code || "")}
                  className="flex items-center gap-1.5 hover:text-hd-text transition-colors py-0.5 px-2 bg-hd-bg-main rounded border border-hd-border text-hd-blue-light font-bold"
                >
                  <Terminal className="w-3 h-3 text-hd-yellow" />
                  Run in Playground
                </button>
              </div>
              <pre className="p-4 md:p-6 font-mono text-sm leading-relaxed text-hd-purple overflow-x-auto whitespace-pre">
                <code>{currentQuestion.code}</code>
              </pre>
            </div>
          ) : (
            <div className="p-4 bg-hd-bg-main/30 border border-hd-border rounded font-mono text-xs text-hd-muted">
              # Conceptual challenge session. Standard execution sequence applies.
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIdx] === idx;
              const isCorrectOpt = idx === currentQuestion.correctIndex;
              const isWrongAndSelected = isSelected && !isCorrectOpt;

              let cardStyle = "border-hd-border bg-hd-bg-panel hover:border-hd-muted";
              let labelStyle = "border-hd-border text-hd-muted bg-hd-bg-main";

              if (hasSelected) {
                if (isCorrectOpt) {
                  // Correct Choice Style (Green)
                  cardStyle = "border-hd-green bg-hd-bg-card shadow-[0_0_12px_rgba(35,134,54,0.15)]";
                  labelStyle = "border-hd-green text-hd-green bg-hd-bg-main";
                } else if (isWrongAndSelected) {
                  // Wrong choice Style (Red)
                  cardStyle = "border-hd-red bg-hd-bg-card";
                  labelStyle = "border-hd-red text-hd-red bg-hd-bg-main";
                } else {
                  // Muted Style
                  cardStyle = "border-hd-border bg-hd-bg-panel opacity-40 cursor-not-allowed";
                  labelStyle = "border-hd-border text-hd-muted bg-hd-bg-main";
                }
              } else if (isTimeUp) {
                cardStyle = "border-hd-border bg-hd-bg-panel opacity-40 cursor-not-allowed";
              }

              return (
                <div
                  key={idx}
                  onClick={() => !hasSelected && !isTimeUp && handleSelectOption(idx)}
                  className={`border p-4 rounded flex items-center cursor-pointer transition-all relative group ${cardStyle}`}
                >
                  <div className={`w-8 h-8 rounded border flex items-center justify-center font-mono mr-4 text-sm font-bold shrink-0 transition-all ${labelStyle}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-mono text-xs sm:text-sm text-hd-text break-words pr-4">{option}</span>

                  {/* Pulsing indicator or static indicators */}
                  {hasSelected && isCorrectOpt && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-hd-green animate-pulse"></div>
                    </div>
                  )}
                  {hasSelected && isWrongAndSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-hd-red"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time's up indicator */}
          {isTimeUp && !hasSelected && (
            <div className="p-3 bg-hd-red/10 border border-hd-red/20 rounded font-mono text-xs text-hd-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>[TIMEOUT] No input detected. Correct answer highlighted. Continue to next stage.</span>
            </div>
          )}

          {/* Submit/Next button container */}
          <div className="pt-4 border-t border-hd-border flex justify-end">
            <button
              disabled={!hasSelected && !isTimeUp}
              onClick={handleNext}
              className="bg-hd-green hover:bg-hd-green-hover text-white font-mono font-bold text-xs uppercase px-8 py-2.5 rounded transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2"
            >
              <span>{currentIdx === questions.length - 1 ? "Lock Session" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Right Sidebar Status/Metrics Column */}
      <aside className="w-full lg:w-80 flex flex-col bg-hd-bg-main border-t lg:border-t-0 lg:border-l border-hd-border">
        {/* Countdown Timer Widget */}
        <div className="p-6 border-b border-hd-border">
          <div className="flex flex-col items-center">
            <span className="text-hd-muted text-[10px] uppercase font-mono font-bold tracking-[0.2em] mb-1">Time Remaining</span>
            <span className={`text-5xl font-mono font-bold tracking-tighter tabular-nums ${isTimeUrgent ? "text-hd-red animate-pulse" : "text-hd-yellow"}`}>
              00:{String(timeLeft).padStart(2, '0')}
            </span>
            <div className="w-full h-1 bg-hd-bg-card mt-4 rounded-full overflow-hidden border border-hd-border">
              <div 
                className={`h-full transition-all duration-1000 ${isTimeUrgent ? "bg-hd-red" : "bg-hd-blue"}`}
                style={{ width: `${(timeLeft / SECONDS_PER_QUESTION) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Dynamic Context Explanation */}
        <div className="flex-1 p-6 flex flex-col justify-between gap-4 font-mono">
          <div className="space-y-4">
            <div className="p-3 bg-hd-bg-panel border border-hd-border rounded">
              <div className="text-[10px] uppercase text-hd-muted mb-1 font-bold">Compiler Target</div>
              <div className="text-xs text-hd-blue-light font-bold">python-3.12.3-amd64</div>
            </div>

            <div className="p-3 bg-hd-bg-panel border border-hd-border rounded">
              <div className="text-[10px] uppercase text-hd-muted mb-1 font-bold">Difficulty Factor</div>
              <div className="text-xs text-hd-text font-bold">{currentQuestion.difficulty}</div>
            </div>

            <AnimatePresence>
              {hasSelected && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-hd-bg-card border border-hd-border rounded space-y-1.5"
                >
                  <span className="text-[9px] font-bold text-hd-yellow uppercase tracking-wider block">Execution Breakdown</span>
                  <p className="text-[11px] text-hd-text leading-relaxed font-sans font-medium">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-3 bg-hd-bg-panel border border-hd-border rounded text-[10px] text-hd-muted">
            <div className="flex items-center gap-1.5 justify-between">
              <span>SANDBOX STATUS:</span>
              <span className="text-hd-green font-bold">STANDBY</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
