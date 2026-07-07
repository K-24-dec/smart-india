import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini API Client safely
const apiKey = process.env.GEMINI_API_KEY;
const isApiConfigured = !!apiKey && apiKey !== "MY_GEMINI_API_KEY";

const ai = new GoogleGenAI({
  apiKey: isApiConfigured ? apiKey : "mock-api-key-for-compilation",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON Local Database File path
const DB_PATH = path.join(process.cwd(), "db.json");

// Default high-fidelity mock database state
const defaultDb = {
  profile: {
    name: "Karthik Kondapalli",
    age: 34,
    gender: "Male",
    state: "Karnataka",
    district: "Bengaluru Urban",
    income: 420000,
    occupation: "Private Employee / Freelancer",
    isFarmer: false,
    isStudent: false,
    isSeniorCitizen: false,
    hasDisability: false,
    education: "Graduate",
    familySize: 3,
    monthlySavingsGoal: 5000
  },
  complaints: [
    {
      id: "C-9081",
      title: "Malfunctioning Streetlights",
      category: "Street Lights",
      description: "Streetlights are completely off for the last 12 days on 17th Main Road, Sector 4, HSR Layout, making it highly unsafe for pedestrians and residents at night.",
      location: "17th Main Road, HSR Layout, Sector 4, Bengaluru, Karnataka 560102",
      status: "In Progress",
      department: "BESCOM (Bangalore Electricity Supply Company)",
      createdAt: "2026-07-02T10:15:00.000Z",
      predictedResolution: "3 Days Remaining",
      upvotes: 42,
      timeline: [
        { status: "Complaint Registered", date: "Jul 02, 2026", description: "Successfully registered and allocated Complaint ID C-9081.", active: false },
        { status: "Assigned to Department", date: "Jul 03, 2026", description: "Forwarded to HSR Layout Sub-division Electrical Engineer, BESCOM.", active: false },
        { status: "Investigation In Progress", date: "Jul 05, 2026", description: "Field officers dispatched to inspect underground cables and faulty bulbs.", active: true },
        { status: "Resolution & Testing", date: "Pending", description: "Replacing non-functional LED panels and certifying safety.", active: false }
      ]
    },
    {
      id: "C-9082",
      title: "Severe Road Caving and Potholes",
      category: "Road Damage",
      description: "Huge, waterlogged potholes near the Silk Board Flyover entry. They are causing massive bumper-to-bumper traffic and severe hazard to two-wheeler riders.",
      location: "Silk Board Junction Outer Ring Road Entry, Bengaluru, Karnataka 560068",
      status: "Submitted",
      department: "BBMP (Bruhat Bengaluru Mahanagara Palike - Road Infrastructure)",
      createdAt: "2026-07-06T08:30:00.000Z",
      predictedResolution: "5 Days",
      upvotes: 118,
      timeline: [
        { status: "Complaint Registered", date: "Jul 06, 2026", description: "Successfully lodged with BBMP Sahaya Portal.", active: true },
        { status: "Assigned to Department", date: "Pending", description: "Awaiting approval from Assistant Executive Engineer (AEE).", active: false },
        { status: "Work Order Issued", date: "Pending", description: "Scheduling contractor for patching/paving works.", active: false },
        { status: "Resolved", date: "Pending", description: "Filling pothole and compacting aggregate.", active: false }
      ]
    }
  ],
  forms: [
    {
      id: "form-passport",
      title: "Re-issue of Indian Passport",
      description: "Online form helper for standard passport renewal / re-issue application.",
      department: "Ministry of External Affairs (CPV Division)",
      status: "Draft",
      lastUpdated: "2026-07-05T14:20:00.000Z",
      fields: [
        { name: "applicantName", label: "Applicant's Given Name", type: "text", value: "Karthik Kondapalli", suggestedValue: "Karthik Kondapalli", explanation: "As written exactly in your matriculation or current passport.", required: true },
        { name: "dateOfBirth", label: "Date of Birth", type: "date", value: "1992-04-12", suggestedValue: "1992-04-12", required: true },
        { name: "placeOfBirth", label: "Place of Birth (City/Village)", type: "text", value: "Bengaluru", suggestedValue: "Bengaluru", required: true },
        { name: "passportOffice", label: "Passport Office Location", type: "select", value: "Bengaluru (PO)", suggestedValue: "Bengaluru (PO)", options: ["Bengaluru (PO)", "Delhi (PO)", "Mumbai (PO)", "Chennai (PO)"], required: true },
        { name: "employmentType", label: "Employment Type", type: "select", value: "Private Sector", suggestedValue: "Private Sector", options: ["Government", "Private Sector", "Self-Employed", "Retired", "Student"], required: true },
        { name: "nonEcr", label: "Eligible for Non-ECR Category?", type: "select", value: "Yes", suggestedValue: "Yes", options: ["Yes", "No"], explanation: "Yes is selected since you have a Graduate degree (10th standard or higher).", required: true }
      ]
    },
    {
      id: "form-ayushman",
      title: "Ayushman Bharat PM-JAY Registration",
      description: "Apply for the PM-JAY Cashless Health Insurance cover of up to ₹5 Lakhs.",
      department: "National Health Authority",
      status: "Draft",
      lastUpdated: "2026-07-06T11:05:00.000Z",
      fields: [
        { name: "fullName", label: "Full Name (Aadhaar Registered)", type: "text", value: "Karthik Kondapalli", suggestedValue: "Karthik Kondapalli", required: true },
        { name: "aadhaarNumber", label: "Aadhaar Card Number", type: "text", value: "5423 **** ****", suggestedValue: "", explanation: "12-digit UID for verification. Never stored in raw logs.", required: true },
        { name: "annualIncome", label: "Annual Household Income (INR)", type: "number", value: "420000", suggestedValue: "420000", required: true },
        { name: "rationCardNumber", label: "Ration Card (NFSA Code) / ID", type: "text", value: "", required: false },
        { name: "category", label: "SECC Household Category", type: "select", value: "Non-Beneficiary SECC", suggestedValue: "Non-Beneficiary SECC", options: ["Rural/Deprived Household", "Urban Occupational Scheme", "NFSA Ration Card Holder", "Non-Beneficiary SECC"], explanation: "Based on ₹4.2L income and urban private employment, you fall outside direct SECC deprivation brackets.", required: true }
      ]
    }
  ]
};

// Database utility helper with in-memory caching to support read-only environments like Vercel
let memoryDb: any = null;

function getDb() {
  if (memoryDb) {
    return memoryDb;
  }
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      memoryDb = JSON.parse(data);
      return memoryDb;
    }
  } catch (e) {
    console.error("Failed to read db.json, returning default mock db:", e);
  }
  // If not exist or fails, write default and return
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write initial db.json:", e);
  }
  memoryDb = JSON.parse(JSON.stringify(defaultDb));
  return memoryDb;
}

