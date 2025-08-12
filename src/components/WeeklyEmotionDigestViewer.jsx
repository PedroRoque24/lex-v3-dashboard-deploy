import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext.jsx";

const WeeklyEmotionDigestViewer = () => {
  const { casePath } = useCaseContext();
  const [text, setText] = useState("");

  useEffect(() => {
    if (!casePath) return;

    fetch("http://localhost:5000/api/emotion_weekly_digest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ case_path: casePath })
    })
      .then((res) => res.json())
      .then((data) => {
        setText(data.text);
      })
      .catch((err) => {
        console.error("Digest error:", err);
        setText("⚠️ Digest backend returned HTML or malformed data.");
      });
  }, [casePath]);

  return (
    <div className="bg-gray-900 max-w-3xl mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-2 text-xl">📅 Weekly Emotional Digest</h2>
      <p className="text-sm whitespace-pre-line">{text || "Generating digest..."}</p>
    </div>
  );
};

export default WeeklyEmotionDigestViewer;
