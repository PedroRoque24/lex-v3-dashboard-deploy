import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from './CaseContext.jsx';

const JournalLogViewer = () => {
  const { casePath } = useCaseContext();
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!casePath) return;

    fetch("http://localhost:5000/api/journal/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath })
    })
      .then((res) => res.json())
      .then((data) => setEntries(data || []))
      .catch((err) => {
        console.error("❌ Journal fetch error:", err);
        setError("❌ Could not load journal entries.");
      });
  }, [casePath]);

  return (
    <div className="bg-gray-900 mt-4 p-4 rounded-xl shadow text-sm text-white">
      <h3 className="font-bold mb-2 text-lg">📚 Journal Log</h3>
      {error && <p className="text-red-600">{error}</p>}
      {casePath === null && entries.length === 0 && (
        <p className="text-yellow-300">⚠️ No case selected.</p>
      )}
      {!error && entries.length === 0 && casePath && (
        <p className="italic text-blue-300">No journal entries found for this case.</p>
      )}
      <ul className="space-y-2">
        {entries.map((entry, i) => (
          <li key={i} className="border border-blue-700-blue-400 border-blue-700-l-4 pl-3">
            <p className="mb-1 text-blue-300 text-xs">
              🗓️ {new Date(entry.timestamp).toLocaleString()}
            </p>
            <p className="text-sm text-white">{entry.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JournalLogViewer;
