import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

const API_BASE = process.env.REACT_APP_API_BASE || "https://mitigation-ai-server.onrender.com";

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
  const [techHours, setTechHours] = useState([{ date: "", in: "", out: "", notes: "" }]);

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

  const [rooms, setRooms] = useState([{ name: "", narrative: "", dryLogs: [], photo: null, checklist: [] }]);

  const addRoom = () => {
    setRooms([...rooms, { name: "", narrative: "", dryLogs: [], photo: null, checklist: [] }]);
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

  const handlePhotoUpload = (idx, e) => {
    setRooms((prev) => {
      const updated = [...prev];
      updated[idx].photo = URL.createObjectURL(e.target.files[0]);
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
      const res = await axios.post(`${API_BASE}/api/generate-summary`, { job: payload });
      setAiSummary(res.data.summary);
    } catch (err) {
      setAiSummary("Error connecting to backend.");
    }
  };

  /* =============================================
     RENDER
  ============================================= */
  return (
    <div className="container">
      <header className="header-row">
        <img src="/WaterCleanUpLogoFinal.png" className="company-logo" alt="Logo" />
        <h1>Mitigation Supervisor Console</h1>

        <input
          className="job-input"
          placeholder="Job Name"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
        />

        <div>
          <button className="btn" onClick={saveJob}>Save Job</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Export PDF</button>
        </div>
      </header>

      <section className="card">
        <h2>Initial Inspection</h2>
        <input placeholder="Inspector Name"
          value={inspection.inspector}
          onChange={(e) => setInspection({ ...inspection, inspector: e.target.value })}
        />
        <input type="date" value={inspection.inspectionDate}
          onChange={(e) => setInspection({ ...inspection, inspectionDate: e.target.value })}
        />
        <textarea placeholder="Observations / Scope of Work"
          value={inspection.observations}
          onChange={(e) => setInspection({ ...inspection, observations: e.target.value })}
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

      <section className="card">
        <h2>Tech Hours</h2>
        {techHours.map((entry, idx) => (
          <div className="grid-4" key={idx}>
            <input type="date" value={entry.date} onChange={(e) => updateTechHour(idx, "date", e.target.value)} />
            <input type="time" value={entry.in} onChange={(e) => updateTechHour(idx, "in", e.target.value)} />
            <input type="time" value={entry.out} onChange={(e) => updateTechHour(idx, "out", e.target.value)} />
            <input placeholder="Notes" value={entry.notes} onChange={(e) => updateTechHour(idx, "notes", e.target.value)} />
          </div>
        ))}
        <button className="btn" onClick={addTechHour}>+ Add Entry</button>
      </section>

      <section className="card">
        <h2>Rooms & Dry Logs</h2>
        {rooms.map((room, idx) => (
          <div key={idx} className="room-box">
            <input placeholder="Room Name" value={room.name}
              onChange={(e) => updateRoom(idx, "name", e.target.value)} />
            <textarea placeholder="Work Done / Narrative"
              value={room.narrative}
              onChange={(e) => updateRoom(idx, "narrative", e.target.value)}
            />
            <h4>Checklist</h4>
            <div className="checklist-grid">
              {roomChecklistItems.map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={room.checklist.includes(item)}
                    onChange={() => toggleRoomChecklist(idx, item)}
                  />
                  {item}
                </label>
              ))}
            </div>
            <button className="btn" onClick={() => addDryLog(idx)}>+ Add Dry Log</button>
            {room.dryLogs.map((log, i) => (
              <div key={i} className="grid-3">
                <input type="date" />
                <input type="time" />
                <input placeholder="Moisture Reading" />
              </div>
            ))}
            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(idx, e)} />
            {room.photo && <img src={room.photo} className="room-photo" alt="Room" />}
          </div>
        ))}
        <button className="btn" onClick={addRoom}>+ Add Room</button>
      </section>

      <section className="card">
        <h2>Psychrometric Readings</h2>
        {psychroReadings.map((row, idx) => (
          <div key={idx} className="grid-5">
            <input type="date" onChange={(e) => updateReading(idx, "date", e.target.value)} />
            <input type="time" onChange={(e) => updateReading(idx, "time", e.target.value)} />
            <input placeholder="Temp" onChange={(e) => updateReading(idx, "temp", e.target.value)} />
            <input placeholder="RH" onChange={(e) => updateReading(idx, "rh", e.target.value)} />
            <input placeholder="GPP" onChange={(e) => updateReading(idx, "gpp", e.target.value)} />
          </div>
        ))}
        <button className="btn" onClick={addReading}>+ Add Reading</button>
      </section>

      <section className="card">
        <button className="btn btn-primary" onClick={handleGenerateSummary}>
          Generate AI Summary
        </button>
        {aiSummary && (
          <div className="ai-section">
            <h3>AI Output</h3>
            <p>{aiSummary}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
