import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://mitigation-ai-server.onrender.com";

function App() {
  /* =============================================
     LOAD / SAVE JOBS (LocalStorage)
  ============================================= */
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobName, setJobName] = useState("");

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem("mitigationJobs")) || [];
    setSavedJobs(jobs);
  }, []);

  const saveJob = () => {
    if (!jobName) return alert("Enter a job name!");
    const newJob = {
      jobName,
      timestamp: new Date().toISOString(),
      jobDetails,
      insured,
      insurance,
      inspection,
      techHours,
      rooms,
      psychroReadings,
    };
    const updated = [...savedJobs, newJob];
    localStorage.setItem("mitigationJobs", JSON.stringify(updated));
    setSavedJobs(updated);
    alert("Job Saved!");
  };

  const loadJob = (job) => {
    setJobDetails(job.jobDetails);
    setInsured(job.insured);
    setInsurance(job.insurance);
    setInspection(job.inspection);
    setTechHours(job.techHours);
    setRooms(job.rooms);
    setPsychroReadings(job.psychroReadings);
    alert("Job Loaded!");
  };

  /* =============================================
     MAIN STATE
  ============================================= */
  const [jobDetails, setJobDetails] = useState({
    companyName: "",
    jobNumber: "",
    priority: "Standard",
    technician: "",
    supervisor: "",
    dateOfLoss: "",
    inspectionDate: "",
    lossType: "",
    iicrcClass: "",
    sourceOfLoss: "",
  });

  const [insured, setInsured] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [insurance, setInsurance] = useState({
    carrier: "",
    policyNumber: "",
    claimNumber: "",
    deductible: "",
    adjusterName: "",
    adjusterPhone: "",
    adjusterEmail: "",
    billingStatus: "",
  });

  /* =============================================
     INITIAL INSPECTION + CHECKLIST
  ============================================= */
  const [inspection, setInspection] = useState({
    inspector: "",
    inspectionDate: "",
    observations: "",
    checklist: [],
  });

  const inspectionChecklistItems = [
    "Standing Water",
    "Musty Odor",
    "Visible Mold",
    "Structural Damage",
    "Electrical Risk",
    "Baseboards Removed",
    "Flooring Demo",
    "Safety Concerns",
  ];

  const toggleInspectionItem = (item) => {
    setInspection((prev) => ({
      ...prev,
      checklist: prev.checklist.includes(item)
        ? prev.checklist.filter((i) => i !== item)
        : [...prev.checklist, item],
    }));
  };

  /* =============================================
     TECH HOURS
  ============================================= */
  const [techHours, setTechHours] = useState([
    { date: "", in: "", out: "", notes: "" },
  ]);

  const addTechHour = () =>
    setTechHours([...techHours, { date: "", in: "", out: "", notes: "" }]);

  const updateTechHour = (idx, field, value) => {
    const updated = [...techHours];
    updated[idx][field] = value;
    setTechHours(updated);
  };

  /* =============================================
     ROOMS & CHECKLIST
  ============================================= */
  const roomChecklistItems = [
    "Baseboards Removed",
    "Carpet Pulled",
    "Flooring Removed",
    "2ft Wall Cut",
    "4ft Wall Cut",
    "Containment Setup",
    "Dehumidifier Used",
    "Air Movers Installed",
    "HEPA Filtration",
  ];

  const [rooms, setRooms] = useState([
    {
      name: "",
      narrative: "",
      dryLogs: [],
      photo: null,
      photoData: "",
      checklist: [],
    },
  ]);

  const addRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        name: "",
        narrative: "",
        dryLogs: [],
        photo: null,
        photoData: "",
        checklist: [],
      },
    ]);
  };

  const updateRoom = (idx, field, value) => {
    setRooms((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const toggleRoomChecklist = (roomIdx, item) => {
    setRooms((prev) => {
      const updated = [...prev];
      const list = updated[roomIdx].checklist || [];
      updated[roomIdx].checklist = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];
      return updated;
    });
  };

  const addDryLog = (roomIdx) => {
    setRooms((prev) => {
      const updated = [...prev];
      updated[roomIdx].dryLogs = updated[roomIdx].dryLogs || [];
      updated[roomIdx].dryLogs.push({ date: "", time: "", reading: "" });
      return updated;
    });
  };

  const updateDryLog = (roomIdx, logIdx, field, value) => {
    setRooms((prev) => {
      const updated = [...prev];
      updated[roomIdx].dryLogs[logIdx][field] = value;
      return updated;
    });
  };

  const handlePhotoUpload = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result; // data:image/...;base64,...
      setRooms((prev) => {
        const updated = [...prev];
        updated[idx].photo = URL.createObjectURL(file);
        updated[idx].photoData = dataUrl;
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  /* =============================================
     PSYCHROMETRIC READINGS
  ============================================= */
  const [psychroReadings, setPsychroReadings] = useState([
    { date: "", time: "", temp: "", rh: "", gpp: "" },
  ]);

  const addReading = () =>
    setPsychroReadings((prev) => [
      ...prev,
      { date: "", time: "", temp: "", rh: "", gpp: "" },
    ]);

  const updateReading = (idx, field, value) => {
    setPsychroReadings((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  /* =============================================
     AI OUTPUT STATE
  ============================================= */
  const [aiSummary, setAiSummary] = useState("");
  const [psychroAnalysis, setPsychroAnalysis] = useState("");
  const [scopeText, setScopeText] = useState("");
  const [hazardPlan, setHazardPlan] = useState("");
  const [loading, setLoading] = useState(false);

  /* =============================================
     COMMON JOB PAYLOAD
  ============================================= */
  const buildJobPayload = () => ({
    jobDetails,
    insured,
    insurance,
    inspection,
    techHours,
    rooms,
    psychroReadings,
  });

  /* =============================================
     AI CALLS
  ============================================= */
  const handleGenerateSummary = async () => {
    try {
      setLoading(true);
      const payload = buildJobPayload();
      const res = await axios.post(`${API_BASE}/api/generate-summary`, {
        job: payload,
      });
      setAiSummary(res.data.summary || "No AI response");
    } catch (err) {
      console.error(err);
      setAiSummary("Error connecting to backend for summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePsychro = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE}/api/analyze-psychrometrics`,
        {
          readings: psychroReadings,
        }
      );
      setPsychroAnalysis(res.data.analysis || "No AI psychro response.");
    } catch (err) {
      console.error(err);
      setPsychroAnalysis("Error analyzing psychrometrics.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScope = async () => {
    try {
      setLoading(true);
      const payload = buildJobPayload();
      const res = await axios.post(
        `${API_BASE}/api/generate-scope-only`,
        { job: payload }
      );
      setScopeText(res.data.scope || "No AI scope response.");
    } catch (err) {
      console.error(err);
      setScopeText("Error generating scope of work.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHazardPlan = async () => {
    try {
      setLoading(true);
      const payload = buildJobPayload();
      const res = await axios.post(
        `${API_BASE}/api/generate-hazard-plan`,
        { job: payload }
      );
      setHazardPlan(res.data.hazardPlan || "No hazard plan generated.");
    } catch (err) {
      console.error(err);
      setHazardPlan("Error generating hazard plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRoomPhoto = async (idx) => {
    const room = rooms[idx];
    if (!room.photoData) {
      return alert("Upload a photo for this room first.");
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE}/api/analyze-room-photo`,
        {
          photoData: room.photoData,
          roomName: room.name,
          checklist: room.checklist || [],
        }
      );
      const desc = res.data.description || "No description generated.";
      // Append to room narrative
      setRooms((prev) => {
        const updated = [...prev];
        const current = updated[idx].narrative || "";
        updated[idx].narrative =
          current.trim().length > 0
            ? `${current}\n\nAI Photo Notes:\n${desc}`
            : `AI Photo Notes:\n${desc}`;
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Error analyzing room photo.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      const job = buildJobPayload();
      const res = await axios.post(
        `${API_BASE}/api/generate-pdf`,
        {
          job,
          summary: aiSummary,
          psychroAnalysis,
          scope: scopeText,
          hazardPlan,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mitigation-report-${jobDetails.jobNumber || "job"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF export failed. Check backend / logs.");
    }
  };

  /* =============================================
     NEW: XACTIMATE CSV EXPORT (PER ROOM)
  ============================================= */
  const handleExportXactimate = async () => {
    try {
      const job = buildJobPayload();
      const res = await axios.post(
        `${API_BASE}/api/export-xactimate`,
        { job },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `xactimate-export-${jobDetails.jobNumber || "job"}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Xactimate export failed. Check backend.");
    }
  };

  /* =============================================
     RENDER
  ============================================= */
  return (
    <div className="container">
      {/* HEADER */}
      <header className="header-row">
        <img
          src="/WaterCleanUpLogoFinal.png"
          className="company-logo"
          alt="Logo"
        />
        <div className="header-main">
          <h1>Mitigation Supervisor Console</h1>
          <p className="subtext">
            Rooter Plus – Insurer-ready mitigation documentation, AI narratives,
            and PDF export.
          </p>
        </div>

        <div className="header-controls">
          <input
            className="job-input"
            placeholder="Job Name"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
          />
          <div className="header-buttons">
            <button className="btn" onClick={saveJob}>
              Save Job
            </button>
            <button className="btn" onClick={handleExportXactimate}>
              Export Xactimate CSV
            </button>
            <button className="btn btn-primary" onClick={handleExportPdf}>
              Export Insurance PDF
            </button>
          </div>
        </div>
      </header>

      {/* LOAD JOBS */}
      {savedJobs.length > 0 && (
        <section className="card">
          <h2>Saved Jobs</h2>
          <div className="saved-jobs-list">
            {savedJobs.map((j, i) => (
              <button
                key={i}
                className="saved-job-btn"
                onClick={() => loadJob(j)}
              >
                {j.jobName} –{" "}
                {new Date(j.timestamp).toLocaleString("en-US")}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* INITIAL INSPECTION */}
      <section className="card">
        <h2>Initial Inspection</h2>
        <div className="grid-3">
          <input
            placeholder="Inspector Name"
            value={inspection.inspector}
            onChange={(e) =>
              setInspection({ ...inspection, inspector: e.target.value })
            }
          />
          <input
            type="date"
            value={inspection.inspectionDate}
            onChange={(e) =>
              setInspection({
                ...inspection,
                inspectionDate: e.target.value,
              })
            }
          />
          <select
            value={jobDetails.lossType}
            onChange={(e) =>
              setJobDetails({ ...jobDetails, lossType: e.target.value })
            }
          >
            <option value="">Loss Type</option>
            <option value="Clean Water (Cat 1)">Clean Water (Cat 1)</option>
            <option value="Grey Water (Cat 2)">Grey Water (Cat 2)</option>
            <option value="Black Water (Cat 3)">Black Water (Cat 3)</option>
            <option value="Storm">Storm</option>
            <option value="Flood">Flood</option>
            <option value="Sewage Backup">Sewage Backup</option>
          </select>
        </div>
        <textarea
          placeholder="Observations / Scope of Work"
          value={inspection.observations}
          onChange={(e) =>
            setInspection({ ...inspection, observations: e.target.value })
          }
        />
        <div className="checklist-grid">
          {inspectionChecklistItems.map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={inspection.checklist.includes(item)}
                onChange={() => toggleInspectionItem(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </section>

      {/* JOB / INSURED / INSURANCE */}
      <section className="card">
        <h2>Job & Loss Details</h2>
        <div className="grid-3">
          <input
            placeholder="Company Name"
            value={jobDetails.companyName}
            onChange={(e) =>
              setJobDetails({ ...jobDetails, companyName: e.target.value })
            }
          />
          <input
            placeholder="Job #"
            value={jobDetails.jobNumber}
            onChange={(e) =>
              setJobDetails({ ...jobDetails, jobNumber: e.target.value })
            }
          />
          <select
            value={jobDetails.priority}
            onChange={(e) =>
              setJobDetails({ ...jobDetails, priority: e.target.value })
            }
          >
            <option value="Standard">Priority: Standard</option>
            <option value="Emergency">Priority: Emergency</option>
            <option value="After Hours">Priority: After Hours</option>
            <option value="High">Priority: High</option>
          </select>
        </div>
        <div className="grid-3">
          <input
            placeholder="Technician"
            value={jobDetails.technician}
            onChange={(e) =>
              setJobDetails({ ...jobDetails, technician: e.target.value })
            }
          />
          <input
            placeholder="Supervisor"
            value={jobDetails.supervisor}
            onChange={(e) =>
              setJobDetails({ ...jobDetails, supervisor: e.target.value })
            }
          />
          <select
            value={jobDetails.iicrcClass}
            onChange={(e) =>
              setJobDetails({ ...jobDetails, iicrcClass: e.target.value })
            }
          >
            <option value="">IICRC Class</option>
            <option value="Class 1">Class 1 – Small amount of wet materials</option>
            <option value="Class 2">Class 2 – Significant area affected</option>
            <option value="Class 3">Class 3 – Walls / Insulation soaked</option>
            <option value="Class 4">
              Class 4 – Specialty drying (wood, plaster)
            </option>
          </select>
        </div>
        <div className="grid-3">
          <input
            type="date"
            value={jobDetails.dateOfLoss}
            onChange={(e) =>
              setJobDetails({ ...jobDetails, dateOfLoss: e.target.value })
            }
          />
          <input
            type="date"
            value={jobDetails.inspectionDate}
            onChange={(e) =>
              setJobDetails({
                ...jobDetails,
                inspectionDate: e.target.value,
              })
            }
          />
          <input
            placeholder="Source of Loss"
            value={jobDetails.sourceOfLoss}
            onChange={(e) =>
              setJobDetails({
                ...jobDetails,
                sourceOfLoss: e.target.value,
              })
            }
          />
        </div>
      </section>

      <section className="card">
        <h2>Insured / Property</h2>
        <div className="grid-3">
          <input
            placeholder="Insured Name"
            value={insured.name}
            onChange={(e) =>
              setInsured({ ...insured, name: e.target.value })
            }
          />
          <input
            placeholder="Phone"
            value={insured.phone}
            onChange={(e) =>
              setInsured({ ...insured, phone: e.target.value })
            }
          />
          <input
            placeholder="Email"
            value={insured.email}
            onChange={(e) =>
              setInsured({ ...insured, email: e.target.value })
            }
          />
        </div>
        <div className="grid-3">
          <input
            placeholder="Address"
            value={insured.address}
            onChange={(e) =>
              setInsured({ ...insured, address: e.target.value })
            }
          />
          <input
            placeholder="City"
            value={insured.city}
            onChange={(e) =>
              setInsured({ ...insured, city: e.target.value })
            }
          />
          <input
            placeholder="State"
            value={insured.state}
            onChange={(e) =>
              setInsured({ ...insured, state: e.target.value })
            }
          />
        </div>
        <div className="grid-3">
          <input
            placeholder="ZIP"
            value={insured.zip}
            onChange={(e) =>
              setInsured({ ...insured, zip: e.target.value })
            }
          />
        </div>
      </section>

      <section className="card">
        <h2>Insurance & Billing</h2>
        <div className="grid-3">
          <input
            placeholder="Carrier"
            value={insurance.carrier}
            onChange={(e) =>
              setInsurance({ ...insurance, carrier: e.target.value })
            }
          />
          <input
            placeholder="Policy #"
            value={insurance.policyNumber}
            onChange={(e) =>
              setInsurance({
                ...insurance,
                policyNumber: e.target.value,
              })
            }
          />
          <input
            placeholder="Claim #"
            value={insurance.claimNumber}
            onChange={(e) =>
              setInsurance({
                ...insurance,
                claimNumber: e.target.value,
              })
            }
          />
        </div>
        <div className="grid-3">
          <input
            placeholder="Deductible"
            value={insurance.deductible}
            onChange={(e) =>
              setInsurance({
                ...insurance,
                deductible: e.target.value,
              })
            }
          />
          <input
            placeholder="Adjuster Name"
            value={insurance.adjusterName}
            onChange={(e) =>
              setInsurance({
                ...insurance,
                adjusterName: e.target.value,
              })
            }
          />
          <input
            placeholder="Adjuster Phone"
            value={insurance.adjusterPhone}
            onChange={(e) =>
              setInsurance({
                ...insurance,
                adjusterPhone: e.target.value,
              })
            }
          />
        </div>
        <div className="grid-3">
          <input
            placeholder="Adjuster Email"
            value={insurance.adjusterEmail}
            onChange={(e) =>
              setInsurance({
                ...insurance,
                adjusterEmail: e.target.value,
              })
            }
          />
          <input
            placeholder="Billing Status"
            value={insurance.billingStatus}
            onChange={(e) =>
              setInsurance({
                ...insurance,
                billingStatus: e.target.value,
              })
            }
          />
        </div>
      </section>

      {/* TECH HOURS */}
      <section className="card">
        <h2>Tech Hours</h2>
        {techHours.map((entry, idx) => (
          <div className="grid-4" key={idx}>
            <input
              type="date"
              value={entry.date}
              onChange={(e) =>
                updateTechHour(idx, "date", e.target.value)
              }
            />
            <input
              type="time"
              value={entry.in}
              onChange={(e) =>
                updateTechHour(idx, "in", e.target.value)
              }
            />
            <input
              type="time"
              value={entry.out}
              onChange={(e) =>
                updateTechHour(idx, "out", e.target.value)
              }
            />
            <input
              placeholder="Notes"
              value={entry.notes}
              onChange={(e) =>
                updateTechHour(idx, "notes", e.target.value)
              }
            />
          </div>
        ))}
        <button className="btn" onClick={addTechHour}>
          + Add Entry
        </button>
      </section>

      {/* ROOMS & DRY LOGS */}
      <section className="card">
        <h2>Rooms & Dry Logs</h2>
        {rooms.map((room, idx) => (
          <div key={idx} className="room-box">
            <input
              placeholder="Room Name"
              value={room.name}
              onChange={(e) =>
                updateRoom(idx, "name", e.target.value)
              }
            />
            <textarea
              placeholder="Work Done / Narrative"
              value={room.narrative}
              onChange={(e) =>
                updateRoom(idx, "narrative", e.target.value)
              }
            />
            <h4>Checklist</h4>
            <div className="checklist-grid">
              {roomChecklistItems.map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={room.checklist?.includes(item)}
                    onChange={() => toggleRoomChecklist(idx, item)}
                  />
                  {item}
                </label>
              ))}
            </div>

            <button
              className="btn"
              onClick={() => addDryLog(idx)}
            >
              + Add Dry Log
            </button>
            {room.dryLogs?.map((log, i) => (
              <div key={i} className="grid-3">
                <input
                  type="date"
                  value={log.date}
                  onChange={(e) =>
                    updateDryLog(idx, i, "date", e.target.value)
                  }
                />
                <input
                  type="time"
                  value={log.time}
                  onChange={(e) =>
                    updateDryLog(idx, i, "time", e.target.value)
                  }
                />
                <input
                  placeholder="Moisture Reading"
                  value={log.reading}
                  onChange={(e) =>
                    updateDryLog(idx, i, "reading", e.target.value)
                  }
                />
              </div>
            ))}

            <div className="room-photo-row">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(idx, e)}
              />
              {room.photo && (
                <img
                  src={room.photo}
                  className="room-photo"
                  alt="Room"
                />
              )}
            </div>

            <button
              className="btn"
              onClick={() => handleAnalyzeRoomPhoto(idx)}
            >
              AI Describe From Photo
            </button>
          </div>
        ))}
        <button className="btn" onClick={addRoom}>
          + Add Room
        </button>
      </section>

      {/* PSYCHROMETRIC READINGS */}
      <section className="card">
        <h2>Psychrometric Readings</h2>
        {psychroReadings.map((row, idx) => (
          <div key={idx} className="grid-5">
            <input
              type="date"
              value={row.date}
              onChange={(e) =>
                updateReading(idx, "date", e.target.value)
              }
            />
            <input
              type="time"
              value={row.time}
              onChange={(e) =>
                updateReading(idx, "time", e.target.value)
              }
            />
            <input
              placeholder="Temp (°F)"
              value={row.temp}
              onChange={(e) =>
                updateReading(idx, "temp", e.target.value)
              }
            />
            <input
              placeholder="RH (%)"
              value={row.rh}
              onChange={(e) =>
                updateReading(idx, "rh", e.target.value)
              }
            />
            <input
              placeholder="GPP"
              value={row.gpp}
              onChange={(e) =>
                updateReading(idx, "gpp", e.target.value)
              }
            />
          </div>
        ))}
        <button className="btn" onClick={addReading}>
          + Add Reading
        </button>
        <button
          className="btn secondary"
          onClick={handleAnalyzePsychro}
        >
          Analyze Psychrometrics (AI)
        </button>
        {psychroAnalysis && (
          <div className="ai-section">
            <h3>AI Psychrometric Analysis</h3>
            <p>{psychroAnalysis}</p>
          </div>
        )}
      </section>

      {/* AI SECTIONS */}
      <section className="card">
        <h2>AI Outputs</h2>

        <div className="ai-button-row">
          <button
            className="btn btn-primary"
            onClick={handleGenerateSummary}
          >
            Generate AI Insurance Summary
          </button>
          <button
            className="btn"
            onClick={handleGenerateScope}
          >
            Generate Scope of Work
          </button>
          <button
            className="btn"
            onClick={handleGenerateHazardPlan}
          >
            Generate Hazard / Safety Plan
          </button>
        </div>

        {loading && (
          <p className="loading-text">
            AI is thinking like a mitigation supervisor…
          </p>
        )}

        {aiSummary && (
          <div className="ai-section">
            <h3>AI Insurance Summary</h3>
            <p>{aiSummary}</p>
          </div>
        )}

        {scopeText && (
          <div className="ai-section">
            <h3>Scope of Work (Xactimate-Style Narrative)</h3>
            <p>{scopeText}</p>
          </div>
        )}

        {hazardPlan && (
          <div className="ai-section">
            <h3>Hazard / Safety Plan</h3>
            <p>{hazardPlan}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
