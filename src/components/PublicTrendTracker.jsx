import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/Card"; // Use Lex-glass Card

// Util functions for API
async function loadTrendData() {
  const res = await fetch("/api/public/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "trend" }),
  });
  const result = await res.json();
  return Array.isArray(result) ? result : [];
}

async function appendTrendEntry(entry) {
  const res = await fetch("/api/public/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "trend", entry }),
  });
  return await res.json();
}

async function clearTrendData() {
  const res = await fetch("/api/public/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "trend", data: [] }),
  });
  return await res.json();
}

export default function PublicTrendTracker() {
  const [data, setData] = useState([]);
  const [newEntry, setNewEntry] = useState({ disease: "", count: "", date: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendData().then((saved) => {
      setData(Array.isArray(saved) ? saved : []);
      setLoading(false);
    });
  }, []);

  const addEntry = async () => {
    if (!newEntry.disease || !newEntry.count || !newEntry.date) return;
    const entry = { ...newEntry };
    setData([...data, entry]);
    setNewEntry({ disease: "", count: "", date: "" });
    await appendTrendEntry(entry);
  };

  const getSummary = () => {
    const grouped = {};
    data.forEach(({ disease, count }) => {
      if (!grouped[disease]) grouped[disease] = 0;
      grouped[disease] += parseInt(count);
    });
    return Object.entries(grouped);
  };

  const clearAll = async () => {
    setData([]);
    await clearTrendData();
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <h2 className="text-xl font-bold text-fuchsia-400 mb-4">
          📊 Epidemiological Trend Tracker
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <input
            placeholder="Disease"
            value={newEntry.disease}
            onChange={(e) => setNewEntry({ ...newEntry, disease: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          />
          <input
            placeholder="Count"
            type="number"
            value={newEntry.count}
            onChange={(e) => setNewEntry({ ...newEntry, count: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          />
          <input
            type="date"
            value={newEntry.date}
            onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          />
        </div>

        <button
          onClick={addEntry}
          disabled={!newEntry.disease || !newEntry.count || !newEntry.date}
          className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-60"
        >
          ➕ Add Entry
        </button>
        <button
          onClick={clearAll}
          className="ml-3 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition"
        >
          🗑️ Clear All
        </button>

        <div className="mt-6">
          <h3 className="font-semibold text-md mb-2 text-blue-300">Disease Totals</h3>
          <ul className="text-sm list-disc ml-5 text-blue-100">
            {getSummary().map(([disease, count], idx) => (
              <li key={idx}>
                <span className="text-fuchsia-300 font-bold">{disease}:</span> {count} cases
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-md mb-2 text-blue-300">Raw Entries</h3>
          {loading ? (
            <div className="text-fuchsia-200">Loading...</div>
          ) : (
            <ul className="text-sm list-decimal ml-5 text-blue-100">
              {data.map((entry, idx) => (
                <li key={idx} className="mb-2">
                  {entry.date}: <span className="text-fuchsia-300 font-bold">{entry.disease}</span> - {entry.count} cases
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

