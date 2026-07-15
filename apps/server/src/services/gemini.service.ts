import dotenv from "dotenv";
dotenv.config();

console.log(
  "GEMINI KEY IN SERVICE:",
  process.env.GEMINI_API_KEY
);



import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});


export const generateRoadmap = async (
  profileData: any
): Promise<string> => {
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

  return response.text ?? "";
};


export const generateProjectRecommendations =
  async (
    profileData: any,
    skillGapAnalysis: string
  ): Promise<any[]> => {

    const prompt = `
You are an expert software mentor.

Career Goal:
${profileData.careerGoal}

Current Role:
${profileData.currentRole}

Experience:
${profileData.experience}

Current Skills:
${profileData.skills?.join(", ")}

Interested Domains:
${profileData.interestedDomains?.join(", ")}

Skill Gap Analysis:
${skillGapAnalysis}

Recommend 5 software projects.

Return ONLY valid JSON.

Format:

[
  {
    "title":"Project Name",
    "description":"Project Description",
    "skills":["Skill1","Skill2"],
    "difficulty":"Beginner"
  }
]
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

  const text =
  response.text ?? "[]";

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
    "PROJECT JSON ERROR:",
    cleanedText
  );

  return [];
}
};


export const analyzePortfolioWithAI =
  async (
    githubData: any
  ): Promise<any> => {

    const prompt = `
You are a software engineering mentor.

Analyze this GitHub portfolio.

Total Repositories:
${githubData.totalRepos}

Languages Used:
${githubData.languages.join(", ")}

Return ONLY valid JSON.

{
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "analysis": ""
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
        "PORTFOLIO JSON ERROR:",
        cleanedText
      );

      return {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        analysis:
          "Unable to analyze portfolio",
      };
    }
  };

  export const generateMockInterviewQuestions =
  async (
    role: string
  ): Promise<string[]> => {

    const prompt = `
You are an expert technical interviewer.

Generate 10 interview questions for:

${role}

Return ONLY valid JSON.

[
  "Question 1",
  "Question 2",
  "Question 3"
]
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

    const text =
      response.text ?? "[]";

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
        "INTERVIEW QUESTIONS JSON ERROR:",
        cleanedText
      );

      return [];
    }
  };


  export const evaluateMockInterview =
  async (
    role: string,
    questions: string[],
    answers: string[]
  ): Promise<any> => {

    const prompt = `
You are an expert technical interviewer.

Role:
${role}

Questions:
${JSON.stringify(
  questions
)}

Answers:
${JSON.stringify(
  answers
)}

Evaluate the candidate.

Return ONLY valid JSON.

{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "feedback": []
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
        "INTERVIEW EVALUATION JSON ERROR:",
        cleanedText
      );

      return {
        score: 0,
        strengths: [],
        weaknesses: [],
        feedback: [],
      };
    }
  };


  export const generateLearningResources =
  async (
    skill: string
  ): Promise<any> => {

    const prompt = `
Recommend learning resources for:

Skill:
${skill}

Return ONLY valid JSON.

{
  "documentation": [],
  "youtube": [],
  "practicePlatforms": [],
  "projectIdeas": [],
  "courses": []
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
        "RESOURCE JSON ERROR:",
        cleanedText
      );

      return {
        documentation: [],
        youtube: [],
        practicePlatforms: [],
        projectIdeas: [],
        courses: [],
      };
    }
  };