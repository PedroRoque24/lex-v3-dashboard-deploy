import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCaseContext } from "./CaseContext";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function LibraryExternalExport({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const { casePath } = useCaseContext() || {};
  const [tab, setTab] = useState("export");
  const [files, setFiles] = useState([]);
  const [savedCerts, setSavedCerts] = useState([]);
  const [selected, setSelected] = useState(null);

  // Load certs on tab/case switch
  useEffect(() => {
    if (tab === "archive" && casePath) {
      axios.post("http://localhost:5000/api/certificates/get", { case_path: casePath })
        .then(res => setSavedCerts(res.data || []));
    }
  }, [tab, casePath]);

  // Save uploaded file to backend
  const handleFileSelect = async (e) => {
    const filesArr = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...filesArr]);
    if (!casePath) return;
    for (let file of filesArr) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        await axios.post("http://localhost:5000/api/certificates/add", {
          case_path: casePath,
          name: file.name,
          content: event.target.result,
        });
      };
      reader.readAsText(file);
    }
    // Refresh archive after upload
    const res = await axios.post("http://localhost:5000/api/certificates/get", { case_path: casePath });
    setSavedCerts(res.data || []);
  };

  // Download all in-memory uploaded files (not archived ones)
  const downloadAll = () => {
    files.forEach((file) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Attach cert to patient case (again, saved in backend as attached_certificates.json)
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
          <span className="mr-2 text-2xl align-middle">📤</span>
          External Export & Saved Certificates
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>

      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          <div className="flex gap-2 mb-4">
            <button
              className={`px-4 py-2 rounded-t-xl font-bold transition text-base
                ${tab === "export"
                  ? "bg-blue-700 text-white shadow-lex"
                  : "bg-gray-700 text-blue-200 hover:bg-blue-800/40"}
              `}
              onClick={() => setTab("export")}
              type="button"
            >
              📤 External Export
            </button>
            <button
              className={`px-4 py-2 rounded-t-xl font-bold transition text-base
                ${tab === "archive"
                  ? "bg-blue-700 text-white shadow-lex"
                  : "bg-gray-700 text-blue-200 hover:bg-blue-800/40"}
              `}
              onClick={() => setTab("archive")}
              type="button"
            >
              📁 Saved Certificates
            </button>
          </div>

          {tab === "export" && (
            <div>
              <h2 className="text-xl font-bold text-blue-300 mb-3">External Export Mode</h2>
              <input
                type="file"
                multiple
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="block w-full bg-gray-900 text-blue-200 border border-blue-700 rounded-xl py-2 px-3 mb-2"
              />
              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  <h3 className="text-lg font-semibold text-blue-200">Selected Files:</h3>
                  <ul className="list-disc pl-5 text-sm text-blue-100">
                    {files.map((f, i) => (
                      <li key={i}>{f.name}</li>
                    ))}
                  </ul>
                  <button
                    onClick={downloadAll}
                    className="bg-fuchsia-700 text-white px-4 py-2 rounded-xl hover:bg-fuchsia-800 transition font-bold"
                    type="button"
                  >
                    ⬇️ Download All
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === "archive" && (
            <div>
              <h2 className="text-xl font-bold text-blue-300 mb-3">Saved Certificates</h2>
              <ul className="space-y-2">
                {savedCerts.map((r, idx) => (
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
      )}
    </div>
  );
}

