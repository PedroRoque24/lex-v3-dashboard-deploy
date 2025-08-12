import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { useCaseContext } from "./CaseContext";

export default function VitalsInputBlock() {
  const { casePath } = useCaseContext();
  const [vitals, setVitals] = useState({
    temperature: "",
    bp: "",
    heartRate: "",
    o2Sat: ""
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (casePath) setReady(true);
  }, [casePath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!casePath) {
      alert("❌ No casePath defined.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/vitals/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ casePath, vitals })
      });
      if (!res.ok) throw new Error("Submit error");
      alert("✅ Vitals submitted successfully.");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit vitals.");
    }
  };

  if (!ready) {
    return <div className="italic p-4 text-yellow-300">⏳ Waiting for patient/case context...</div>;
  }

  return (
    <div className="bg-gray-900 border border-blue-700 max-w-xl p-4 rounded-xl shadow text-white">
      <h2 className="font-semibold mb-4 text-xl">Enter Vital Signs</h2>

      <div className="space-y-3">
        <input
          name="temperature"
          value={vitals.temperature}
          onChange={handleChange}
          placeholder="Temperature (°C)"
          className="border border-blue-700 p-2 rounded-xl w-full"
        />

        <input
          name="bp"
          value={vitals.bp}
          onChange={handleChange}
          placeholder="Blood Pressure (mmHg)"
          className="border border-blue-700 p-2 rounded-xl w-full"
        />

        <input
          name="heartRate"
          value={vitals.heartRate}
          onChange={handleChange}
          placeholder="Heart Rate (bpm)"
          className="border border-blue-700 p-2 rounded-xl w-full"
        />

        <input
          name="o2Sat"
          value={vitals.o2Sat}
          onChange={handleChange}
          placeholder="Oxygen Saturation (%)"
          className="border border-blue-700 p-2 rounded-xl w-full"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded-xl text-white"
      >
        Submit Vitals
      </button>
    </div>
  );
}
