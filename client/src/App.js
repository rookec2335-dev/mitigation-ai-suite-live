import React, { useState } from "react";
import axios from "axios";

function App() {
  const [initialInspection, setInitialInspection] = useState({
    date: "",
    inspector: "",
    observations: "",
  });

  const [jobDetails, setJobDetails] = useState({
    company: "",
    jobNumber: "",
    lossType: "Standard",
    category: "", // Cat 1, 2 or 3
  });

  const [psychometrics, setPsychometrics] = useState({
    outsideTemp: "",
    insideTemp: "",
    humidity: "",
    grainsPerLb: "",
  });

  const [rooms, setRooms] = useState([
    { name: "", photos: null, narrative: "", dryLog: "" },
  ]);

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms([...rooms, { name: "", photos: null, narrative: "", dryLog: "" }]);
  };

  const generateAIReport = async () => {
    const payload = {
      initialInspection,
      jobDetails,
      psychometrics,
      rooms,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE}/api/generate-report`,
        payload
      );
      alert("Report Generated:\n\n" + response.data.report);
    } catch (err) {
      alert("Error generating report");
    }
  };

  return (
    <div style={{ background: "#1E2A38", color: "white", minHeight: "100vh", padding: "2rem" }}>
      <h1>Mitigation Supervisor Console</h1>
      <p>Professional Insurance Format • Field Ready</p>

      {/* ----------- INITIAL INSPECTION ----------- */}
      <section style={boxStyle}>
        <h2>Initial Inspection</h2>
        <input
          type="date"
          value={initialInspection.date}
          onChange={(e) =>
            setInitialInspection({ ...initialInspection, date: e.target.value })
          }
          style={inputStyle}
        />
        <input
          placeholder="Inspector Name"
          value={initialInspection.inspector}
          onChange={(e) =>
            setInitialInspection({ ...initialInspection, inspector: e.target.value })
          }
          style={inputStyle}
        />
        <textarea
          placeholder="Observations (water visible, odor, hazards, etc.)"
          value={initialInspection.observations}
          onChange={(e) =>
            setInitialInspection({ ...initialInspection, observations: e.target.value })
          }
          style={textareaStyle}
        />
      </section>

      {/* ----------- JOB / LOSS DETAILS ----------- */}
      <section style={boxStyle}>
        <h2>Job / Loss Details</h2>
        <input
          placeholder="Company"
          value={jobDetails.company}
          onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Job Number"
          value={jobDetails.jobNumber}
          onChange={(e) => setJobDetails({ ...jobDetails, jobNumber: e.target.value })}
          style={inputStyle}
        />

        <select
          value={jobDetails.lossType}
          onChange={(e) => setJobDetails({ ...jobDetails, lossType: e.target.value })}
          style={inputStyle}
        >
          <option value="Standard">Standard</option>
          <option value="Fire Loss">Fire Loss</option>
          <option value="Flood Loss">Flood Loss</option>
        </select>

        {/* Category 1 / 2 / 3 */}
        <select
          value={jobDetails.category}
          onChange={(e) => setJobDetails({ ...jobDetails, category: e.target.value })}
          style={inputStyle}
        >
          <option value="">Loss Category</option>
          <option value="Category 1">Category 1 (Clean Water)</option>
          <option value="Category 2">Category 2 (Gray Water)</option>
          <option value="Category 3">Category 3 (Black Water)</option>
        </select>
      </section>

      {/* ----------- ROOMS & PHOTOS ----------- */}
      <section style={boxStyle}>
        <h2>Rooms & Photos</h2>
        {rooms.map((room, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <input
              placeholder="Room Name"
              value={room.name}
              onChange={(e) => handleRoomChange(index, "name", e.target.value)}
              style={inputStyle}
            />

            <input
              type="file"
              multiple
              onChange={(e) => handleRoomChange(index, "photos", e.target.files)}
              style={inputStyle}
            />

            <textarea
              placeholder="Narrative of work performed / damage"
              value={room.narrative}
              onChange={(e) => handleRoomChange(index, "narrative", e.target.value)}
              style={textareaStyle}
            />

            <textarea
              placeholder="Dry Log (Day 1: %, Dehus, RH, Temp)"
              value={room.dryLog}
              onChange={(e) => handleRoomChange(index, "dryLog", e.target.value)}
              style={textareaStyle}
            />
          </div>
        ))}
        <button onClick={addRoom} style={buttonGreen}>
          + Add Room
        </button>
      </section>

      {/* ----------- PSYCHOMETRICS ----------- */}
      <section style={boxStyle}>
        <h2>Psychometric Readings</h2>
        <input
          placeholder="Outside Temp (°F)"
          onChange={(e) => setPsychometrics({ ...psychometrics, outsideTemp: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Inside Temp (°F)"
          onChange={(e) => setPsychometrics({ ...psychometrics, insideTemp: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Relative Humidity (%)"
          onChange={(e) => setPsychometrics({ ...psychometrics, humidity: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Grains Per Pound"
          onChange={(e) => setPsychometrics({ ...psychometrics, grainsPerLb: e.target.value })}
          style={inputStyle}
        />
      </section>

      {/* ----------- BUTTON ----------- */}
      <button onClick={generateAIReport} style={buttonBlue}>
        Generate Insurance Summary (AI)
      </button>
    </div>
  );
}

export default App;

const boxStyle = {
  background: "#0E1822",
  padding: "1rem",
  borderRadius: "8px",
  marginBottom: "1.5rem",
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginTop: "0.5rem",
  borderRadius: "5px",
  border: "none",
};

const textareaStyle = {
  width: "100%",
  height: "70px",
  marginTop: "0.5rem",
  padding: "8px",
  borderRadius: "5px",
  border: "none",
};

const buttonBlue = {
  background: "#19A7CE",
  padding: "12px 18px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  width: "100%",
};

const buttonGreen = {
  background: "#2ecc71",
  padding: "8px 14px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
