import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCaseContext } from "./CaseContext";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function LibraryTimelineNavigator({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const { casePath } = useCaseContext() || {};
  const [timeline, setTimeline] = useState([]);
  const [query, setQuery] = useState("");

  // Fetch real continuum_timeline.json
  useEffect(() => {
    if (!casePath) return;
    axios
      .post("http://localhost:5000/api/library/continuum_timeline", { case_path: casePath })
      .then(res => setTimeline(res.data || []));
  }, [casePath]);

  // Filter entries by search query (in summary, content, or source)
  const filtered = timeline.filter((e) => {
    const q = query.trim().toLowerCase();
    return (
      !q ||
      (e.summary && e.summary.toLowerCase().includes(q)) ||
      (e.content && e.content.toLowerCase().includes(q)) ||
      (e.source && e.source.toLowerCase().includes(q))
    );
  });

  return (
    <div className="rounded-2xl shadow-lex mb-6 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition max-w-xl mx-auto">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow"
        onClick={() => onClick(section)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">⏳</span>
          Timeline Navigator
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          <input
            className="border border-blue-700 px-2 py-2 mb-4 rounded-xl w-full bg-gray-800 text-blue-100 placeholder:text-blue-400"
            placeholder="Buscar (ex: febre, consulta, exame, alta)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-blue-300 text-sm">Nenhum evento encontrado.</div>
            ) : (
              filtered.map((e, i) => (
                <div key={i} className="border border-blue-700 rounded-xl p-3 bg-gray-800 text-blue-100">
                  <div className="text-xs text-blue-300 mb-1">
                    {e.date ? new Date(e.date).toLocaleString() : ""}
                    {e.source && (
                      <span className="ml-2 text-yellow-400">[{e.source}]</span>
                    )}
                  </div>
                  <div className="font-semibold">{e.summary || e.content || "—"}</div>
                  {e.detail && <div className="text-xs text-blue-200 mt-1">{e.detail}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
