import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const app = express();
app.use(express.json());

const PORT = 3000;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai });
});

// Endpoint 1: Generate custom Python quiz questions
app.post("/api/quiz/generate", async (req, res) => {
  try {
    const { topic = "General Basics", difficulty = "Intermediate", count = 5 } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API is not configured. Please add GEMINI_API_KEY in Settings > Secrets.",
      });
    }

    const prompt = `Generate exactly ${count} multiple-choice Python programming quiz questions about the topic "${topic}" with difficulty level "${difficulty}".
Each question must test real Python knowledge, core principles, syntax, or output prediction.
Ensure at least 3 of the questions include a specific, interesting Python code snippet in the 'code' property to be analyzed.
The options must have exactly 4 choices.
Provide a clear, detailed explanation for the correct answer.

Return ONLY a JSON array of objects conforming to the provided schema. No markdown formatting.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, highly experienced Python Developer and Computer Science Professor. You create high-quality, bug-free Python quizzes that test conceptual and practical understanding. Avoid trivia; focus on syntax, memory models, object-oriented concepts, and data structures.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of generated quiz questions",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique short alphanumeric ID" },
              question: { type: Type.STRING, description: "The quiz question text" },
              code: { type: Type.STRING, description: "Optional Python code snippet, or empty string if not applicable" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 multiple choice options"
              },
              correctIndex: { type: Type.INTEGER, description: "The 0-based index of the correct option (0 to 3)" },
              explanation: { type: Type.STRING, description: "Detailed explanation of why the correct option is right and the others are wrong" },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctIndex", "explanation", "topic", "difficulty"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const questions = JSON.parse(jsonText.trim());
    res.json({ success: true, questions });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz questions" });
  }
});

// Endpoint 2: Get a detailed AI explanation for a specific question/answer combination
app.post("/api/quiz/explain", async (req, res) => {
  try {
    const { question, code, selectedOption, correctOption, options } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API is not configured. Please add GEMINI_API_KEY in Settings > Secrets.",
      });
    }

    const prompt = `Explain the following Python quiz question details to a student:
Question: ${question}
${code ? `Python Code:\n\`\`\`python\n${code}\n\`\`\`` : ""}
Choices:
0. ${options[0]}
1. ${options[1]}
2. ${options[2]}
3. ${options[3]}

The student selected Option: "${selectedOption}" (index: ${options.indexOf(selectedOption)})
The correct answer is Option: "${correctOption}" (index: ${options.indexOf(correctOption)})

Please provide:
1. A clear verdict confirming if they were correct or incorrect.
2. A step-by-step breakdown of how the Python interpreter executes this code.
3. Practical tips or best practices related to this concept.
Keep it encouraging, highly educational, and clean (using markdown format).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a warm, extremely clear, and engaging Python Tutor. You explain Python concepts beautifully using simple language but technical precision."
      }
    });

    res.json({ success: true, explanation: response.text });
  } catch (error: any) {
    console.error("Error explaining answer:", error);
    res.status(500).json({ error: error.message || "Failed to generate explanation" });
  }
});

// Endpoint 3: Real-Time AI Python Sandbox Executor
app.post("/api/sandbox/run", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || code.trim() === "") {
      return res.json({ output: "", error: "Code cannot be empty." });
    }

    if (!ai) {
      // Local fallback simulator if API key is not present
      const outputLines: string[] = [];
      try {
        // Very basic mock simulation for printing and math
        const lines = code.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("print(") && trimmed.endsWith(")")) {
            const inner = trimmed.substring(6, trimmed.length - 1);
            // Handle quotes or simple math
            if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
              outputLines.push(inner.substring(1, inner.length - 1));
            } else {
              // Try evaluating basic math or variable lookups
              try {
                // simple math
                const evalResult = new Function(`return ${inner}`)();
                outputLines.push(String(evalResult));
              } catch {
                outputLines.push(`[Simulated Print: ${inner}]`);
              }
            }
          }
        }
        return res.json({
          output: outputLines.join("\n") || "Code executed successfully (no output produced).",
          error: null,
          explanation: "Local Fallback Simulator: To get full dynamic AI execution support, configure the GEMINI_API_KEY in Secrets."
        });
      } catch (err: any) {
        return res.json({ output: "", error: err.message, explanation: "Fallback Simulator Error" });
      }
    }

    const prompt = `Simulate the execution of the following Python code snippet as a standard Python 3 interpreter would.
Evaluate variables, control structures (loops, conditionals), function calls, objects, or standard libraries.
Python Code to execute:
\`\`\`python
${code}
\`\`\`

You must return a JSON object containing:
1. 'output' (string): The exact standard output (stdout) that would be printed.
2. 'error' (string or null): Any SyntaxError, NameError, TypeError, IndexError, etc., if the code has a bug, or null if it compiles and runs fine.
3. 'explanation' (string): A short, friendly explanation of what this code did under the hood.

Only return this JSON object. No other text or markdown tags.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a perfect Python 3 Interpreter simulation. You analyze Python code and accurately report its stdout output and any runtime or compilation errors. You also explain the execution mechanics.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            output: { type: Type.STRING, description: "The simulated standard output (stdout) of the code" },
            error: { type: Type.STRING, description: "Simulated error message if any, otherwise null or empty string" },
            explanation: { type: Type.STRING, description: "Line-by-line explanation of the simulated runtime execution" }
          },
          required: ["output", "explanation"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error executing code sandbox:", error);
    res.status(500).json({ error: error.message || "Failed to execute code in sandbox" });
  }
});

// Setup Vite Dev Server / Static files handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
