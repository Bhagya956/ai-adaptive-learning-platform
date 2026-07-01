import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const analyzeResumeWithAI = async (
  resumeText: string
): Promise<string> => {
  const prompt = `
You are an expert ATS Resume Reviewer.

Analyze the following resume.

Return ONLY raw JSON.

Do NOT wrap JSON in markdown.
Do NOT use \`\`\`json.
Do NOT add explanations.
Return a valid JSON object only.

{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "suggestions": [],
  "recommendedRoles": []
}

Rules:

- score must be between 0 and 100
- strengths must contain positive points
- weaknesses must contain improvement areas
- missingSkills must contain important missing technologies
- suggestions must contain actionable recommendations
- recommendedRoles must contain suitable job roles

Resume:

${resumeText}
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

  return response.text ?? "";
};