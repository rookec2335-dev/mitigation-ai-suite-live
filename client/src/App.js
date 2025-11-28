// src/App.js

import React, { useState } from "react";
import "./styles.css";
import WaterCleanUpLogoFinal from "./WaterCleanUpLogoFinal.png";

function App() {
  // -------- Initial Inspection --------
  const [initialInspection, setInitialInspection] = useState({
    date: "",
    inspector: "",
    observations: "",
  });

  // -------- New Checklist for Inspection --------
  const [inspectionChecklist, setInspectionChecklist] = useState({
    waterVisible: false,
    odorPresent: false,
    safetyHazards: false,
    structuralDamage: false,
    electricalRisk: false,
    sewerBackup: false,
    highMoisture: false,
    hvacAffected: false,
  });

  // -------- Job / Loss Details --------
  const [jobDetails, setJobDetails] = useState({
    company: "",
    jobNumber: "",
    jobType: "Standard",
    lossType: "", // NEW DROPDOWN FIELD
  });

  // -------- Rooms --------
  const [rooms, setRooms] = useState([
    { name: "", photos: null, notes: "" },
  ]);

  const addRoom = () => {
    setRooms([...rooms, { name: "", photos: null, notes: "" }]);
  };

  return (
    <div className="container">
      {/* Company Logo */}
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
          placeholder="mm/dd/yyyy"
        />
        <input
          type="text"
          value={initialInspection.inspector}
          onChange={(e) =>
            setInitialInspection({
              ...initialInspection,
              inspector: e.target.value,
            })
          }
          placeholder="Inspector Name"
        />
        <textarea
          value={initialInspection.observations}
          onChange={(e) =>
            setInitialInspection({
              ...initialInspection,
              observations: e.target.value,
            })
          }
          placeholder="Observations (water visible, odors, hazards, etc.)"
        />

        {/* -------- CHECKLIST -------- */}
        <h3>Inspection Checklist (Select All That Apply)</h3>
        {Object.keys(inspectionChecklist).map((item) => (
          <label key={item} className="checkbox-item">
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
            {item.replace(/([A-Z])/g, " $1")} {/* Format text nicely */}
          </label>
        ))}
      </section>

      {/* ================= JOB / LOSS DETAILS ================= */}
      <section className="card">
        <h2>Job / Loss Details</h2>
        <input
          type="text"
          value={jobDetails.company}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, company: e.target.value })
          }
          placeholder="Company"
        />
        <input
          type="text"
          value={jobDetails.jobNumber}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, jobNumber: e.target.value })
          }
          placeholder="Job Number"
        />

        <select
          value={jobDetails.jobType}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, jobType: e.target.value })
          }
        >
          <option value="Standard">Standard</option>
          <option value="Emergency Service">Emergency Service</option>
          <option value="After Hours">After Hours</option>
        </select>

        {/* -------- NEW LOSS TYPE DROPDOWN -------- */}
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
          <option value="Roof Leak">Roof / Leak Damage</option>
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
                const newRooms = [...rooms];
                newRooms[index].name = e.target.value;
                setRooms(newRooms);
              }}
            />

            <input
              type="file"
              multiple
              onChange={(e) => {
                const newRooms = [...rooms];
                newRooms[index].photos = e.target.files;
                setRooms(newRooms);
              }}
            />

            <textarea
              placeholder="Narrative of work performed / damage"
              onChange={(e) => {
                const newRooms = [...rooms];
                newRooms[index].notes = e.target.value;
                setRooms(newRooms);
              }}
            />
          </div>
        ))}
        <button onClick={addRoom}>+ Add Room</button>
      </section>

      <button className="generate-btn">Generate Insurance Summary (AI)</button>
    </div>
  );
}

export default App;
