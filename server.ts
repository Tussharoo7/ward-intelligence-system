import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Ensure secrets are loaded if local env file exists
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Prominent wards lists and helper data to inject into AI Context
const LATEST_WARD_INFO = [
  { id: 1, name: "Gandhi Nagar / Airport Road", population: 28400, candidates: "Suresh Sharma (BJP: 48%), Pooja Trivedi (INC: 42%), Sanjay Yadav (IND: 10%)", issues: "Water pressure drops, Airport Connector potholes" },
  { id: 4, name: "Nanda Nagar", population: 31200, candidates: "Preeti Patel (BJP: 52%), Anil Verma (INC: 38%), Sharda Shrivastava (AAP: 10%)", issues: "Trash pickup irregular, Street lights broken" },
  { id: 10, name: "Vijay Nagar", population: 42000, candidates: "Ramesh Trivedi (BJP: 46%), Sunita Verma (INC: 44%), Kamlesh Mandloi (AAP: 10%)", issues: "Bhawarkua market traffic light sync, parking gridlocks" },
  { id: 18, name: "LIG Colony Area", population: 24500, candidates: "Kiran Joshi (BJP: 41%), Preeti Choudhary (INC: 45%), Rekha Rathore (IND: 14%)", issues: "Youth park security issues, sewer cleanup delays" },
  { id: 25, name: "Khajrana Chowk Area", population: 45600, candidates: "Sanjay Mishra (BJP: 39%), Preeti Yadav (INC: 51%), Preeti Patel (AAP: 10%)", issues: "High traffic jams near Khajrana square, water pipeline installation delay" },
  { id: 32, name: "Palasia / Saket", population: 19800, candidates: "Sunita Trivedi (BJP: 53%), Manoj Pandey (INC: 37%), Vijay Shrivastava (IND: 10%)", issues: "Monsoon street flooding, CCTV camera coverage gaps" },
  { id: 45, name: "Rajwada / Sarafa Market", population: 18200, candidates: "Preeti Mandloi (BJP: 47%), Preeti Patel (INC: 45%), Manoj Trivedi (AAP: 8%)", issues: "Old heritage building safety, tourist pedestrian pathways" },
  { id: 54, name: "Annapurna Mandir Area", population: 33500, candidates: "Alka Rathore (BJP: 52%), Sanjay Trivedi (INC: 40%), Preeti Choudhary (IND: 8%)", issues: "Temple entry traffic congestion, water contamination in Sector B" },
  { id: 62, name: "Bhawarkua / University Rd", population: 39100, candidates: "Sharda Verma (BJP: 43%), Sanjay Patel (INC: 46%), PREETI Shrivastava (AAP: 11%)", issues: "Bhawarkua traffic light sync, student hostel streetlights" },
  { id: 75, name: "Manik Bagh Road", population: 27900, candidates: "Asha Trivedi (BJP: 41%), preeti Sharma (INC: 47%), Vijay Pandey (AAP: 12%)", issues: "Waste bins overflowing around local parks" },
  { id: 85, name: "Bicholi Hapsi Suburbs", population: 21400, candidates: "Suresh Mandloi (BJP: 50%), Sanjay Joshi (INC: 41%), preeti Rathore (IND: 9%)", issues: "Monsoon swamp water stagnation, street dogs safety" }
];

// Initialize Gemini client lazily to avoid startup crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

