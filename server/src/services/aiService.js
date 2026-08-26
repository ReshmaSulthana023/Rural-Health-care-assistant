const { GoogleGenAI } = require("@google/genai");
const { symptomRules } = require("../data/symptomRules");

console.log(
  "Gemini API key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const getRuleBasedResult = (symptoms, severity) => {
  const matchedConditions = symptomRules
    .filter((rule) => rule.symptoms.every((symptom) => symptoms.includes(symptom)))
    .flatMap((rule) => rule.possibleConditions);

  const possibleConditions = [...new Set(matchedConditions)];
  const urgency = severity === "Severe"
    ? "High"
    : severity === "Moderate"
      ? "Moderate"
      : "Low";

  return {
    possibleConditions: possibleConditions.length
      ? possibleConditions
      : ["A general health condition"],
    urgency,
    recommendation: severity === "Severe"
      ? "Please consult a qualified healthcare professional promptly."
      : "Monitor your symptoms and consult a qualified healthcare professional if they continue or worsen.",
  };
};

const analyzeSymptoms = async (symptoms, duration, severity) => {
  if (!process.env.GEMINI_API_KEY) {
    return getRuleBasedResult(symptoms, severity);
  }

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
      model: "gemini-2.5-flash",
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

    const allowedUrgencies = ["Low", "Moderate", "High", "Emergency"];

    if (!allowedUrgencies.includes(result.urgency)) {
      return getRuleBasedResult(symptoms, severity);
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

    console.warn("Gemini unavailable; using local symptom rules.");
    return getRuleBasedResult(symptoms, severity);
  }
};

module.exports = {
  analyzeSymptoms,
};