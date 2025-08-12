import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCaseContext } from "./CaseContext";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const TAGS = [
  "Cognitivo",
  "Emocional",
  "Somático",
  "Narrativo",
  "Outro"
];

export default function LibrarySymbolicReflection({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const { casePath } = useCaseContext() || {};
  const [entries, setEntries] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Fetch symbolic_summary.json
  useEffect(() => {
    if (!casePath) return;
    axios
      .post("http://localhost:5000/api/library/symbolic_summary", { case_path: casePath })
      .then(res => setEntries(res.data || []));
  }, [casePath]);

  const handleTagClick = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // Filter entries by selectedTags (if any)
  const filtered = selectedTags.length === 0
    ? entries
    : entries.filter(e => e.tags && e.tags.some(tag => selectedTags.includes(tag)));

  return (
    <div className="rounded-2xl shadow-lex mb-6 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition max-w-xl mx-auto">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow"
        onClick={() => onClick(section)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">🔮</span>
          Symbolic Reflection
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          <div className="flex flex-wrap gap-2 mb-4">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-4 py-2 rounded-xl text-base font-bold border-2 transition
                  ${selectedTags.includes(tag)
                    ? "bg-blue-700 text-white border-blue-900 shadow-lex"
                    : "bg-gray-700 text-blue-200 border-blue-700 hover:bg-blue-900/40"}
                `}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="text-blue-300 mb-2">
            <strong>Selecionadas:</strong> {selectedTags.join(", ") || "Nenhuma"}
          </div>
          <div className="mt-4 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-blue-400 text-sm">No entries for these tags.</div>
            ) : (
              filtered.map((entry, idx) => (
                <div key={idx} className="border border-blue-700 rounded-xl p-3 bg-gray-800 text-blue-100">
                  <div className="text-xs text-blue-300 mb-1">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="ml-2">
                        {entry.tags.map(t => (
                          <span key={t} className="inline-block px-2 py-0.5 bg-blue-900 text-blue-200 rounded mr-1 text-xxs">{t}</span>
                        ))}
                      </span>
                    )}
                    {entry.source && (
                      <span className="ml-2 text-yellow-400">[{entry.source}]</span>
                    )}
                  </div>
                  <div>{entry.text || entry.content || entry.summary || "—"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
