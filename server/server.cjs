const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Incredible Bharat AI Guide backend is running",
  });
});

app.post("/api/ask-guide", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a question.",
      });
    }

    console.log("Question received:", question.trim());

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: question.trim(),
      config: {
        systemInstruction:
          "You are Bharat AI, the cultural guide for Incredible Bharat. " +
          "You specialize in India's heritage, traditions, festivals, arts, crafts, " +
          "music, cuisine, communities, literature, architecture, history, and cultural knowledge. " +
          "Give accurate, respectful and educational answers. " +
          "Do not invent facts or present uncertain information as certain. " +
          "When you are unsure about a specific fact, say so clearly. " +
          "Use Markdown headings, bold text, bullets, and short paragraphs when useful. " +
          "Keep answers engaging and easy to understand for students and general visitors.",
      },
    });

    console.log("AI response received successfully.");

    res.json({
      success: true,
      answer: response.text,
    });
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("==================================");

    res.status(500).json({
      success: false,
      error: error?.message || String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Incredible Bharat AI server running on http://localhost:${PORT}`
  );
});