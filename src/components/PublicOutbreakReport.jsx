import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/Card"; // Use your Lex-glass Card

// API helpers
async function loadOutbreakReports() {
  const res = await fetch("/api/public/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "outbreak" }),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function appendOutbreakReport(report) {
  const res = await fetch("/api/public/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "outbreak", entry: report }),
  });
  return await res.json();
}

async function clearOutbreakReports() {
  const res = await fetch("/api/public/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "outbreak", data: [] }),
  });
  return await res.json();
}

export default function PublicOutbreakReport() {
  const [disease, setDisease] = useState("");
  const [location, setLocation] = useState("");
  const [cases, setCases] = useState("");
  const [date, setDate] = useState("");
  const [report, setReport] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOutbreakReports().then((saved) => {
      setLog(Array.isArray(saved) ? saved : []);
      setLoading(false);
    });
  }, []);

  const generateReport = async () => {
    const text = `🦠 OUTBREAK ALERT\n\nDisease: ${disease}\nLocation: ${location}\nCases Reported: ${cases}\nDate of Notification: ${date}\n\nHealth authorities are advised to increase surveillance and inform the community.\nFurther investigations are recommended.`;
    setReport(text);
    const entry = {
      timestamp: new Date().toISOString(),
      disease,
      location,
      cases,
      date,
      text,
    };
    setLog((prev) => [...prev, entry]);
    await appendOutbreakReport(entry);
  };

  const clearAll = async () => {
    setLog([]);
    await clearOutbreakReports();
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <h2 className="text-xl font-bold text-fuchsia-400 mb-4">
          📢 Outbreak Report Generator
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            placeholder="Disease"
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
          />
          <input
            placeholder="Location"
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="number"
            placeholder="Case Count"
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
            value={cases}
            onChange={(e) => setCases(e.target.value)}
          />
          <input
            type="date"
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          onClick={generateReport}
          disabled={!disease || !location || !cases || !date}
          className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-60"
        >
          📝 Generate Report
        </button>

        <button
          className="ml-3 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition"
          onClick={clearAll}
        >
          🗑️ Clear All
        </button>

        {report && (
          <>
            <textarea
              value={report}
              readOnly
              rows={10}
              className="w-full bg-gray-900 text-fuchsia-200 border border-fuchsia-700 rounded-xl p-3 mt-4 text-sm"
            />
            <button
              className="mt-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl"
              onClick={() => navigator.clipboard.writeText(report)}
            >
              📋 Copy Report
            </button>
          </>
        )}

        <div className="mt-6">
          <h3 className="font-semibold text-md mb-2 text-blue-300">
            📚 Past Outbreak Reports
          </h3>
          {loading ? (
            <div className="text-fuchsia-200">Loading...</div>
          ) : (
            <ul className="text-sm list-decimal ml-5 text-blue-100">
              {log.map((entry, idx) => (
                <li key={idx} className="mb-2">
                  <strong className="text-fuchsia-300">{entry.disease}</strong> ({entry.date}) in{" "}
                  <span className="text-blue-200">{entry.location}</span>: {entry.cases} cases
                  <pre className="bg-gray-800 border border-blue-900 rounded-xl p-2 mt-1 whitespace-pre-wrap text-white">
                    {entry.text}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

