// client/src/App.js

import React, { useState } from "react";
import "./styles.css";
import logo from "./WaterCleanUpLogoFinal.png"; // MUST match filename EXACTLY

function App() {
  // ================= STATE =================
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

  const [psychro, setPsychro] = useState({
    outsideTemp: "",
    insideTemp: "",
    rh: "",
    grains: "",
  });

  // ================= HANDLERS =================
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
    alert("AI Backend coming next — front end looks good now!");
  };

  // ================= RENDER =================
  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <img src={logo} alt="Company Logo" className="logo" />
        <h1>Mitigation Supervisor Console</h1>
        <p>Professional Insurance Format • Field Ready</p>
      </header>

      {/* ================= INITIAL INSPECTION ================= */}
      <section className="card">
        <h2>Initial Inspection</h2>
        <input
          type="date"
          placeholder="mm/dd/yyyy"
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
          onChange={(e) =>
            setInspection({ ...inspection, observations: e.target.value })
          }
        />
      </section>

      {/* ================= JOB DETAILS ================= */}
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
          value={jobDetails.lossType}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, lossType: e.target.value })
          }
        >
          <option>Standard</option>
          <option>Water Damage</option>
          <option>Fire Damage</option>
        </select>
        <input
          type="text"
          placeholder="Loss Category (Cat 1, 2, or 3)"
          value={jobDetails.lossCategory}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, lossCategory: e.target.value })
          }
        />
      </section>

      {/* ================= ROOMS ================= */}
      <section className="card">
        <h2>Rooms & Photos</h2>
        {rooms.map((room, index) => (
          <div key={index} className="room-section">
            <input
              type="text"
              placeholder="Room Name"
              value={room.name}
              onChange={(e) => handleRoomChange(index, "name", e.target.value)}
            />
            <input
              type="file"
              multiple
              onChange={(e) =>
                handleRoomChange(index, "photos", e.target.files)
              }
            />
            <textarea
              placeholder="Narrative of work (demo, drying, baseboards, flooring removed...)"
              value={room.narrative}
              onChange={(e) =>
                handleRoomChange(index, "narrative", e.target.value)
              }
            />
            <textarea
              placeholder="Dry Logs (Day 1-4: Moisture %, RH, Temp)"
              value={room.dryLogs}
              onChange={(e) =>
                handleRoomChange(index, "dryLogs", e.target.value)
              }
            />
          </div>
        ))}
        <button className="add-btn" onClick={addRoom}>+ Add Room</button>
      </section>

      {/* ================= TECH HOURS ================= */}
      <section className="card">
        <h2>Tech Hour Tracking</h2>
        {techHours.map((th, i) => (
          <div key={i} className="tech-row">
            <input
              type="text"
              placeholder="Tech Name"
              value={th.tech}
              onChange={(e) => {
                const updated = [...techHours];
                updated[i].tech = e.target.value;
                setTechHours(updated);
              }}
            />
            <input
              type="number"
              placeholder="Hours Worked"
              value={th.hours}
              onChange={(e) => {
                const updated = [...techHours];
                updated[i].hours = e.target.value;
                setTechHours(updated);
              }}
            />
          </div>
        ))}
        <button className="add-btn" onClick={addTechHour}>+ Add Tech Hour</button>
      </section>

      {/* ================= PSYCHROMETRIC TABLE ================= */}
      <section className="card">
        <h2>Psychrometric Table</h2>
        <input
          type="number"
          placeholder="Outside Temp (°F)"
          value={psychro.outsideTemp}
          onChange={(e) => setPsychro({ ...psychro, outsideTemp: e.target.value })}
        />
        <input
          type="number"
          placeholder="Inside Temp (°F)"
          value={psychro.insideTemp}
          onChange={(e) => setPsychro({ ...psychro, insideTemp: e.target.value })}
        />
        <input
          type="number"
          placeholder="Relative Humidity (%)"
          value={psychro.rh}
          onChange={(e) => setPsychro({ ...psychro, rh: e.target.value })}
        />
        <input
          type="number"
          placeholder="Grains Per Pound"
          value={psychro.grains}
          onChange={(e) => setPsychro({ ...psychro, grains: e.target.value })}
        />
      </section>

      <button className="generate-btn" onClick={generateInsuranceSummary}>
        Generate Insurance Summary (AI)
      </button>
    </div>
  );
}

export default App;
