import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCaseContext } from "./CaseContext";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function LibraryCertificateArchive({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const { casePath } = useCaseContext() || {};
  const [savedReports, setSavedReports] = useState([]);
  const [selected, setSelected] = useState(null);

  // Load certificates for this case
  useEffect(() => {
    if (!casePath) return;
    axios.post("http://localhost:5000/api/certificates/get", { case_path: casePath })
      .then(res => setSavedReports(res.data || []));
  }, [casePath]);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file || !casePath) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      await axios.post("http://localhost:5000/api/certificates/add", {
        case_path: casePath,
        name: file.name,
        content,
      });
      const res = await axios.post("http://localhost:5000/api/certificates/get", { case_path: casePath });
      setSavedReports(res.data || []);
    };
    reader.readAsText(file);
  };

  const handleAttach = async () => {
    if (!selected || !casePath) return;
    await axios.post("http://localhost:5000/api/certificates/attach", {
      case_path: casePath,
      name: selected.name,
      content: selected.content,
    });
    alert("Certificate attached to patient case.");
  };

  return (
    <div className="rounded-2xl shadow-lex mb-6 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow"
        onClick={() => onClick(section)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">🗄️</span>
          Certificate Archive
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          <input
            type="file"
            accept=".txt"
            onChange={handleImport}
            className="block w-full bg-gray-900 text-blue-200 border border-blue-700 rounded-xl py-2 px-3 mb-2"
          />

          <ul className="space-y-2 mt-2">
            {savedReports.map((r, idx) => (
              <li key={idx}>
                <button
                  className="bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-800 transition"
                  onClick={() => setSelected(r)}
                  type="button"
                >
                  📄 {r.name}
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-blue-200">Preview: {selected.name}</h3>
              <textarea
                rows={12}
                className="w-full border border-blue-700 rounded-xl p-3 text-sm bg-gray-800 text-blue-100"
                value={selected.content}
                readOnly
              />
              <button
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700"
                onClick={handleAttach}
                type="button"
              >
                📎 Attach to Patient Case
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
