import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext";

export default function ExamViewer() {
  const { casePath } = useCaseContext();
  const [logs, setLogs] = useState([]);
  const [curatedSummary, setCuratedSummary] = useState(""); // GPT summary
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [openIndexes, setOpenIndexes] = useState([]);
  const [showSummary, setShowSummary] = useState(true); // NEW: show/hide summary
  const [showRawLogs, setShowRawLogs] = useState(true); // NEW: show/hide raw logs

  // Fetch logs and GPT summary
  const fetchLogs = () => {
    if (!casePath) return;
    fetch("http://localhost:5000/api/exam/log/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath })
    })
      .then(res => res.json())
      .then(async data => {
        setLogs(data.reverse());

        // Fetch GPT summary as before
        setCuratedSummary("");
        setLoadingSummary(true);
        try {
          const gptRes = await fetch("http://localhost:5001/api/gpt/curate_exam_log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logs: data })
          });
          const gptData = await gptRes.json();
          setCuratedSummary(gptData.summary);
        } catch (e) {
          setCuratedSummary("⚠️ Failed to summarize exams with AI.");
        }
        setLoadingSummary(false);
      })
      .catch(err => {
        console.error("❌ Failed to load exam log:", err);
        setLogs([]);
        setCuratedSummary("");
        setLoadingSummary(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [casePath]);

  useEffect(() => {
    window.addEventListener("examUploaded", fetchLogs);
    return () => window.removeEventListener("examUploaded", fetchLogs);
    // eslint-disable-next-line
  }, [casePath]);

  const toggleIndex = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  if (!casePath) {
    return <div className="p-4 text-red-600">⚠️ Select a patient/case to view exams.</div>;
  }

  if (logs.length === 0) {
    return <div className="italic p-4 text-blue-200">No exams analyzed yet.</div>;
  }

  return (
    <div className="bg-gray-900 mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-4 text-xl">📄 AI-Analyzed Exams</h2>

      {/* Toggles */}
      <div className="flex gap-3 mb-2">
        <button
          onClick={() => setShowSummary(v => !v)}
          className="bg-gray-800 border border-blue-700 border-blue-700-purple-400 hover:bg-purple-200 px-3 py-1 rounded-xl text-blue-200"
        >
          {showSummary ? "Hide" : "Show"} Curated Summary
        </button>
        <button
          onClick={() => setShowRawLogs(v => !v)}
          className="bg-blue-100 border border-blue-700 border-blue-700-blue-400 hover:bg-blue-200 px-3 py-1 rounded-xl text-blue-200"
        >
          {showRawLogs ? "Hide" : "Show"} Raw Reports
        </button>
      </div>

      {/* GPT–curated summary */}
      {showSummary && (
        <div className="mb-4">
          {loadingSummary ? (
            <div className="italic text-blue-200">Summarizing with AI…</div>
          ) : (
            curatedSummary && (
              <div className="bg-gray-800 border border-blue-700-l-4 border-blue-700-purple-400 mb-4 p-4 rounded-xl">
                <h3 className="flex font-semibold gap-2 items-center mb-2 text-md">
                  <span>🧠</span> GPT–Curated Exam Summary
                </h3>
                <div className="text-sm whitespace-pre-line">{curatedSummary}</div>
              </div>
            )
          )}
        </div>
      )}

      {/* Raw log entries */}
      {showRawLogs && (
        <div className="space-y-4">
          {logs.map((entry, idx) => (
            <div key={idx} className="bg-gray-800 border border-blue-700 p-3 rounded-xl shadow-sm">
              <div className="flex items-center justify-between text-blue-200 text-sm">
                <span>
                  🗓 {new Date(entry.timestamp).toLocaleString()} • <code>{entry.filename}</code>
                </span>
                <button
                  onClick={() => toggleIndex(idx)}
                  className="hover:underline text-blue-200 text-xs"
                >
                  {openIndexes.includes(idx) ? "🔽 Hide Report" : "📝 Open Report"}
                </button>
              </div>

              {openIndexes.includes(idx) && (
                <div className="mt-3 space-y-3 text-sm whitespace-pre-wrap">
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-200">🧠 Vision Output</h3>
                    <div>{entry.vision_output}</div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-blue-200">⚖️ Lex Reflection</h3>
                    <div>{entry.reflection_output}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
