import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const API_BASE = process.env.REACT_APP_API_BASE || "https://mitigation-ai-server.onrender.com";

function App() {
  /* =========================
     LOAD SAVED JOBS
  ========================= */
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

  /* =========================
     INITIAL STATES
  ========================= */
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

  const [insured, setInsured] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

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

  const [inspection, setInspection] = useState({
    inspector: '',
    inspectionDate: '',
    observations: '',
    checklist: [],
  });

  const inspectionChecklistItems = [
    'Standing Water Present',
    'Musty Odor',
    'Visible Mold',
    'Structural Damage',
    'Electrical Risk',
    'Baseboards Removed',
    'Flooring Demo Done',
    'Safety Concerns',
  ];

  const toggleInspectionItem = (item) => {
    setInspection((prev) => ({
      ...prev,
      checklist: prev.checklist.includes(item)
        ? prev.checklist.filter((i) => i !== item)
        : [...prev.checklist, item],
    }));
  };

  /* ============= TECH HOURS ============= */
  const [techHours, setTechHours] = useState([{ date: '', in: '', out: '', notes: '' }]);
  const addTechHour = () => setTechHours([...techHours, { date: '', in: '', out: '', notes: '' }]);
  const updateTechHour = (idx, field, value) => {
    const updated = [...techHours];
    updated[idx][field] = value;
    setTechHours(updated);
  };

  /* ============= ROOMS (UPDATED) ============= */
  const roomChecklistItems = [
    'Baseboards Removed',
    'Carpet Pulled',
    'Flooring Removed',
    'Walls Cut (2ft/4ft)',
    'Containment Setup',
    'Dehumidifier Used',
    'Air Movers Installed',
    'HEPA Filtration Setup',
  ];

  const [rooms, setRooms] = useState([
    { name: '', narrative: '', dryLogs: [], photo: null, checklist: [] }
  ]);

  const addRoom = () => {
    setRooms([...rooms, { name: '', narrative: '', dryLogs: [], photo: null, checklist: [] }]);
  };

  const updateRoom = (idx, field, value) => {
    const updated = [...rooms];
    updated[idx][field] = value;
    setRooms(updated);
  };

  const toggleRoomChecklist = (roomIdx, item) => {
    const updated = [...rooms];
    const checklist = updated[roomIdx].checklist;

    updated[roomIdx].checklist = checklist.includes(item)
      ? checklist.filter((i) => i !== item)
      : [...checklist, item];

    setRooms(updated);
  };

  const addDryLog = (idx) => {
    const updated = [...rooms];
    updated[idx].dryLogs.push({ date: '', time: '', reading: '' });
    setRooms(updated);
  };

  const handlePhotoUpload = (idx, e) => {
    const updated = [...rooms];
    updated[idx].photo = URL.createObjectURL(e.target.files[0]);
    setRooms(updated);
  };

  /* ============= PSYCHROMETRIC TABLE ============= */
  const [psychroReadings, setPsychroReadings] = useState([
    { date: '', time: '', temp: '', rh: '', gpp: '' }
  ]);
  const addReading = () => setPsychroReadings([...psychroReadings, { date: '', time: '', temp: '', rh: '', gpp: '' }]);
  const updateReading = (idx, field, value) => {
    const updated = [...psychroReadings];
    updated[idx][field] = value;
    setPsychroReadings(updated);
  };

  /* ============= AI SUMMARY ============= */
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
    } catch (err) {
      setAiSummary('Error – check server / API key.');
    }
  };

  /* ============= RENDER ============= */
  return (
    <div className="container">
      <header>
        <img src="/WaterCleanUpLogoFinal.png" className="company-logo" alt="Logo"/>
        <h1>Mitigation Supervisor Console</h1>
        <button className="primary-btn" onClick={() => window.print()}>Export PDF</button>
      </header>

      {/* ROOMS SECTION (UPDATED) */}
      <section className="card">
        <h2>Rooms & Dry Logs</h2>
        {rooms.map((room, idx) => (
          <div key={idx} className="room-box">
            <input placeholder="Room Name" value={room.name}
              onChange={(e) => updateRoom(idx, 'name', e.target.value)}
            />

            <textarea placeholder="Narrative of work done"
              value={room.narrative}
              onChange={(e) => updateRoom(idx, 'narrative', e.target.value)}
            />

            <h4>Room Checklist:</h4>
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

            <button onClick={() => addDryLog(idx)}>+ Add Dry Log</button>
            {room.dryLogs.map((log, i) => (
              <div key={i} className="grid-3">
                <input type="date" onChange={(e) => { room.dryLogs[i].date = e.target.value; setRooms([...rooms]); }}/>
                <input type="time" onChange={(e) => { room.dryLogs[i].time = e.target.value; setRooms([...rooms]); }}/>
                <input placeholder="Reading" onChange={(e) => { room.dryLogs[i].reading = e.target.value; setRooms([...rooms]); }}/>
              </div>
            ))}

            <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(idx, e)} />
            {room.photo && <img src={room.photo} className="room-photo" alt="Room"/>}
          </div>
        ))}
        <button onClick={addRoom}>+ Add Room</button>
      </section>

      {/* AI SECTION */}
      <section className="card">
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
