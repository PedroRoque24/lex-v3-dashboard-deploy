
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LibraryReportSimilarity({ patientId, caseId }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (!patientId || !caseId) return;
    axios
      .post("/api/reports/similarity", { patient_id: patientId, case_id: caseId })
      .then((res) => setReports(res.data || []))
      .catch((err) => console.error("Similarity fetch error:", err));
  }, [patientId, caseId]);

  if (reports.length === 0) return null;

  return (
    <div className="p-4 border rounded-xl bg-white shadow">
      <h2 className="text-lg font-bold mb-2">🔍 Similar Reports</h2>
      {reports.map((r, i) => (
        <div key={i} className="mb-2 p-2 border rounded">
          <div className="text-sm text-gray-600">Match: {r.similarity_score}%</div>
          <div className="text-xs text-gray-500">{r.summary}</div>
        </div>
      ))}
    </div>
  );
}