// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- Env checks ---
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in .env");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}
if (!process.env.SERP_API_KEY) {
  console.warn("⚠️ Missing SERP_API_KEY, live queries may fail");
}

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// --- MongoDB Setup ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

const TokenSchema = new mongoose.Schema({
  totalTokens: { type: Number, default: 0 }
});
const Token = mongoose.model("Token", TokenSchema);

// --- Helper: Add tokens ---
async function addTokens(tokensUsed) {
  let tokenDoc = await Token.findOne();
  if (!tokenDoc) {
    tokenDoc = new Token({ totalTokens: tokensUsed });
  } else {
    tokenDoc.totalTokens += tokensUsed;
  }
  await tokenDoc.save();
  return tokenDoc.totalTokens;
}

// --- OpenAI Client ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000
});

// --- SerpAPI Helper ---
const fetchSerpData = async (query) => {
  if (!process.env.SERP_API_KEY) return null;
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
      query
    )}&hl=en&gl=us&api_key=${process.env.SERP_API_KEY}`;
    const resp = await axios.get(url);
    if (resp.data.organic_results) {
      return resp.data.organic_results
        .slice(0, 5)
        .map((r) => `- ${r.title}: ${r.snippet}`)
        .join("\n");
    }
    return null;
  } catch (err) {
    console.error("❌ SerpAPI Error:", err.message);
    return null;
  }
};

// --- Chat Endpoint ---
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message)
    return res
      .status(400)
      .json({ reply: "Provide a message", tokensUsed: 0, totalTokens: 0 });

  try {
    const gptReply = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }]
    });

    let reply = gptReply?.choices?.[0]?.message?.content || "No reply";
    let tokensUsed = gptReply?.usage?.total_tokens || 0;

    // If query needs live info
    if (
      /I don't know|cannot provide|Sorry/i.test(reply) ||
      /today|latest|weather|news|update/i.test(message)
    ) {
      const serpData = await fetchSerpData(message);
      if (serpData) {
        const enhancedReply = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `Live search results:\n${serpData}` },
            { role: "user", content: message }
          ]
        });
        reply = enhancedReply?.choices?.[0]?.message?.content || serpData;
        tokensUsed += enhancedReply?.usage?.total_tokens || 0;
      }
    }

    // Update DB with new tokens
    const totalTokens = await addTokens(tokensUsed);

    res.json({ reply, tokensUsed, totalTokens });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    res
      .status(500)
      .json({ reply: "Error processing request", tokensUsed: 0, totalTokens: 0 });
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Chatbot running on http://localhost:${PORT}`)
);
