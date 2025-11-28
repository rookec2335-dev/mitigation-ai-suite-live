import React, { useState, useEffect } from 'react';
import './styles.css';

function App() {
  // =========================
  // LOAD SAVED JOBS ON START
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
    setInspection(job.inspection);
    setTechHours(job.techHours);
    setRooms(job.rooms);
    setPsychroReadings(job.psychroReadings);
    alert("Job Loaded!");
  };

  // =========================
  // INITIAL INSPECTION
  // =========================
  const [inspection, setInspection] = useState({
    inspector: '',
    inspectionDate: '',
    observations: '',
    checklist: []
  });

  const checklistItems = [
    'Water Visible', 'Odor Present', 'Safety Hazards',
    'Structural Damage', 'Electrical Risk', 'HVAC Affected'
  ];

  const toggleChecklist = (item) => {
    setInspection((prev) => ({
      ...prev,
      checklist: prev.checklist.includes(item)
        ? prev.checklist.filter(i => i !== item)
        : [...prev.checklist, item]
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
  // ROOMS
  // =========================
  const [rooms, setRooms] = useState([{ name: '', narrative: '', dryLog: '' }]);

  const addRoom = () => setRooms([...rooms, { name: '', narrative: '', dryLog: '' }]);

  const updateRoom = (idx, field, value) => {
    const updated = [...rooms];
    updated[idx][field] = value;
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
    const newReadings = [...psychroReadings];
    newReadings[idx][field] = value;
    setPsychroReadings(newReadings);
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="container">
      <header>
        <img src="/WaterCleanUpLogoFinal.png" className="company-logo" alt="Logo"/>
        <h1>Mitigation Supervisor Console</h1>
        <p>Insurance Ready • Tech Friendly</p>
      </header>

      {/* SAVE / LOAD JOBS */}
      <section className="card">
        <h2>Save or Load Job</h2>
        <input
          type="text"
          placeholder="Job Name / Address"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
        />
        <button onClick={saveJob}>💾 Save Job</button>

        {savedJobs.length > 0 && (
          <>
            <h3>Load Previous Job</h3>
            <select onChange={(e) => loadJob(JSON.parse(e.target.value))}>
              <option value="">Select a job...</option>
              {savedJobs.map((job, i) => (
                <option key={i} value={JSON.stringify(job)}>
                  {job.jobName} — {new Date(job.timestamp).toLocaleDateString()}
                </option>
              ))}
            </select>
          </>
        )}
      </section>

      {/* INSPECTION SECTION */}
      <section className="card">
        <h2>Initial Inspection</h2>
        <input
          type="text"
          placeholder="Inspector Name"
          value={inspection.inspector}
          onChange={(e) => setInspection({ ...inspection, inspector: e.target.value })}
        />
        <input
          type="date"
          value={inspection.inspectionDate}
          onChange={(e) => setInspection({ ...inspection, inspectionDate: e.target.value })}
        />
        <textarea
          placeholder="Observations"
          value={inspection.observations}
          onChange={(e) => setInspection({ ...inspection, observations: e.target.value })}
        />
        <div className="checklist-grid">
          {checklistItems.map((item) => (
            <label key={item} className="check-item">
              <input
                type="checkbox"
                checked={inspection.checklist.includes(item)}
                onChange={() => toggleChecklist(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </section>

      {/* TECH HOURS */}
      <section className="card">
        <h2>Tech Hours</h2>
        {techHours.map((hour, i) => (
          <div key={i} className="tech-card">
            <input type="date" value={hour.date} onChange={(e) => updateTechHour(i, 'date', e.target.value)} />
            <input type="time" value={hour.in} onChange={(e) => updateTechHour(i, 'in', e.target.value)} />
            <input type="time" value={hour.out} onChange={(e) => updateTechHour(i, 'out', e.target.value)} />
            <textarea placeholder="Notes" value={hour.notes} onChange={(e) => updateTechHour(i, 'notes', e.target.value)} />
          </div>
        ))}
        <button onClick={addTechHour}>+ Add Tech Hour</button>
      </section>

      {/* PSYCHROMETRIC TABLE */}
      <section className="card">
        <h2>Psychrometric Readings</h2>
        {psychroReadings.map((r, i) => (
          <div key={i} className="psychro-row">
            <input type="date" value={r.date} onChange={(e) => updateReading(i, 'date', e.target.value)} />
            <input type="time" value={r.time} onChange={(e) => updateReading(i, 'time', e.target.value)} />
            <input type="text" placeholder="Temp (°F)" value={r.temp} onChange={(e) => updateReading(i, 'temp', e.target.value)} />
            <input type="text" placeholder="RH (%)" value={r.rh} onChange={(e) => updateReading(i, 'rh', e.target.value)} />
            <input type="text" placeholder="GPP" value={r.gpp} onChange={(e) => updateReading(i, 'gpp', e.target.value)} />
          </div>
        ))}
        <button onClick={addReading}>+ Add Reading</button>
      </section>
    </div>
  );
}

export default App;
