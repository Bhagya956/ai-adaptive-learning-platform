import dotenv from "dotenv";
dotenv.config();

console.log(
  "GEMINI KEY IN SERVICE:",
  process.env.GEMINI_API_KEY
);



import { GoogleGenAI } from "@google/genai";

// httpOptions.timeout is required in Node 24 so the SDK passes an AbortSignal
// to the underlying fetch call. Without it the SDK calls fetch() with no signal,
// which hits undici's internal 10 s connectTimeout before the TCP handshake
// completes — even though the endpoint is reachable. 60 s gives enough headroom
// for Gemini's generative calls while still failing fast on real outages.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: { timeout: 60000 },
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
You are a learning resource curator.

Recommend learning resources for the following skill: ${skill}

Return ONLY valid JSON with NO explanation or markdown. Use exactly this structure:

{
  "documentation": [
    { "name": "Resource name", "description": "One sentence description", "url": "https://..." }
  ],
  "youtube": [
    { "name": "Channel or video title", "description": "One sentence description", "url": "https://youtube.com/..." }
  ],
  "practicePlatforms": [
    { "name": "Platform name", "description": "One sentence description", "url": "https://..." }
  ],
  "projectIdeas": [
    { "name": "Project title", "description": "One sentence description of what to build", "url": "" }
  ],
  "courses": [
    { "name": "Course title and platform", "description": "One sentence description", "url": "https://..." }
  ]
}

Rules:
- Each array must contain 3 to 5 items.
- Every item must have "name", "description", and "url" fields.
- "url" may be an empty string only for projectIdeas where no specific URL applies.
- Do not include any text outside the JSON object.
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
      const parsed = JSON.parse(cleanedText);

      // Normalise: ensure every item in every category is an object with name/description/url.
      // If Gemini returns a plain string for any item, coerce it into the expected shape.
      const categories = [
        "documentation",
        "youtube",
        "practicePlatforms",
        "projectIdeas",
        "courses",
      ] as const;

      for (const cat of categories) {
        if (!Array.isArray(parsed[cat])) {
          parsed[cat] = [];
          continue;
        }
        parsed[cat] = parsed[cat]
          .filter(Boolean)
          .map((item: any) => {
            if (typeof item === "string") {
              // Gemini returned a plain string — wrap it so Mongoose is happy
              return { name: item, description: "", url: "" };
            }
            return {
              name: item.name ?? item.title ?? "Resource",
              description: item.description ?? "",
              url: item.url ?? item.link ?? "",
            };
          });
      }

      return parsed;
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