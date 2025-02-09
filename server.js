require('dotenv').config({ path: './.env' });

console.log("✅ OpenAI API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "Not Found");

const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// OpenAI Setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Endpoint for processing user queries with TTS
app.post('/ask', async (req, res) => {
    const { prompt, fen } = req.body;

    if (!prompt || !fen) {
        return res.status(400).json({ error: "Missing prompt or board state (FEN)." });
    }

    console.log(`📩 Received request -> Prompt: "${prompt}" | FEN: "${fen}"`);

    try {
        // Generate AI chess response
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a chess AI assistant. Analyze the board in FEN notation and provide a technical yet concise answer (max 4 sentences, no Markdown, no repetition)." },
                { role: "user", content: `Current Board State (FEN): ${fen}\nUser Question: ${prompt}` }
            ]
        });

        const aiResponse = response.choices?.[0]?.message?.content?.trim() || "I'm not sure how to respond to that.";
        console.log(`🤖 AI Response: "${aiResponse}"`);

        // Generate speech for AI response
        const ttsResponse = await openai.audio.speech.create({
            model: "tts-1",
            input: aiResponse,
            voice: "alloy"
        });

        const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

        res.json({
            response: aiResponse,
            audio: audioBuffer.toString('base64')  // Send audio as base64 string
        });

    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        res.status(500).json({ error: "Error processing request. Please try again later." });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
