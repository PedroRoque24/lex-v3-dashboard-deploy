import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCaseContext } from "./CaseContext";

export default function MoodTracker() {
  const { casePath } = useCaseContext();
  const [mood, setMood] = useState("😐");
  const [status, setStatus] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const moodOptions = [
    { emoji: "😄", label: "Happy – feeling upbeat, positive" },
    { emoji: "😊", label: "Calm – relaxed or content" },
    { emoji: "😐", label: "Neutral – emotionally steady" },
    { emoji: "😞", label: "Sad – down or discouraged" },
    { emoji: "😡", label: "Angry – frustrated or upset" },
  ];

  const submitMood = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/mood/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, case_path: casePath }),
      });
      const data = await response.json();
      if (data.status === "mood saved") {
        setStatus("✅ Mood logged.");
      } else {
        setStatus("⚠️ Error saving mood.");
      }
    } catch (err) {
      console.error("Mood submission error:", err);
      setStatus("❌ Submission failed.");
    }
  };

  return (
    <div className="rounded-2xl shadow-lex mb-4 border-2 border-fuchsia-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-fuchsia-700 bg-fuchsia-900/80 text-fuchsia-200 shadow"
        onClick={() => setIsOpen(x => !x)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">🪞</span>
          Mood Tracker
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-fuchsia-700 animate-fadeIn transition-all">
          <div style={{ display: "flex", gap: "1em", fontSize: "2em", marginBottom: "0.5em" }}>
            {moodOptions.map((option) => (
              <span
                key={option.emoji}
                style={{
                  cursor: "pointer",
                  opacity: mood === option.emoji ? 1 : 0.5,
                  filter: mood === option.emoji ? "drop-shadow(0 0 10px #e879f9)" : "none",
                  transition: "opacity 0.2s, filter 0.2s",
                }}
                onClick={() => setMood(option.emoji)}
                title={option.label}
              >
                {option.emoji}
              </span>
            ))}
          </div>
          <div className="mb-2 text-fuchsia-300 text-lg font-semibold">
            {moodOptions.find((m) => m.emoji === mood)?.label}
          </div>
          <button
            className="bg-fuchsia-700 hover:bg-fuchsia-800 px-6 py-2 rounded-xl text-white text-base font-bold shadow-lex transition-all"
            style={{ marginTop: "0.5em" }}
            onClick={submitMood}
          >
            Submit Mood
          </button>
          {status && <p className="mt-2 text-fuchsia-200 font-bold">{status}</p>}
        </div>
      )}
    </div>
  );
}

