// ==============================
// MITIGATION AI SERVER (FULL FILE)
// Safe to copy & paste — overwrite your current index.js
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
app.use(bodyParser.json({ limit: "10mb" }));

// ------------------------------
// Health check
// ------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "mitigation-ai-server" });
});

// Helper: create OpenAI client
function createOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Helper: build a rich text prompt from job
function buildJobContext(job) {
  const {
    jobDetails = {},
    insured = {},
    insurance = {},
    inspection = {},
    techHours = [],
    rooms = [],
    psychroReadings = [],
    signatures = {},
  } = job || {};

  return `
JOB & LOSS
- Company: ${jobDetails.companyName || "N/A"}
- Job #: ${jobDetails.jobNumber || "N/A"}
- Priority: ${jobDetails.priority || "Standard"}
- Tech: ${jobDetails.technician || "N/A"}
- Supervisor: ${jobDetails.supervisor || "N/A"}
- Date of Loss: ${jobDetails.dateOfLoss || "N/A"}
- Inspection Date: ${jobDetails.inspectionDate || "N/A"}
- Loss Type: ${jobDetails.lossType || "N/A"}
- IICRC Class: ${jobDetails.iicrcClass || "N/A"}
- Source of Loss: ${jobDetails.sourceOfLoss || "N/A"}

INSURED / PROPERTY
- Name: ${insured.name || "N/A"}
- Phone: ${insured.phone || "N/A"}
- Email: ${insured.email || "N/A"}
- Address: ${insured.address || ""} ${insured.city || ""} ${
    insured.state || ""
  } ${insured.zip || ""}

INSURANCE INFO
- Carrier: ${insurance.carrier || "N/A"}
- Policy #: ${insurance.policyNumber || "N/A"}
- Claim #: ${insurance.claimNumber || "N/A"}
- Deductible: ${insurance.deductible || "N/A"}
- Adjuster: ${insurance.adjusterName || "N/A"} | ${
    insurance.adjusterPhone || "N/A"
  } | ${insurance.adjusterEmail || "N/A"}
- Billing Status: ${insurance.billingStatus || "N/A"}

INITIAL INSPECTION
- Inspector: ${inspection.inspector || "N/A"}
- Inspection Date: ${inspection.inspectionDate || "N/A"}
- Observations / Narrative: ${inspection.observations || "N/A"}
- Checklist Flags: ${
    (inspection.checklist || []).join(", ") || "None noted"
  }

TECH HOURS
${
  techHours
    .map(
      (h) =>
        `- ${h.date || "N/A"} | In: ${h.in || "N/A"} | Out: ${
          h.out || "N/A"
        } | Notes: ${h.notes || ""}`
    )
    .join("\n") || "No hours entered."
}

ROOMS & DRY LOGS
${
  rooms
    .map((r, idx) => {
      const dry = (r.dryLogs || [])
        .map(
          (d) =>
            `    • ${d.date || "N/A"} ${d.time || ""} – ${
              d.reading || ""
            }`
        )
        .join("\n");
      const checklist = (r.checklist || []).join(", ") || "None";
      return `
  Room ${idx + 1}: ${r.name || "Unnamed Room"}
  - Narrative: ${r.narrative || "N/A"}
  - Checklist: ${checklist}
  - Dry Logs:
${dry || "    • No dry logs recorded."}
`;
    })
    .join("\n") || "No rooms recorded."
}

PSYCHROMETRIC READINGS
${
  psychroReadings
    .map(
      (p) =>
        `- ${p.date || "N/A"} ${p.time || ""} | Temp: ${
          p.temp || "N/A"
        } | RH: ${p.rh || "N/A"} | GPP: ${p.gpp || "N/A"}`
    )
    .join("\n") || "No psychrometric readings recorded."
}

SIGNATURES & AUTHORIZATION
- Technician Name: ${signatures.techName || "N/A"}
- Technician Signed At: ${signatures.techSignedAt || "N/A"}
- Customer Name: ${signatures.customerName || "N/A"}
- Customer Signed At: ${signatures.customerSignedAt || "N/A"}
- Customer Acknowledged: ${
    signatures.customerAcknowledged ? "Yes" : "No"
  }
`;
}

