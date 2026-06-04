import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generateInterviewPrep =
  async (
    profileData: any,
    targetRole: string
  ) => {
    const prompt = `
You are an expert technical interviewer.

Candidate Profile:

Current Role:
${profileData.currentRole}

Skills:
${profileData.skills.join(", ")}

Experience:
${profileData.experience} years

Target Role:
${targetRole}

Generate:

1. Top Technical Interview Questions
2. Top Behavioral Questions
3. Important Topics to Study
4. Interview Preparation Plan
5. Common Mistakes to Avoid

Return a clean structured markdown response.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    return response.text;
  };