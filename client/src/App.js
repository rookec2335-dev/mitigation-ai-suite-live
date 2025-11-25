import React, { useState } from "react";
import axios from "axios";
import "./styles.css";
import logo from "./WaterCleanUpLogoFinal.png";

// Your live server base URL from environment
const API_BASE = process.env.REACT_APP_API_BASE;

function App() {
  // ----------------- STATE -----------------
  const [initialInspection, setInitialInspection] = useState({
    date: "",
    inspector: "",
    notes: "",
  });

  const [jobDetails, setJobDetails] = useState({
    company: "",
    jobNumber: "",
    priority: "Standard", // Standard / Emergency / After Hours etc
    lossCategory: "", // Cat 1 / Cat 2 / Cat 3, etc.
  });

  const [rooms, setRooms] = useState([
    {
      id: Date.now(),
      name: "",
      photos: [],
      workNotes: "",
      dryLogs: [
        {
          id: Date.now() + 1,
          dayLabel: "",
          moistureReading: "",
          equipment: "",
          notes: "",
        },
      ],
    },
  ]);

  const [psychro, setPsychro] = useState({
    outsideTemp: "",
    insideTemp: "",
    relativeHumidity: "",
    grainsPerLb: "",
  });

  const [aiSummary, setAiSummary] = useState("");
  const [aiScopeOfWork, setAiScopeOfWork] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------- HELPERS -----------------

  const handleInitialChange = (field, value) =>
    setInitialInspection((prev) => ({ ...prev, [field]: value }));

  const handleJobChange = (field, value) =>
    setJobDetails((prev) => ({ ...prev, [field]: value }));

  const handlePsychroChange = (field, value) =>
    setPsychro((prev) => ({ ...prev, [field]: value }));

  const addRoom = () =>
    setRooms((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        photos: [],
        workNotes: "",
        dryLogs: [
          {
            id: Date.now() + Math.random(),
            dayLabel: "",
            moistureReading: "",
            equipment: "",
            notes: "",
          },
        ],
      },
    ]);

  const updateRoomField = (roomId, field, value) =>
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, [field]: value } : room
      )
    );

  const handleRoomPhotosChange = (roomId, files) =>
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, photos: Array.from(files || []) }
          : room
      )
    );

  const addDryLog = (roomId) =>
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              dryLogs: [
                ...room.dryLogs,
                {
                  id: Date.now() + Math.random(),
                  dayLabel: "",
                  moistureReading: "",
                  equipment: "",
                  notes: "",
                },
              ],
            }
          : room
      )
    );

  const updateDryLogField = (roomId, logId, field, value) =>
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              dryLogs: room.dryLogs.map((log) =>
                log.id === logId ? { ...log, [field]: value } : log
              ),
            }
          : room
      )
    );

  const removeDryLog = (roomId, logId) =>
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              dryLogs: room.dryLogs.filter((log) => log.id !== logId),
            }
          : room
      )
    );

  const handleExportPdf = () => {
    // Uses print styles in CSS to create a clean PDF
    window.print();
  };

  // ----------------- AI CALL -----------------

  const handleGenerateSummary = async () => {
    setLoading(true);
    setAiSummary("");
    setAiScopeOfWork("");

    try {
      const payload = {
        initialInspection,
        jobDetails,
        rooms: rooms.map((room) => ({
          ...room,
          // send only filenames for photos (backend can’t read File objects)
          photos: (room.photos || []).map((f) => f.name),
        })),
        psychro,
      };

      const res = await axios.post(
        `${API_BASE}/api/generate-summary`,
        payload
      );

      // Expecting backend to optionally send { summary, scopeOfWork }
      setAiSummary(res.data.summary || "");
      setAiScopeOfWork(res.data.scopeOfWork || "");
    } catch (err) {
      console.error(err);
      setAiSummary(
        "Error generating AI summary. Check the server logs or API key."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------- RENDER -----------------

  return (
    <div className="page">
      {/* HEADER */}
      <header className="app-header no-print">
        <div className="logo-wrap">
          <img src={logo} alt="RooterPLUS Water Clean Up" className="logo" />
        </div>
        <div>
          <h1>Mitigation Supervisor Console</h1>
          <p className="subtext">
            Professional Insurance Format • Field-Tech Friendly • Insurance
            Ready
          </p>
        </div>
        <button className="primary-btn" onClick={handleExportPdf}>
          Export Insurance Report PDF
        </button>
      </header>

      <main className="content">
        {/* INITIAL INSPECTION */}
        <section className="card">
          <h2>Initial Inspection</h2>

          <div className="grid-2">
            <input
              type="date"
              value={initialInspection.date}
              onChange={(e) =>
                handleInitialChange("date", e.target.value)
              }
            />
            <input
              placeholder="Inspector Name"
              value={initialInspection.inspector}
              onChange={(e) =>
                handleInitialChange("inspector", e.target.value)
              }
            />
          </div>

          <textarea
            className="full"
            rows={4}
            placeholder="Observations (water visible, odors, hazards, affected areas, access issues, etc.)"
            value={initialInspection.notes}
            onChange={(e) =>
              handleInitialChange("notes", e.target.value)
            }
          />
        </section>

        {/* JOB / LOSS DETAILS */}
        <section className="card">
          <h2>Job / Loss Details</h2>

          <div className="grid-2">
            <input
              placeholder="Company"
              value={jobDetails.company}
              onChange={(e) =>
                handleJobChange("company", e.target.value)
              }
            />
            <input
              placeholder="Job Number"
              value={jobDetails.jobNumber}
              onChange={(e) =>
                handleJobChange("jobNumber", e.target.value)
              }
            />
          </div>

          <div className="grid-2">
            <select
              value={jobDetails.priority}
              onChange={(e) =>
                handleJobChange("priority", e.target.value)
              }
            >
              <option value="Standard">Priority: Standard</option>
              <option value="Emergency">Priority: Emergency</option>
              <option value="After Hours">Priority: After Hours</option>
            </select>

            <select
              value={jobDetails.lossCategory}
              onChange={(e) =>
                handleJobChange("lossCategory", e.target.value)
              }
            >
              <option value="">Loss Category (IICRC)</option>
              <option value="Category 1">Category 1 – Clean Water</option>
              <option value="Category 2">Category 2 – Grey Water</option>
              <option value="Category 3">Category 3 – Black Water</option>
            </select>
          </div>
        </section>

        {/* ROOMS & PHOTOS & DRY LOGS */}
        <section className="card">
          <div className="card-header-row">
            <h2>Rooms, Photos & Dry Logs</h2>
            <button className="secondary-btn" onClick={addRoom}>
              + Add Room
            </button>
          </div>

          {rooms.map((room) => (
            <div key={room.id} className="room-block">
              <div className="grid-2">
                <input
                  placeholder="Room Name (e.g. Master Bedroom, Hall Bath)"
                  value={room.name}
                  onChange={(e) =>
                    updateRoomField(room.id, "name", e.target.value)
                  }
                />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    handleRoomPhotosChange(
                      room.id,
                      e.target.files || []
                    )
                  }
                />
              </div>

              <textarea
                rows={3}
                placeholder="Narrative of work performed / demo completed (baseboards removed, flooring removed, cabinets detached, etc.)"
                value={room.workNotes}
                onChange={(e) =>
                  updateRoomField(room.id, "workNotes", e.target.value)
                }
              />

              <div className="drylog-section">
                <div className="drylog-header">
                  <h3>Dry Log</h3>
                  <button
                    className="small-btn"
                    type="button"
                    onClick={() => addDryLog(room.id)}
                  >
                    + Add Day
                  </button>
                </div>

                <div className="drylog-table">
                  <div className="drylog-row drylog-row--head">
                    <span>Day / Date</span>
                    <span>Moisture Reading</span>
                    <span>Equipment / Settings</span>
                    <span>Notes</span>
                    <span />
                  </div>

                  {room.dryLogs.map((log) => (
                    <div key={log.id} className="drylog-row">
                      <input
                        placeholder="Day 1 – 11/24"
                        value={log.dayLabel}
                        onChange={(e) =>
                          updateDryLogField(
                            room.id,
                            log.id,
                            "dayLabel",
                            e.target.value
                          )
                        }
                      />
                      <input
                        placeholder="Drywall 12%, Base 14%"
                        value={log.moistureReading}
                        onChange={(e) =>
                          updateDryLogField(
                            room.id,
                            log.id,
                            "moistureReading",
                            e.target.value
                          )
                        }
                      />
                      <input
                        placeholder="2x LGR @ High, 1x Axial"
                        value={log.equipment}
                        onChange={(e) =>
                          updateDryLogField(
                            room.id,
                            log.id,
                            "equipment",
                            e.target.value
                          )
                        }
                      />
                      <input
                        placeholder="Trend improving / at goal, etc."
                        value={log.notes}
                        onChange={(e) =>
                          updateDryLogField(
                            room.id,
                            log.id,
                            "notes",
                            e.target.value
                          )
                        }
                      />
                      <button
                        type="button"
                        className="small-btn danger"
                        onClick={() => removeDryLog(room.id, log.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* PSYCHROMETRICS (BASIC) */}
        <section className="card">
          <h2>Psychrometrics (Snapshot)</h2>
          <div className="grid-4">
            <input
              placeholder="Outside Temp (°F)"
              value={psychro.outsideTemp}
              onChange={(e) =>
                handlePsychroChange("outsideTemp", e.target.value)
              }
            />
            <input
              placeholder="Inside Temp (°F)"
              value={psychro.insideTemp}
              onChange={(e) =>
                handlePsychroChange("insideTemp", e.target.value)
              }
            />
            <input
              placeholder="Relative Humidity (%)"
              value={psychro.relativeHumidity}
              onChange={(e) =>
                handlePsychroChange("relativeHumidity", e.target.value)
              }
            />
            <input
              placeholder="Grains Per Lb (GPP)"
              value={psychro.grainsPerLb}
              onChange={(e) =>
                handlePsychroChange("grainsPerLb", e.target.value)
              }
            />
          </div>
        </section>

        {/* AI SUMMARY / SCOPE OF WORK */}
        <section className="card">
          <h2>AI Insurance Narrative & Scope of Work</h2>

          <button
            className="primary-btn"
            type="button"
            onClick={handleGenerateSummary}
          >
            Generate Insurance Summary (AI)
          </button>

          {loading && (
            <p className="muted">
              AI is generating a mitigation summary and scope of work…
            </p>
          )}

          {aiScopeOfWork && (
            <div className="ai-box">
              <h3>AI Scope of Work</h3>
              <p>{aiScopeOfWork}</p>
            </div>
          )}

          {aiSummary && (
            <div className="ai-box">
              <h3>AI Insurance Summary</h3>
              <p>{aiSummary}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
