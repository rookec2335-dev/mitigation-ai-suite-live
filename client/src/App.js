import React, { useState } from "react";
import "./App.css";
import logo from "./WaterCleanUpLogoFinal.png";

function App() {
  const [initialDetails, setInitialDetails] = useState({
    date: "",
    inspector: "",
    observations: "",
    lossCategory: "Standard",
    initialCallName: "",
    timeOfLoss: "",
    causeOfLoss: "",
    accessInfo: ""
  });

  const [jobDetails, setJobDetails] = useState({
    company: "",
    jobNumber: "",
    category: "",
  });

  const [rooms, setRooms] = useState([
    { name: "", photos: [], narrative: "", dryLog: "" },
  ]);

  const [techHours, setTechHours] = useState([
    { name: "", hours: "", description: "" },
  ]);

  const [psychrometrics, setPsychrometrics] = useState({
    outsideTemp: "",
    insideTemp: "",
    relativeHumidity: "",
    grainsPerPound: "",
  });

  // Add new Room
  const addRoom = () => {
    setRooms([...rooms, { name: "", photos: [], narrative: "", dryLog: "" }]);
  };

  // Add new Technician row
  const addTechHours = () => {
    setTechHours([...techHours, { name: "", hours: "", description: "" }]);
  };

  return (
    <div className="app-container">
      {/* Logo Header */}
      <div className="header">
        <img src={logo} alt="RooterPLUS Water Cleanup" className="logo" />
        <h1>Mitigation Supervisor Console</h1>
        <p>Professional Insurance Format • Field Ready</p>
      </div>

      {/* Initial Call Section */}
      <section className="form-section">
        <h2>📞 Initial Call / Emergency Details</h2>
        <input
          type="text"
          placeholder="Caller Name"
          value={initialDetails.initialCallName}
          onChange={(e) =>
            setInitialDetails({ ...initialDetails, initialCallName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Time of Loss"
          value={initialDetails.timeOfLoss}
          onChange={(e) =>
            setInitialDetails({ ...initialDetails, timeOfLoss: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Cause of Loss (Pipe burst, sewer backup, etc)"
          value={initialDetails.causeOfLoss}
          onChange={(e) =>
            setInitialDetails({ ...initialDetails, causeOfLoss: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Access Instructions (Gate codes, lockbox, etc)"
          value={initialDetails.accessInfo}
          onChange={(e) =>
            setInitialDetails({ ...initialDetails, accessInfo: e.target.value })
          }
        />
      </section>

      {/* Initial Inspection */}
      <section className="form-section">
        <h2>Initial Inspection</h2>
        <input
          type="date"
          value={initialDetails.date}
          onChange={(e) =>
            setInitialDetails({ ...initialDetails, date: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Inspector Name"
          value={initialDetails.inspector}
          onChange={(e) =>
            setInitialDetails({ ...initialDetails, inspector: e.target.value })
          }
        />
        <textarea
          placeholder="Observations (water visible, odor, hazards, etc.)"
          rows={3}
          value={initialDetails.observations}
          onChange={(e) =>
            setInitialDetails({ ...initialDetails, observations: e.target.value })
          }
        />
      </section>

      {/* Job Details Section */}
      <section className="form-section">
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
          value={jobDetails.category}
          onChange={(e) =>
            setJobDetails({ ...jobDetails, category: e.target.value })
          }
        >
          <option value="Cat 1">Cat 1</option>
          <option value="Cat 2">Cat 2</option>
          <option value="Cat 3">Cat 3</option>
        </select>
      </section>

      {/* Rooms & Photos */}
      <section className="form-section">
        <h2>Rooms & Photos</h2>
        {rooms.map((room, i) => (
          <div key={i} className="room-block">
            <input
              type="text"
              placeholder="Room Name"
              value={room.name}
              onChange={(e) => {
                const newRooms = [...rooms];
                newRooms[i].name = e.target.value;
                setRooms(newRooms);
              }}
            />
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                const newRooms = [...rooms];
                newRooms[i].photos = files;
                setRooms(newRooms);
              }}
            />
            <textarea
              placeholder="Narrative of work performed..."
              rows={3}
              value={room.narrative}
              onChange={(e) => {
                const newRooms = [...rooms];
                newRooms[i].narrative = e.target.value;
                setRooms(newRooms);
              }}
            />
            <textarea
              placeholder="Dry Log: Day 1-5 (RH, Temp, Dehus, %)"
              rows={2}
              value={room.dryLog}
              onChange={(e) => {
                const newRooms = [...rooms];
                newRooms[i].dryLog = e.target.value;
                setRooms(newRooms);
              }}
            />
          </div>
        ))}
        <button onClick={addRoom}>+ Add Room</button>
      </section>

      {/* Technician Hours */}
      <section className="form-section">
        <h2>Technician Labor Hours</h2>
        {techHours.map((tech, i) => (
          <div key={i} className="tech-block">
            <input
              type="text"
              placeholder="Technician Name"
              value={tech.name}
              onChange={(e) => {
                const newTech = [...techHours];
                newTech[i].name = e.target.value;
                setTechHours(newTech);
              }}
            />
            <input
              type="number"
              placeholder="Hours"
              value={tech.hours}
              onChange={(e) => {
                const newTech = [...techHours];
                newTech[i].hours = e.target.value;
                setTechHours(newTech);
              }}
            />
            <input
              type="text"
              placeholder="Description (Demo, Drying, Monitoring)"
              value={tech.description}
              onChange={(e) => {
                const newTech = [...techHours];
                newTech[i].description = e.target.value;
                setTechHours(newTech);
              }}
            />
          </div>
        ))}
        <button onClick={addTechHours}>+ Add Technician</button>
      </section>

      {/* Psychrometric Data */}
      <section className="form-section">
        <h2>Psychrometric Conditions</h2>
        <input
          type="text"
          placeholder="Outside Temp (°F)"
          value={psychrometrics.outsideTemp}
          onChange={(e) =>
            setPsychrometrics({ ...psychrometrics, outsideTemp: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Inside Temp (°F)"
          value={psychrometrics.insideTemp}
          onChange={(e) =>
            setPsychrometrics({ ...psychrometrics, insideTemp: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Relative Humidity (%)"
          value={psychrometrics.relativeHumidity}
          onChange={(e) =>
            setPsychrometrics({
              ...psychrometrics,
              relativeHumidity: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="Grains Per Pound"
          value={psychrometrics.grainsPerPound}
          onChange={(e) =>
            setPsychrometrics({
              ...psychrometrics,
              grainsPerPound: e.target.value,
            })
          }
        />
      </section>

      {/* Generate PDF */}
      <button className="generate-btn">Generate Insurance Summary (AI)</button>
    </div>
  );
}

export default App;
