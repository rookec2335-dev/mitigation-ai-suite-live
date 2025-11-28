import React, { useState } from 'react';
import './styles.css';

function App() {
  // Initial Inspection
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [observations, setObservations] = useState('');
  const [inspectionChecklist, setInspectionChecklist] = useState([]);

  const checklistItems = [
    'Water Visible',
    'Odor Present',
    'Safety Hazards',
    'Structural Damage',
    'Sewer Backup',
    'Electrical Risk',
    'High Moisture',
    'HVAC Affected'
  ];

  const toggleChecklistItem = (item) => {
    setInspectionChecklist((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Job/Loss Details
  const [company, setCompany] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [lossType, setLossType] = useState('Standard');
  const [lossCategory, setLossCategory] = useState('');

  // Tech Hours Section
  const [techHours, setTechHours] = useState([
    { date: '', timeIn: '', timeOut: '', notes: '' }
  ]);

  const addTechHour = () => {
    setTechHours([...techHours, { date: '', timeIn: '', timeOut: '', notes: '' }]);
  };

  const updateTechHour = (index, field, value) => {
    const updated = [...techHours];
    updated[index][field] = value;
    setTechHours(updated);
  };

  // Rooms & Photos
  const [rooms, setRooms] = useState([
    { name: '', photos: [], narrative: '', dryLog: '' }
  ]);

  const addRoom = () => {
    setRooms([...rooms, { name: '', photos: [], narrative: '', dryLog: '' }]);
  };

  const updateRoom = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  return (
    <div className="container">
      {/* HEADER */}
      <header>
        <img src="/WaterCleanUpLogoFinal.png" alt="Logo" className="company-logo" />
        <h1>Mitigation Supervisor Console</h1>
        <p>Professional Insurance Format • Field Ready</p>
      </header>

      {/* INITIAL INSPECTION */}
      <section className="card">
        <h2>Initial Inspection</h2>
        <input type="date" placeholder="mm/dd/yyyy" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} />
        <input type="text" placeholder="Inspector Name" value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} />
        <textarea placeholder="Observations (water visible, hazards, odors, etc.)" value={observations} onChange={(e) => setObservations(e.target.value)}></textarea>

        <h3>Inspection Checklist</h3>
        <div className="checklist-grid">
          {checklistItems.map((item, index) => (
            <label key={index} className="check-item">
              <input
                type="checkbox"
                checked={inspectionChecklist.includes(item)}
                onChange={() => toggleChecklistItem(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </section>

      {/* JOB / LOSS DETAILS */}
      <section className="card">
        <h2>Job / Loss Details</h2>
        <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input type="text" placeholder="Job Number" value={jobNumber} onChange={(e) => setJobNumber(e.target.value)} />

        <select value={lossType} onChange={(e) => setLossType(e.target.value)}>
          <option value="Standard">Standard</option>
          <option value="Emergency">Emergency</option>
          <option value="Sewer">Sewer</option>
        </select>

        <select value={lossCategory} onChange={(e) => setLossCategory(e.target.value)}>
          <option value="">Loss Category (1, 2, 3)</option>
          <option value="Cat 1">Cat 1</option>
          <option value="Cat 2">Cat 2</option>
          <option value="Cat 3">Cat 3</option>
        </select>
      </section>

      {/* TECH HOURS SECTION */}
      <section className="card">
        <h2>Tech Hours Log</h2>
        {techHours.map((entry, index) => (
          <div key={index} className="tech-card">
            <input type="date" value={entry.date} onChange={(e) => updateTechHour(index, 'date', e.target.value)} />
            <div className="time-row">
              <input type="time" value={entry.timeIn} onChange={(e) => updateTechHour(index, 'timeIn', e.target.value)} />
              <input type="time" value={entry.timeOut} onChange={(e) => updateTechHour(index, 'timeOut', e.target.value)} />
            </div>
            <textarea placeholder="Notes or tasks completed..." value={entry.notes} onChange={(e) => updateTechHour(index, 'notes', e.target.value)} />
          </div>
        ))}
        <button className="add-room-btn" onClick={addTechHour}>+ Add Day</button>
      </section>

      {/* ROOMS SECTION */}
      <section className="card">
        <h2>Rooms & Photos</h2>
        {rooms.map((room, index) => (
          <div key={index} className="room-card">
            <input type="text" placeholder="Room Name" value={room.name} onChange={(e) => updateRoom(index, 'name', e.target.value)} />
            <textarea placeholder="Narrative of work performed..." value={room.narrative} onChange={(e) => updateRoom(index, 'narrative', e.target.value)} />
            <textarea placeholder="Dry Log (Day 1, Day 2, Temp, RH, etc.)" value={room.dryLog} onChange={(e) => updateRoom(index, 'dryLog', e.target.value)} />
          </div>
        ))}
        <button className="add-room-btn" onClick={addRoom}>+ Add Room</button>
      </section>
    </div>
  );
}

export default App;
