import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext.jsx";

const MedicationViewer = () => {
  const { casePath } = useCaseContext();
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    if (!casePath) return;

    fetch("http://localhost:5000/api/medications/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath })
    })
      .then((res) => res.json())
      .then((data) => setMeds(data))
      .catch((err) => {
        console.error("Failed to fetch meds:", err);
        setMeds([]);
      });
  }, [casePath]);

  return (
    <div className="bg-gray-900 mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-2 text-xl">💊 Active Medications</h2>
      {meds.length === 0 && <p className="italic text-sm">No medications found.</p>}
      <ul className="space-y-2">
        {meds.map((med, i) => (
          <li key={i} className="border border-blue-700-b pb-2">
            <strong>{med.name}</strong> – {med.dose}<br />
            Every {med.frequency_hours}h | Start: {med.start || "–"} | End: {med.end || "–"}<br />
            <span className="text-blue-300 text-xs">Source: {med.source}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MedicationViewer;
