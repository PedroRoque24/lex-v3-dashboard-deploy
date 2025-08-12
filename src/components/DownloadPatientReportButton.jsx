import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function DownloadPatientReportButton() {
  const { casePath } = useCaseContext();
  const [mode, setMode] = useState("friendly"); // "friendly" or "soap"
  const [sections, setSections] = useState({
    summary: true,
    medications: true,
    timeline: true,
    encouragement: true,
    alerts: true
  });

  // Collapse/expand logic
  const [isOpen, setIsOpen] = useState(true);

  const toggleSection = (key) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = () => {
    const patient_id = casePath.split("/")[1];
    const selected = Object.entries(sections)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    const query = new URLSearchParams({
      case_path: casePath,
      patient_id,
      mode: mode,
      sections: JSON.stringify(selected)
    }).toString();
    window.open(`/reportapi/patient/download?${query}`, "_blank");
  };

  return (
    <div className="rounded-2xl shadow-lex mb-4 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className={`w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/70 text-fuchsia-200 shadow`}
        onClick={() => setIsOpen((x) => !x)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">📋</span>
          Patient Report Generator
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          {/* Controls */}
          <div className="mb-3">
            <label className="font-semibold mr-2 text-base text-fuchsia-200">📄 Report Type:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="border border-blue-700 p-2 rounded-xl text-base bg-gray-950 text-white shadow"
            >
              <option value="friendly">🧠 Friendly (Patient Explanation)</option>
              <option value="soap">🩺 SOAP (Clinical Summary)</option>
            </select>
          </div>

          {mode === "friendly" && (
            <div className="gap-2 grid grid-cols-2 mb-4 text-base">
              {Object.keys(sections).map((key) => (
                <label key={key} className="flex gap-2 items-center text-fuchsia-100">
                  <input
                    type="checkbox"
                    checked={sections[key]}
                    onChange={() => toggleSection(key)}
                    className="form-checkbox accent-fuchsia-500"
                  />
                  <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </label>
              ))}
            </div>
          )}

          <button
            onClick={handleDownload}
            className="bg-fuchsia-700 hover:bg-fuchsia-800 mt-2 px-5 py-3 rounded-xl text-lg font-bold text-white shadow-lex transition-all"
          >
            📥 Generate Patient Report
          </button>
        </div>
      )}
    </div>
  );
}

// Don't forget to import useCaseContext!
import { useCaseContext } from "./CaseContext";
