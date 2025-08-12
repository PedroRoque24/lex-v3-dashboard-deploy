
import { memoryUrl } from '../lib/api';
import React from "react";

export default function LexReportViewer({ lexOutput, casePath, patientId }) {
  if (!lexOutput || typeof lexOutput !== "string") return null;

  const downloadSummary = () => {
    const blob = new Blob([lexOutput], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lex_Reasoning_Summary.html";
    a.click();
  };

  const downloadSOAP = async () => {
    if (!casePath || !patientId) return alert("Missing case or patient ID.");
    try {
      const url = "http://127.0.0.1:5004/api/report/patient/soap?case_path=" + encodeURIComponent(casePath) + "&patient_id=" + encodeURIComponent(patientId);
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "Lex_SOAP_Report.html";
      a.click();
    } catch (err) {
      console.error("SOAP download failed", err);
    }
  };

  return (
    <div style={{ marginTop: "2em", padding: "1em", backgroundColor: "#fefefe", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>🧠 Lex Reasoning Summary</h3>
      <div style={{ whiteSpace: "pre-wrap", padding: "1em", backgroundColor: "#f9f9f9", borderRadius: "4px", border: "1px solid #ddd" }}>
        {lexOutput}
      </div>
      <div style={{ marginTop: "1em" }}>
        <button onClick={downloadSummary} style={{ marginRight: "10px" }}>
          📥 Download Reasoning
        </button>
        <button onClick={downloadSOAP}>
          📄 Download SOAP
        </button>
      </div>
    </div>
  );
}