// AI Dialogue endpoint
app.post("/api/chat", async (req, res) => {
  const { message, lang = "en", wardId = 10 } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Find info about the currently selected ward
  const selectedWardInfo = LATEST_WARD_INFO.find(w => w.id === Number(wardId)) || LATEST_WARD_INFO[2]; // Default Vijay Nagar (10)

  // Construct context
  const wardContextText = `
WARD DATA INCONTEXT (Indore, Madhya Pradesh System):
- Current Selected Ward Number: ${selectedWardInfo.id}
- Ward Name: ${selectedWardInfo.name}
- Total Population under boundary: ${selectedWardInfo.population}
- Candidates support currently: ${selectedWardInfo.candidates}
- Active critical issues reported: ${selectedWardInfo.issues}
- City Scale total Wards: 85 Wards
`;

  const systemInstruction = `
You are WardBot, a professional senior political analytics assistant representing Indore ward-level politics (Madhya Pradesh). 
You work on Indore Wards (1-85). 

Rules:
1. Answer ONLY ward-related questions, public issues, candidate support sharing, and local development policies.
2. Detect the user's language from their message (it could be English, Hindi in Devanagari script, or Hinglish written in Roman English script like "Kaun aage hai", "Ward 10 ka kya haal hai").
3. ALWAYS reply in the SAME language as the query (English for English, Hindi for Hindi, Hinglish for Hinglish).
4. Be concise, highly professional, objective, and provide data-driven insights. No emojis or empty talk.
5. Emphasize that civic data points (support %, street lights status, cleanliness updates, upvotes) are generated securely from verified local feedback.

Context Snapshot for Selected Ward:
${wardContextText}
`;

  try {
    const ai = getAiClient();
    
    // If API key is missing, return a simulated response in the appropriate language
    if (!ai) {
      console.log("GEMINI_API_KEY is not configured yet. Returning simulated high-fidelity response.");
      
      const m = message.toLowerCase();
      let responseText = "";

      if (lang === "hi" || m.includes("है") || m.includes("कौन")) {
        responseText = `[सिम्यूलेटेड जवाब - कृपया Settings > Secrets में GEMINI_API_KEY डालें] \n\n**इंदौर वार्ड ${selectedWardInfo.id} (${selectedWardInfo.name}) की जानकारी:**\n\n1. **समर्थन रुझान**: यहां अभी प्रमुख रूप से ${selectedWardInfo.candidates} की दावेदारी मजबूत है।\n2. **मुख्य जन शिकायतें**: ${selectedWardInfo.issues} जैसी गंभीर समस्याएं नागरिक फ़ीडबैक से दर्ज की गई हैं। \n\nक्या आप इस वार्ड की समस्याओं का पूरा रिपोर्ट कार्ड देखना चाहते हैं?;`;
      } else if (lang === "hng" || m.includes("kya") || m.includes("kaun") || m.includes("aage")) {
        responseText = `[Simulated response - Please configure GEMINI_API_KEY in Secrets] \n\n**Indore Ward ${selectedWardInfo.id} (${selectedWardInfo.name}) ka update:**\n\n1. **Kaun Aage Hai**: Support data me abhi ${selectedWardInfo.candidates} ka rating solid chal raha hai.\n2. **Khaas Dikkat**: Local voter feedback ke mutabik "${selectedWardInfo.issues}" sabse badi dikkat hai.\n\nAap is ward ka dynamic PDF report download karke saare statistics dekh sakte hain!`;
      } else {
        responseText = `[Simulated Response - Configuration info: Please provide GEMINI_API_KEY under Settings > Secrets] \n\n**Indore Ward ${selectedWardInfo.id} (${selectedWardInfo.name}) Intelligence Snapshot:**\n\n- **Candidate Support**: Current standing shows ${selectedWardInfo.candidates}.\n- **Top Local Issues**: High severity grievances include: ${selectedWardInfo.issues}.\n- **Population Influence**: Serves ${selectedWardInfo.population} residents.\n\nYou can input a complaint in the Feedback box to see how the system registers verified voters.`;
      }

      return res.json({ text: responseText, simulated: true });
    }

    // Direct API call
    const completion = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.6
      }
    });

    const reply = completion.text || "I apologize, I could not generate a response. Please check your query.";
    res.json({ text: reply, simulated: false });

  } catch (err: any) {
    console.error("Gemini API Error details:", err);
    res.status(500).json({ 
      error: "Error contacting Gemini AI engine.", 
      details: err.message,
      simulated: true,
      text: `[Gemini Error - Falling back to local assistant] Currently encountering query limits. Ward ${selectedWardInfo.id} is trending with ${selectedWardInfo.candidates}. Key issues are: ${selectedWardInfo.issues}.`
    });
  }
});

// Serve Vite dev server or static distribution build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ward Analytics Pro Server listining on http://0.0.0.0:${PORT}`);
  });
}

startServer();
