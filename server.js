import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------
// CORS
// ----------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://healnet-ten.vercel.app",
];

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1); // stop server if DB fails
});


app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow Postman, server-to-server
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error(`CORS blocked for origin ${origin}`), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// ----------------------
// Middleware
// ----------------------
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ----------------------
// MongoDB
// ----------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

const TokenSchema = new mongoose.Schema({
  totalTokens: { type: Number, default: 0 },
});
const Token = mongoose.model("Token", TokenSchema);

// Ensure token document exists
async function ensureTokenDoc() {
  const existing = await Token.findOne();
  if (!existing) await Token.create({ totalTokens: 0 });
}
ensureTokenDoc();

// ----------------------
// OpenAI
// ----------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000,
});

// ----------------------
// SerpAPI optional
// ----------------------
const fetchSerpData = async (query) => {
  if (!process.env.SERP_API_KEY) return null;
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&hl=en&gl=us&api_key=${process.env.SERP_API_KEY}`;
    const resp = await axios.get(url);
    if (resp.data.organic_results) {
      return resp.data.organic_results
        .slice(0, 5)
        .map(r => `- ${r.title}: ${r.snippet}`)
        .join("\n");
    }
    return null;
  } catch (err) {
    console.error("❌ SerpAPI error:", err.message);
    return null;
  }
};

// ----------------------
// Chat endpoint
// ----------------------
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Provide a message", tokensUsed: 0 });

  try {
    // GPT-4O mini reply
    const gptReply = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    let reply = gptReply?.choices?.[0]?.message?.content || "No reply";
    let tokensUsed = gptReply?.usage?.total_tokens || 0;

    // Optional: SerpAPI fallback for live queries
    if (/I don't know|cannot provide|Sorry/i.test(reply) || /today|latest|weather|news|update/i.test(message)) {
      const serpData = await fetchSerpData(message);
      if (serpData) {
        const enhanced = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `Live search results:\n${serpData}` },
            { role: "user", content: message },
          ],
        });
        reply = enhanced?.choices?.[0]?.message?.content || serpData;
        tokensUsed += enhanced?.usage?.total_tokens || 0;
      }
    }

    // Save global token count
    const tokenDoc = await Token.findOne();
    tokenDoc.totalTokens += tokensUsed;
    await tokenDoc.save();

    res.json({ reply, tokensUsed, totalTokens: tokenDoc.totalTokens });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    res.status(500).json({ reply: "Error processing request", tokensUsed: 0 });
  }
});

// ----------------------
// Get total tokens
// ----------------------
app.get("/tokens", async (req, res) => {
  const tokenDoc = await Token.findOne();
  res.json({ totalTokens: tokenDoc?.totalTokens || 0 });
});

// ----------------------
app.listen(PORT, () => console.log(`🚀 Chatbot backend running on port ${PORT}`));

