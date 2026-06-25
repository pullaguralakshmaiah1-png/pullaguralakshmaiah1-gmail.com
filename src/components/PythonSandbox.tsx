import React, { useState } from "react";
import { Play, Terminal, HelpCircle, RefreshCw, Code2, AlertTriangle, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

interface PythonSandboxProps {
  initialCode?: string;
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    name: "List Comprehension",
    code: `# List comprehension with dynamic filtering
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squares_of_evens = [x**2 for x in numbers if x % 2 == 0]
print("Evens squared:", squares_of_evens)
`
  },
  {
    name: "Recursive Fibonacci",
    code: `# Classic recursive Fibonacci with step logging
def fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(6):
    print(f"Fib({i}) = {fibonacci(i)}")
`
  },
  {
    name: "OOP Inheritance",
    code: `# Custom classes with methods and inheritance
class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "Generic sound"

class Dog(Animal):
    def speak(self):
        return "Woof! Woof!"

my_dog = Dog("Buddy")
print(f"{my_dog.name} says: {my_dog.speak()}")
`
  },
  {
    name: "Mutable Argument Gotcha",
    code: `# Educational demonstration of default arguments
def append_to_list(val, my_list=[]):
    my_list.append(val)
    return my_list

print("Call 1:", append_to_list("A"))
print("Call 2:", append_to_list("B"))
print("Call 3:", append_to_list("C"))
`
  }
];

export default function PythonSandbox({ initialCode = "", isOpen, onClose }: PythonSandboxProps) {
  const [code, setCode] = useState(initialCode || TEMPLATES[0].code);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput("");
    setError(null);
    setExplanation("");

    try {
      const response = await fetch("/api/sandbox/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      }
      setOutput(data.output || "");
      setExplanation(data.explanation || "");
    } catch (err: any) {
      setError(err.message || "Failed to communicate with execution sandbox.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = (tplCode: string) => {
    setCode(tplCode);
    setOutput("");
    setError(null);
    setExplanation("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="w-full max-w-3xl h-[92vh] bg-hd-bg-panel border border-hd-border rounded shadow-2xl flex flex-col overflow-hidden text-hd-text"
      >
        {/* Sandbox Header */}
        <div className="bg-hd-bg-card border-b border-hd-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-hd-blue/10 rounded text-hd-blue-light">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="font-mono">
              <h3 className="font-bold text-sm sm:text-base text-hd-text">VIRTUAL_PLAYGROUND // COMPILE</h3>
              <p className="text-[10px] text-hd-muted">Execute and analyze custom scripts with real-time AI memory traces</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-hd-border rounded text-hd-muted hover:text-hd-text transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sandbox Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left panel: Code input & templates */}
          <div className="flex-1 flex flex-col border-r border-hd-border p-4 overflow-y-auto">
            <div className="mb-3 font-mono">
              <label className="text-[10px] font-bold text-hd-muted uppercase tracking-wider block mb-1.5">
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleApplyTemplate(tpl.code)}
                    className="text-[10px] bg-hd-bg-card hover:bg-hd-border text-hd-text px-2 py-1 rounded border border-hd-border transition-colors flex items-center gap-1 font-bold"
                  >
                    <Code2 className="w-3.5 h-3.5 text-hd-blue-light" />
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[250px] font-mono">
              <div className="flex items-center justify-between bg-hd-bg-card border-t border-x border-hd-border px-4 py-1.5 rounded-t">
                <span className="text-[10px] text-hd-muted font-bold">main.py</span>
                <span className="text-[10px] text-hd-yellow font-bold">python-3.12</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-hd-bg-code text-hd-text p-4 font-mono text-xs border border-hd-border rounded-b focus:outline-none focus:ring-1 focus:ring-hd-blue resize-none leading-relaxed"
                placeholder="# Write your Python code here..."
                spellCheck="false"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 font-mono">
              <button
                onClick={() => handleApplyTemplate("")}
                className="text-xs hover:bg-hd-border text-hd-muted hover:text-hd-text px-3 py-1.5 rounded border border-transparent hover:border-hd-border transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear Board
              </button>
              <button
                onClick={handleRunCode}
                disabled={isLoading}
                className="bg-hd-green hover:bg-hd-green-hover text-white font-bold text-xs uppercase px-5 py-2.5 rounded transition-all shadow flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                    Run Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right panel: Output terminal & explanation */}
          <div className="flex-1 bg-hd-bg-panel p-4 flex flex-col overflow-y-auto border-t md:border-t-0 md:border-l border-hd-border">
            {/* Output terminal */}
            <div className="flex-1 flex flex-col min-h-[180px] mb-4">
              <h4 className="text-[10px] font-mono font-bold text-hd-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-hd-green" />
                Standard Output (stdout)
              </h4>
              <div className="flex-1 bg-hd-bg-code border border-hd-border rounded p-4 font-mono text-xs overflow-y-auto leading-relaxed relative min-h-[120px]">
                {isLoading && (
                  <div className="absolute inset-0 bg-hd-bg-code/80 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-hd-muted font-mono text-[11px]">
                      <div className="h-4 w-4 border-2 border-hd-yellow border-t-transparent animate-spin rounded-full"></div>
                      <span>Analyzing memory allocations...</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="text-hd-red mb-2 p-2 bg-hd-red/10 border border-hd-red/20 rounded flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold block uppercase text-[9px]">Traceback Error:</span>
                      <pre className="whitespace-pre-wrap">{error}</pre>
                    </div>
                  </div>
                )}
                {output ? (
                  <pre className="text-hd-green font-bold whitespace-pre-wrap">{output}</pre>
                ) : (
                  !error && !isLoading && <span className="text-hd-muted italic font-mono text-[11px]">No stdout produced. Run code to see prints here.</span>
                )}
              </div>
            </div>

            {/* AI tutor breakdown */}
            <div className="flex-1 flex flex-col">
              <h4 className="text-[10px] font-mono font-bold text-hd-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-hd-yellow" />
                AI Tutor Analysis Traces
              </h4>
              <div className="flex-1 bg-hd-bg-card border border-hd-border rounded p-4 text-xs text-hd-text overflow-y-auto leading-relaxed min-h-[120px]">
                {isLoading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 bg-hd-border rounded w-3/4"></div>
                    <div className="h-3 bg-hd-border rounded w-5/6"></div>
                    <div className="h-3 bg-hd-border rounded w-1/2"></div>
                  </div>
                ) : explanation ? (
                  <div className="space-y-2 font-mono text-xs text-hd-text whitespace-pre-wrap">
                    {explanation}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-hd-muted font-mono">
                    <HelpCircle className="w-6 h-6 mb-1.5 opacity-35 text-hd-yellow" />
                    <p className="max-w-xs text-[11px]">Run a script above, and the AI Tutor will dissect step-by-step memory mutations!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
