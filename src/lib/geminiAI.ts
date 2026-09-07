export const defaultCategories = [
  "Education",
  "Healthcare",
  "Infrastructure",
  "Environment",
  "Agriculture",
  "Water Resources",
  "Sanitation & Drainage",
  "Road & Traffic Safety",
  "Street Lighting & Power",
  "Public Safety & Police",
] as const;

export const challengeCategories = defaultCategories;
export const challengePriorities = ["High", "Medium", "Low"] as const;

export type ChallengeCategory = string;
export type ChallengePriority = (typeof challengePriorities)[number];

export type ChallengeClassification = {
  category: string;
  priority: ChallengePriority;
  suggestedTags?: string[];
};

function formatTitleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function categorizeLocally(description: string): ChallengeClassification {
  const text = description.toLowerCase();

  if (
    text.includes("water") ||
    text.includes("pipe") ||
    text.includes("leak") ||
    text.includes("drain") ||
    text.includes("sewer") ||
    text.includes("supply")
  ) {
    return { category: "Sanitation & Water Resources", priority: "High" };
  }
  if (
    text.includes("hospital") ||
    text.includes("doctor") ||
    text.includes("health") ||
    text.includes("medicine") ||
    text.includes("clinic") ||
    text.includes("disease") ||
    text.includes("medical")
  ) {
    return { category: "Healthcare & Sanitation", priority: "High" };
  }
  if (
    text.includes("school") ||
    text.includes("student") ||
    text.includes("teacher") ||
    text.includes("education") ||
    text.includes("book") ||
    text.includes("college") ||
    text.includes("class")
  ) {
    return { category: "Education & Schools", priority: "Medium" };
  }
  if (
    text.includes("farm") ||
    text.includes("crop") ||
    text.includes("fertilizer") ||
    text.includes("seed") ||
    text.includes("agriculture") ||
    text.includes("irrigation") ||
    text.includes("farmer")
  ) {
    return { category: "Agriculture & Rural Development", priority: "Medium" };
  }
  if (
    text.includes("garbage") ||
    text.includes("trash") ||
    text.includes("waste") ||
    text.includes("pollution") ||
    text.includes("tree") ||
    text.includes("plastic") ||
    text.includes("clean") ||
    text.includes("environment")
  ) {
    return { category: "Waste Management & Environment", priority: "Medium" };
  }
  if (
    text.includes("light") ||
    text.includes("lamp") ||
    text.includes("electric") ||
    text.includes("wire") ||
    text.includes("power")
  ) {
    return { category: "Street Lighting & Power", priority: "High" };
  }
  if (
    text.includes("road") ||
    text.includes("pothole") ||
    text.includes("bridge") ||
    text.includes("traffic") ||
    text.includes("footpath") ||
    text.includes("street")
  ) {
    return { category: "Roads & Public Infrastructure", priority: "High" };
  }
  if (
    text.includes("crime") ||
    text.includes("police") ||
    text.includes("safety") ||
    text.includes("theft") ||
    text.includes("cyber")
  ) {
    return { category: "Public Safety & Law", priority: "High" };
  }

  return { category: "Civic Infrastructure", priority: "High" };
}

export async function categorizeChallenge(description: string): Promise<ChallengeClassification> {
  if (!description.trim()) {
    throw new Error("A challenge description is required.");
  }

  const apiKey = import.meta.env["VITE_GEMINI_API_KEY"];
  if (!apiKey || apiKey.startsWith("AQ.Ab8RN")) {
    // Smart local AI fallback when remote API key is unavailable/placeholder
    return categorizeLocally(description);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Classify this civic report description into a category:\n\n${description}` }],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: `You are an AI civic classifier. Return ONLY a valid JSON object with exactly two fields: "category" and "priority".
The "category" MUST be a concise, professional 2-4 word civic category name suited for the report (for example: "Sanitation & Drainage", "Street Lighting", "Road Traffic & Safety", "Cybercrime & Fraud", "Public Healthcare", "Water Supply", "Waste Management", "Public Safety", etc. You can generate ANY relevant category name, do NOT restrict to a predefined list).
The "priority" MUST be one of: "High", "Medium", "Low".`,
              },
            ],
          },
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      return categorizeLocally(description);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return categorizeLocally(description);
    }

    const parsed = JSON.parse(responseText);

    const categoryName =
      typeof parsed.category === "string" && parsed.category.trim()
        ? formatTitleCase(parsed.category.trim())
        : categorizeLocally(description).category;

    const priorityVal = challengePriorities.includes(parsed.priority)
      ? parsed.priority
      : "Medium";

    return {
      category: categoryName,
      priority: priorityVal as ChallengePriority,
    };
  } catch (error) {
    return categorizeLocally(description);
  }
}

function localHinglishConverter(text: string): string {
  const dictionary: Record<string, string> = {
    गड्ढा: "pothole",
    गड्ढे: "potholes",
    सड़क: "sadak",
    रोड: "road",
    पानी: "pani",
    लीक: "leakage",
    गंदा: "ganda",
    कचरा: "kachra",
    बिजली: "bijli",
    लाइट: "light",
    समस्या: "problem",
    दुर्घटना: "accident",
    खतरा: "danger",
    अंधेरा: "andhera",
    नाला: "naala",
    नाली: "naali",
    स्कूल: "school",
    अस्पताल: "hospital",
    डॉक्टर: "doctor",
    सफाई: "safai",
  };

  let converted = text;
  Object.entries(dictionary).forEach(([hindi, hinglish]) => {
    converted = converted.replaceAll(hindi, hinglish);
  });

  return converted;
}

export async function convertToHinglish(speechText: string): Promise<string> {
  if (!speechText.trim()) return "";

  const apiKey = import.meta.env["VITE_GEMINI_API_KEY"];
  if (!apiKey || apiKey.startsWith("AQ.Ab8RN")) {
    return localHinglishConverter(speechText);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `Convert this spoken text (Hindi or English) into natural Romanized Hinglish:\n\n${speechText}` }],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: `You are an AI speech-to-Hinglish converter for JanSetu.
Convert any input spoken sentence (whether in Devanagari Hindi, English, or mixed) into natural, clear Romanized Hinglish (Hindi-English written in English script, e.g., 'Road par water leakage ki vajah se accident ka danger hai').
Return ONLY the converted Hinglish text without any markdown, quotes, or explanations.`,
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      return localHinglishConverter(speechText);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return resultText && resultText.trim()
      ? resultText.trim().replace(/^["']|["']$/g, "")
      : localHinglishConverter(speechText);
  } catch (error) {
    return localHinglishConverter(speechText);
  }
}