import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext.jsx";

const MedicationLogViewer = () => {
  const { casePath } = useCaseContext();
  const [meds, setMeds] = useState([]);
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (!casePath) return;

    fetch("http://localhost:5000/api/medications/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath })
    })
      .then((res) => res.json())
      .then((data) => setMeds(data || []));

    fetch("http://localhost:5000/api/medications/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath })
    })
      .then((res) => res.json())
      .then((data) => {
        const tracker = {};
        data.forEach((entry) => {
          tracker[entry.medication] = entry.status || "taken";
        });
        setStatus(tracker);
      });
  }, [casePath]);

  const mark = async (medication, state) => {
    await fetch("http://localhost:5000/api/medications/" + state, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath, medication })
    });
    setStatus({ ...status, [medication]: state });
  };

  return (
    <div className="bg-gray-900 mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-2 text-xl">📒 Medication Log Viewer</h2>
      <ul className="space-y-3">
        {meds.map((med, i) => (
          <li key={i} className="border border-blue-700-b pb-2">
            <strong>{med.name}</strong> – {med.dose} (every {med.frequency_hours}h)<br />
            {status[med.name] === "taken" && <span className="text-green-300 text-sm">✅ Taken</span>}
            {status[med.name] === "missed" && <span className="text-red-600 text-sm">❌ Missed</span>}
            {!status[med.name] && (
              <>
                <button
                  onClick={() => mark(med.name, "taken")}
                  className="bg-green-600 mr-2 mt-1 px-3 py-1 rounded-xl text-white text-xs"
                >
                  ✅ Mark as Taken
                </button>
                <button
                  onClick={() => mark(med.name, "missed")}
                  className="bg-red-600 mt-1 px-3 py-1 rounded-xl text-white text-xs"
                >
                  ❌ Mark as Missed
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MedicationLogViewer;
