// FULL UPDATED APP.JS FOR RENDER – Insurance Ready + Photo Upload
import React, { useState } from "react";
import axios from "axios";
import "./styles.css";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://mitigation-ai-suite-live-back-end.onrender.com";

function App() {
  // ================== FORM STATES ==================
  const [initialInspection, setInitialInspection] = useState({
    date: "",
    inspector: "",
    observations: "",
  });

  const [jobDetails, setJobDetails] = useState({
    companyName: "",
    jobNumber: "",
    technician: "",
    supervisor: "",
    lossType: "",
    priority: "Standard",
    dateOfLoss: "",
    inspectionDate: "",
    sourceOfLoss: "",
  });

  const [rooms, setRooms] = useState([
    {
      id: Date.now(),
      roomName: "",
      floor: "",
      narrative: "",
      photos: [],
      dryLogs: [],
    },
  ]);

  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // ================== HANDLERS ==================
  const addRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        id: Date.now(),
        roomName: "",
        floor: "",
        narrative: "",
        photos: [],
        dryLogs: [],
      },
    ]);
  };

  const updateRoomField = (id, field, value) =>
    setRooms((r) => r.map((room) => (room.id === id ? { ...room, [field]: value } : room)));

  const handlePhotoUpload = (roomId, files) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, photos: [...room.photos, ...Array.from(files)] }
          : room
      )
    );
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const payload = { initialInspection, jobDetails, rooms };
      const res = await axios.post(`${API_BASE}/api/generate-summary`, payload);
      setAiSummary(res.data.summary);
    } catch (err) {
      setAiSummary("Error — check server.");
    }
    setLoading(false);
  };

  const handleExportPdf = () => window.print();

  // ================== UI LAYOUT ==================
  return (
    <div className="container">
      <div className="header-row">
        <h1>Mitigation Supervisor Console</h1>
        <p className="subtext">Professional Insurance Format • Field Ready</p>
        <button className="export-btn" onClick={handleExportPdf}>
          Export Insurance Report PDF
        </button>
      </div>

      {/* Initial Inspection */}
      <div className="card">
        <h2>Initial Inspection</h2>
        <div className="grid-3">
          <input
            type="date"
            value={initialInspection.date}
            onChange={(e) => setInitialInspection({ ...initialInspection, date: e.target.value })}
          />
          <input
            placeholder="Inspector Name"
            value={initialInspection.inspector}
            onChange={(e) => setInitialInspection({ ...initialInspection, inspector: e.target.value })}
          />
        </div>
        <textarea
          placeholder="Observations: water visible, odors, hazards, etc."
          value={initialInspection.observations}
          onChange={(e) => setInitialInspection({ ...initialInspection, observations: e.target.value })}
        />
      </div>

      {/* JOB DETAILS */}
      <div className="card">
        <h2>Job / Loss Details</h2>
        <div className="grid-3">
          <input placeholder="Company" value={jobDetails.companyName} 
            onChange={(e) => setJobDetails({ ...jobDetails, companyName: e.target.value })} />
          <input placeholder="Job #" value={jobDetails.jobNumber}
            onChange={(e) => setJobDetails({ ...jobDetails, jobNumber: e.target.value })} />
          <select value={jobDetails.priority}
            onChange={(e) => setJobDetails({ ...jobDetails, priority: e.target.value })}>
            <option>Standard</option>
            <option>Emergency</option>
          </select>
        </div>
      </div>

      {/* ROOMS */}
      <div className="card">
        <div className="flex-between">
          <h2>Rooms & Photos</h2>
          <button className="add-btn" onClick={addRoom}> + Add Room </button>
        </div>

        {rooms.map((room) => (
          <div key={room.id} className="room-box">
            <input
              placeholder="Room Name"
              value={room.roomName}
              onChange={(e) => updateRoomField(room.id, "roomName", e.target.value)}
            />

            {/* Photo Upload */}
            <div>
              <input
                type="file"
                multiple
                onChange={(e) => handlePhotoUpload(room.id, e.target.files)}
              />
              {room.photos.length > 0 && (
                <div className="photo-preview">
                  {room.photos.map((file, idx) => (
                    <p key={idx}>📷 {file.name}</p>
                  ))}
                </div>
              )}
            </div>

            <textarea
              placeholder="Narrative of work performed..."
              value={room.narrative}
              onChange={(e) => updateRoomField(room.id, "narrative", e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* AI SUMMARY */}
      <div className="card">
        <button className="primary-btn" onClick={handleGenerateSummary}>
          Generate Insurance Summary (AI)
        </button>

        {loading && <p>Supervisor is reviewing...</p>}
        {aiSummary && (
          <div className="ai-section">
            <h3>Insurance Summary</h3>
            <p>{aiSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
