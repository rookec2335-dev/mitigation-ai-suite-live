// KEEP ALL IMPORTS YOU ALREADY HAD — JUST ADD ONE:
import { useState } from "react";

function App() {
  const [initialInspection, setInitialInspection] = useState({
    date: "",
    inspector: "",
    observations: ""
  });

  const [jobDetails, setJobDetails] = useState({
    company: "",
    jobNumber: "",
    lossCategory: "Standard"
  });

  const [rooms, setRooms] = useState([
    { name: "", photos: [], narrative: "", dryLog: "" }
  ]);

  const [psychometrics, setPsychometrics] = useState({
    outsideTemp: "",
    insideTemp: "",
    relativeHumidity: "",
    grainsPerLb: ""
  });

  const [aiOutput, setAiOutput] = useState("");

  // ADD ROOM
  const addRoom = () => {
    setRooms([...rooms, { name: "", photos: [], narrative: "", dryLog: "" }]);
  };

  // HANDLE FILE UPLOAD
  const handlePhotoUpload = (index, files) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].photos = Array.from(files); // store photos
    setRooms(updatedRooms);
  };

  // AI CALL
  const generateSummary = async () => {
    const payload = {
      inspection: initialInspection,
      job: jobDetails,
      rooms,
      psychometrics
    };

    const response = await fetch("https://mitigation-ai-suite-live-back-end.onrender.com/generate-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setAiOutput(data.summary);
  };

  return (
    <div style={{ padding: "30px", color: "white", fontFamily: "Arial" }}>
      <h1>Mitigation Supervisor Console</h1>
      <p>Professional Insurance Format • Field Ready</p>

      <hr />

      {/* INITIAL INSPECTION */}
      <section>
        <h2>Initial Inspection</h2>
        <input
          type="date"
          placeholder="Date"
          onChange={(e) => setInitialInspection({ ...initialInspection, date: e.target.value })}
        />
        <input
          placeholder="Inspector Name"
          onChange={(e) => setInitialInspection({ ...initialInspection, inspector: e.target.value })}
        />
        <textarea
          placeholder="Observations (water visible, odor, hazards...)"
          onChange={(e) => setInitialInspection({ ...initialInspection, observations: e.target.value })}
        />
      </section>

      {/* JOB DETAILS */}
      <section>
        <h2>Job / Loss Details</h2>
        <input
          placeholder="Company"
          onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
        />
        <input
          placeholder="Job Number"
          onChange={(e) => setJobDetails({ ...jobDetails, jobNumber: e.target.value })}
        />
        <select
          onChange={(e) => setJobDetails({ ...jobDetails, lossCategory: e.target.value })}
        >
          <option>Standard</option>
          <option>Cat 1</option>
          <option>Cat 2</option>
          <option>Cat 3</option>
        </select>
      </section>

      {/* ROOMS SECTION */}
      <section>
        <h2>Rooms & Photos</h2>
        {rooms.map((room, index) => (
          <div key={index} style={{ border: "1px solid gray", padding: "15px", marginBottom: "10px" }}>
            <input
              placeholder="Room Name"
              onChange={(e) => {
                const updated = [...rooms];
                updated[index].name = e.target.value;
                setRooms(updated);
              }}
            />

            {/* Photos */}
            <input
              type="file"
              multiple
              onChange={(e) => handlePhotoUpload(index, e.target.files)}
            />

            {/* Narrative */}
            <textarea
              placeholder="Narrative of work / damage"
              onChange={(e) => {
                const updated = [...rooms];
                updated[index].narrative = e.target.value;
                setRooms(updated);
              }}
            />

            {/* DRY LOG – NEW */}
            <textarea
              placeholder="Dry Log (Day 1: %, Day 2: %, Dehus, RH, Temp)"
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

      {/* PSYCHOMETRICS */}
      <section>
        <h2>Psychometric Data</h2>
        <input placeholder="Outside Temp (°F)" onChange={(e) => setPsychometrics({ ...psychometrics, outsideTemp: e.target.value })} />
        <input placeholder="Inside Temp (°F)" onChange={(e) => setPsychometrics({ ...psychometrics, insideTemp: e.target.value })} />
        <input placeholder="Relative Humidity (%)" onChange={(e) => setPsychometrics({ ...psychometrics, relativeHumidity: e.target.value })} />
        <input placeholder="Grains Per Lb" onChange={(e) => setPsychometrics({ ...psychometrics, grainsPerLb: e.target.value })} />
      </section>

      {/* AI OUTPUT */}
      <button onClick={generateSummary}>Generate Insurance Summary (AI)</button>
      {aiOutput && (
        <pre style={{ background: "#222", padding: "15px", marginTop: "20px" }}>
          {aiOutput}
        </pre>
      )}
    </div>
  );
}

export default App;
