
import { memoryUrl } from '../lib/api';
import React from "react";

export default function LexSummaryExport({ casePath, patientId }) {
  if (!casePath || !patientId) return null;

  const downloadReasoning = () => {
    const url = `/reportapi/patient/download?mode=friendly&case_path=${encodeURIComponent(casePath)}&patient_id=${encodeURIComponent(patientId)}&sections=%5B%22summary%22%2C%22medications%22%2C%22timeline%22%2C%22encouragement%22%2C%22alerts%22%5D`;
    window.open(url, "_blank");
  };

  const downloadSOAP = async () => {
    try {
      const url = `/api/report/patient/soap?case_path=${encodeURIComponent(casePath)}&patient_id=${encodeURIComponent(patientId)}`;
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "Lex_SOAP_Report.html";
      a.click();
    } catch (err) {
      console.error("SOAP download failed:", err);
      alert("SOAP generation failed.");
    }
  };

  return (
    <div style={{ marginTop: "2em" }}>
      <h4 className="text-lg font-semibold mb-2">📤 Export Options</h4>
      <button onClick={downloadReasoning} className="mr-4 bg-blue-700 text-white px-4 py-2 rounded">
        📥 Download Lex Reasoning
      </button>
      <button onClick={downloadSOAP} className="bg-green-600 text-white px-4 py-2 rounded">
        📄 Generate SOAP
      </button>
    </div>
  );
}