
import { memoryUrl } from '../lib/api';
import { useCaseContext } from './CaseContext.jsx';
import React, { useEffect, useState } from 'react';

function CompanionPromptViewer() {
  const context = useCaseContext();
  const [prompts, setPrompts] = useState([]);
  const [error, setError] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [expanded, setExpanded] = useState(false);

  const fetchPrompts = () => {
    if (!context?.casePath) return;
    fetch("http://127.0.0.1:5000/api/companion_prompts/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: context.casePath })
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPrompts(data.reverse());
        else setError("⚠️ Failed to load prompts.");
      })
      .catch((err) => {
        console.error(err);
        setError("❌ Connection error.");
      });
  };

  useEffect(() => {
    fetchPrompts();
  }, [context]);

  const sendPrompt = () => {
    if (!newPrompt.trim()) return;
    fetch("http://127.0.0.1:5000/api/companion_prompts/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newPrompt, case_path: context.casePath })
    })
      .then(res => res.json())
      .then(() => {
        setNewPrompt("");
        fetchPrompts();
      });
  };

  const visible = expanded ? prompts : prompts.slice(0, 2);

  if (!context) return <div>Loading context...</div>;

  return (
    <div className="bg-gray-900 max-w-3xl mt-4 p-4 rounded-xl shadow text-slate-100">
      <h2 className="font-bold mb-2 text-xl">🗣️ Lex Companion Prompt History</h2>
      <p className="mb-4 text-blue-300 text-sm">Path: <code>{context.casePath}</code></p>

      <div className="mb-4">
        <textarea
          rows={3}
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          placeholder="How are you feeling? Write here..."
          className="border border-slate-700 p-2 rounded-xl text-sm w-full bg-[#111827] text-slate-100 placeholder:text-slate-400"
        />
        <button
          onClick={sendPrompt}
          className="bg-purple-600 hover:bg-purple-700 mt-2 px-4 py-1 rounded-xl text-sm text-white"
        >
          Submit Prompt
        </button>
      </div>

      {error && <p className="mb-2 text-red-500 text-sm">{error}</p>}
      {prompts.length === 0 && !error ? (
        <p className="italic text-blue-300 text-sm">No prompts found.</p>
      ) : (
        <>
          <ul className="space-y-4 text-sm">
            {visible.map((entry, index) => (
              <li key={index} className="bg-gray-50 border border-blue-700 p-3 rounded-xl">
                <p className="mb-1 text-blue-300 text-xs">🕒 {new Date(entry.timestamp).toLocaleString()}</p>
                <p className={entry.sender === "user" ? "text-blue-300" : "text-purple-300"}>
                  <strong>{entry.sender === "user" ? "🧍 You:" : "🧠 Lex:"}</strong> {entry.message}
                </p>
              </li>
            ))}
          </ul>
          {prompts.length > 2 && (
            <button
              className="bg-purple-200 hover:bg-purple-300 mt-4 px-3 py-1 rounded-xl text-purple-300 text-sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default CompanionPromptViewer;
