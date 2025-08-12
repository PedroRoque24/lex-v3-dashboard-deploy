import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/Card"; // Use Lex-glass Card

const SYMPTOM_LIST = [
  "Fever",
  "Cough",
  "Fatigue",
  "Headache",
  "Diarrhea",
  "Shortness of breath",
  "Sore throat"
];

// API helpers
async function loadSymptomData() {
  const res = await fetch("/api/public/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "symptom" }),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function appendSymptomEntry(entry) {
  const res = await fetch("/api/public/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "symptom", entry }),
  });
  return await res.json();
}

async function clearSymptomData() {
  const res = await fetch("/api/public/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "symptom", data: [] }),
  });
  return await res.json();
}

// PATCH: Aggregation trigger
async function aggregateFromPatients() {
  const res = await fetch("/api/public/aggregate_patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data;
}

export default function PublicSymptomSurveillance() {
  const [entries, setEntries] = useState([]);
  const [current, setCurrent] = useState({ date: "", symptom: "", count: "" });
  const [loading, setLoading] = useState(true);
  const [aggMsg, setAggMsg] = useState(""); // PATCH: status message

  useEffect(() => {
    loadSymptomData().then((saved) => {
      setEntries(Array.isArray(saved) ? saved : []);
      setLoading(false);
    });
  }, []);

  const addEntry = async () => {
    if (!current.symptom || !current.count || !current.date) return;
    const entry = { ...current };
    setEntries([...entries, entry]);
    setCurrent({ date: "", symptom: "", count: "" });
    await appendSymptomEntry(entry);
  };

  const groupBySymptom = () => {
    const map = {};
    entries.forEach(({ symptom, count }) => {
      map[symptom] = (map[symptom] || 0) + parseInt(count);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  const clearAll = async () => {
    setEntries([]);
    await clearSymptomData();
  };

  // PATCH: trigger aggregation and reload data
  const handleAggregate = async () => {
    setAggMsg("Syncing with patients...");
    const data = await aggregateFromPatients();
    setAggMsg(data.status === "aggregated" ? `Aggregated ${data.added} symptom events from patients.` : (data.error || "Aggregation failed"));
    // Reload symptoms after aggregation
    setLoading(true);
    const saved = await loadSymptomData();
    setEntries(Array.isArray(saved) ? saved : []);
    setLoading(false);
    setTimeout(() => setAggMsg(""), 4000); // Hide message after 4s
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <h2 className="text-xl font-bold text-fuchsia-400 mb-4">
          🩺 Symptom Surveillance Engine
        </h2>

        {/* PATCH: Aggregation button */}
        <div className="mb-4">
          <button
            onClick={handleAggregate}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-5 py-2 rounded-xl font-bold transition"
          >
            🔄 Sync With Patients
          </button>
          {aggMsg && (
            <span className="ml-4 text-green-400 font-bold">{aggMsg}</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <select
            value={current.symptom}
            onChange={(e) => setCurrent({ ...current, symptom: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          >
            <option value="">Select Symptom</option>
            {SYMPTOM_LIST.map((symptom) => (
              <option key={symptom} value={symptom}>
                {symptom}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Case Count"
            value={current.count}
            onChange={(e) => setCurrent({ ...current, count: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          />
          <input
            type="date"
            value={current.date}
            onChange={(e) => setCurrent({ ...current, date: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          />
        </div>

        <button
          onClick={addEntry}
          disabled={!current.symptom || !current.count || !current.date}
          className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-60"
        >
          ➕ Log Symptom Case
        </button>
        <button
          onClick={clearAll}
          className="ml-3 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition"
        >
          🗑️ Clear All
        </button>

        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2 text-blue-300">
            📈 Summary by Symptom
          </h3>
          <ul className="text-sm list-disc ml-5 text-blue-100">
            {groupBySymptom().map(([symptom, total], idx) => (
              <li key={idx}>
                <span className="text-fuchsia-300 font-bold">{symptom}</span>: {total} cases
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2 text-blue-300">
            📝 All Logged Entries
          </h3>
          {loading ? (
            <div className="text-fuchsia-200">Loading...</div>
          ) : (
            <ul className="text-sm list-decimal ml-5 text-blue-100">
              {entries.map((entry, idx) => (
                <li key={idx}>
                  {entry.date}:{" "}
                  <span className="text-fuchsia-300 font-bold">
                    {entry.symptom}
                  </span>{" "}
                  - {entry.count} cases{" "}
                  {entry.source === "clinical_auto" && (
                    <span className="text-indigo-400 ml-2">(auto)</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}