
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext";

const EmotionalLogViewer = () => {
  const { casePath } = useCaseContext();
  const [log, setLog] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!casePath) return;
    fetch(`/memory/${casePath}/emotional_log.json`)
      .then(res => res.json())
      .then(data => setLog(data.reverse()))
      .catch(() => setLog([]));
  }, [casePath]);

  const displayed = expanded ? log : log.slice(0, 3);

  return (
    <div className="bg-gray-900 mt-4 p-4 rounded-xl shadow-md text-white">
      <h2 className="font-bold mb-3 text-xl">🧠 Emotional Reflection Log</h2>
      {log.length === 0 ? (
        <p className="italic text-blue-300 text-sm">No journal reflections analyzed yet.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {displayed.map((entry, i) => (
              <li key={i} className="bg-gray-50 border border-blue-700 p-3 rounded-xl">
                <p className="text-blue-300 text-sm">
                  🕒 <strong>{new Date(entry.timestamp).toLocaleString()}</strong>
                </p>
                <p className="italic mb-2 text-sm">"{entry.input}"</p>
                {entry.emotional_signals ? (
                  <ul className="list-disc ml-5 text-sm">
                    {entry.emotional_signals.map((e, j) => (
                      <li key={j}>
                        <strong>{e.emotion}</strong> <span className="text-blue-300 text-xs">({e.source}, {e.priority})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <>
                    {entry.gpt_emotion && (
                      <p className="mb-1 text-purple-300 text-sm">
                        GPT Emotion: <strong>{entry.gpt_emotion}</strong>
                      </p>
                    )}
                    {Array.isArray(entry.local_tags) && entry.local_tags.length > 0 && (
                      <ul className="list-disc ml-5 text-sm">
                        {entry.local_tags.map((tag, j) => (
                          <li key={j}>{tag}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
          {log.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="hover:underline mt-2 text-blue-300 text-sm"
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default EmotionalLogViewer;
