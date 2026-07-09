import { GoogleGenAI }
from "@google/genai";

const ai = new GoogleGenAI({
  apiKey:
    process.env.GEMINI_API_KEY!,
});

export const generateQuiz =
  async (
    topic: string
  ): Promise<string> => {

    const prompt = `
Generate exactly 10 quiz questions about:

${topic}

Rules:

- Return ONLY raw JSON
- Do NOT use markdown
- Do NOT use \`\`\`
- Mix MCQ and True/False questions
- 7 MCQ questions
- 3 True/False questions

Format:

[
  {
    "question":
      "What is React?",
    "type": "mcq",
    "options": [
      "Library",
      "Database",
      "Server",
      "Language"
    ],
    "correctAnswer":
      "Library"
  },
  {
    "question":
      "React uses a Virtual DOM.",
    "type":
      "truefalse",
    "options": [
      "True",
      "False"
    ],
    "correctAnswer":
      "True"
  }
]
`;

    const response =
      await ai.models.generateContent({
        model:
          "gemini-2.5-flash",
        contents: prompt,
      });

    return (
      response.text ?? ""
    );
  };