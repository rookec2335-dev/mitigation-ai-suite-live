import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const API_BASE = process.env.REACT_APP_API_BASE || "https://mitigation-ai-server.onrender.com";

function App() {
  // =========================
  // LOAD SAVED JOBS
  // =========================
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobName, setJobName] = useState("");

  useEffect(() => {
    const jobs = JSON.parse(localStorage.getItem('mitigationJobs')) || [];
    setSavedJobs(jobs);
  }, []);

  const saveJob = () => {
    if (!jobName) return alert("Enter a job name first!");

    const jobData = {
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

    const updatedJobs = [...savedJobs, jobData];
    localStorage.setItem('mitigationJobs', JSON.stringify(updatedJobs));
    setSavedJobs(updatedJobs);
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

  // =========================
  // JOB & LOSS DETAILS
  // =========================
  const [jobDetails, setJobDetails] = useState({
    companyName: '',
    jobNumber: '',
    priority: 'Standard',
    technician: '',
    supervisor: '',
    dateOfLoss: '',
    inspectionDate: '',
    lossType: '',
    iicrcClass: '',
    sourceOfLoss: '',
  });

  const handleJobChange = (f, v) => setJobDetails((p) => ({ ...p, [f]: v }));

  // =========================
  // INSURED DETAILS
  // =========================
  const [insured, setInsured] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const handleInsuredChange = (f, v) => setInsured((p) => ({ ...p, [f]: v }));

  // =========================
  // INSURANCE DETAILS
  // =========================
  const [insurance, setInsurance] = useState({
    carrier: '',
    policyNumber: '',
    claimNumber: '',
    deductible: '',
    adjusterName: '',
    adjusterPhone: '',
    adjusterEmail: '',
    billingStatus: '',
  });
  const handleInsuranceChange = (f, v) => setInsurance((p) => ({ ...p, [f]: v }));

  // =========================
  // INITIAL INSPECTION
  // =========================
  const [inspection, setInspection] = useState({
    inspector: '',
    inspectionDate: '',
    observations: '',
    checklist: [],
  });

  const checklistItems = [
    'Standing Water Present',
    'Musty Odor',
    'Visible Mold',
    'Structural Damage',
    'Electrical Risk',
    'HVAC Impacted',
    'Safety Hazards',
    'Baseboards Removed',
    'Flooring Demolition Started',
  ];

  const toggleChecklist = (item) => {
    setInspection((prev) => ({
      ...prev,
      checklist: prev.checklist.includes(item)
        ? prev.checklist.filter((i) => i !== item)
        : [...prev.checklist, item],
    }));
  };

  // =========================
  // TECH HOURS
  // =========================
  const [techHours, setTechHours] = useState([{ date: '', in: '', out: '', notes: '' }]);

  const addTechHour = () => {
    setTechHours([...techHours, { date: '', in: '', out: '', notes: '' }]);
  };

  const updateTechHour = (idx, field, value) => {
    const newHours = [...techHours];
    newHours[idx][field] = value;
    setTechHours(newHours);
  };

  // =========================
  // ROOMS & DRY LOGS
  // =========================
  const [rooms, setRooms] = useState([
    { name: '', narrative: '', dryLogs: [], photo: null }
  ]);

  const addRoom = () => {
    setRooms([...rooms, { name: '', narrative: '', dryLogs: [], photo: null }]);
  };

  const addDryLog = (idx) => {
    const updated = [...rooms];
    updated[idx].dryLogs.push({ date: '', time: '', reading: '' });
    setRooms(updated);
  };

  const updateRoom = (idx, field, value) => {
    const updated = [...rooms];
    updated[idx][field] = value;
    setRooms(updated);
  };

  const handlePhotoUpload = (idx, event) => {
    const file = event.target.files[0];
    const updated = [...rooms];
    updated[idx].photo = URL.createObjectURL(file);
    setRooms(updated);
  };

  // =========================
  // PSYCHROMETRIC TABLE
  // =========================
  const [psychroReadings, setPsychroReadings] = useState([
    { date: '', time: '', temp: '', rh: '', gpp: '' }
  ]);

  const addReading = () => {
    setPsychroReadings([...psychroReadings, { date: '', time: '', temp: '', rh: '', gpp: '' }]);
  };

  const updateReading = (idx, field, value) => {
    const updated = [...psychroReadings];
    updated[idx][field] = value;
    setPsychroReadings(updated);
  };

  // =========================
  // AI SUMMARY CALL
  // =========================
  const [aiSummary, setAiSummary] = useState('');
  const handleGenerateSummary = async () => {
    try {
      const jobPayload = {
        jobDetails,
        insured,
        insurance,
        inspection,
        techHours,
        rooms,
        psychroReadings,
      };
      const res = await axios.post(`${API_BASE}/api/generate-summary`, { job: jobPayload });
      setAiSummary(res.data.summary);
    } catch {
      setAiSummary('Error – check server.');
    }
  };

  // =========================
  // RENDER UI
  // =========================
  return (
    <div className="container">
      <header>
        <img src="/WaterCleanUpLogoFinal.png" className="company-logo" alt="Logo"/>
        <h1>Mitigation Supervisor Console</h1>
        <p>Professional Documentation • Insurance Ready • Tech Friendly</p>
        <button className="primary-btn" onClick={() => window.print()}>Export PDF</button>
      </header>

      {/* JOB SAVE / LOAD */}
      <section className="card">
        <h2>Save or Load Job</h2>
        <input
          placeholder="Job Name/Address"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
        />
        <button onClick={saveJob}>💾 Save Job</button>
        {savedJobs.length > 0 && (
          <select onChange={(e) => loadJob(JSON.parse(e.target.value))}>
            <option>Select saved job...</option>
            {savedJobs.map((job, i) => (
              <option key={i} value={JSON.stringify(job)}>
                {job.jobName} – {new Date(job.timestamp).toLocaleDateString()}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* JOB & LOSS SECTION */}
      <section className="card">
        <h2>Job & Loss Details</h2>
        <div className="grid-3">
          <input placeholder="Company Name" onChange={(e) => handleJobChange('companyName', e.target.value)} value={jobDetails.companyName}/>
          <input placeholder="Job #" onChange={(e) => handleJobChange('jobNumber', e.target.value)} value={jobDetails.jobNumber}/>
          <select onChange={(e) => handleJobChange('priority', e.target.value)} value={jobDetails.priority}>
            <option>Standard</option>
            <option>Emergency</option>
            <option>After Hours</option>
            <option>High Priority</option>
          </select>
        </div>
        <div className="grid-3">
          <input placeholder="Technician" onChange={(e) => handleJobChange('technician', e.target.value)} value={jobDetails.technician}/>
          <input placeholder="Supervisor" onChange={(e) => handleJobChange('supervisor', e.target.value)} value={jobDetails.supervisor}/>
          <input type="date" onChange={(e) => handleJobChange('inspectionDate', e.target.value)} value={jobDetails.inspectionDate}/>
        </div>
        <textarea placeholder="Source of Loss" onChange={(e) => handleJobChange('sourceOfLoss', e.target.value)} value={jobDetails.sourceOfLoss}/>
      </section>

      {/* INITIAL INSPECTION */}
      <section className="card">
        <h2>Initial Inspection</h2>
        <input placeholder="Inspector" onChange={(e) => setInspection({ ...inspection, inspector: e.target.value })} value={inspection.inspector}/>
        <input type="date" onChange={(e) => setInspection({ ...inspection, inspectionDate: e.target.value })} value={inspection.inspectionDate}/>
        <textarea placeholder="Observations" onChange={(e) => setInspection({ ...inspection, observations: e.target.value })} value={inspection.observations}/>
        <div className="checklist-grid">
          {checklistItems.map((item) => (
            <label key={item}><input type="checkbox" onChange={() => toggleChecklist(item)}/>{item}</label>
          ))}
        </div>
      </section>

      {/* TECH HOURS */}
      <section className="card">
        <h2>Tech Hours</h2>
        {techHours.map((hour, idx) => (
          <div className="tech-card" key={idx}>
            <input type="date" onChange={(e) => updateTechHour(idx, 'date', e.target.value)} value={hour.date}/>
            <input type="time" onChange={(e) => updateTechHour(idx, 'in', e.target.value)} value={hour.in}/>
            <input type="time" onChange={(e) => updateTechHour(idx, 'out', e.target.value)} value={hour.out}/>
            <textarea placeholder="Notes" onChange={(e) => updateTechHour(idx, 'notes', e.target.value)} value={hour.notes}/>
          </div>
        ))}
        <button onClick={addTechHour}>+ Add Hour</button>
      </section>

      {/* ROOMS */}
      <section className="card">
        <h2>Rooms & Dry Logs</h2>
        {rooms.map((room, idx) => (
          <div key={idx} className="room-box">
            <input placeholder="Room Name" value={room.name} onChange={(e) => updateRoom(idx, 'name', e.target.value)}/>
            <textarea placeholder="Narrative of work done" value={room.narrative} onChange={(e) => updateRoom(idx, 'narrative', e.target.value)}/>
            <button onClick={() => addDryLog(idx)}>+ Add Dry Log</button>
            {room.dryLogs.map((log, i) => (
              <div key={i} className="grid-3">
                <input type="date" onChange={(e) => { room.dryLogs[i].date = e.target.value; setRooms([...rooms]); }}/>
                <input type="time" onChange={(e) => { room.dryLogs[i].time = e.target.value; setRooms([...rooms]); }}/>
                <input placeholder="Reading" onChange={(e) => { room.dryLogs[i].reading = e.target.value; setRooms([...rooms]); }}/>
              </div>
            ))}
            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(idx, e)}/>
            {room.photo && <img src={room.photo} className="room-photo" alt="Room"/>}
          </div>
        ))}
        <button onClick={addRoom}>+ Add Room</button>
      </section>

      {/* PSYCHROMETRICS */}
      <section className="card">
        <h2>Psychrometric Readings</h2>
        {psychroReadings.map((r, i) => (
          <div key={i} className="psychro-row">
            <input type="date" value={r.date} onChange={(e) => updateReading(i, 'date', e.target.value)}/>
            <input type="time" value={r.time} onChange={(e) => updateReading(i, 'time', e.target.value)}/>
            <input placeholder="Temp (°F)" value={r.temp} onChange={(e) => updateReading(i, 'temp', e.target.value)}/>
            <input placeholder="RH (%)" value={r.rh} onChange={(e) => updateReading(i, 'rh', e.target.value)}/>
            <input placeholder="GPP" value={r.gpp} onChange={(e) => updateReading(i, 'gpp', e.target.value)}/>
          </div>
        ))}
        <button onClick={addReading}>+ Add Reading</button>
      </section>

      {/* AI SUMMARY */}
      <section className="card">
        <h2>AI Insurance Summary</h2>
        <button className="primary-btn" onClick={handleGenerateSummary}>Generate AI Summary</button>
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
