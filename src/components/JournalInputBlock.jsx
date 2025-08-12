import { memoryUrl } from '../lib/api';
import { useCaseContext } from './CaseContext.jsx';
import React, { useState, useEffect } from "react";

const JournalInputBlock = () => {
  const { casePath } = useCaseContext();
  const [entry, setEntry] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("🧠 Detected casePath:", casePath);
  }, [casePath]);

  const handleSubmit = async () => {
    if (!casePath) {
      setMessage("⚠️ No case selected.");
      return;
    }

    if (!entry.trim()) {
      setMessage("⚠️ Entry is empty.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/journal/addEntry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_path: casePath,
          content: entry
        })
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Journal entry saved.");
        setEntry("");
      } else {
        setMessage("❌ Failed to save: " + (result.message || result.error));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("❌ Failed to reach journal API.");
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md text-slate-100">
      <h2 className="font-semibold mb-3 text-xl">📝 Journal</h2>
      <textarea
        className="border border-slate-700 p-2 rounded-xl text-sm w-full bg-[#111827] text-slate-100 placeholder:text-slate-400"
        rows={6}
        placeholder="Describe how you've been feeling today..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
      <button
        className="bg-blue-600 mt-2 px-4 py-1 rounded-xl text-white"
        onClick={handleSubmit}
      >
        Save Entry
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default JournalInputBlock;
