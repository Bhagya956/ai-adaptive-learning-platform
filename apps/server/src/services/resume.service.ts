import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const analyzeResumeWithAI = async (
  resumeText: string
) => {
const prompt = `
Analyze the resume and return ONLY valid JSON.

Format:

{
  "score": number,
  "strengths": [],
  "missingSkills": [],
  "suggestions": []
}

Resume:

${resumeText}
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

  return response.text;
};