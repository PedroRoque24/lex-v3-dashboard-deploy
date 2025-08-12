import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import { useCaseContext } from "./CaseContext";

export default function PDFExamUploader({ showTitle = true }) {
  const context = useCaseContext() || {};
  const casePath = context.casePath || "patients/_tmp_fallback_case";
  const patientId = context.patientId || "patient_001";

  const [selectedFile, setSelectedFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [contextText, setContextText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFilename(file?.name || "");
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a PDF exam/lab result file.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("casePath", casePath);
    formData.append("context", contextText);

    try {
      const res = await fetch("/api/exam/analyze-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setResult("❌ " + data.error);
      } else {
        const log = data.log || {};
        const visionOut = log.vision_output || log.text_output || "No primary output.";
const reflectionOut = log.reflection_output || "";

const clean = (txt) => (txt || "").toLowerCase().replace(/\s+/g, " ").trim();

if (reflectionOut && clean(reflectionOut) !== clean(visionOut)) {
  setResult(`✅ PDF Output:\n\n${visionOut}\n\n🧠 Reflection:\n${reflectionOut}`);
} else {
  setResult(`✅ PDF Output:\n\n${visionOut}`);
}
      }
    } catch (err) {
      setResult("❌ Upload or AI processing failed.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-900 border border-blue-800 p-4 rounded-xl text-white space-y-4 mt-6">
      {showTitle && (
        <h3 className="text-xl font-bold text-blue-300">
          📄 Upload PDF Exam/Lab Results for AI Review
        </h3>
      )}
      <input type="file" accept=".pdf" onChange={handleFileChange} className="bg-black text-white" />
      {filename && <div className="text-sm text-blue-200 mt-2">File: {filename}</div>}
      <textarea
        rows={2}
        placeholder="Describe this PDF (optional context: e.g., 'Hemograma, resultado laboratorial')"
        value={contextText}
        onChange={(e) => setContextText(e.target.value)}
        className="w-full p-2 rounded-xl bg-black text-white border border-blue-700 mt-2"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-600 mt-2 text-white"
      >
        {loading ? "Analyzing..." : "Submit PDF for AI Review"}
      </button>

      {result && (
        <button
          onClick={() => {
            const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "LexPDF_Report.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-purple-700 text-white px-3 py-1 mt-3 rounded hover:bg-purple-600"
        >
          📄 Download PDF Summary
        </button>
      )}

      {result && (
        <div className="mt-6 space-y-6 bg-gray-900 border border-blue-800 rounded-xl shadow p-6 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-300">
            🧠 PDF Analysis Summary
          </h2>
          {result.split("###").map((section, idx) => {
            const [titleLine, ...contentLines] = section.trim().split("\n");
            const sectionTitle = titleLine.replace("**", "").replace(":", "").trim();
            return (
              <div key={idx}>
                <h3 className="text-md font-semibold mb-2 flex items-center gap-2 text-blue-200">
                  {sectionTitle}
                </h3>
                <ul className="list-disc list-inside text-sm text-gray-200 space-y-2 pl-2">
                  {contentLines
                    .filter((line) => line.trim() !== "")
                    .map((line, i) => (
                      <li key={i}>{line.replaceAll("**", "")}</li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

