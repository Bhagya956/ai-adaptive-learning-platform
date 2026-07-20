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

Current Skills:
${profileData.skills?.join(", ")}

Current Role:
${profileData.currentRole}

Experience:
${profileData.experience}

Target Role:
${targetRole}

Return ONLY valid JSON.

{
  "analysis":"Detailed analysis",

  "missingSkills":[
    "Skill 1",
    "Skill 2"
  ],

  "recommendations":[
    "Recommendation 1",
    "Recommendation 2"
  ]
}
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    const text =
      response.text ?? "{}";

    const cleanedText =
      text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {

      return JSON.parse(
        cleanedText
      );

    } catch (error) {

      console.error(
        "SKILL GAP JSON ERROR:",
        cleanedText
      );

      return {
        analysis:
          "Failed to generate analysis",
        missingSkills: [],
        recommendations: [],
      };
    }
};