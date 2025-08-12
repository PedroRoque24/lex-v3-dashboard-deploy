
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext";

const CompanionEmotionHistoryViewer = () => {
  const { casePath } = useCaseContext();
  const [log, setLog] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!casePath) return;
    fetch(`/memory/${casePath}/companion_log.json`)
      .then(res => res.json())
      .then(data => setLog(data.reverse()))
      .catch(() => setLog([]));
  }, [casePath]);

  const visible = expanded ? log : log.slice(0, 2);

  if (hidden) return (
    <div className="mt-4 text-sm">
      <button
        className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded-xl text-white"
        onClick={() => setHidden(false)}
      >
        Show Lex Companion Emotional History
      </button>
    </div>
  );

  return (
    <div className="bg-gray-900 max-w-3xl mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-2 text-xl">🧠 Lex Companion – Emotional History</h2>
      {log.length === 0 ? (
        <p className="italic text-blue-300 text-sm">No emotional replies logged yet.</p>
      ) : (
        <>
          <ul className="space-y-4 text-sm">
            {visible.map((entry, i) => (
              <li key={i} className="bg-gray-50 border border-blue-700 p-3 rounded-xl">
                <p className="mb-1 text-blue-300">🕒 <strong>{new Date(entry.timestamp).toLocaleString()}</strong></p>
                <p className="italic mb-2 text-blue-300">User: "{entry.input}"</p>
                <p className="text-purple-300">🧠 Emotion: <strong>{entry.emotion || "Not tagged"}</strong></p>
                <div className="bg-gray-900 border border-blue-700-l-4 border-blue-700-purple-400 mt-2 p-2">
                  <p className="text-blue-300">Lex: {entry.response || entry.reply}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-x-2">
            {log.length > 2 && (
              <button
                className="bg-purple-200 hover:bg-purple-300 px-3 py-1 rounded-xl text-purple-300 text-sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show Less" : "Show More"}
              </button>
            )}
            <button
              className="bg-lex-card hover:bg-gray-300 px-3 py-1 rounded-xl shadow text-sm\ text-white"
              onClick={() => setHidden(true)}
            >
              Hide
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanionEmotionHistoryViewer;