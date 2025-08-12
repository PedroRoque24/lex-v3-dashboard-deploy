import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { useCaseContext } from "./CaseContext";

export default function VisionUploader({ showTitle = true }) {
  const context = useCaseContext() || {};
  const casePath = context.casePath || "patients/_tmp_fallback_case";
  const patientId = context.patientId || "patient_001";

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [contextText, setContextText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("🧠 VisionUploader initialized.");
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !contextText) {
      alert("Please select an image and enter clinical context.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("casePath", casePath);
    formData.append("context", contextText);

    try {
      const res = await fetch("http://localhost:5001/api/exam/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setResult("❌ " + data.error);
      } else {
        const log = data.log || {};
        let visionOut = log.vision_output || "No primary output.";
let reflectionOut = log.reflection_output || "";

// Compare normalized strings (case-insensitive, squash whitespace)
const clean = (txt) => (txt || "").toLowerCase().replace(/\s+/g, " ").trim();

if (reflectionOut && clean(reflectionOut) !== clean(visionOut)) {
  setResult(`✅ Vision Output:\n\n${visionOut}\n\n🧠 Reflection:\n${reflectionOut}`);
} else {
  setResult(`✅ Vision Output:\n\n${visionOut}`);
}
if (log && casePath) {
          await fetch("http://localhost:5000/api/exam/log/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              casePath: casePath,
              log: {
                timestamp: new Date().toISOString(),
                filename: selectedFile?.name,
                context: contextText,
                vision_output: log.vision_output,
                reflection_output: log.reflection_output,
              }
            })
          });
        }
        window.dispatchEvent(new Event("examUploaded"));
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
          🖼️ Upload Medical Image for AI Review
        </h3>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} className="bg-black text-white" />
      {preview && (
        <div
          style={{
            background: "#222",
            borderRadius: "1em",
            padding: "0.7em",
            display: "inline-block",
            marginTop: "0.5em",
            boxShadow: "0 2px 8px #0005",
            maxWidth: "370px"
          }}
        >
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: "350px",
              maxHeight: "250px",
              width: "auto",
              height: "auto",
              display: "block",
              borderRadius: "0.5em",
              objectFit: "contain",
              background: "#111"
            }}
          />
        </div>
      )}
      <textarea
        rows={2}
        placeholder="Describe what this image shows (clinical context)"
        value={contextText}
        onChange={(e) => setContextText(e.target.value)}
        className="w-full p-2 rounded-xl bg-black text-white border border-blue-700 mt-2"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-700 px-4 py-2 rounded hover:bg-blue-600 mt-2 text-white"
      >
        {loading ? "Analyzing..." : "Submit for AI Review"}
      </button>

      {result && (
        <button
          onClick={() => {
            const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "LexVision_Report.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-purple-700 text-white px-3 py-1 mt-3 rounded hover:bg-purple-600"
        >
          📄 Download Vision Summary
        </button>
      )}

      {result && (
        <div className="mt-6 space-y-6 bg-gray-900 border border-blue-800 rounded-xl shadow p-6 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2 text-blue-300">
            🧠 Vision Analysis Summary
          </h2>
          {result.split("###").map((section, idx) => {
            const [titleLine, ...contentLines] = section.trim().split("\n");
            const sectionTitle = titleLine.replace("**", "").replace(":", "").trim();
            const iconMap = {
              "Findings": "🦴",
              "Interpretation": "🧠",
              "Interpretation/Impression": "🧠",
              "Considerations": "📌",
              "Recommendations": "🧪",
              "Missing Reasoning and Recommendations": "⚠️",
              "Clarity Rephrased": "🔍",
              "Differential Diagnosis Reprioritization": "📚",
              "Flagging Uncertainty": "❗",
              "Inconsistencies Detection": "🧩",
              "Note": "📝",
              "Reflection": "💬",
              "Summary": "📝",
              "Key Findings": "📋",
              "Additional Consideration": "➕",
            };
            const highlight = [
              "Most Likely Diagnosis",
              "Differential Diagnosis Reprioritization",
              "Prioritized Differential Diagnosis",
            ].includes(sectionTitle);

            return (
              <div key={idx}>
                <h3
                  className={`text-md font-semibold mb-2 flex items-center gap-2 ${
                    highlight ? "text-red-700 underline underline-offset-4" : "text-blue-200"
                  }`}
                >
                  <span>{iconMap[sectionTitle] || "📄"}</span>
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



