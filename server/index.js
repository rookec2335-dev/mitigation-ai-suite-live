// ==============================
// MITIGATION AI SERVER — CLEAN + IMPROVED
// SAFE TO COPY & PASTE OVER EXISTING index.js
// ==============================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const PDFDocument = require("pdfkit");
const stream = require("stream");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));

// ------------------------------
// HEALTH CHECK
// ------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "mitigation-ai-server" });
});

// ------------------------------
// OpenAI Helper
// ------------------------------
function createOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ------------------------------
// FORMAT JOB CONTEXT FOR PROMPTING
// ------------------------------
function buildJobContext(job) {
  const {
    jobDetails = {},
    insured = {},
    insurance = {},
    inspection = {},
    techHours = [],
    rooms = [],
    psychroReadings = [],
  } = job || {};

  return `
=== JOB DETAILS ===
Company: ${jobDetails.companyName || "N/A"}
Job #: ${jobDetails.jobNumber || "N/A"}
Technician: ${jobDetails.technician || "N/A"}
Supervisor: ${jobDetails.supervisor || "N/A"}
Priority: ${jobDetails.priority || "Standard"}
Loss Type: ${jobDetails.lossType || "N/A"}
IICRC Class: ${jobDetails.iicrcClass || "N/A"}
Source of Loss: ${jobDetails.sourceOfLoss || "N/A"}
Date of Loss: ${jobDetails.dateOfLoss || "N/A"}
Inspection Date: ${jobDetails.inspectionDate || "N/A"}

=== INSURED INFO ===
Insured: ${insured.name || "N/A"}
Phone: ${insured.phone || "N/A"}
Email: ${insured.email || "N/A"}
Address: ${insured.address || ""} ${insured.city || ""} ${insured.state || ""} ${insured.zip || ""}

=== INSURANCE CARRIER ===
Carrier: ${insurance.carrier || "N/A"}
Policy #: ${insurance.policyNumber || "N/A"}
Claim #: ${insurance.claimNumber || "N/A"}
Adjuster: ${insurance.adjusterName || "N/A"} (${insurance.adjusterPhone || "N/A"})
Email: ${insurance.adjusterEmail || "N/A"}
Deductible: ${insurance.deductible || "N/A"}

=== INITIAL INSPECTION ===
Inspector: ${inspection.inspector || "N/A"}
Inspection Date: ${inspection.inspectionDate || "N/A"}
Observations: ${inspection.observations || "N/A"}
Checklist: ${(inspection.checklist || []).join(", ") || "None"}

=== TECH HOURS ===
${techHours
    .map(
      (h) =>
        `• ${h.date || "N/A"} — In: ${h.in || "N/A"} Out: ${h.out || "N/A"} Notes: ${
          h.notes || ""
        }`
    )
    .join("\n")}

=== ROOMS ===
${rooms
    .map((r, idx) => {
      const dry = r.dryLogs
        ?.map(
          (d) => `   - ${d.date || ""} ${d.time || ""} | Reading: ${d.reading || ""}`
        )
        .join("\n");
      return `
Room ${idx + 1}: ${r.name || "Unnamed"}
Narrative: ${r.narrative || "N/A"}
Checklist: ${(r.checklist || []).join(", ") || "None"}
Dry Logs:
${dry || "   - No logs"}
`;
    })
    .join("\n")}

=== PSYCHROMETRIC READINGS ===
${psychroReadings
    .map(
      (p) =>
        `• ${p.date || ""} ${p.time || ""} | Temp: ${p.temp || ""} RH: ${
          p.rh || ""
        } GPP: ${p.gpp || ""}`
    )
    .join("\n")}
`;
}

// ------------------------------
// AI SUMMARY (INSURANCE-READY)
// ------------------------------
app.post("/api/generate-summary", async (req, res) => {
  try {
    const job = req.body.job || {};
    const openai = createOpenAI();
    const jobContext = buildJobContext(job);

    const prompt = `
You are an expert mitigation supervisor who writes insurance-ready narratives.
Write a **clean, factual, professional** narrative formatted exactly with
these headings (do NOT change or add headings):

1) CLAIM / LOSS SUMMARY  
2) INITIAL INSPECTION SUMMARY  
3) DETAILED SCOPE OF WORK  
4) ROOM-BY-ROOM DESCRIPTION  
5) EQUIPMENT & DRYING STRATEGY  
6) PSYCHROMETRIC / DRYING PROGRESSION  
7) TECH HOURS & SITE VISITS  
8) FINAL RECOMMENDATIONS / HANDOFF  

Use bullet points where appropriate.  
Do NOT exaggerate or create materials not provided.  

JOB DATA:
${jobContext}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You produce insurer-ready mitigation reports only." },
        { role: "user", content: prompt },
      ],
    });

    const summary = response.choices?.[0]?.message?.content || "AI response missing";
    res.json({ summary });
  } catch (err) {
    console.error("SUMMARY ERR:", err);
    res.status(500).json({ error: "Summary generation failed" });
  }
});

// ------------------------------
// AI PSYCHROMETRIC ANALYSIS
// ------------------------------
app.post("/api/analyze-psychrometrics", async (req, res) => {
  try {
    const readings = req.body.readings || [];
    const openai = createOpenAI();

    const prompt = `
Provide a short (2 paragraph max + 3 bullets)
interpretation of drying progress based on psychrometric readings.
Discuss GPP, RH, and temperature trends.

READINGS:
${JSON.stringify(readings, null, 2)}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const analysis = response.choices?.[0]?.message?.content || "";
    res.json({ analysis });
  } catch (err) {
    console.error("PSYCHRO ERR:", err);
    res.status(500).json({ error: "Psychro analysis failed" });
  }
});

