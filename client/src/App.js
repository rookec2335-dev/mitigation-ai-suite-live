import React, { useState } from 'react';
import './styles.css';
import logo from './WaterCleanUpLogoFinal.png';

function App() {
  // INITIAL INSPECTION
  const [inspection, setInspection] = useState({
    date: '',
    inspector: '',
    observations: '',
    checklist: []
  });

  // JOB / LOSS DETAILS
  const [job, setJob] = useState({
    company: '',
    jobNumber: '',
    type: 'Standard',
    category: '',
  });

  // ROOMS SECTION
  const [rooms, setRooms] = useState([
    { name: '', narrative: '', photos: [], demo: {}, equipment: '', moistureDay1: '', moistureDay2: '', material: '' }
  ]);

  // ADD NEW ROOM
  const addRoom = () => {
    setRooms([...rooms, { name: '', narrative: '', photos: [], demo: {}, equipment: '', moistureDay1: '', moistureDay2: '', material: '' }]);
  };

  const updateRoom = (index, field, value) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  const handleRoomPhotoUpload = (index, e) => {
    const fileList = Array.from(e.target.files);
    const updated = [...rooms];
    updated[index].photos = fileList;
    setRooms(updated);
  };

  return (
    <div className="container">

      {/* HEADER */}
      <img src={logo} alt="Company Logo" className="logo" />
      <h1>Mitigation Supervisor Console</h1>
      <p className="subtitle">Professional Insurance Format • Field Ready</p>

      {/* INITIAL INSPECTION */}
      <section className="card">
        <h2>Initial Inspection</h2>
        <input type="date" placeholder="mm/dd/yyyy" value={inspection.date}
          onChange={(e) => setInspection({ ...inspection, date: e.target.value })} />

        <input type="text" placeholder="Inspector Name" value={inspection.inspector}
          onChange={(e) => setInspection({ ...inspection, inspector: e.target.value })} />

        <textarea placeholder="Observations (water visible, odors, hazards, etc.)"
          value={inspection.observations}
          onChange={(e) => setInspection({ ...inspection, observations: e.target.value })} ></textarea>

        {/* CHECKLIST SECTION */}
        <h3>Inspection Checklist (Select Any That Apply)</h3>
        <div className="checklist-grid">
          {[
            "Water visible", "Odor present", "Safety hazards", "Structural damage",
            "Electrical risk", "High moisture", "HVAC affected", "Sewer backup"
          ].map((item) => (
            <label key={item}>
              <input
                type="checkbox"
                checked={inspection.checklist.includes(item)}
                onChange={() => {
                  const exists = inspection.checklist.includes(item);
                  const updated = exists
                    ? inspection.checklist.filter((i) => i !== item)
                    : [...inspection.checklist, item];
                  setInspection({ ...inspection, checklist: updated });
                }}
              /> {item}
            </label>
          ))}
        </div>
      </section>

      {/* JOB / LOSS DETAILS */}
      <section className="card">
        <h2>Job / Loss Details</h2>
        <input type="text" placeholder="Company" value={job.company}
          onChange={(e) => setJob({ ...job, company: e.target.value })} />

        <input type="text" placeholder="Job Number" value={job.jobNumber}
          onChange={(e) => setJob({ ...job, jobNumber: e.target.value })} />

        <select value={job.type} onChange={(e) => setJob({ ...job, type: e.target.value })}>
          <option>Standard</option>
          <option>Emergency</option>
          <option>After Hours</option>
        </select>

        <select value={job.category} onChange={(e) => setJob({ ...job, category: e.target.value })}>
          <option value="">Loss Category (Cat 1, 2, or 3)</option>
          <option>Cat 1 - Clean Water</option>
          <option>Cat 2 - Grey Water</option>
          <option>Cat 3 - Black Water</option>
        </select>
      </section>

      {/* ROOMS SECTION */}
      <section className="card">
        <h2>Rooms & Photos</h2>

        {rooms.map((room, index) => (
          <div key={index} className="room-card">
            <input type="text" placeholder="Room Name" value={room.name}
              onChange={(e) => updateRoom(index, 'name', e.target.value)} />

            <input type="file" multiple onChange={(e) => handleRoomPhotoUpload(index, e)} />

            <textarea placeholder="Narrative of work performed..."
              value={room.narrative}
              onChange={(e) => updateRoom(index, 'narrative', e.target.value)} />

            <h4>Demo Work Performed</h4>
            <div className="checklist-grid">
              {[
                "Removed baseboards", "Removed drywall", "Removed ceiling",
                "Pulled flooring", "Cabinet damage", "Content manipulation"
              ].map((item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={room.demo?.[item] || false}
                    onChange={() => updateRoom(index, 'demo', {
                      ...room.demo,
                      [item]: !room.demo?.[item]
                    })}
                  /> {item}
                </label>
              ))}
            </div>

            <h4>Equipment Used</h4>
            <select value={room.equipment} onChange={(e) => updateRoom(index, 'equipment', e.target.value)}>
              <option value="">-- Select --</option>
              <option>Dehumidifier</option>
              <option>Air Mover</option>
              <option>Air Scrubber</option>
              <option>HEPA Vacuum</option>
            </select>

            <h4>Dry Log</h4>
            <input type="text" placeholder="Day 1 Moisture (%)" value={room.moistureDay1}
              onChange={(e) => updateRoom(index, 'moistureDay1', e.target.value)} />
            <input type="text" placeholder="Day 2 Moisture (%)" value={room.moistureDay2}
              onChange={(e) => updateRoom(index, 'moistureDay2', e.target.value)} />

            <h4>Affected Materials</h4>
            <select value={room.material} onChange={(e) => updateRoom(index, 'material', e.target.value)}>
              <option value="">-- Select --</option>
              <option>Drywall</option>
              <option>Framing</option>
              <option>Subfloor</option>
              <option>Vanity/Cabinets</option>
              <option>Contents</option>
            </select>
          </div>
        ))}

        <button className="add-room-btn" onClick={addRoom}>+ Add Room</button>
      </section>

      <button className="ai-btn">Generate Insurance Summary (AI)</button>
    </div>
  );
}

export default App;
