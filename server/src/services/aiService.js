const { GoogleGenAI } = require("@google/genai");

console.log(
  "Gemini API key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const analyzeSymptoms = async (symptoms, duration, severity) => {
  try {
    const prompt = `
You are a healthcare symptom screening assistant.

The user has reported:

Symptoms: ${symptoms.join(", ")}
Duration: ${duration}
Severity: ${severity}

Analyze these symptoms for basic health screening.

Return ONLY a valid JSON object with exactly these fields:

{
  "possibleConditions": ["condition 1", "condition 2"],
  "urgency": "Low",
  "recommendation": "A clear recommendation for the user"
}

Urgency must be exactly one of:

Low
Moderate
High
Emergency

Important:
- Do not provide a definite medical diagnosis.
- Give possible conditions only.
- If the symptoms could indicate an emergency, set urgency to Emergency.
- Recommend professional medical care when appropriate.
- Keep the recommendation understandable for a general user.
- Return only JSON.
- Do not use Markdown.
- Do not put the JSON inside code fences.
`;

    console.log("Sending request to Gemini...");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    console.log("Gemini response received!");

    const text = response.text;

    console.log("Gemini response text:");
    console.log(text);

    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    const result = JSON.parse(text);

    console.log("Parsed Gemini result:");
    console.log(result);

    // Basic validation of AI response
    if (
      !Array.isArray(result.possibleConditions) ||
      !result.urgency ||
      !result.recommendation
    ) {
      throw new Error("Invalid response format from Gemini");
    }

    return result;

  } catch (error) {

    console.log("\n");
    console.log("========================================");
    console.log("          REAL GEMINI ERROR");
    console.log("========================================");

    console.log("Error message:");
    console.log(error.message);

    console.log("\nError name:");
    console.log(error.name);

    console.log("\nError status:");
    console.log(error.status);

    console.log("\nError code:");
    console.log(error.code);

    console.log("\nFull error:");
    console.log(error);

    console.log("========================================");
    console.log("\n");

    // Keep the real error visible while debugging
    throw error;
  }
};

module.exports = {
  analyzeSymptoms,
};