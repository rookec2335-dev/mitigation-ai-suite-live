// src/App.js

import React, { useState } from "react";
import "./styles.css";
import WaterCleanUpLogoFinal from "./WaterCleanUpLogoFinal.png";

function App() {
  // ====== Initial Inspection ======
  const [initialInspection, setInitialInspection] = useState({
    date: "",
    inspector: "",
    observations: "",
  });

  // ====== Inspection Checklist ======
  const [inspectionChecklist, setInspectionChecklist] = useState({
    waterVisible: false,
    odorPresent: false,
    safetyHazards: false,
    structuralDamage: false,
    sewerBackup: false,
    electricalRisk: false,
    highMoisture: false,
    hvacAffected: false,
  });

  // ====== Job Details ======
  const [jobDetails, setJobDetails] = useState({
    company: "",
    jobNumber: "",
    jobType: "Standard",
    lossType: "",
  });

  // ====== Rooms ======
  const [rooms, setRooms] = useState([
    { name: "", photos: null, notes: "", dryLog: "" },
  ]);

  const addRoom = () => {
    setRooms([...rooms, { name: "", photos: null, notes: "", dryLog: "" }]);
  };

  // ====== Psychrometric Table ======
  const [psychrometrics, setPsychrometrics] = useState({
    outsideTemp: "",
    insideTemp: "",
    humidity: "",
    grains: "",
  });

  // ====== Generate AI Report (placeholder) ======
  const generateAIReport = () => {
    alert("AI Summary will be added next! 😎");
  };

  return (
    <div className="container">
      {/* Logo */}
      <img src={WaterCleanUpLogoFinal} alt="Company Logo" className="logo" />

      <h1>Mitigation Supervisor Console</h1>
      <p>Professional Insurance Format • Field Ready</p>

      {/* ================= INITIAL INSPECTION ================= */}
      <section className="card">
        <h2>Initial Inspection</h2>
        <input
          type="date"
          value={initialInspection.date}
          onChange={(e) =>
            setInitialInspection({ ...initialInspection, date: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Inspector Name"
          value={initialInspection.inspector}
          onChange={(e) =>
            setInitialInspection({
              ...initialInspection,
              inspector: e.target.value,
            })
          }
        />
        <textarea
          placeholder="Observations (water visible, odors, hazards, etc.)"
          value={initialInspection.observations}
          onChange={(e) =>
            setInitialInspection({
              ...initialInspection,
              observations: e.target.value,
            })
          }
        />

        {/* === INSPECTION CHECKLIST === */}
        <h3>Inspection Checklist (Select Any That Apply)</h3>
        {Object.keys(inspectionChecklist).map((item, i) => (
          <label key={i} className="checkbox-item">
            <input
              type="checkbox"
              checked={inspectionChecklist[item]}
              onChange={() =>
                setInspectionChecklist({
                  ...inspectionChecklist,
                  [item]: !inspectionChecklist[item],
                })
              }
            />
            {item.replace(/([A-Z])/g, " $1")}
          </label>
        ))}
      </section>

      {/* ================= JOB / LOSS DETAILS ================= */}
      <section className="card">
        <h2>Job / Loss Details</h2>
        <input
          type="text"
          placeholder="Company"
          value={jobDetails.company}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, company: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Job Number"
          value={jobDetails.jobNumber}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, jobNumber: e.target.value })
          }
        />

        <select
          value={jobDetails.jobType}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, jobType: e.target.value })
          }
        >
          <option>Standard</option>
          <option>Emergency Service</option>
          <option>After Hours</option>
        </select>

        {/* === NEW LOSS TYPE DROPDOWN === */}
        <select
          value={jobDetails.lossType}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, lossType: e.target.value })
          }
        >
          <option value="">Select Loss Type</option>
          <option value="Water Damage">Water Damage</option>
          <option value="Fire Damage">Fire Damage</option>
          <option value="Mold Remediation">Mold Remediation</option>
          <option value="Storm Damage">Storm Damage</option>
          <option value="Sewage Backup">Sewage Backup</option>
          <option value="CAT Loss">Catastrophic Loss (CAT)</option>
        </select>
      </section>

      {/* ================= ROOMS & PHOTOS ================= */}
      <section className="card">
        <h2>Rooms & Photos</h2>
        {rooms.map((room, index) => (
          <div key={index} className="room-card">
            <input
              type="text"
              placeholder="Room Name"
              value={room.name}
              onChange={(e) => {
                const updated = [...rooms];
                updated[index].name = e.target.value;
                setRooms(updated);
              }}
            />

            <input
              type="file"
              multiple
              onChange={(e) => {
                const updated = [...rooms];
                updated[index].photos = e.target.files;
                setRooms(updated);
              }}
            />

            <textarea
              placeholder="Narrative of work performed / damage"
              value={room.notes}
              onChange={(e) => {
                const updated = [...rooms];
                updated[index].notes = e.target.value;
                setRooms(updated);
              }}
            />

            {/* === DRY LOG INPUT === */}
            <textarea
              placeholder="Dry log: Day 1 %, Day 2 %, RH, Temp"
              value={room.dryLog}
              onChange={(e) => {
                const updated = [...rooms];
                updated[index].dryLog = e.target.value;
                setRooms(updated);
              }}
            />
          </div>
        ))}
        <button onClick={addRoom}>+ Add Room</button>
      </section>

      {/* ================= PSYCHROMETRIC DATA ================= */}
      <section className="card">
        <h2>Psychrometric Data</h2>
        <input
          type="text"
          placeholder="Outside Temp (°F)"
          value={psychrometrics.outsideTemp}
          onChange={(e) =>
            setPsychrometrics({
              ...psychrometrics,
              outsideTemp: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="Inside Temp (°F)"
          value={psychrometrics.insideTemp}
          onChange={(e) =>
            setPsychrometrics({
              ...psychrometrics,
              insideTemp: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="Relative Humidity (%)"
          value={psychrometrics.humidity}
          onChange={(e) =>
            setPsychrometrics({
              ...psychrometrics,
              humidity: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="Grains Per Lb"
          value={psychrometrics.grains}
          onChange={(e) =>
            setPsychrometrics({
              ...psychrometrics,
              grains: e.target.value,
            })
          }
        />
      </section>

      {/* ================= AI BUTTON ================= */}
      <button onClick={generateAIReport} className="generate-btn">
        Generate Insurance Summary (AI)
      </button>
    </div>
  );
}

export default App;
