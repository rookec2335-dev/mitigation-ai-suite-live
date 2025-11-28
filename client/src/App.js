// client/src/App.js

import React, { useState } from "react";
import "./styles.css";
import logo from "./WaterCleanUpLogoFinal.png";

function App() {
  // ====================== STATE ======================
  const [emergency, setEmergency] = useState({
    callTime: "",
    callerName: "",
    phone: "",
    address: "",
    issue: "",
  });

  const [inspection, setInspection] = useState({
    date: "",
    inspector: "",
    observations: "",
  });

  const [jobDetails, setJobDetails] = useState({
    company: "",
    jobNumber: "",
    lossType: "Standard",
    lossCategory: "",
  });

  const [rooms, setRooms] = useState([
    { name: "", photos: [], narrative: "", dryLogs: "" },
  ]);

  const [techHours, setTechHours] = useState([{ tech: "", hours: "" }]);
  const [adjusterNotes, setAdjusterNotes] = useState("");

  const [psychro, setPsychro] = useState({
    outsideTemp: "",
    insideTemp: "",
    rh: "",
    grains: "",
  });

  const [scopeOfWork, setScopeOfWork] = useState({
    baseboardRemoval: false,
    flooringRemoval: false,
    drywallCut: false,
    dehumidifiers: false,
    airMovers: false,
    containment: false,
  });

  // ====================== HANDLERS ======================
  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms([...rooms, { name: "", photos: [], narrative: "", dryLogs: "" }]);
  };

  const addTechHour = () => {
    setTechHours([...techHours, { tech: "", hours: "" }]);
  };

  const generateInsuranceSummary = () => {
    alert("AI Summary & PDF Export Coming in Backend Phase!");
  };

  // ====================== RETURN UI ======================
  return (
    <div className="app-container">

      {/* HEADER */}
      <header className="header">
        <img src={logo} alt="Company Logo" className="logo" />
        <h1>Mitigation Supervisor Console</h1>
        <p>Professional Insurance Format • Field Tech Ready</p>
      </header>

      {/* ================== EMERGENCY INTAKE ================== */}
      <section className="card">
        <h2>📍 Emergency Call Intake</h2>
        <input
          type="datetime-local"
          placeholder="Time of Call"
          value={emergency.callTime}
          onChange={(e) => setEmergency({ ...emergency, callTime: e.target.value })}
        />
        <input
          type="text"
          placeholder="Caller Name"
          value={emergency.callerName}
          onChange={(e) => setEmergency({ ...emergency, callerName: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={emergency.phone}
          onChange={(e) => setEmergency({ ...emergency, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Property Address"
          value={emergency.address}
          onChange={(e) => setEmergency({ ...emergency, address: e.target.value })}
        />
        <textarea
          placeholder="Reported Issue (Example: burst pipe in ceiling)"
          value={emergency.issue}
          onChange={(e) => setEmergency({ ...emergency, issue: e.target.value })}
        />
      </section>

      {/* ================== INITIAL INSPECTION ================== */}
      <section className="card">
        <h2>Initial Inspection</h2>
        <input
          type="date"
          value={inspection.date}
          onChange={(e) => setInspection({ ...inspection, date: e.target.value })}
        />
        <input
          type="text"
          placeholder="Inspector Name"
          value={inspection.inspector}
          onChange={(e) => setInspection({ ...inspection, inspector: e.target.value })}
        />
        <textarea
          placeholder="Observations (water visible, hazards, odors, etc.)"
          value={inspection.observations}
          onChange={(e) => setInspection({ ...inspection, observations: e.target.value })}
        />
      </section>

      {/* ================== SCOPE OF WORK ================== */}
      <section className="card">
        <h2>Scope of Work (Assist)</h2>
        {Object.keys(scopeOfWork).map((item) => (
          <label key={item} className="checkbox-item">
            <input
              type="checkbox"
              checked={scopeOfWork[item]}
              onChange={() => setScopeOfWork({ ...scopeOfWork, [item]: !scopeOfWork[item] })}
            />
            {item.replace(/([A-Z])/g, " $1")}
          </label>
        ))}
      </section>

      {/* ================== JOB DETAILS ================== */}
      <section className="card">
        <h2>Job / Loss Details</h2>
        <input
          type="text"
          placeholder="Company"
          value={jobDetails.company}
          onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
        />
        <input
          type="text"
          placeholder="Job Number"
          value={jobDetails.jobNumber}
          onChange={(e) => setJobDetails({ ...jobDetails, jobNumber: e.target.value })}
        />
        <select
          value={jobDetails.lossType}
          onChange={(e) => setJobDetails({ ...jobDetails, lossType: e.target.value })}
        >
          <option>Standard</option>
          <option>Water Damage</option>
          <option>Fire Damage</option>
        </select>
        <input
          type="text"
          placeholder="Loss Category (Cat 1, 2, or 3)"
          value={jobDetails.lossCategory}
          onChange={(e) => setJobDetails({ ...jobDetails, lossCategory: e.target.value })}
        />
      </section>

      {/* ================== ROOMS ================== */}
      <section className="card">
        <h2>Rooms & Photos</h2>
        {rooms.map((room, i) => (
          <div key={i} className="room-section">
            <input
              type="text"
              placeholder="Room Name"
              value={room.name}
              onChange={(e) => handleRoomChange(i, "name", e.target.value)}
            />
            <input
              type="file"
              multiple
              onChange={(e) => handleRoomChange(i, "photos", e.target.files)}
            />
            <textarea
              placeholder="Narrative (demo, removed baseboards, flooring…)"
              value={room.narrative}
              onChange={(e) => handleRoomChange(i, "narrative", e.target.value)}
            />
            <textarea
              placeholder="Dry Logs (Day 1-4 moisture %, RH, Temp)"
              value={room.dryLogs}
              onChange={(e) => handleRoomChange(i, "dryLogs", e.target.value)}
            />
          </div>
        ))}
        <button className="add-btn" onClick={addRoom}>+ Add Room</button>
      </section>

      {/* ================== TECH HOURS ================== */}
      <section className="card">
        <h2>Tech Hours</h2>
        {techHours.map((t, i) => (
          <div key={i} className="tech-row">
            <input
              type="text"
              placeholder="Tech Name"
              value={t.tech}
              onChange={(e) => {
                const copy = [...techHours];
                copy[i].tech = e.target.value;
                setTechHours(copy);
              }}
            />
            <input
              type="number"
              placeholder="Hours"
              value={t.hours}
              onChange={(e) => {
                const copy = [...techHours];
                copy[i].hours = e.target.value;
                setTechHours(copy);
              }}
            />
          </div>
        ))}
        <button className="add-btn" onClick={addTechHour}>+ Add Tech Hour</button>
      </section>

      {/* ================== PSYCHROMETRIC TABLE ================== */}
      <section className="card">
        <h2>Psychrometric Table</h2>
        <input type="number" placeholder="Outside Temp (°F)" value={psychro.outsideTemp} onChange={(e) => setPsychro({ ...psychro, outsideTemp: e.target.value })} />
        <input type="number" placeholder="Inside Temp (°F)" value={psychro.insideTemp} onChange={(e) => setPsychro({ ...psychro, insideTemp: e.target.value })} />
        <input type="number" placeholder="Relative Humidity (%)" value={psychro.rh} onChange={(e) => setPsychro({ ...psychro, rh: e.target.value })} />
        <input type="number" placeholder="Grains Per Pound" value={psychro.grains} onChange={(e) => setPsychro({ ...psychro, grains: e.target.value })} />
      </section>

      {/* ================== ADJUSTER NOTES ================== */}
      <section className="card">
        <h2>Adjuster Notes</h2>
        <textarea
          placeholder="Adjuster comments or special instructions"
          value={adjusterNotes}
          onChange={(e) => setAdjusterNotes(e.target.value)}
        />
      </section>

      <button className="generate-btn" onClick={generateInsuranceSummary}>
        Generate Insurance Summary (AI)
      </button>

      {/* FOOTER */}
      <footer className="footer">© {new Date().getFullYear()} - RooterPlus Water Cleanup</footer>
    </div>
  );
}

export default App;
