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
  // Strip generated boilerplate before classifying so we analyze ONLY the user's core report
  let userText = description
    .toLowerCase()
    .replace(/^📌\s*issue summary:\s*/gim, "")
    .replace(/ground impact.*$/gim, "")
    .replace(/recommended action.*$/gim, "")
    .replace(/action requested.*$/gim, "")
    .trim();

  if (!userText) userText = description.toLowerCase();

  // 1. Lighting, Electricity & Power (handles Hinglish & typos like "liight", "bijli", "andhera", "light")
  if (
    userText.includes("light") ||
    userText.includes("liight") ||
    userText.includes("bijli") ||
    userText.includes("power") ||
    userText.includes("lamp") ||
    userText.includes("electric") ||
    userText.includes("wire") ||
    userText.includes("taar") ||
    userText.includes("current") ||
    userText.includes("voltage") ||
    userText.includes("transformer") ||
    userText.includes("meter") ||
    userText.includes("andhera") ||
    userText.includes("dark")
  ) {
    return { category: "Street Lighting & Power", priority: "High" };
  }

  // 2. Roads, Potholes & Infrastructure
  if (
    userText.includes("road") ||
    userText.includes("sadak") ||
    userText.includes("pothole") ||
    userText.includes("gaddha") ||
    userText.includes("gaddhe") ||
    userText.includes("bridge") ||
    userText.includes("traffic") ||
    userText.includes("footpath") ||
    userText.includes("street") ||
    userText.includes("jam")
  ) {
    return { category: "Roads & Public Infrastructure", priority: "High" };
  }

  // 3. Water Supply, Drainage & Sanitation
  if (
    userText.includes("water") ||
    userText.includes("pani") ||
    userText.includes("paani") ||
    userText.includes("pipe") ||
    userText.includes("leak") ||
    userText.includes("drain") ||
    userText.includes("naala") ||
    userText.includes("naali") ||
    userText.includes("sewer") ||
    userText.includes("supply") ||
    userText.includes("tank")
  ) {
    return { category: "Sanitation & Water Resources", priority: "High" };
  }

  // 4. Waste Management & Environment
  if (
    userText.includes("garbage") ||
    userText.includes("kachra") ||
    userText.includes("trash") ||
    userText.includes("waste") ||
    userText.includes("pollution") ||
    userText.includes("tree") ||
    userText.includes("clean") ||
    userText.includes("safai") ||
    userText.includes("environment") ||
    userText.includes("dump")
  ) {
    return { category: "Waste Management & Environment", priority: "Medium" };
  }

  // 5. Healthcare
  if (
    userText.includes("hospital") ||
    userText.includes("doctor") ||
    userText.includes("health") ||
    userText.includes("medicine") ||
    userText.includes("dawa") ||
    userText.includes("clinic") ||
    userText.includes("disease") ||
    userText.includes("medical")
  ) {
    return { category: "Healthcare & Sanitation", priority: "High" };
  }

  // 6. Education
  if (
    userText.includes("school") ||
    userText.includes("student") ||
    userText.includes("teacher") ||
    userText.includes("education") ||
    userText.includes("college") ||
    userText.includes("padhai") ||
    userText.includes("class")
  ) {
    return { category: "Education & Schools", priority: "Medium" };
  }

  // 7. Public Safety & Crime
  if (
    userText.includes("crime") ||
    userText.includes("police") ||
    userText.includes("theft") ||
    userText.includes("chori") ||
    userText.includes("cyber") ||
    userText.includes("fraud")
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
                text: `You are an expert AI civic report classifier for JanSetu in India.
Analyze the user's issue description (which may be in English, Hindi, Devanagari, or Hinglish with phonetic spellings/typos like 'liight', 'sadak', 'pani', 'bijli', 'kachra').
Classify it into a concise civic category. Examples:
- "Street Lighting & Power" (for electricity, light outage, power, wires, transformer)
- "Roads & Public Infrastructure" (for sadak, potholes, traffic, bridges)
- "Sanitation & Water Resources" (for water supply, pipeline leakage, drainage, naali)
- "Waste Management & Environment" (for kachra, garbage, trash dump, pollution)
- "Healthcare & Sanitation" (for hospital, doctor, medicine, health)
- "Education & Schools" (for school, college, student, padhai)
- "Public Safety & Law" (for crime, police, theft, fraud)

Return ONLY a valid JSON object with "category" and "priority" ("High", "Medium", "Low").`,
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

function localEnhancer(rawText: string): string {
  let clean = rawText.trim();
  if (!clean) return "";

  // Strip any pre-existing section headers & repetitive boilerplate to prevent nesting
  clean = clean
    .replace(/^📌\s*Issue Summary:\s*/gim, "")
    .replace(/^⚠️\s*Ground Impact & Urgency:\s*/gim, "")
    .replace(/^🛠️\s*Recommended Action:\s*/gim, "")
    .replace(/^Issue Summary:\s*/gim, "")
    .replace(/^Ground Impact & Safety Risk:\s*/gim, "")
    .replace(/^Ground Impact:\s*/gim, "")
    .replace(/^Action Requested:\s*/gim, "")
    .replace(/This civic issue directly affects local residents.*?(?=\n\n|\n|$)/gim, "")
    .replace(/Immediate site inspection.*?(?=\n\n|\n|$)/gim, "")
    .replace(/Urgent attention is recommended.*?(?=\n\n|\n|$)/gim, "")
    .replace(/Prompt site assessment is advised.*?(?=\n\n|\n|$)/gim, "")
    .replace(/Inspection, site clearance.*?(?=\n\n|\n|$)/gim, "")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  // Extract core statement (first line)
  const coreStatement = clean.split("\n")[0]?.trim() || clean;

  return `📌 Issue Summary:\n${coreStatement}\n\n⚠️ Ground Impact & Urgency:\nThis civic issue impacts local residents, daily commuters, and neighborhood safety. Prompt site assessment is advised.\n\n🛠️ Recommended Action:\nInspection, site clearance, and structural repair by municipal authorities or university research project leads.`;
}

export async function enhanceDescription(rawDescription: string): Promise<string> {
  if (!rawDescription.trim()) return "";

  const apiKey = import.meta.env["VITE_GEMINI_API_KEY"];
  if (!apiKey || apiKey.startsWith("AQ.Ab8RN")) {
    return localEnhancer(rawDescription);
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
              parts: [
                {
                  text: `Enhance and expand this user's rough civic issue description into a structured, professional, clear report:\n\n${rawDescription}`,
                },
              ],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: `You are an AI Civic Report Enhancer for JanSetu.
Take the user's input (which may be a short note or speech in English, Hindi, or Hinglish) and rewrite it into a clean 3-part report:
📌 Issue Summary: (what the problem is)
⚠️ Ground Impact & Urgency: (who it affects and severity)
🛠️ Recommended Action: (what local authorities should inspect and resolve)

Return ONLY the enhanced description text without markdown block quotes or explanations.`,
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      return localEnhancer(rawDescription);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return resultText && resultText.trim()
      ? resultText.trim().replace(/^["']|["']$/g, "")
      : localEnhancer(rawDescription);
  } catch (error) {
    return localEnhancer(rawDescription);
  }
}