function saveDb(data: any) {
  memoryDb = data;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save db.json:", e);
  }
}

// REST API Endpoints

// 1. Health & Config Status Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: isApiConfigured,
    currentTime: new Date().toISOString(),
  });
});

// 2. Fetch User Profile
app.get("/api/profile", (req, res) => {
  const db = getDb();
  res.json(db.profile);
});

// 3. Update User Profile
app.post("/api/profile", (req, res) => {
  const db = getDb();
  db.profile = { ...db.profile, ...req.body };
  saveDb(db);
  res.json({ success: true, profile: db.profile });
});

// 4. Fetch Complaints
app.get("/api/complaints", (req, res) => {
  const db = getDb();
  res.json(db.complaints);
});

// 5. Add / Lodge a Complaint
app.post("/api/complaints", (req, res) => {
  const db = getDb();
  const newComplaint = {
    id: `C-${Math.floor(1000 + Math.random() * 9000)}`,
    title: req.body.title || "Civic Complaint",
    category: req.body.category || "General Municipal",
    description: req.body.description || "",
    location: req.body.location || "Bengaluru, Karnataka",
    status: "Submitted",
    department: req.body.department || "Municipal Corporation",
    createdAt: new Date().toISOString(),
    predictedResolution: req.body.predictedResolution || "5 Days",
    upvotes: 1,
    imageUrl: req.body.imageUrl || "",
    timeline: [
      { status: "Complaint Registered", date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }), description: "Successfully registered via Smart Bharat App.", active: true },
      { status: "Assigned to Department", date: "Pending", description: `Forwarded to regional department officer.`, active: false },
      { status: "Investigation", date: "Pending", description: "Technical ground check scheduled.", active: false },
      { status: "Resolved", date: "Pending", description: "Resolution certified by site engineer.", active: false }
    ]
  };
  db.complaints.unshift(newComplaint);
  saveDb(db);
  res.json({ success: true, complaint: newComplaint });
});

