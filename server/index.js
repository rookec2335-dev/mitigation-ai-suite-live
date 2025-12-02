// ==============================
// MITIGATION AI SERVER — FULL VERSION
// SAFE TO COPY & PASTE
// ==============================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const PDFDocument = require("pdfkit");

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
    throw new Error("Missing OPENAI_API_KEY in environment.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ------------------------------
// Build job context for prompts
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
Address: ${insured.address || ""} ${insured.city || ""} ${insured.state || ""} ${
    insured.zip || ""
  }

=== INSURANCE CARRIER ===
Carrier: ${insurance.carrier || "N/A"}
Policy #: ${insurance.policyNumber || "N/A"}
Claim #: ${insurance.claimNumber || "N/A"}
Adjuster: ${insurance.adjusterName || "N/A"} (${insurance.adjusterPhone || "N/A"})
Adjuster Email: ${insurance.adjusterEmail || "N/A"}
Deductible: ${insurance.deductible || "N/A"}
Billing Status: ${insurance.billingStatus || "N/A"}

=== INITIAL INSPECTION ===
Inspector: ${inspection.inspector || "N/A"}
Inspection Date: ${inspection.inspectionDate || "N/A"}
Observations: ${inspection.observations || "N/A"}
Checklist: ${(inspection.checklist || []).join(", ") || "None"}

=== TECH HOURS ===
${techHours
    .map(
      (h) =>
        `• ${h.date || "N/A"} — In: ${h.in || "N/A"} Out: ${
          h.out || "N/A"
        } | Notes: ${h.notes || ""}`
    )
    .join("\n") || "No tech hours logged."}

=== ROOMS & DRY LOGS ===
${rooms
    .map((r, idx) => {
      const dry = (r.dryLogs || [])
        .map(
          (d) =>
            `   - ${d.date || ""} ${d.time || ""} | Reading: ${d.reading || ""}`
        )
        .join("\n");
      const checklist = (r.checklist || []).join(", ") || "None";
      return `
Room ${idx + 1}: ${r.name || "Unnamed Room"}
Checklist: ${checklist}
Narrative: ${r.narrative || "N/A"}
Dry Logs:
${dry || "   - No dry logs logged."}
`;
    })
    .join("\n") || "No rooms logged."}

=== PSYCHROMETRIC READINGS ===
${psychroReadings
    .map(
      (p) =>
        `• ${p.date || ""} ${p.time || ""} | Temp: ${p.temp || "N/A"} | RH: ${
          p.rh || "N/A"
        } | GPP: ${p.gpp || "N/A"}`
    )
    .join("\n") || "No psychrometric readings."}
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
You are a senior mitigation supervisor with 15+ years of field experience.
You write documentation specifically for PROPERTY INSURANCE CARRIERS.

Write a clear, factual narrative using EXACTLY these headings:

1) CLAIM / LOSS SUMMARY  
2) INITIAL INSPECTION SUMMARY  
3) DETAILED SCOPE OF WORK  
4) ROOM-BY-ROOM DESCRIPTION  
5) EQUIPMENT & DRYING STRATEGY  
6) PSYCHROMETRIC / DRYING PROGRESSION  
7) TECH HOURS & SITE VISITS  
8) FINAL RECOMMENDATIONS / HANDOFF  

Rules:
- Use neutral, professional language.
- Justify mitigation based on conditions.
- Reference rooms and observations where appropriate.
- Do NOT add headings or sections beyond the 8 listed.

JOB DATA:
${jobContext}
`.trim();

    const openaiClient = createOpenAI();
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert mitigation supervisor who writes insurer-ready documentation only.",
        },
        { role: "user", content: prompt },
      ],
    });

    const summary =
      response.choices?.[0]?.message?.content ||
      "No AI response — check API key / model.";

    res.json({ summary });
  } catch (error) {
    console.error("SUMMARY ERROR:", error);
    res.status(500).json({ error: "Summary generation failed." });
  }
});

// ------------------------------
// AI PSYCHROMETRIC ANALYSIS
// ------------------------------
app.post("/api/analyze-psychrometrics", async (req, res) => {
  try {
    const readings = req.body.readings || [];
    const openaiClient = createOpenAI();

    const prompt = `
You are a mitigation supervisor reviewing psychrometric readings.

Return a SHORT INTERPRETATION (max 2 short paragraphs + 3 bullet points)
covering:
- Are conditions trending drier or wetter?
- Any concerns (plateau, rising RH, equipment issues)?
- Whether conditions appear to be moving toward dry standard.