// ------------------------------
// AI: Full Insurance Summary + Scope of Work
// ------------------------------
app.post("/api/generate-summary", async (req, res) => {
  try {
    const job = req.body.job || {};
    const openai = createOpenAI();

    const jobContext = buildJobContext(job);

    const prompt = `
You are a senior mitigation supervisor (15+ years experience) writing documentation
for PROPERTY INSURANCE CARRIERS. You understand IICRC, Xactimate-style scopes,
and what adjusters look for.

GOAL:
Create a clear, professional, insurer-ready narrative that can be attached directly
to a mitigation invoice file. Use neutral, factual language.

FORMAT THE RESPONSE USING THESE EXACT SECTION HEADINGS:

1) CLAIM / LOSS SUMMARY
- Briefly restate loss type, category of water, IICRC class, and cause of loss.
- Include property address and insured name as a single concise paragraph.

2) INITIAL INSPECTION SUMMARY
- Summarize key conditions found on arrival using inspection observations & checklist.
- Mention standing water, odors, visible damages, safety concerns, etc.
- Note any immediate actions taken for safety.

3) DETAILED SCOPE OF WORK
- Use bullet points.
- Build scope of work from Initial Inspection, room narratives, and room checklists.
- For each major task, reference the area (e.g., "Hall bath," "Living room," etc.).
- Include demolition (baseboards, drywall, flooring), cleaning, drying, containment, and equipment setup.

4) ROOM-BY-ROOM DESCRIPTION
- For each room: describe what was affected and what work was done.
- Mention whether materials were removed or dried in place.
- Include any containment or specialty drying details.

5) EQUIPMENT & DRYING STRATEGY
- Summarize dehumidifiers, air movers, HEPA units, etc. (based on room data and typical setups).
- Explain rationale for equipment, referencing psychrometric trends if available.

6) PSYCHROMETRIC / DRYING PROGRESSION
- Provide a short paragraph describing whether conditions improved over time
  (drier air, lower RH, improved GPP).
- Keep this concise (3–5 sentences). DO NOT list each reading.

7) TECH HOURS & SITE VISITS
- Summarize tech presence on site (e.g., daily monitoring, equipment adjustments).
- Explain that hours reflect monitoring, documentation, and moisture mapping.

8) FINAL RECOMMENDATIONS / HANDOFF
- Note remaining work items (rebuild, further evaluation, etc.).
- Keep neutral and professional.

Use clear paragraphs and bullet lists. Do NOT add your own headings beyond the 8 above.
Do NOT invent policy language. Just justify the mitigation.

Here is the structured job data:

${jobContext}
    `.trim();

    const response = await openai.chat.completions.create({
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

    const summaryText =
      response.choices?.[0]?.message?.content ||
      "No AI response — check API settings.";

    res.json({ summary: summaryText });
  } catch (error) {
    console.error("AI SUMMARY ERROR:", error);
    res.status(500).json({ error: "AI summary failed. Check server logs." });
  }
});

// ------------------------------
// AI: Psychrometric Analysis (short & focused)
// ------------------------------
app.post("/api/analyze-psychrometrics", async (req, res) => {
  try {
    const readings = req.body.readings || [];
    const openai = createOpenAI();

    const prompt = `
You are a mitigation supervisor reviewing psychrometric logs.

TASK:
Return a SHORT SUMMARY (max 2 short paragraphs + 3 bullet points) describing:
- Whether drying conditions improved (trend in GPP / RH / temp)
- Any concerns (no change, rising humidity, equipment issues)
- Whether conditions appear to be moving toward dry standard.

Do NOT list each reading. Just interpret the trend.

READINGS:
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
    console.error("AI PSYCHRO ERROR:", error);
    res.status(500).json({ error: "AI psychrometric analysis failed." });
  }
});

// ------------------------------
// AI: Scope of Work Only
// ------------------------------
app.post("/api/generate-scope-only", async (req, res) => {
  try {
    const job = req.body.job || {};
    const openai = createOpenAI();
    const jobContext = buildJobContext(job);

    const prompt = `
Using the job data below, write ONLY a clean, bullet-pointed SCOPE OF WORK,
as it would appear in mitigation documentation sent to insurance.

- Focus on demolition, drying, cleaning, containment, and equipment.
- Group bullets by area/room.
- Do NOT include pricing, quantities, or policy language.
- Do NOT add extra sections or headings, just the scope bullets.

JOB DATA:
${jobContext}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const scopeText =
      response.choices?.[0]?.message?.content ||
      "No AI scope response — check API settings.";

    res.json({ scope: scopeText });
  } catch (error) {
    console.error("AI SCOPE ERROR:", error);
    res.status(500).json({ error: "AI scope generation failed." });
  }
});

// ------------------------------
// AI: Hazard / Safety Plan
// ------------------------------
app.post("/api/generate-hazard-plan", async (req, res) => {
  try {
    const job = req.body.job || {};
    const openai = createOpenAI();
    const jobContext = buildJobContext(job);

    const prompt = `
You are a mitigation safety supervisor.

Based on the job information below, write a concise HAZARD / SAFETY PLAN with:
- PPE requirements
- Electrical / structural / microbial concerns
- Containment and negative air considerations
- Documentation / signage recommendations

Keep it 3–6 short bullet points per section, neutral and professional.

JOB DATA:
${jobContext}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const hazardPlan =
      response.choices?.[0]?.message?.content ||
      "No hazard plan generated.";

    res.json({ hazardPlan });
  } catch (error) {
    console.error("AI HAZARD ERROR:", error);
    res.status(500).json({ error: "AI hazard plan failed." });
  }
});

// ------------------------------
// AI: Analyze Room Photo
// ------------------------------
app.post("/api/analyze-room-photo", async (req, res) => {
  try {
    const { photoData, roomName, checklist = [] } = req.body || {};
    const openai = createOpenAI();

    const prompt = `
You are viewing a mitigation job site photo (encoded as base64; you won't actually see the image, but infer from description)
and room metadata. The tech wants a short narrative summary of what appears to have been done,
suitable for an insurance-facing note.

Room: ${roomName || "Unnamed Room"}
Checklist Flags: ${checklist.join(", ") || "None"}

Write 3–6 sentences:
- Describe likely demo (baseboards, drywall cuts, flooring removal, etc.).
- Mention equipment present if implied by flags (air movers, dehus, HEPA).
- Keep neutral, factual, and insurer-friendly.
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const description =
      response.choices?.[0]?.message?.content ||
      "No description generated.";

    res.json({ description });
  } catch (error) {
    console.error("AI PHOTO ERROR:", error);
    res.status(500).json({ error: "AI photo analysis failed." });
  }
});

// ------------------------------
// AI: Xactimate-style Narrative
// ------------------------------
app.post("/api/generate-xactimate", async (req, res) => {
  try {
    const job = req.body.job || {};
    const mode = req.body.mode || "per-room";
    const openai = createOpenAI();
    const jobContext = buildJobContext(job);

    const prompt = `
You are building an XACTIMATE-STYLE NARRATIVE ONLY.

GOAL:
Return a copy/paste-ready narrative the estimator can drop into Xactimate notes.

RULES:
- Use short, direct sentences.
- Group by rooms/areas.
- Focus on demolition, cleaning, drying, containment, and equipment.
- Do NOT include quantities, line item codes, or pricing.
- Do NOT include policy language.

FORMAT:
- Start with "MITIGATION SCOPE OF WORK - NARRATIVE"
- Then bullet by room/area: "HALL BATH:", "LIVING ROOM:", etc.
- Under each, 3–7 short bullets of what was done.

JOB DATA:
${jobContext}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const xactimate =
      response.choices?.[0]?.message?.content ||
      "No Xactimate-style narrative generated.";

    res.json({ xactimate });
  } catch (error) {
    console.error("AI XACTIMATE ERROR:", error);
    res.status(500).json({ error: "AI Xactimate narrative failed." });
  }
});

// ------------------------------
// PDF GENERATION ENDPOINT
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
      signatures = {},
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

    // ---- COVER / HEADER ----
    doc.fontSize(18).text("Mitigation Report", { align: "center" });
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

    doc
      .fontSize(12)
      .text(
        `Insured: ${insured.name || "N/A"} | Loss Type: ${
          jobDetails.lossType || "N/A"
        } | Class: ${jobDetails.iicrcClass || "N/A"}`
      );
    doc.moveDown();

    // Claim / Insured info
    doc.fontSize(14).text("Claim / Insured Information", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Property: ${insured.address || ""}`);
    doc.text(
      `City/State/Zip: ${insured.city || ""}, ${insured.state || ""} ${
        insured.zip || ""
      }`
    );
    doc.text(`Insured Phone: ${insured.phone || "N/A"}`);
    doc.text(`Insured Email: ${insured.email || "N/A"}`);
    doc.moveDown(0.5);
    doc.text(`Carrier: ${insurance.carrier || "N/A"}`);
    doc.text(`Policy #: ${insurance.policyNumber || "N/A"}`);
    doc.text(`Claim #: ${insurance.claimNumber || "N/A"}`);
    doc.text(`Adjuster: ${insurance.adjusterName || "N/A"}`);
    doc.text(
      `Adjuster Contact: ${insurance.adjusterPhone || "N/A"} | ${
        insurance.adjusterEmail || "N/A"
      }`
    );
    doc.moveDown();

    // Initial inspection
    doc.fontSize(14).text("Initial Inspection Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Inspector: ${inspection.inspector || "N/A"}`);
    doc.text(`Inspection Date: ${inspection.inspectionDate || "N/A"}`);
    if (inspection.checklist && inspection.checklist.length > 0) {
      doc.text(`Key Conditions: ${inspection.checklist.join(", ")}`);
    }
    doc.moveDown(0.5);
    if (inspection.observations) {
      doc.text(inspection.observations, { align: "left" });
    }
    doc.moveDown();

    // Tech hours
    if (techHours && techHours.length > 0) {
      doc.fontSize(14).text("Tech Hours & Site Visits", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      techHours.forEach((h) => {
        doc.text(
          `- ${h.date || "N/A"} | In: ${h.in || "N/A"} | Out: ${
            h.out || "N/A"
          } | Notes: ${h.notes || ""}`
        );
      });
      doc.moveDown();
    }

    // Rooms
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
        doc.moveDown(0.3);
        if (r.dryLogs && r.dryLogs.length > 0) {
          doc.text("Dry Logs:");
          r.dryLogs.forEach((d) => {
            doc.text(
              `  - ${d.date || "N/A"} ${d.time || ""} | ${d.reading || ""}`
            );
          });
        }
        doc.moveDown();
      });
    }

    // Psychrometric overview
    if (psychroReadings && psychroReadings.length > 0) {
      doc
        .fontSize(14)
        .text("Psychrometric Overview (Key Readings)", {
          underline: true,
        });
      doc.moveDown(0.5);
      doc.fontSize(11);
      psychroReadings.forEach((p) => {
        doc.text(
          `- ${p.date || "N/A"} ${p.time || ""} | Temp: ${
            p.temp || "N/A"
          } | RH: ${p.rh || "N/A"} | GPP: ${p.gpp || "N/A"}`
        );
      });
      doc.moveDown();
    }

    // Signatures & Authorization
    doc.fontSize(14).text("Signatures & Authorization", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(
      `Technician: ${signatures.techName || "N/A"} | Signed: ${
        signatures.techSignedAt || "N/A"
      }`
    );
    doc.text(
      `Customer: ${signatures.customerName || "N/A"} | Signed: ${
        signatures.customerSignedAt || "N/A"
      }`
    );
    doc.text(
      `Customer Acknowledged Work: ${
        signatures.customerAcknowledged ? "Yes" : "No"
      }`
    );
    doc.moveDown();

    // AI narrative (full summary) + optional sections on new page
    if (summary || psychroAnalysis || scope || hazardPlan) {
      doc.addPage();
      doc.fontSize(16).text("AI Mitigation Narrative Bundle", {
        underline: true,
        align: "center",
      });
      doc.moveDown();

      doc.fontSize(13).text("AI Insurance Summary", { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(11).text(summary || "No summary generated.", {
        align: "left",
      });
      doc.moveDown();

      if (scope) {
        doc.fontSize(13).text("Scope of Work (Narrative)", {
          underline: true,
        });
        doc.moveDown(0.3);
        doc.fontSize(11).text(scope, { align: "left" });
        doc.moveDown();
      }

      if (psychroAnalysis) {
        doc.fontSize(13).text("Psychrometric Analysis (AI)", {
          underline: true,
        });
        doc.moveDown(0.3);
        doc.fontSize(11).text(psychroAnalysis, { align: "left" });
        doc.moveDown();
      }

      if (hazardPlan) {
        doc.fontSize(13).text("Hazard / Safety Plan", {
          underline: true,
        });
        doc.moveDown(0.3);
        doc.fontSize(11).text(hazardPlan, { align: "left" });
        doc.moveDown();
      }
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
