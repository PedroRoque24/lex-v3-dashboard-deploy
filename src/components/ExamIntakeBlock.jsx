import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import { useCaseContext } from "./CaseContext";

export default function ExamIntakeBlock() {
  const { casePath } = useCaseContext();
  const [file, setFile] = useState(null);
  const [context, setContext] = useState("");
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file || !casePath) {
      alert("Missing file or case context.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("casePath", casePath);
    formData.append("context", context);
    formData.append("linkToCase", "true");

    try {
      // 1. POST to LexBrain for AI analysis
      const res = await fetch("http://localhost:5001/api/exam/analyze", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setStatus(data.status || "Submitted.");
      // 2. PATCH: Immediately POST result to continuum for log sync
      if (data && data.log && casePath) {
        await fetch("http://localhost:5000/api/exam/log/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            casePath: casePath,
            log: {
              timestamp: new Date().toISOString(),
              filename: file?.name,
              context: context,
              vision_output: data.log.vision_output,
              reflection_output: data.log.reflection_output,
            }
          })
        });
      }
      // 3. Always trigger viewer reload
      window.dispatchEvent(new Event("examUploaded"));
    } catch (err) {
      console.error("Exam upload failed:", err);
      setStatus("❌ Upload failed.");
    }
  };

  return (
    <div className="bg-gray-900 border border-blue-700 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-2 text-lg">📤 Upload Exam for Preliminary Review</h2>
      <input
        type="file"
        accept="image/png, image/jpeg, application/pdf"
        onChange={handleFileChange}
        className="mb-2"
      />
      <textarea
        rows={3}
        placeholder="Enter clinical context (e.g. 'sore throat with fever')"
        className="border border-blue-700 mb-2 p-2 rounded-xl w-full"
        value={context}
        onChange={(e) => setContext(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white"
      >
        Submit for AI Review
      </button>
      {status && <p className="mt-2 text-blue-300 text-sm">{status}</p>}
    </div>
  );
}
