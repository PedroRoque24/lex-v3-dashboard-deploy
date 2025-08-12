import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCaseContext } from "./CaseContext";

// Fetch active problems log (from backend or static)
async function fetchActiveProblems(casePath) {
  const url = `/memory/${casePath}/active_problems.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// This will hit the backend every time a problem is solved
async function markProblemSolvedBackend(casePath, icd, summary) {
  try {
    await fetch("http://localhost:5000/api/problems/mark_solved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath, icd, summary }),
    });
  } catch (err) {
    console.error("FAILED to mark as solved", err);
  }
}

function getSolvedICDsLocal(casePath) {
  try {
    const saved = localStorage.getItem(`solved_problems_${casePath}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}
function saveSolvedICDsLocal(casePath, arr) {
  localStorage.setItem(`solved_problems_${casePath}`, JSON.stringify(arr));
}

// Smarter: Extract DISEASE only from a verbose summary
function extractDisease(summary = "") {
  if (!summary) return "";
  let match =
    summary.match(/suggestive of ([A-Za-z0-9\s\-\(\)\/]+)(\.|\)|$)/i) ||
    summary.match(/diagnosed with ([A-Za-z0-9\s\-\(\)\/]+)(\.|\)|$)/i) ||
    summary.match(/consistent with ([A-Za-z0-9\s\-\(\)\/]+)(\.|\)|$)/i) ||
    summary.match(/for ([A-Za-z0-9\s\-\(\)\/]+)(\.|\)|$)/i);

  if (match && match[1]) {
    return match[1].replace(/^(an?|the)\s+/i, "").replace(/\.$/, "").trim();
  }

  let parenMatch = summary.match(/\(([A-Za-z0-9\s\-/]+)\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].trim();
  }

  let diseaseWords = [
    "infection", "syndrome", "diabetes", "hypertension", "asthma",
    "pneumonia", "cancer", "disease", "fracture", "injury", "ulcer", "failure"
  ];
  let lastWords = summary.trim().split(/\s+/).slice(-4).join(" ");
  for (let dw of diseaseWords) {
    if (lastWords.toLowerCase().includes(dw)) return lastWords;
  }
  return "Diagnosis not found";
}

export default function ActiveProblemsPanel({ casePath }) {
  const [problems, setProblems] = useState([]);
  const [solvedICDs, setSolvedICDs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collapse logic
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!casePath) return;
    setLoading(true);
    fetchActiveProblems(casePath)
      .then(setProblems)
      .finally(() => setLoading(false));
    setSolvedICDs(getSolvedICDsLocal(casePath));
  }, [casePath]);

  const handleSolve = (icd, summary = "") => {
    if (!solvedICDs.includes(icd)) {
      const next = [...solvedICDs, icd];
      setSolvedICDs(next);
      saveSolvedICDsLocal(casePath, next);
      markProblemSolvedBackend(casePath, icd, summary);
    }
  };

  return (
    <div className="rounded-2xl shadow-lex mb-4 border-2 border-purple-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className={`w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-purple-700 bg-fuchsia-900/80 text-fuchsia-200 shadow`}
        onClick={() => setIsOpen((x) => !x)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">🩺</span>
          Active Problems
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-purple-700 animate-fadeIn transition-all">
          {loading ? (
            <div className="text-blue-300">Loading...</div>
          ) : problems.length === 0 ? (
            <div className="text-blue-300">No active problems found for this case.</div>
          ) : (
            <ul className="space-y-4">
              {problems.map((prob, idx) => {
                const isSolved = solvedICDs.includes(prob.icd);
                return (
                  <li
                    key={idx}
                    className={`p-4 rounded-xl border border-purple-700 flex flex-col bg-gray-800/80 shadow-lex relative transition-all duration-300 ${
                      isSolved ? "opacity-50 line-through" : ""
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="mr-2 text-xl">🏷️</span>
                      <span className="font-bold text-lg text-fuchsia-100">
                        {prob.name || extractDisease(prob.summary) || "(No diagnosis found)"}
                      </span>
                    </div>
                    <div className="mb-1 ml-7">
                      <span className="bg-fuchsia-900/60 inline-block px-2 py-1 rounded-xl text-fuchsia-300 text-sm">
                        ICD: {prob.icd}
                      </span>
                    </div>
                    {prob.timestamp && (
                      <div className="flex items-center mb-2 ml-7 text-blue-300 text-xs">
                        <span className="mr-1">📅</span>
                        {new Date(prob.timestamp).toLocaleString()}
                      </div>
                    )}
                    <div className="ml-7 mt-1">
                      {!isSolved && (
                        <button
                          className="bg-green-700 hover:bg-green-800 inline-flex items-center px-2 py-1 rounded-xl text-green-100 text-xs transition font-bold"
                          onClick={() => handleSolve(prob.icd, prob.summary || prob.name)}
                        >
                          <span role="img" aria-label="check" className="mr-1">✅</span>
                          Mark as Solved
                        </button>
                      )}
                      {isSolved && (
                        <span className="bg-purple-900 inline-flex items-center px-2 py-1 rounded-xl shadow text-blue-200 text-xs font-semibold">
                          <span role="img" aria-label="solved" className="mr-1">✔️</span>
                          Solved
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

