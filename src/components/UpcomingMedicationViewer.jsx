import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext.jsx";

const UpcomingMedicationViewer = () => {
  const { casePath } = useCaseContext();
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    if (!casePath) return;

    fetch("http://localhost:5000/api/medications/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath })
    })
      .then((res) => res.json())
      .then((meds) => {
        const now = new Date();
        const windowHours = 24;
        const upcomingDoses = [];

        meds.forEach((med) => {
          const freq = parseInt(med.frequency_hours || "24");
          const start = new Date(med.start);
          const end = med.end ? new Date(med.end) : null;

          if (isNaN(start.getTime()) || isNaN(freq)) return;

          let next = new Date(start);
          while (next < now) {
            next.setHours(next.getHours() + freq);
          }

          const diff = (next - now) / (1000 * 60 * 60); // in hours
          if (diff <= windowHours && (end ? next <= end : true)) {
            upcomingDoses.push({
              name: med.name,
              dose: med.dose,
              time: next.toLocaleString()
            });
          }
        });

        setUpcoming(upcomingDoses);
      });
  }, [casePath]);

  return (
    <div className="bg-gray-900 mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-2 text-xl">⏰ Upcoming Medications (Next 24h)</h2>
      {upcoming.length === 0 ? (
        <p className="italic text-blue-300 text-sm">No doses due soon.</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((item, i) => (
            <li key={i}>
              <strong>{item.name}</strong> – {item.dose} due at <span className="text-blue-300">{item.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingMedicationViewer;
