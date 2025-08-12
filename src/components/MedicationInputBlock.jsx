import { memoryUrl } from '../lib/api';
import { useCaseContext } from './CaseContext.jsx';
import React, { useState } from "react";

const MedicationInputBlock = () => {
  const { casePath } = useCaseContext();

  const [form, setForm] = useState({
    name: "",
    dose: "",
    frequency_hours: "24",
    start: "",
    end: "",
    source: "patient"
  });

  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!casePath) {
      setMessage("⚠️ No case selected.");
      return;
    }

    const payload = {
      case_path: casePath,
      ...form
    };

    try {
      const res = await fetch("http://localhost:5000/api/medications/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Medication saved.");
        setForm({
          name: "",
          dose: "",
          frequency_hours: "24",
          start: "",
          end: "",
          source: "patient"
        });
      } else {
        setMessage("❌ Failed to save: " + (result.message || result.error));
      }
    } catch (err) {
      console.error("API error:", err);
      setMessage("❌ Failed to reach save API.");
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md text-white">
      <h2 className="font-semibold mb-3 text-xl">💊 Add Medication</h2>
      <div className="gap-3 grid grid-cols-1 md:grid-cols-2">
        <input className="border border-blue-700 p-2 rounded-xl" placeholder="Medication Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border border-blue-700 p-2 rounded-xl" placeholder="Dose (e.g. 5mg)" value={form.dose}
          onChange={(e) => setForm({ ...form, dose: e.target.value })} />
        <input type="number" className="border border-blue-700 p-2 rounded-xl" placeholder="Frequency (hours)" value={form.frequency_hours}
          onChange={(e) => setForm({ ...form, frequency_hours: e.target.value })} />
        <input type="date" className="border border-blue-700 p-2 rounded-xl" value={form.start}
          onChange={(e) => setForm({ ...form, start: e.target.value })} />
        <input type="date" className="border border-blue-700 p-2 rounded-xl" value={form.end}
          onChange={(e) => setForm({ ...form, end: e.target.value })} />
        <select className="border border-blue-700 p-2 rounded-xl" value={form.source}
          onChange={(e) => setForm({ ...form, source: e.target.value })}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </div>
      <button
        className="bg-blue-600 mt-4 px-4 py-2 rounded-xl text-white"
        onClick={handleSubmit}
      >
        Save Medication
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default MedicationInputBlock;
