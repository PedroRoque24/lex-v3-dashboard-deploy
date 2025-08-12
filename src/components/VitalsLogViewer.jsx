import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext";

export default function VitalsLogViewer() {
  const { casePath } = useCaseContext();
  const [vitalsLog, setVitalsLog] = useState([]);

  useEffect(() => {
    if (!casePath) return;

    fetch("http://localhost:5000/api/vitals/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath })
    })
      .then(res => res.json())
      .then(setVitalsLog)
      .catch(err => {
        console.error("Vitals log fetch error:", err);
        setVitalsLog([]);
      });
  }, [casePath]);

  const fallback = (val) => val && val.trim() !== "" ? val : "—";

  if (!casePath) {
    return <div className="p-4 text-red-600">⚠️ No patient/case selected.</div>;
  }

  if (vitalsLog.length === 0) {
    return <div className="italic p-4 text-blue-200">No vitals submitted yet.</div>;
  }

  return (
    <div className="bg-gray-900 max-w-3xl mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-semibold mb-3 text-xl">📋 Vitals History</h2>
      <div className="space-y-3">
        {vitalsLog.map((v, i) => (
          <div key={i} className="bg-gray-800 border border-blue-700 p-3 rounded-xl shadow-sm">
            <div className="mb-1 text-blue-200 text-xs">
              <strong>🕒 {new Date(v.timestamp).toLocaleString()}</strong>
            </div>
            <div className="font-mono gap-4 grid grid-cols-4 text-sm">
              <div>🌡 Temp: {fallback(v.temperature)} °C</div>
              <div>💉 BP: {fallback(v.bp)}</div>
              <div>❤️ HR: {fallback(v.heartRate)} bpm</div>
              <div>🫁 O₂ Sat: {fallback(v.o2Sat)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}