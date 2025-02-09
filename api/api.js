require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());
app.use(cors());

// OpenAI Setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// API route for AI analysis
app.post('/api/ask', async (req, res) => {
    const { prompt, fen } = req.body;
    if (!prompt || !fen) {
        return res.status(400).json({ error: "Missing prompt or FEN." });
    }

    console.log(`📩 Received request -> Prompt: "${prompt}" | FEN: "${fen}"`);

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a chess AI assistant." },
                { role: "user", content: `Current Board State (FEN): ${fen}\nUser Question: ${prompt}` }
            ]
        });

        const aiResponse = response.choices?.[0]?.message?.content?.trim() || "I'm not sure how to respond.";

        console.log(`🤖 AI Response: "${aiResponse}"`);
        res.json({ response: aiResponse });

    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        res.status(500).json({ error: "Error processing request." });
    }
});

// Export for Vercel serverless function
module.exports = app;
