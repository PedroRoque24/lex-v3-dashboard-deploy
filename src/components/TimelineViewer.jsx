
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from 'react';

const TimelineViewer = ({ patientId = 'patient_001', caseId }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [error, setError] = useState(null);

  const casePath = `/memory/patients/${patientId}/${caseId}/continuum_timeline.json`;

  useEffect(() => {
    if (!caseId) return;
    fetch(casePath)
      .then(res => {
        if (!res.ok) throw new Error("File not found or unreadable");
        return res.json();
      })
      .then(data => {
        setTimelineData(data);
        console.log("Timeline loaded:", data);
      })
      .catch(err => {
        console.error("Timeline fetch error:", err);
        setError(err.message);
      });
  }, [caseId]);

  return (
    <div>
      <h3>🧠 Case Timeline</h3>
      {error ? (
        <p style={{ color: "crimson" }}>⚠️ {error}</p>
      ) : (
        <ul>
          {timelineData.map((entry, i) => (
            <li key={i}>
              <strong>{entry.timestamp || `Entry ${i + 1}`}</strong>: {entry.summary || JSON.stringify(entry)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TimelineViewer;