// Upvote a complaint
app.post("/api/complaints/:id/upvote", (req, res) => {
  const db = getDb();
  const complaint = db.complaints.find((c: any) => c.id === req.params.id);
  if (complaint) {
    complaint.upvotes = (complaint.upvotes || 0) + 1;
    saveDb(db);
    res.json({ success: true, upvotes: complaint.upvotes });
  } else {
    res.status(404).json({ error: "Complaint not found" });
  }
});

// 6. Fetch Government Forms
app.get("/api/forms", (req, res) => {
  const db = getDb();
  res.json(db.forms);
});

// Save Government Form draft
app.post("/api/forms/:id", (req, res) => {
  const db = getDb();
  const formIndex = db.forms.findIndex((f: any) => f.id === req.params.id);
  if (formIndex !== -1) {
    db.forms[formIndex] = {
      ...db.forms[formIndex],
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    saveDb(db);
    res.json({ success: true, form: db.forms[formIndex] });
  } else {
    res.status(404).json({ error: "Form not found" });
  }
});

// Create custom form or submit
app.post("/api/forms/:id/submit", (req, res) => {
  const db = getDb();
  const form = db.forms.find((f: any) => f.id === req.params.id);
  if (form) {
    form.status = "Submitted";
    form.lastUpdated = new Date().toISOString();
    saveDb(db);
    res.json({ success: true, form });
  } else {
    res.status(404).json({ error: "Form not found" });
  }
});


// -----------------------------------------------------------------------------
// ADVANCED GEMINI INTELLIGENT AI ENDPOINTS
// -----------------------------------------------------------------------------

// Global Gemini Fallback Check to guarantee smooth experience in offline modes / missing key
const generateContentMockOrReal = async (options: {
  model: string;
  contents: any;
  config?: any;
  mockResponse: string;
}) => {
  if (!isApiConfigured) {
    console.log("Gemini API not configured. Serving high-fidelity simulated response.");
    // Simulate real delay to make the UX feel premium and immersive
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { text: options.mockResponse };
  }

  try {
    const res = await ai.models.generateContent({
      model: options.model,
      contents: options.contents,
      config: options.config,
    });
    return res;
  } catch (error) {
    console.error("Gemini API Error, falling back to mock:", error);
    return { text: options.mockResponse };
  }
};


// 1. AI Civic Companion Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history, language, profile } = req.body;
  const currentLang = language || "English";

  const userContext = profile ? 
    `You are speaking to ${profile.name || "a citizen"}, ${profile.age || "34"} years old, living in ${profile.district || "Bengaluru Urban"}, ${profile.state || "Karnataka"}. Their annual income is ₹${profile.income || "4.2 Lakhs"}, occupation is ${profile.occupation || "Private Employee"}. Farmer: ${profile.isFarmer ? "Yes" : "No"}, Student: ${profile.isStudent ? "Yes" : "No"}.`
    : "You are speaking to an Indian citizen.";

  const systemInstruction = `
    You are 'Bharat Civic AI', the intelligent voice and companion operating system for Indian citizens, built by Google researchers and civic-tech experts.
    Your mission is to guide citizens, simplify complex bureaucracy, recommend beneficial welfare schemes, clarify documents, and solve civic problems with outstanding empathy, expertise, and clarity.
    
    CRITICAL INSTRUCTIONS:
    1. Respond in the language requested: "${currentLang}". If they converse in other Indian dialects (like Hinglish, Hindi, Telugu, Tamil, etc.), adapt seamlessly.
    2. Incorporate user-specific context: "${userContext}" where relevant. For example, if they ask about education, refer to their student/grad status. If they ask about local benefits, refer to ${profile?.state || "their state"}.
    3. Be extremely helpful, action-oriented, and reliable. Avoid bureaucratic jargon; translate legal/government terms into simple, relatable analogies.
    4. Provide clear sequential bullets or step-by-step guidance rather than blocks of text.
    5. Always remain objective, completely neutral, and non-partisan. Your goal is purely public welfare, safety, and empowerment.
  `;

  // Format history for Gemini API Chat or standard prompt
  const contents = [];
  if (history && history.length > 0) {
    for (const h of history) {
      contents.push({
        role: h.role,
        parts: [{ text: h.content || h.message || "" }]
      });
    }
  }
  contents.push({ role: "user", parts: [{ text: message }] });

  const mockResponse = `Namaste! Based on your profile living in ${profile?.district || "Bengaluru Urban"}, ${profile?.state || "Karnataka"}, you have access to various local welfare programs and municipal portals. 

Since you asked about municipal support:
1. **BBMP Sahaya**: For civic complaints like potholes, streetlights, or waste management, you can log them directly in our "Complaint Management" tab. BBMP usually resolves minor streetlight issues in 3 days.
2. **Citizen Services**: Since you reside in Karnataka, you can access over 800+ services via the **Seva Sindhu** portal (sevasindhu.karnataka.gov.in) using your Aadhaar.

What specific government department or scheme would you like to explore today? I am here to translate any document, guide you through application steps, or auto-fill forms.`;

  try {
    const result = await generateContentMockOrReal({
      model: "gemini-3.5-flash",
      contents,
      config: { systemInstruction },
      mockResponse
    });

    res.json({ text: result.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// 2. Smart Scheme Recommendation Engine
app.post("/api/schemes/recommend", async (req, res) => {
  const { profile, categoryFilter } = req.body;
  const p = profile || getDb().profile;

  const prompt = `
    Analyze the following Indian citizen profile and recommend exactly 3 to 5 real, active Indian government schemes (Central or State-specific to their residence state) that they are highly eligible for.
    
    CITIZEN PROFILE:
    - Name: ${p.name}
    - Age: ${p.age}
    - Gender: ${p.gender}
    - State of Residence: ${p.state}
    - District: ${p.district}
    - Annual Family Income (INR): ₹${p.income}
    - Occupation: ${p.occupation}
    - Is a Farmer: ${p.isFarmer ? "Yes" : "No"}
    - Is a Student: ${p.isStudent ? "Yes" : "No"}
    - Is a Senior Citizen: ${p.isSeniorCitizen ? "Yes" : "No"}
    - Has a Disability: ${p.hasDisability ? "Yes" : "No"}
    - Education Qualification: ${p.education}
    - Family Size: ${p.familySize}

    Return a strict, valid JSON array containing objects matching this schema (do NOT return any other markdown formatting or text besides the valid JSON):
    [{
      "id": "unique-scheme-slug",
      "name": "Official Full Scheme Name (e.g., PM Jan Arogya Yojana)",
      "ministry": "Responsible Ministry/Department name",
      "category": "One of: Agriculture, Health, Social Security, Education, Finance, Women Care",
      "description": "Brief description of what the scheme is.",
      "eligibilityPercentage": 95, // integer percentage representing match quality based on demographic checks
      "estimatedBenefits": "A realistic estimation of the financial or material aid they would receive (e.g. ₹5,00,000 Free Cashless Health Cover / ₹6,000 annually)",
      "whyEligible": "A personalized 2-sentence explanation of WHY they specifically qualify based on their age, income (₹${p.income}), state (${p.state}), or occupation.",
      "steps": [
        "Step 1: Go to the official website...",
        "Step 2: Authenticate using Aadhaar OTP...",
        "Step 3: Upload your Income certificate and submit."
      ]
    }]
  `;

  const mockResponse = JSON.stringify([
    {
      id: "ayushman-bharat",
      name: "Ayushman Bharat PM-JAY",
      ministry: "Ministry of Health and Family Welfare",
      category: "Health",
      description: "Provides free health insurance cover of up to ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.",
      eligibilityPercentage: 85,
      estimatedBenefits: "₹5,00,000 Cashless Health Cover",
      whyEligible: `Based on your household size of ${p.familySize} and annual income of ₹${p.income}, you qualify for targeted health security covers in ${p.state} designed for low-to-middle income groups.`,
      steps: [
        "Step 1: Visit the nearest PM-JAY Empaneled Hospital or Common Service Centre (CSC).",
        "Step 2: Carry your Aadhaar Card, Ration Card, and Family Income Certificate.",
        "Step 3: Ask the 'Ayushman Mitra' to check your name in the beneficiary list.",
        "Step 4: Complete your e-KYC and receive your golden Ayushman Card instantly."
      ]
    },
    {
      id: "atal-pension",
      name: "Atal Pension Yojana (APY)",
      ministry: "Ministry of Finance",
      category: "Social Security",
      description: "A government-backed pension scheme focused on the unorganized sector, ensuring a stable monthly pension after retirement.",
      eligibilityPercentage: 95,
      estimatedBenefits: "₹1,000 to ₹5,000 Monthly Pension post age 60",
      whyEligible: `As an eligible unorganized/private freelancer of age ${p.age} (within the 18-40 range), this is the optimal government co-contributory retirement planning scheme for you.`,
      steps: [
        "Step 1: Visit your local bank branch where you hold a savings account.",
        "Step 2: Fill out the Atal Pension Yojana registration form.",
        "Step 3: Provide your Aadhaar card and active mobile number.",
        "Step 4: Authorize auto-debit of subscription premium (approx ₹150-₹400/month based on your entry age)."
      ]
    },
    {
      id: "pm-mudra",
      name: "Pradhan Mantri Mudra Yojana (PMMY)",
      ministry: "Ministry of Finance",
      category: "Finance",
      description: "Provides collateral-free micro-business loans up to ₹10 Lakhs in three categories: Shishu (up to ₹50,000), Kishor (up to ₹5 Lakhs), and Tarun (up to ₹10 Lakhs).",
      eligibilityPercentage: 90,
      estimatedBenefits: "Up to ₹10 Lakhs Collateral-Free Business Loan",
      whyEligible: `As a freelancer / private sector developer of age ${p.age} in urban ${p.district}, you qualify for the Kishor or Tarun category to finance business setup, equipment, or service expansion.`,
      steps: [
        "Step 1: Prepare a basic business proposal or work portfolio outline.",
        "Step 2: Visit any public sector bank or apply online on the Udyam Mitra portal.",
        "Step 3: Submit identity proof, address proof, passport photos, and your business details.",
        "Step 4: The bank evaluates your application and disburses the collateral-free loan within 10 days."
      ]
    }
  ]);

  try {
    const result = await generateContentMockOrReal({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              ministry: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              eligibilityPercentage: { type: Type.INTEGER },
              estimatedBenefits: { type: Type.STRING },
              whyEligible: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "name", "ministry", "category", "description", "eligibilityPercentage", "estimatedBenefits", "whyEligible", "steps"]
          }
        }
      },
      mockResponse
    });

    const parsed = JSON.parse(result.text || "[]");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// 3. Government Document Explainer
app.post("/api/document/explain", async (req, res) => {
  const { textContent, imageBytes, mimeType, language } = req.body;
  const currentLang = language || "English";

  let contents: any[] = [];
  let userText = `Please analyze, simplify, and explain this official Indian government document or notification. Explain it in plain, simple, highly readable language in "${currentLang}".`;

  if (imageBytes && mimeType) {
    contents.push({
      inlineData: {
        data: imageBytes,
        mimeType: mimeType
      }
    });
    userText += " Please use OCR to extract text from the attached document image first.";
  } else {
    contents.push({ text: `Document text to analyze:\n\n${textContent || "No text provided. Please explain standard Aadhaar enrollment terms."}` });
  }

  const prompt = `${userText}
    Simplify all complex, dense, and legal terms. Give practical bullet points.
    
    You MUST output a strict JSON object matching the following schema. Return ONLY valid JSON (no extra markdown formatting outside the JSON block):
    {
      "title": "Document Name / Title",
      "summary": "High-level summary of the document (1-2 sentences).",
      "simplifiedExplanation": "Detailed, friendly, paragraph-by-paragraph plain-language translation of the main contents.",
      "translation": "If requested language is not English, translate the simplified explanation here.",
      "keyDates": [
        { "date": "Date / Deadline", "event": "Description of the event/deadline" }
      ],
      "faqs": [
        { "question": "Practical Question a citizen would ask", "answer": "Clear, precise answer" }
      ],
      "legalTerms": [
        { "term": "Bureaucratic / Legal Term", "simpleDefinition": "Plain-language translation of what it actually means" }
      ]
    }
  `;

  const mockResponse = JSON.stringify({
    title: "Income & Asset Certificate Notification (EWS Section)",
    summary: "Official government guidelines outlining standard eligibility and certification criteria for reservation benefits under the Economically Weaker Sections (EWS).",
    simplifiedExplanation: "This document states that citizens seeking EWS certification must meet strict income and property limits. If your annual household income is under ₹8 Lakhs and you do not own major agricultural lands or large residential flats, you are eligible to receive a 10% educational and employment reservation. The certificate must be issued by a local Tehsildar or Revenue Officer and is valid for exactly one financial year.",
    translation: currentLang !== "English" ? `यह दस्तावेज़ बताता है कि आर्थिक रूप से कमजोर वर्ग (EWS) के तहत लाभ प्राप्त करने के लिए आपके परिवार की वार्षिक आय ₹8 लाख से कम होनी चाहिए और आपके पास कृषि भूमि या बड़े फ्लैट नहीं होने चाहिए।` : undefined,
    keyDates: [
      { date: "March 31, Annually", event: "Expiry of current financial year certificate. Renewal required for next session." },
      { date: "April 15", event: "Typical start date for submitting applications for the fresh fiscal cycle." }
    ],
    faqs: [
      { question: "Who counts as 'family' for calculating annual income?", answer: "Family includes the applicant, their parents, siblings under 18, and their spouse and children under 18." },
      { question: "Which local official is authorized to sign this certificate?", answer: "District Magistrate, Deputy Commissioner, Tehsildar, or Sub-Divisional Officer (SDO)." }
    ],
    legalTerms: [
      { term: "Gross Annual Income", simpleDefinition: "Your total income before taxes, including salary, agriculture, business, and pension from all family members." },
      { term: "Empaneled Authority", simpleDefinition: "The specific government officers who are legally allowed to sign and issue this certificate." }
    ]
  });

  try {
    const result = await generateContentMockOrReal({
      model: "gemini-3.5-flash",
      contents: [...contents, { text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            simplifiedExplanation: { type: Type.STRING },
            translation: { type: Type.STRING },
            keyDates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  event: { type: Type.STRING }
                }
              }
            },
            faqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              }
            },
            legalTerms: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  simpleDefinition: { type: Type.STRING }
                }
              }
            }
          },
          required: ["title", "summary", "simplifiedExplanation", "keyDates", "faqs", "legalTerms"]
        }
      },
      mockResponse
    });

    const parsed = JSON.parse(result.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// 4. AI Form Filling Assistant
app.post("/api/forms/fill", async (req, res) => {
  const { formName, fields, profile } = req.body;
  const p = profile || getDb().profile;

  const prompt = `
    You are an expert Indian Government Form-Filling Assistant. 
    Review the form "${formName}" and the citizen's profile:
    - Name: ${p.name}
    - Age: ${p.age}
    - Gender: ${p.gender}
    - State: ${p.state}
    - District: ${p.district}
    - Income: ₹${p.income}
    - Occupation: ${p.occupation}
    - Farmer: ${p.isFarmer}
    - Student: ${p.isStudent}
    - Graduate: ${p.education === "Graduate" || p.education === "Post-Graduate"}
    
    Form fields that require assistance:
    ${JSON.stringify(fields)}

    For each field in the form, recommend the best suggestedValue based on their profile, write a friendly 1-sentence "explanation" of what the field means or why you filled it this way, and check if their current value has any obvious "error" (e.g. spelling, empty required field, invalid formats, or logical mismatches like having ECR passport status while holding a graduate degree).

    Return a strict, valid JSON object matching the following schema. Return ONLY valid JSON (no markdown block outside):
    {
      "fields": [
        {
          "name": "field_name_matching_input",
          "suggestedValue": "recommended value to fill in",
          "explanation": "Why this value is filled / What it means in plain language.",
          "error": "Any correction warning, or null if perfectly correct."
        }
      ]
    }
  `;

  const mockResponse = JSON.stringify({
    fields: fields.map((f: any) => {
      let suggested = f.value || "";
      let explanation = `Standard verification field for ${f.label}.`;
      let error = null;

      if (f.name === "applicantName" || f.name === "fullName") {
        suggested = p.name;
        explanation = "Pre-filled from your verified identity profile.";
      } else if (f.name === "dateOfBirth") {
        suggested = "1992-04-12";
        explanation = "Extracted from your profile metadata.";
      } else if (f.name === "annualIncome") {
        suggested = String(p.income);
        explanation = "Pre-filled based on your annual taxation brackets.";
      } else if (f.name === "nonEcr") {
        suggested = "Yes";
        explanation = "Selected 'Yes' because you marked your education level as 'Graduate'. High education applicants are exempted from emigration checks.";
      } else if (f.name === "aadhaarNumber" && !f.value) {
        error = "Required field. Please enter your secure 12-digit Aadhaar Card Number.";
      }

      return {
        name: f.name,
        suggestedValue: suggested,
        explanation,
        error
      };
    })
  });

  try {
    const result = await generateContentMockOrReal({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  suggestedValue: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  error: { type: Type.STRING, nullable: true }
                }
              }
            }
          },
          required: ["fields"]
        }
      },
      mockResponse
    });

    const parsed = JSON.parse(result.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// 5. Complaint Management Analyzer
app.post("/api/complaints/analyze", async (req, res) => {
  const { text, imageBytes, mimeType, location } = req.body;

  let contents: any[] = [];
  let userText = `Analyze this citizen complaint: "${text || "Potholes blocking the road"}".`;

  if (imageBytes && mimeType) {
    contents.push({
      inlineData: {
        data: imageBytes,
        mimeType: mimeType
      }
    });
    userText += " Inspect the attached photo to identify the exact hazard and severeness.";
  }

  const prompt = `${userText}
    Classify this complaint into a standard municipal category: 'Road Damage', 'Garbage / Waste', 'Street Lights', 'Water Connection', 'Electricity', 'Traffic Control', 'Public Safety', or 'Corruption'.
    Assign the responsible Indian administrative department (e.g., PWD, Municipal Corporation, Electricity Board, Traffic Police).
    Write a highly formal, precise 1-sentence "complaintSummary" to submit to officials.
    Predict the standard SLA-mandated resolution time (e.g., "3 Days", "5 Days", "7 Days") and a 4-step municipal workflow timeline based on active Indian citizen charters.
    
    Return a strict, valid JSON object matching the following schema. Return ONLY valid JSON (no markdown formatting outside):
    {
      "category": "Street Lights",
      "department": "BESCOM (Electricity Board)",
      "complaintSummary": "Lodged official complaint regarding malfunctioning high-mast streetlights...",
      "predictedResolution": "3 Days",
      "timeline": [
        { "status": "Complaint Lodged", "date": "Today", "description": "Successfully dispatched to regional engineer...", "active": true },
        { "status": "Field Inspection", "date": "Tomorrow", "description": "Crew scheduled to inspect physical grid and lines...", "active": false },
        { "status": "Contractor Allocation", "date": "In 2 Days", "description": "Procuring replacements for broken light sensors and bulbs...", "active": false },
        { "status": "Resolved", "date": "In 3 Days", "description": "Bulbs replaced, safety certificate uploaded.", "active": false }
      ]
    }
  `;

  const mockResponse = JSON.stringify({
    category: text?.toLowerCase().includes("light") ? "Street Lights" : "Road Damage",
    department: text?.toLowerCase().includes("light") ? "BESCOM (Bangalore Electricity Supply Company)" : "BBMP (Bruhat Bengaluru Mahanagara Palike)",
    complaintSummary: `Official complaint registered regarding: ${text || "Severe infrastructural hazard impacting traffic flow."}`,
    predictedResolution: text?.toLowerCase().includes("light") ? "3 Days" : "5 Days",
    timeline: [
      { status: "Complaint Lodged", date: "Jul 06, 2026", description: "Successfully registered in municipal docket. SMS alert dispatched to citizen.", active: true },
      { status: "Officer Assigned", date: "Jul 07, 2026", description: "Assigned to Ward Assistant Engineer for inspection.", active: false },
      { status: "Contractor Allocation", date: "Jul 09, 2026", description: "Procuring materials and assigning field repair crew.", active: false },
      { status: "Resolved", date: "Jul 11, 2026", description: "Repairs executed on site. Post-repair photo uploaded.", active: false }
    ]
  });

  try {
    const result = await generateContentMockOrReal({
      model: "gemini-3.5-flash",
      contents: [...contents, { text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            department: { type: Type.STRING },
            complaintSummary: { type: Type.STRING },
            predictedResolution: { type: Type.STRING },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING },
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  active: { type: Type.BOOLEAN }
                }
              }
            }
          },
          required: ["category", "department", "complaintSummary", "predictedResolution", "timeline"]
        }
      },
      mockResponse
    });

    const parsed = JSON.parse(result.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// 6. AI Policy Explainer
app.post("/api/policy/explain", async (req, res) => {
  const { policyName, query, language } = req.body;
  const currentLang = language || "English";

  const prompt = `
    Analyze and explain the Indian public policy: "${policyName}" in extremely clear, simple, human language. Respond in "${currentLang}".
    If a specific query is provided, focus heavily on answering it: "${query || "What are the core pillars and direct impacts on families?"}"
    
    You MUST deliver a strict JSON object matching the following schema. Return ONLY valid JSON (no markdown code block outside):
    {
      "title": "Short Policy Title (e.g., NEP 2020 / DPDP Act)",
      "simplifiedText": "A simplified, friendly 2-paragraph overview explaining what the policy actually does and why it was introduced.",
      "pros": [
        "Pro 1: Simplifies tax structure...",
        "Pro 2: Promotes ease of business..."
      ],
      "cons": [
        "Con 1: High initial transition burden...",
        "Con 2: Concerns regarding digital compliance..."
      ],
      "whoBenefits": [
        "Benefit Group 1 (e.g., Young students under 18)",
        "Benefit Group 2 (e.g., Local micro-entrepreneurs)"
      ],
      "latestUpdates": [
        "Update 1: Rollout starts across 15 states in August 2026...",
        "Update 2: Ministry releases revised FAQ draft for digital complaints."
      ],
      "relatedSchemes": [
        "Related Scheme Name 1",
        "Related Scheme Name 2"
      ]
    }
  `;

  const mockResponse = JSON.stringify({
    title: policyName || "Digital Personal Data Protection (DPDP) Act",
    simplifiedText: "The DPDP Act is India's landmark privacy law that regulates how companies, banks, and government portals collect and use your personal information. It forces digital services to obtain clear, explicit consent in multiple Indian languages before accessing your Aadhaar, location, or contacts, giving citizens the absolute right to view, correct, or delete their digital footprints.",
    pros: [
      "Explicit Consent: Apps can no longer track your location or share your details without your permission.",
      "Right to Erasure: You can request any tech firm or service to wipe your private files from their servers.",
      "Massive Penalties: Violating organizations face heavy fines up to ₹250 Crores, preventing spam and data leaks."
    ],
    cons: [
      "Compliance Costs: Small local startups face heavy technical loads adapting to security guidelines.",
      "Government Exemptions: State agencies retain broad national security exemptions to access data in critical events."
    ],
    whoBenefits: [
      "Every Indian smartphone user: Completely shielded from unsolicited telemarketing spam.",
      "Families & Children: Added safety measures forbidding companies from tracking kids' search habits."
    ],
    latestUpdates: [
      "Rules Notification: Executive guidelines and grievance appellate bodies slated for deployment in July 2026.",
      "Consent Manager Framework: Trials for secure middleware consent apps begun by MeitY."
    ],
    relatedSchemes: [
      "Digital India Mission",
      "Pradhan Mantri Gramin Digital Saksharta Abhiyan (PMGDISHA)"
    ]
  });

  try {
    const result = await generateContentMockOrReal({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            simplifiedText: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            whoBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            latestUpdates: { type: Type.ARRAY, items: { type: Type.STRING } },
            relatedSchemes: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "simplifiedText", "pros", "cons", "whoBenefits", "latestUpdates", "relatedSchemes"]
        }
      },
      mockResponse
    });

    const parsed = JSON.parse(result.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Start Express app with Vite Middleware
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
    console.log(`Smart Bharat Server running on http://localhost:${PORT}`);
  });
}

// Only start the standalone listener if not running as a Vercel serverless function
if (!process.env.VERCEL) {
  startServer();
}

export default app;
