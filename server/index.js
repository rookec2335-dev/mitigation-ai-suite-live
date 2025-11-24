// ==============================
    // MITIGATION AI SERVER (FINAL)
    // ==============================

    require('dotenv').config();
    const express = require('express');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const OpenAI = require("openai");

    const app = express();
    const PORT = process.env.PORT || 5000;

    app.use(cors());
    app.use(bodyParser.json({ limit: '2mb' }));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', service: 'mitigation-ai-server' });
    });

    // AI SUMMARY ENDPOINT
    app.post('/api/generate-summary', async (req, res) => {
      try {
        const job = req.body.job || {};

        if (!process.env.OPENAI_API_KEY) {
          console.error("Missing OPENAI_API_KEY");
          return res.status(500).json({ error: "Server missing OpenAI API key." });
        }

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `
You are a mitigation supervisor with 15+ years of field experience.
You understand IICRC standards and insurance carrier expectations.

Write a professional summary meant for an insurance adjuster.
Justify all work performed. Explain the scope, equipment usage, rooms,
dry logs, psychrometric progress, safety concerns, and why mitigation was necessary.

Be concise but detailed. Avoid filler. Use insurance language.

Here is the structured job data:
${JSON.stringify(job, null, 2)}
        `.trim();

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an expert mitigation supervisor who writes insurer-ready documentation." },
            { role: "user", content: prompt }
          ],
        });

        const summaryText =
          response.choices?.[0]?.message?.content ||
          "No AI response — check API settings.";

        res.json({ summary: summaryText });
      } catch (error) {
        console.error("AI ERROR (summary):", error);
        res.status(500).json({ error: "AI call failed. Check server logs or .env key." });
      }
    });

    // AI PSYCHROMETRIC ANALYSIS
    app.post('/api/analyze-psychrometrics', async (req, res) => {
      try {
        const readings = req.body.readings || [];

        if (!process.env.OPENAI_API_KEY) {
          console.error("Missing OPENAI_API_KEY");
          return res.status(500).json({ error: "Server missing OpenAI API key." });
        }

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `
You are a mitigation supervisor reviewing psychrometric logs.
Analyze drying progress. Identify concerns, trends, and verify if
conditions are moving toward dry standard. Mention any necessary next steps.

Readings:
${JSON.stringify(readings, null, 2)}
        `.trim();

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });

        const analysisText =
          response.choices?.[0]?.message?.content ||
          "No AI psychrometric response.";

        res.json({ analysis: analysisText });
      } catch (error) {
        console.error("AI ERROR (psychro):", error);
        res.status(500).json({ error: "AI psychrometric call failed." });
      }
    });

    app.listen(PORT, () => {
      console.log(`Mitigation AI server running on port ${PORT}`);
    });
