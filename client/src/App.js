import React, { useState } from "react";
import axios from "axios";
import "./styles.css";

// LIVE SERVER OR LOCAL (fallback)
const API_BASE =
  process.env.REACT_APP_API_BASE || "https://mitigation-ai-server.onrender.com";

function App() {
  // ------------ STATE --------------
  const [jobDetails, setJobDetails] = useState({
    companyName: "",
    jobNumber: "",
    priority: "Standard",
    technician: "",
    supervisor: "",
    dateOfLoss: "",
    inspectionDate: "",
    lossType: "",
    iicrcClass: "",
    sourceOfLoss: "",
  });

  const [insured, setInsured] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [insurance, setInsurance] = useState({
    carrier: "",
    policyNumber: "",
    claimNumber: "",
    deductible: "",
    adjusterName: "",
    adjusterPhone: "",
    adjusterEmail: "",
    billingStatus: "",
  });

  const [rooms, setRooms] = useState([
    {
      id: Date.now(),
      roomName: "",
      floor: "",
      classOfWater: "",
      affectedMaterials: "",
      equipmentUsed: "",
      roomNotes: "",
      narrative: "",
      dryLogs: [],
    },
  ]);

  const [psychroReadings, setPsychroReadings] = useState([]);
  const [globalNotes, setGlobalNotes] = useState({
    general: "",
    safety: "",
    additionalWork: "",
  });

  const [aiSummary, setAiSummary] = useState("");
  const [psychroAnalysis, setPsychroAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJobChange = (f, v) => setJobDetails((p) => ({ ...p, [f]: v }));
  const handleInsuredChange = (f, v) => setInsured((p) => ({ ...p, [f]: v }));
  const handleInsuranceChange = (f, v) =>
    setInsurance((p) => ({ ...p, [f]: v }));

  const addRoom = () =>
    setRooms((prev) => [
      ...prev,
      {
        id: Date.now(),
        roomName: "",
        floor: "",
        classOfWater: "",
        affectedMaterials: "",
        equipmentUsed: "",
        roomNotes: "",
        narrative: "",
        dryLogs: [],
      },
    ]);

  const removeRoom = (id) => setRooms((p) => p.filter((r) => r.id !== id));

  const updateRoomField = (id, field, value) =>
    setRooms((prev) =>
      prev.map((room) => (room.id === id ? { ...room, [field]: value } : room))
    );

  const addDryLog = (roomId) =>
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              dryLogs: [
                ...room.dryLogs,
                { id: Date.now(), date: "", time: "", reading: "" },
              ],
            }
          : room
      )
    );

  const updateDryLog = (roomId, logId, field, value) =>
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

  const addPsychroRow = () =>
    setPsychroReadings((prev) => [
      ...prev,
      {
        id: Date.now(),
        date: "",
        time: "",
        locationType: "Affected",
        locationName: "",
        airTemp: "",
        rh: "",
        gpp: "",
        dewPoint: "",
      },
    ]);

  const updatePsychroRow = (id, field, value) =>
    setPsychroReadings((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );

  const removePsychroRow = (id) =>
    setPsychroReadings((prev) => prev.filter((row) => row.id !== id));

  const handleExportPdf = () => window.print();

  // ------------ AI CALLS --------------
  const handleGenerateSummary = async () => {
    setLoading(true);
    setAiSummary("");
    try {
      const job = {
        jobDetails,
        insured,
        insurance,
        rooms,
        psychroReadings,
        globalNotes,
      };

      const res = await axios.post(`${API_BASE}/api/generate-summary`, { job });
      setAiSummary(res.data.summary || "No AI response received.");
    } catch (err) {
      console.error(err);
      setAiSummary("Error generating AI summary. Check server / API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePsychro = async () => {
    setLoading(true);
    setPsychroAnalysis("");
    try {
      const res = await axios.post(
        `${API_BASE}/api/analyze-psychrometrics`,
        {
          readings: psychroReadings,
        }
      );
      setPsychroAnalysis(res.data.analysis || "No AI response received.");
    } catch (err) {
      console.error(err);
      setPsychroAnalysis(
        "Error analyzing psychrometrics. Check server / API key."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header-row">
        <h1>Mitigation Supervisor Console</h1>
        <p className="subtext">
          Professional mitigation documentation, AI summaries, and insurer-ready
          PDF export.
        </p>
        <button className="export-btn" onClick={handleExportPdf}>
          Export Insurance PDF
        </button>
      </div>

      <div className="card">
        <h2>Job & Loss Details</h2>

        <div className="grid-3">
          <input
            placeholder="Company Name"
            value={jobDetails.companyName}
            onChange={(e) => handleJobChange("companyName", e.target.value)}
          />
          <input
            placeholder="Job #"
            value={jobDetails.jobNumber}
            onChange={(e) => handleJobChange("jobNumber", e.target.value)}
          />
          <select
            value={jobDetails.priority}
            onChange={(e) => handleJobChange("priority", e.target.value)}
          >
            <option value="Standard">Priority: Standard</option>
            <option value="Emergency">Priority: Emergency</option>
            <option value="After Hours">Priority: After Hours</option>
            <option value="High">Priority: High</option>
          </select>
        </div>

        <div className="grid-3">
          <input
            placeholder="Technician"
            value={jobDetails.technician}
            onChange={(e) => handleJobChange("technician", e.target.value)}
          />
          <input
            placeholder="Supervisor"
            value={jobDetails.supervisor}
            onChange={(e) => handleJobChange("supervisor", e.target.value)}
          />
          <select
            value={jobDetails.lossType}
            onChange={(e) => handleJobChange("lossType", e.target.value)}
          >
            <option value="">Select Loss Type</option>
            <option value="Clean Water (Cat 1)">Clean Water (Cat 1)</option>
            <option value="Grey Water (Cat 2)">Grey Water (Cat 2)</option>
            <option value="Black Water (Cat 3)">Black Water (Cat 3)</option>
            <option value="Storm">Storm</option>
            <option value="Flood">Flood</option>
            <option value="Sewage Backup">Sewage Backup</option>
          </select>
        </div>

        <div className="grid-3">
          <input
            type="date"
            value={jobDetails.dateOfLoss}
            onChange={(e) => handleJobChange("dateOfLoss", e.target.value)}
          />
          <input
            type="date"
            value={jobDetails.inspectionDate}
            onChange={(e) =>
              handleJobChange("inspectionDate", e.target.value)
            }
          />
          <select
            value={jobDetails.iicrcClass}
            onChange={(e) => handleJobChange("iicrcClass", e.target.value)}
          >
            <option value="">Select IICRC Class</option>
            <option value="Class 1">Class 1 – Small amount of wet materials</option>
            <option value="Class 2">
              Class 2 – Significant area affected
            </option>
            <option value="Class 3">Class 3 – Walls / Insulation soaked</option>
            <option value="Class 4">
              Class 4 – Specialty drying (wood, plaster)
            </option>
          </select>
        </div>

        <input
          className="full-input"
          placeholder="Source of Loss (detailed description)"
          value={jobDetails.sourceOfLoss}
          onChange={(e) => handleJobChange("sourceOfLoss", e.target.value)}
        />
      </div>

      <div className="card">
        <h2>Insured / Property</h2>
        <div className="grid-3">
          <input
            placeholder="Insured Name"
            value={insured.name}
            onChange={(e) => handleInsuredChange("name", e.target.value)}
          />
          <input
            placeholder="Phone"
            value={insured.phone}
            onChange={(e) => handleInsuredChange("phone", e.target.value)}
          />
          <input
            placeholder="Email"
            value={insured.email}
            onChange={(e) => handleInsuredChange("email", e.target.value)}
          />
        </div>
        <div className="grid-3">
          <input
            placeholder="Address"
            value={insured.address}
            onChange={(e) => handleInsuredChange("address", e.target.value)}
          />
          <input
            placeholder="City"
            value={insured.city}
            onChange={(e) => handleInsuredChange("city", e.target.value)}
          />
          <input
            placeholder="State"
            value={insured.state}
            onChange={(e) => handleInsuredChange("state", e.target.value)}
          />
        </div>
        <div className="grid-3">
          <input
            placeholder="ZIP"
            value={insured.zip}
            onChange={(e) => handleInsuredChange("zip", e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <h2>Insurance & Billing</h2>
        <div className="grid-3">
          <input
            placeholder="Carrier"
            value={insurance.carrier}
            onChange={(e) =>
              handleInsuranceChange("carrier", e.target.value)
            }
          />
          <input
            placeholder="Policy #"
            value={insurance.policyNumber}
            onChange={(e) =>
              handleInsuranceChange("policyNumber", e.target.value)
            }
          />
          <input
            placeholder="Claim #"
            value={insurance.claimNumber}
            onChange={(e) =>
              handleInsuranceChange("claimNumber", e.target.value)
            }
          />
        </div>
        <div className="grid-3">
          <input
            placeholder="Deductible"
            value={insurance.deductible}
            onChange={(e) =>
              handleInsuranceChange("deductible", e.target.value)
            }
          />
          <input
            placeholder="Adjuster Name"
            value={insurance.adjusterName}
            onChange={(e) =>
              handleInsuranceChange("adjusterName", e.target.value)
            }
          />
          <input
            placeholder="Adjuster Phone"
            value={insurance.adjusterPhone}
            onChange={(e) =>
              handleInsuranceChange("adjusterPhone", e.target.value)
            }
          />
        </div>
        <div className="grid-3">
          <input
            placeholder="Adjuster Email"
            value={insurance.adjusterEmail}
            onChange={(e) =>
              handleInsuranceChange("adjusterEmail", e.target.value)
            }
          />
          <input
            placeholder="Billing Status"
            value={insurance.billingStatus}
            onChange={(e) =>
              handleInsuranceChange("billingStatus", e.target.value)
            }
          />
        </div>
      </div>

      <div className="card">
        <div className="flex-between">
          <h2>Rooms & Dry Logs</h2>
          <button className="add-btn" onClick={addRoom}>
            + Add Room
          </button>
        </div>

        {rooms.map((room) => (
          <div key={room.id} className="room-box">
            <div className="flex-between">
              <h3>{room.roomName || "Untitled Room"}</h3>
              <button
                className="remove-btn"
                onClick={() => removeRoom(room.id)}
              >
                Remove
              </button>
            </div>

            <div className="grid-3">
              <input
                placeholder="Room Name"
                value={room.roomName}
                onChange={(e) =>
                  updateRoomField(room.id, "roomName", e.target.value)
                }
              />
              <input
                placeholder="Floor"
                value={room.floor}
                onChange={(e) =>
                  updateRoomField(room.id, "floor", e.target.value)
                }
              />
              <select
                value={room.classOfWater}
                onChange={(e) =>
                  updateRoomField(room.id, "classOfWater", e.target.value)
                }
              >
                <option value="">Class of Water</option>
                <option value="Category 1">Category 1</option>
                <option value="Category 2">Category 2</option>
                <option value="Category 3">Category 3</option>
              </select>
            </div>

            <input
              placeholder="Affected Materials"
              value={room.affectedMaterials}
              onChange={(e) =>
                updateRoomField(room.id, "affectedMaterials", e.target.value)
              }
            />

            <input
              placeholder="Equipment Used"
              value={room.equipmentUsed}
              onChange={(e) =>
                updateRoomField(room.id, "equipmentUsed", e.target.value)
              }
            />

            <textarea
              placeholder="Room Notes"
              value={room.roomNotes}
              onChange={(e) =>
                updateRoomField(room.id, "roomNotes", e.target.value)
              }
            />

            <textarea
              placeholder="Narrative of Work Performed"
              value={room.narrative}
              onChange={(e) =>
                updateRoomField(room.id, "narrative", e.target.value)
              }
            />

            {room.dryLogs.map((log) => (
              <div key={log.id} className="grid-3">
                <input
                  type="date"
                  value={log.date}
                  onChange={(e) =>
                    updateDryLog(room.id, log.id, "date", e.target.value)
                  }
                />
                <input
                  type="time"
                  value={log.time}
                  onChange={(e) =>
                    updateDryLog(room.id, log.id, "time", e.target.value)
                  }
                />
                <input
                  placeholder="Moisture / drying notes"
                  value={log.reading}
                  onChange={(e) =>
                    updateDryLog(room.id, log.id, "reading", e.target.value)
                  }
                />
              </div>
            ))}

            <button
              className="add-btn small"
              onClick={() => addDryLog(room.id)}
            >
              + Add Dry Log Entry
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex-between">
          <h2>Psychrometric Table</h2>
          <button className="add-btn" onClick={addPsychroRow}>
            + Add Reading
          </button>
        </div>

        {psychroReadings.map((row) => (
          <div key={row.id} className="psychro-row">
            <div className="grid-6">
              <input
                type="date"
                value={row.date}
                onChange={(e) =>
                  updatePsychroRow(row.id, "date", e.target.value)
                }
              />
              <input
                type="time"
                value={row.time}
                onChange={(e) =>
                  updatePsychroRow(row.id, "time", e.target.value)
                }
              />

              <select
                value={row.locationType}
                onChange={(e) =>
                  updatePsychroRow(row.id, "locationType", e.target.value)
                }
              >
                <option value="Affected">Affected</option>
                <option value="Unaffected">Unaffected</option>
                <option value="Dehumidifier">Dehumidifier</option>
              </select>

              <input
                placeholder="Location Name"
                value={row.locationName}
                onChange={(e) =>
                  updatePsychroRow(row.id, "locationName", e.target.value)
                }
              />
              <input
                placeholder="Air Temp (°F)"
                value={row.airTemp}
                onChange={(e) =>
                  updatePsychroRow(row.id, "airTemp", e.target.value)
                }
              />
              <input
                placeholder="RH (%)"
                value={row.rh}
                onChange={(e) =>
                  updatePsychroRow(row.id, "rh", e.target.value)
                }
              />
            </div>

            <div className="grid-3">
              <input
                placeholder="GPP"
                value={row.gpp}
                onChange={(e) =>
                  updatePsychroRow(row.id, "gpp", e.target.value)
                }
              />
              <input
                placeholder="Dew Pt / ΔGrains"
                value={row.dewPoint}
                onChange={(e) =>
                  updatePsychroRow(row.id, "dewPoint", e.target.value)
                }
              />
              <button
                className="remove-btn"
                onClick={() => removePsychroRow(row.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button className="secondary-btn" onClick={handleAnalyzePsychro}>
          Analyze Psychrometrics with AI
        </button>
      </div>

      <div className="card">
        <h2>Global Notes & AI Supervisor Summary</h2>
        <textarea
          placeholder="General Job Notes…"
          value={globalNotes.general}
          onChange={(e) =>
            setGlobalNotes((p) => ({ ...p, general: e.target.value }))
          }
        />
        <textarea
          placeholder="Safety / Health Concerns…"
          value={globalNotes.safety}
          onChange={(e) =>
            setGlobalNotes((p) => ({ ...p, safety: e.target.value }))
          }
        />
        <textarea
          placeholder="Additional Work Recommended…"
          value={globalNotes.additionalWork}
          onChange={(e) =>
            setGlobalNotes((p) => ({
              ...p,
              additionalWork: e.target.value,
            }))
          }
        />

        <button className="primary-btn" onClick={handleGenerateSummary}>
          Generate AI Insurance Summary
        </button>

        {loading && <p>AI is thinking like a mitigation supervisor…</p>}

        {aiSummary && (
          <div className="ai-section">
            <h3>AI Insurance Summary</h3>
            <p>{aiSummary}</p>
          </div>
        )}

        {psychroAnalysis && (
          <div className="ai-section">
            <h3>AI Psychrometric Analysis</h3>
            <p>{psychroAnalysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

