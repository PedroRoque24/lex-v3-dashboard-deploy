import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCaseContext } from "./CaseContext";

export default function ReportHistoryViewer() {
  const { casePath } = useCaseContext();
  const [reports, setReports] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!casePath) return;
    fetch(`/api/report/patient/list?case_path=${casePath}`)
      .then(res => res.json())
      .then(data => setReports(data));
  }, [casePath]);

  return (
    <div className="rounded-2xl shadow-lex mb-4 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className={`w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow`}
        onClick={() => setIsOpen(x => !x)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">📂</span>
          Previous Reports
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          {reports.length === 0 ? (
            <p className="text-blue-300 text-sm">No reports found for this case.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {reports.map((r, i) => (
                <li
                  key={i}
                  className="bg-gray-800/90 border border-blue-700 flex items-start justify-between p-4 rounded-xl text-white shadow"
                >
                  <div>
                    <div className="font-semibold text-lg text-blue-100">
                      🧠 {r.type} — 👤 {r.patient_id} — 🕒 {r.timestamp}
                    </div>
                    {r.sections?.length > 0 && (
                      <div className="text-fuchsia-300 text-xs">
                        🗂 Sections: {r.sections.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}
                      </div>
                    )}
                    <div className="mt-1 text-blue-300 text-xs">{r.filename}</div>
                  </div>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-fuchsia-700 hover:bg-fuchsia-800 ml-4 px-3 py-1 rounded-xl text-white text-xs font-bold transition"
                  >
                    📥 Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

