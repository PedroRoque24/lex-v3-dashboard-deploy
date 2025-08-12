import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext.jsx";

const EmotionalSummaryViewer = () => {
  const { casePath } = useCaseContext();
  const [summary, setSummary] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!casePath) return;
    fetch(`/memory/${casePath}/emotional_summary.json`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));
  }, [casePath]);

  return (
    <div className="bg-gray-900 mt-4 p-4 rounded-xl shadow-md text-white">
      <h2 className="font-bold mb-2 text-xl">📊 Emotional Summary</h2>
      {!summary ? (
        <p className="italic text-blue-300 text-sm">No summary available.</p>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-blue-300">🕒 <strong>{new Date(summary.timestamp).toLocaleString()}</strong></p>
          <p>Entries analyzed: <strong>{summary.entries_analyzed}</strong></p>
          {expanded && (
            <>
              <div>
                <p className="font-semibold mt-2">Top GPT Emotions:</p>
                <ul className="list-disc ml-5">
                  {summary.top_gpt_emotions.map((e, i) => (
                    <li key={i}>{e[0]} ({e[1]})</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold mt-2">Top Local Emotions:</p>
                <ul className="list-disc ml-5">
                  {summary.top_local_emotions.map((e, i) => (
                    <li key={i}>{e[0]} ({e[1]})</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900 border border-blue-700 italic mt-3 p-3 rounded-xl text-sm">
                {summary.summary_text}
              </div>
            </>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="hover:underline mt-2 text-blue-300 text-sm"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmotionalSummaryViewer;
