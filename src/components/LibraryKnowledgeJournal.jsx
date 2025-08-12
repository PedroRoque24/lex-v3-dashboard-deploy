import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCaseContext } from "./CaseContext";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const GLOBAL_KEY = "global_knowledge_journal";

export default function LibraryKnowledgeJournal({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const { casePath } = useCaseContext() || {};
  const [journal, setJournal] = useState("");
  const [log, setLog] = useState([]);
  const [globalLog, setGlobalLog] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setLog([]);
    setError("");
    if (casePath) {
      axios.post("http://localhost:5000/api/journal/get", {
        case_path: casePath
      }).then(res => setLog(res.data || []))
        .catch(() => setError("Failed to load case journal."));
    }
    const globalEntries = localStorage.getItem(GLOBAL_KEY);
    setGlobalLog(globalEntries ? JSON.parse(globalEntries) : []);
  }, [casePath]);

  const handleSave = async () => {
    if (!journal.trim()) return;
    setError("");
    if (casePath) {
      try {
        await axios.post("http://localhost:5000/api/journal/addEntry", {
          case_path: casePath,
          content: journal.trim()
        });
        setJournal("");
        const res = await axios.post("http://localhost:5000/api/journal/get", {
          case_path: casePath
        });
        setLog(res.data || []);
      } catch (e) {
        setError("Failed to save entry to case journal.");
      }
    } else {
      const entry = {
        content: journal.trim(),
        timestamp: new Date().toISOString(),
      };
      const updated = [...globalLog, entry];
      localStorage.setItem(GLOBAL_KEY, JSON.stringify(updated));
      setGlobalLog(updated);
      setJournal("");
    }
  };

  return (
    <div className="rounded-2xl shadow-lex mb-6 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition max-w-xl mx-auto">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow"
        onClick={() => onClick(section)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">📘</span>
          Knowledge Journal
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          <textarea
            className="w-full min-h-[100px] rounded-xl border border-blue-700 bg-gray-800 text-blue-100 p-3 mb-4"
            placeholder="Write your clinical note or learning here..."
            value={journal}
            onChange={e => setJournal(e.target.value)}
          />
          <button
            className="bg-fuchsia-700 text-white px-4 py-2 rounded-xl font-bold hover:bg-fuchsia-800 transition mb-2"
            disabled={!journal.trim()}
            onClick={handleSave}
            type="button"
          >
            Save Journal
          </button>
          {error && (
            <div className="mt-2 text-red-400 font-bold">{error}</div>
          )}
          {casePath && (
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2 text-blue-200">Entries for Selected Case</h3>
              <ul className="space-y-2">
                {log.slice().reverse().map((entry, i) => (
                  <li key={i} className="bg-gray-800 rounded-xl p-3 border border-blue-700 text-blue-100">
                    <div className="text-xs text-blue-300 mb-1">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}
                    </div>
                    <div>{entry.content}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2 text-blue-200">
              {casePath ? "Global Notes (not tied to a case)" : "Journal Entries"}
            </h3>
            <ul className="space-y-2">
              {globalLog.slice().reverse().map((entry, i) => (
                <li key={i} className="bg-gray-800 rounded-xl p-3 border border-blue-700 text-blue-100">
                  <div className="text-xs text-blue-300 mb-1">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}
                  </div>
                  <div>{entry.content}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

