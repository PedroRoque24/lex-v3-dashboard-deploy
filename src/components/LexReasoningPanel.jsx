
import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import axios from "axios";

export default function LexReasoningPanel({ onReasoningDone, patientData, patientId }) {
  const [lexOutput, setLexOutput] = useState(null);
  const [casePath, setCasePath] = useState("");

  const runReasoning = async () => {
    try {
      const res = await axios.post("/api/run", { ...patientData, patient_id: patientId });
      const output = res.data.summary_raw || res.data.summary;
      const path = res.data.case_path || "";
      setLexOutput(output);
      setCasePath(path);
      if (onReasoningDone) {
        onReasoningDone({ lexOutput: output, casePath: path });
      }
    } catch (err) {
      console.error("Reasoning failed", err);
    }
  };

  return (
    <div style={{ marginTop: "2em" }}>
      <button onClick={runReasoning} style={{ background:"#7c3aed", color:"#fff", padding:"0.55rem 1rem", borderRadius:8 }}>
        Run LexBrain Reasoning
      </button>
      {!lexOutput && <p style={{ color:"#f59e0b", marginTop:"0.75rem" }}>⚠️ No summary available.</p>}
    </div>
  );
}