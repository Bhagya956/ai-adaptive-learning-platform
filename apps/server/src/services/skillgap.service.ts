import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generateSkillGapAnalysis =
  async (
    profileData: any,
    targetRole: string
  ) => {
    const prompt = `
You are a career mentor.

Current Profile:
Name: ${profileData.name}

Current Skills:
${profileData.skills.join(", ")}

Current Role:
${profileData.currentRole}

Experience:
${profileData.experience} years

Target Role:
${targetRole}

Analyze:

1. Missing skills
2. Technologies to learn
3. Learning sequence
4. Estimated timeline
5. Practical project suggestions

Provide a structured response.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    return response.text;
  };