Do NOT list each reading individually.

READINGS:
${JSON.stringify(readings, null, 2)}
`.trim();

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const analysis =
      response.choices?.[0]?.message?.content ||
      "No AI psychrometric response.";

    res.json({ analysis });
  } catch (error) {
    console.error("PSYCHRO ERROR:", error);
    res.status(500).json({ error: "Psychrometric analysis failed." });
  }
});

// ------------------------------
// AI SCOPE-ONLY ENDPOINT
// ------------------------------
app.post("/api/generate-scope-only", async (req, res) => {
  try {
    const job = req.body.job || {};
    const openaiClient = createOpenAI();
    const jobContext = buildJobContext(job);

    const prompt = `
Write ONLY a mitigation Scope of Work as bullet points, similar to what an
estimator would write before entering into Xactimate.

Rules:
- No prices, no policy language.
- Group bullets logically by area/room.
- Focus on demolition, drying, cleaning, containment, and equipment.

JOB DATA:
${jobContext}
`.trim();

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const scope =
      response.choices?.[0]?.message?.content ||
      "No AI scope response — check API settings.";

    res.json({ scope });
  } catch (error) {
    console.error("SCOPE ERROR:", error);
    res.status(500).json({ error: "Scope generation failed." });
  }
});

// ------------------------------
// AI HAZARD / SAFETY PLAN
// ------------------------------
app.post("/api/generate-hazard-plan", async (req, res) => {
  try {
    const job = req.body.job || {};
    const openaiClient = createOpenAI();
    const jobContext = buildJobContext(job);

    const prompt = `
You are a mitigation safety supervisor.

Generate a concise Hazard / Safety Plan for this mitigation project.

Use these headings:
- Site Hazards
- Required PPE
- Controls & Procedures
- Special Considerations

Focus on:
- Water category (Cat 1–3)
- Electrical risks
- Structural concerns
- Containment & negative air where appropriate.

JOB DATA:
${jobContext}
`.trim();

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const hazardPlan =
      response.choices?.[0]?.message?.content ||
      "No hazard plan generated.";

    res.json({ hazardPlan });
  } catch (error) {
    console.error("HAZARD ERROR:", error);
    res.status(500).json({ error: "Hazard plan generation failed." });
  }
});

// ------------------------------
// AI ROOM PHOTO ANALYSIS (VISION)
// ------------------------------
app.post("/api/analyze-room-photo", async (req, res) => {
  try {
    const { photoData, roomName, checklist = [] } = req.body || {};
    if (!photoData) {
      return res
        .status(400)
        .json({ error: "photoData (base64 data URL) is required." });
    }

    const openaiClient = createOpenAI();

    const textPrompt = `
You are a mitigation supervisor reviewing a jobsite photo.

Room: ${roomName || "Unnamed Room"}
Checklist items already selected: ${checklist.join(", ") || "None"}

TASK:
Describe in 3–6 bullet points:
- Visible damage (wet materials, staining, microbial growth, cupping, etc.).
- Visible mitigation work (baseboards removed, drywall cuts, flooring demo, containment, equipment).
- Anything relevant for scope of work or documentation.