// ------------------------------
// SCOPE ONLY ENDPOINT
// ------------------------------
app.post("/api/generate-scope-only", async (req, res) => {
  try {
    const job = req.body.job || {};
    const openai = createOpenAI();
    const jobContext = buildJobContext(job);

    const prompt = `
Write ONLY a mitigation **Scope of Work** as bullet points.
Group by room/area.  
No pricing. No policy language. No headings.

DATA:
${jobContext}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const scope = response.choices?.[0]?.message?.content || "";
    res.json({ scope });
  } catch (err) {
    console.error("SCOPE ERR:", err);
    res.status(500).json({ error: "Scope generation failed" });
  }
});

// ------------------------------
// PDF GENERATION ENDPOINT
// ------------------------------
app.post("/api/generate-pdf", async (req, res) => {
  try {
    const { job, summary } = req.body;
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => {
      const pdf = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="mitigation-report.pdf"`);
      res.send(pdf);
    });

    const {
      jobDetails = {},
      insured = {},
      insurance = {},
      inspection = {},
      techHours = [],
      rooms = [],
      psychroReadings = [],
    } = job || {};

    // HEADER
    doc.fontSize(20).text("Mitigation Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(11).text(`Job #: ${jobDetails.jobNumber || "N/A"}`);
    doc.text(`Loss Type: ${jobDetails.lossType || "N/A"}`);
    doc.text(`Class: ${jobDetails.iicrcClass || "N/A"}`);
    doc.moveDown();

    // INSURED SECTION
    doc.fontSize(14).text("Claim / Insured Information", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Insured: ${insured.name}`);
    doc.text(`Address: ${insured.address}, ${insured.city} ${insured.state} ${insured.zip}`);
    doc.text(`Phone: ${insured.phone}`);
    doc.text(`Email: ${insured.email}`);
    doc.text(`Carrier: ${insurance.carrier}`);
    doc.text(`Claim #: ${insurance.claimNumber}`);
    doc.moveDown();

    // INSPECTION
    doc.fontSize(14).text("Initial Inspection Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Inspector: ${inspection.inspector}`);
    doc.text(`Inspection Date: ${inspection.inspectionDate}`);
    doc.text(`Conditions: ${(inspection.checklist || []).join(", ")}`);
    doc.moveDown();
    doc.text(inspection.observations || "No notes");
    doc.moveDown();

    // TECH HOURS
    if (techHours.length) {
      doc.fontSize(14).text("Tech Hours", { underline: true });
      doc.moveDown(0.5);
      techHours.forEach((h) => {
        doc.fontSize(11).text(`• ${h.date} | In: ${h.in} Out: ${h.out} | ${h.notes}`);
      });
      doc.moveDown();
    }

    // ROOMS
    if (rooms.length) {
      doc.fontSize(14).text("Rooms", { underline: true });
      doc.moveDown(0.5);
      rooms.forEach((r, idx) => {
        doc.fontSize(12).text(`Room ${idx + 1}: ${r.name}`, { underline: true });
        doc.fontSize(11).text(`Checklist: ${(r.checklist || []).join(", ")}`);
        doc.text(`Narrative: ${r.narrative}`);
        doc.text("Dry Logs:");
        r.dryLogs?.forEach((d) =>
          doc.text(`   - ${d.date} ${d.time} | ${d.reading}`)
        );
        doc.moveDown();
      });
    }

    // PSYCHRO TABLE
    if (psychroReadings.length) {
      doc.fontSize(14).text("Psychrometric Overview", { underline: true });
      doc.moveDown(0.5);
      psychroReadings.forEach((p) =>
        doc
          .fontSize(11)
          .text(`• ${p.date} ${p.time} | Temp ${p.temp} | RH ${p.rh} | GPP ${p.gpp}`)
      );
      doc.moveDown();
    }

    // AI SUMMARY PAGE
    if (summary) {
      doc.addPage();
      doc.fontSize(18).text("AI Mitigation Narrative", { align: "center" });
      doc.moveDown();
      doc.fontSize(11).text(summary, { align: "left" });
    }

    doc.end();
  } catch (err) {
    console.error("PDF ERR:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

// ------------------------------
// START SERVER
// ------------------------------
app.listen(PORT, () => {
  console.log(`Mitigation AI server running on port ${PORT}`);
});
