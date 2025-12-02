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
    { name: "", narrative: "", dryLogs: [], photo: null, checklist: [] },
  ]);

  const addRoom = () => {
    setRooms([
      ...rooms,
      { name: "", narrative: "", dryLogs: [], photo: null, checklist: [] },
    ]);
  };

  const updateRoom = (idx, field, value) => {
    const updated = [...rooms];
    updated[idx][field] = value;
    setRooms(updated);
  };

  const toggleRoomChecklist = (roomIdx, item) => {
    setRooms((prev) => {
      const updated = [...prev];
      const list = updated[roomIdx].checklist;
      updated[roomIdx].checklist = list.includes(item)
        ? list.filter((i) => i !== item)
        : [...list, item];
      return updated;
    });
  };

  const addDryLog = (idx) => {
    const updated = [...rooms];
    updated[idx].dryLogs.push({ date: "", time: "", reading: "" });
    setRooms(updated);
  };

  const updateDryLog = (roomIdx, logIdx, field, value) => {
    const updated = [...rooms];
    updated[roomIdx].dryLogs[logIdx][field] = value;
    setRooms(updated);
  };

  const handlePhotoUpload = (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRooms((prev) => {
      const updated = [...prev];
      updated[idx].photo = URL.createObjectURL(file);
      return updated;
    });
  };

  /* =============================================
     PSYCHROMETRIC READINGS
  ============================================= */
  const [psychroReadings, setPsychroReadings] = useState([
    { date: "", time: "", temp: "", rh: "", gpp: "" },
  ]);

  const addReading = () =>
    setPsychroReadings([
      ...psychroReadings,
      { date: "", time: "", temp: "", rh: "", gpp: "" },
    ]);

  const updateReading = (idx, field, value) => {
    const updated = [...psychroReadings];
    updated[idx][field] = value;
    setPsychroReadings(updated);
  };

  /* =============================================
     SAVE / LOAD JOBS
  ============================================= */
  const saveJob = () => {
    if (!jobName) return alert("Enter a job name!");

    const newJob = {
      id: Date.now().toString(),
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

  const loadJob = (jobId) => {
    if (!jobId) return;
    const job = savedJobs.find((j) => j.id === jobId);
    if (!job) return;

    setJobName(job.jobName);
    setJobDetails(job.jobDetails || jobDetails);
    setInsured(job.insured || insured);
    setInsurance(job.insurance || insurance);
    setInspection(job.inspection || inspection);
    setTechHours(job.techHours || techHours);
    setRooms(job.rooms || rooms);
    setPsychroReadings(job.psychroReadings || psychroReadings);
    alert("Job Loaded!");
  };

  /* =============================================
     AI SUMMARY
  ============================================= */
  const [aiSummary, setAiSummary] = useState("");

  const handleGenerateSummary = async () => {
    try {
      const payload = {
        jobDetails,
        insured,
        insurance,
        inspection,
        techHours,
        rooms,
        psychroReadings,
      };
      const res = await axios.post(`${API_BASE}/api/generate-summary`, {
        job: payload,
      });
      setAiSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setAiSummary("Error connecting to backend.");
    }
  };

  /* =============================================
     RENDER
  ============================================= */
  return (
    <div className="app-root">
      {/* HEADER / BRANDING */}
      <header className="app-header no-print">
        <div className="header-left">
          <img
            src="/WaterCleanUpLogoFinal.png"
            className="company-logo"
            alt="Company Logo"
          />
          <div>
            <h1 className="app-title">Mitigation Supervisor Console</h1>
            <p className="app-subtitle">
              Professional mitigation documentation • Field tech friendly •
              Insurance ready
            </p>
          </div>
        </div>

        <div className="header-right">
          <input
            className="job-input"
            placeholder="Job Name / Reference"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
          />

          {savedJobs.length > 0 && (
            <select
              className="job-select"
              onChange={(e) => loadJob(e.target.value)}
              defaultValue=""
            >
              <option value="">Load Saved Job…</option>
              {savedJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.jobName || "Unnamed Job"} —{" "}
                  {new Date(job.timestamp).toLocaleDateString()}
                </option>
              ))}
            </select>
          )}

          <div className="header-buttons">
            <button className="btn" onClick={saveJob}>
              Save Job
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => window.print()}
            >
              Export Insurance PDF
            </button>
          </div>
        </div>
      </header>

      <main className="app-container">
        {/* INITIAL INSPECTION */}
        <section className="card">
          <div className="card-header">
            <h2>Initial Inspection</h2>
            <span className="card-tag">Scope & Findings</span>
          </div>

          <div className="grid-3 gap">
            <div className="field-group">
              <label>Inspector Name</label>
              <input
                value={inspection.inspector}
                onChange={(e) =>
                  setInspection({
                    ...inspection,
                    inspector: e.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Inspection Date</label>
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
            </div>
            <div className="field-group">
              <label>Loss Category (Cat 1, 2, 3)</label>
              <select
                value={jobDetails.lossType}
                onChange={(e) =>
                  setJobDetails({ ...jobDetails, lossType: e.target.value })
                }
              >
                <option value="">Select Category</option>
                <option value="Category 1">Category 1</option>
                <option value="Category 2">Category 2</option>
                <option value="Category 3">Category 3</option>
              </select>
            </div>
          </div>

          <div className="field-group">
            <label>Observations / Scope of Work</label>
            <textarea
              rows={4}
              placeholder="Summarize affected areas, damages, hazards, access issues, materials impacted, etc."
              value={inspection.observations}
              onChange={(e) =>
                setInspection({
                  ...inspection,
                  observations: e.target.value,
                })
              }
            />
          </div>

          <div className="field-group">
            <label>Inspection Checklist (select all that apply)</label>
            <div className="checklist-grid">
              {inspectionChecklistItems.map((item) => (
                <label key={item} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={inspection.checklist.includes(item)}
                    onChange={() => toggleInspectionItem(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* TECH HOURS */}
        <section className="card">
          <div className="card-header">
            <h2>Tech Hours Log</h2>
            <span className="card-tag">Labor Tracking</span>
          </div>

          <div className="table-like-header">
            <span>Date</span>
            <span>Time In</span>
            <span>Time Out</span>
            <span>Notes</span>
          </div>

          {techHours.map((entry, idx) => (
            <div className="grid-4 gap tech-row" key={idx}>
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
                placeholder="Crew, tasks, or notes"
                value={entry.notes}
                onChange={(e) =>
                  updateTechHour(idx, "notes", e.target.value)
                }
              />
            </div>
          ))}

          <button className="btn" onClick={addTechHour}>
            + Add Tech Entry
          </button>
        </section>

        {/* ROOMS & DRY LOGS */}
        <section className="card">
          <div className="card-header">
            <h2>Rooms & Dry Logs</h2>
            <span className="card-tag">Per-Room Documentation</span>
          </div>

          {rooms.map((room, idx) => (
            <div key={idx} className="room-box">
              <div className="grid-2 gap">
                <div className="field-group">
                  <label>Room Name</label>
                  <input
                    placeholder="Example: Master Bedroom, Kitchen"
                    value={room.name}
                    onChange={(e) =>
                      updateRoom(idx, "name", e.target.value)
                    }
                  />
                </div>
                <div className="field-group">
                  <label>Room Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(idx, e)}
                  />
                </div>
              </div>

              {room.photo && (
                <div className="room-photo-wrapper">
                  <img
                    src={room.photo}
                    className="room-photo"
                    alt="Room"
                  />
                </div>
              )}

              <div className="field-group">
                <label>Work Done / Narrative</label>
                <textarea
                  rows={3}
                  placeholder="Demo performed, equipment placed, materials removed, special considerations..."
                  value={room.narrative}
                  onChange={(e) =>
                    updateRoom(idx, "narrative", e.target.value)
                  }
                />
              </div>

              <div className="field-group">
                <label>Room Checklist</label>
                <div className="checklist-grid">
                  {roomChecklistItems.map((item) => (
                    <label key={item} className="checklist-item">
                      <input
                        type="checkbox"
                        checked={room.checklist.includes(item)}
                        onChange={() => toggleRoomChecklist(idx, item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label>Dry Log Readings</label>
                <div className="table-like-header small">
                  <span>Date</span>
                  <span>Time</span>
                  <span>Moisture Reading</span>
                </div>

                {room.dryLogs.map((log, logIdx) => (
                  <div key={logIdx} className="grid-3 gap">
                    <input
                      type="date"
                      value={log.date}
                      onChange={(e) =>
                        updateDryLog(idx, logIdx, "date", e.target.value)
                      }
                    />
                    <input
                      type="time"
                      value={log.time}
                      onChange={(e) =>
                        updateDryLog(idx, logIdx, "time", e.target.value)
                      }
                    />
                    <input
                      placeholder="% or meter reading"
                      value={log.reading}
                      onChange={(e) =>
                        updateDryLog(idx, logIdx, "reading", e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  className="btn btn-secondary"
                  onClick={() => addDryLog(idx)}
                  type="button"
                >
                  + Add Dry Log Row
                </button>
              </div>

              <hr className="room-divider" />
            </div>
          ))}

          <button className="btn" onClick={addRoom}>
            + Add Another Room
          </button>
        </section>

        {/* PSYCHROMETRIC TABLE */}
        <section className="card">
          <div className="card-header">
            <h2>Psychrometric Readings</h2>
            <span className="card-tag">Atmospheric Conditions</span>
          </div>

          <div className="table-like-header">
            <span>Date</span>
            <span>Time</span>
            <span>Temp (°F)</span>
            <span>RH (%)</span>
            <span>GPP</span>
          </div>

          {psychroReadings.map((row, idx) => (
            <div key={idx} className="grid-5 gap psychro-row">
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
                placeholder="Temp"
                value={row.temp}
                onChange={(e) =>
                  updateReading(idx, "temp", e.target.value)
                }
              />
              <input
                placeholder="RH"
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
        </section>

        {/* AI SUMMARY */}
        <section className="card">
          <div className="card-header">
            <h2>AI Insurance Summary</h2>
            <span className="card-tag">Narrative & Scope</span>
          </div>

          <button
            className="btn btn-primary no-print"
            onClick={handleGenerateSummary}
          >
            Generate Insurance Summary (AI)
          </button>

          {aiSummary && (
            <div className="ai-section">
              <h3>AI Output</h3>
              <p>{aiSummary}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