Be factual and concise.
`.trim();

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o", // Vision-capable
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: textPrompt },
            {
              type: "image_url",
              image_url: { url: photoData },
            },
          ],
        },
      ],
    });

    const description =
      response.choices?.[0]?.message?.content ||
      "No description generated from photo.";

    res.json({ description });
  } catch (error) {
    console.error("PHOTO ANALYSIS ERROR:", error);
    res.status(500).json({ error: "Photo analysis failed." });
  }
});

// ------------------------------
// PDF GENERATION
// ------------------------------
app.post("/api/generate-pdf", async (req, res) => {
  try {
    const { job, summary, psychroAnalysis, scope, hazardPlan } =
      req.body || {};

    const {
      jobDetails = {},
      insured = {},
      insurance = {},
      inspection = {},
      techHours = [],
      rooms = [],
      psychroReadings = [],
    } = job || {};

    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="mitigation-report-${
          jobDetails.jobNumber || "job"
        }.pdf"`
      );
      res.send(pdfBuffer);
    });

    // HEADER
    doc.fontSize(20).text("Mitigation Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `${jobDetails.companyName || "Company"} – Job #${
          jobDetails.jobNumber || "N/A"
        }`,
        { align: "center" }
      );
    doc.moveDown();

    // CLAIM / INSURED
    doc.fontSize(14).text("Claim / Insured Information", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Insured: ${insured.name || "N/A"}`);
    doc.text(
      `Property: ${insured.address || ""}, ${insured.city || ""} ${
        insured.state || ""
      } ${insured.zip || ""}`
    );
    doc.text(`Phone: ${insured.phone || "N/A"}`);
    doc.text(`Email: ${insured.email || "N/A"}`);
    doc.moveDown(0.3);
    doc.text(`Carrier: ${insurance.carrier || "N/A"}`);
    doc.text(`Policy #: ${insurance.policyNumber || "N/A"}`);
    doc.text(`Claim #: ${insurance.claimNumber || "N/A"}`);
    doc.text(
      `Adjuster: ${insurance.adjusterName || "N/A"} (${insurance.adjusterPhone ||
        "N/A"}) | ${insurance.adjusterEmail || "N/A"}`
    );
    doc.moveDown();

    // INITIAL INSPECTION
    doc.fontSize(14).text("Initial Inspection Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Inspector: ${inspection.inspector || "N/A"}`);
    doc.text(`Inspection Date: ${inspection.inspectionDate || "N/A"}`);
    if (inspection.checklist && inspection.checklist.length > 0) {
      doc.text(`Key Conditions: ${inspection.checklist.join(", ")}`);
    }
    doc.moveDown(0.3);
    if (inspection.observations) {
      doc.text(inspection.observations, { align: "left" });
    } else {
      doc.text("No inspection narrative provided.");
    }
    doc.moveDown();

    // TECH HOURS
    if (techHours && techHours.length > 0) {
      doc.fontSize(14).text("Tech Hours & Site Visits", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      techHours.forEach((h) => {
        doc.text(
          `• ${h.date || "N/A"} | In: ${h.in || "N/A"} Out: ${
            h.out || "N/A"
          } | Notes: ${h.notes || ""}`
        );
      });
      doc.moveDown();
    }

    // ROOMS & DRY LOGS
    if (rooms && rooms.length > 0) {
      doc.fontSize(14).text("Room-by-Room Summary", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      rooms.forEach((r, idx) => {
        doc.text(`Room ${idx + 1}: ${r.name || "Unnamed Room"}`, {
          underline: true,
        });
        if (r.checklist && r.checklist.length > 0) {
          doc.text(`Checklist: ${r.checklist.join(", ")}`);
        }
        if (r.narrative) {
          doc.text(`Work Performed: ${r.narrative}`);
        }
        if (r.dryLogs && r.dryLogs.length > 0) {
          doc.moveDown(0.2);
          doc.text("Dry Logs:");
          r.dryLogs.forEach((d) => {
            doc.text(
              `   - ${d.date || "N/A"} ${d.time || ""} | ${
                d.reading || ""
              }`
            );
          });
        }
        doc.moveDown();
      });
    }

    // PSYCHROMETRIC TABLE
    if (psychroReadings && psychroReadings.length > 0) {
      doc
        .fontSize(14)
        .text("Psychrometric Overview (Key Readings)", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      psychroReadings.forEach((p) => {
        doc.text(
          `• ${p.date || "N/A"} ${p.time || ""} | Temp: ${
            p.temp || "N/A"
          } | RH: ${p.rh || "N/A"} | GPP: ${p.gpp || "N/A"}`
        );
      });
      doc.moveDown();
    }

    // PSYCHRO ANALYSIS
    if (psychroAnalysis) {
      doc
        .fontSize(14)
        .text("AI Psychrometric Trend Analysis", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(psychroAnalysis, { align: "left" });
      doc.moveDown();
    }

    // SCOPE OF WORK
    if (scope) {
      doc
        .fontSize(14)
        .text("Scope of Work (Xactimate-Style Narrative)", {
          underline: true,
        });
      doc.moveDown(0.5);
      doc.fontSize(11).text(scope, { align: "left" });
      doc.moveDown();
    }

    // HAZARD PLAN
    if (hazardPlan) {
      doc.fontSize(14).text("Hazard / Safety Plan", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).text(hazardPlan, { align: "left" });
      doc.moveDown();
    }

    // AI NARRATIVE PAGE
    if (summary) {
      doc.addPage();
      doc
        .fontSize(16)
        .text("AI Mitigation Narrative (Insurance Summary)", {
          align: "center",
          underline: true,
        });
      doc.moveDown();
      doc.fontSize(11).text(summary, { align: "left" });
    }

    doc.end();
  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "PDF generation failed." });
  }
});

// ------------------------------
// START SERVER
// ------------------------------
app.listen(PORT, () => {
  console.log(`Mitigation AI server running on port ${PORT}`);
});
