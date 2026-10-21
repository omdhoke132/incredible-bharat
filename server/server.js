const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      instructions:
        "You are the AI Guide for Incredible Bharat, a cultural atlas of India. " +
        "Answer questions about Indian heritage, traditions, festivals, arts, crafts, " +
        "music, cuisine, communities, literature, and cultural knowledge. " +
        "Be accurate, engaging, respectful, and easy to understand. " +
        "Do not invent historical or cultural facts. " +
        "When the question is unrelated to Indian culture, politely explain that " +
        "you are focused on helping users explore India's cultural heritage.",
      input: question.trim(),
    });

    res.json({
      success: true,
      answer: response.output_text,
    });
  } catch (error) {
    console.error("AI Guide error:", error);

    res.status(500).json({
      success: false,
      error: "The AI Guide could not process your question.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Incredible Bharat AI server running on http://localhost:${PORT}`);
});