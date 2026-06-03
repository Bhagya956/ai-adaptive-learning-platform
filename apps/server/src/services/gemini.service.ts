import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

console.log(
  "Gemini Key:",
  process.env.GEMINI_API_KEY
);
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const generateRoadmap = async (
  profileData: any
) => {
  const prompt = `
Generate a detailed learning roadmap.

Current Role:
${profileData.currentRole}

Experience:
${profileData.experience} years

Skills:
${profileData.skills?.join(", ")}

Interested Domains:
${profileData.interestedDomains?.join(", ")}

Career Goal:
${profileData.careerGoal}

Education:
${profileData.education}

Provide:
1. Learning phases
2. Skills to learn
3. Recommended order
4. Estimated timeline
`;

  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

  return response.text;

};