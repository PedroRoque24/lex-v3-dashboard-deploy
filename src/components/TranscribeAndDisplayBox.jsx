import { memoryUrl } from '../lib/api';
import React, { useState, useRef } from "react";
import axios from "axios";

export default function TranscribeAndDisplayBox({ setPatientData }) {
  const [recording, setRecording] = useState(false);
  const [summary, setSummary] = useState("");
  const [transcript, setTranscript] = useState("");
  const [editMode, setEditMode] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const toggleRecording = async () => {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 300) {
          alert("Recording too short.");
          return;
        }

        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          const resp = await axios.post("/api/clinical/transcribe_and_fill", formData);
          const { transcript, summary } = resp.data;
          setTranscript(transcript);
          setSummary(summary);
          setPatientData({ anamnesis: summary });
        } catch (err) {
          console.error("Transcription failed:", err);
          alert("Transcription failed.");
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } else {
      recorderRef.current?.stop();
      setRecording(false);
    }
  };

  const downloadTranscriptSummary = () => {
    const styledHTML =
      '<!DOCTYPE html>' +
      '<html><head><meta charset="UTF-8"><title>Transcript Clinical Summary</title>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; padding: 2rem; background-color: #18192b; color: #f3f3fa; line-height: 1.6; }' +
      'h2 { color: #7c3aed; }' +
      'pre { white-space: pre-wrap; font-family: inherit; }' +
      '</style></head><body>' +
      '<h2>📋 Suggested Clinical Summary</h2>' +
      '<pre>' + summary + '</pre>' +
      '</body></html>';

    const blob = new Blob([styledHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Transcript_Clinical_Summary.html";
    a.click();
  };

  return (
    <div className="mt-6 bg-gray-900 border border-purple-700 rounded-2xl p-6 shadow-lex">
      <h3 className="text-xl font-bold text-purple-300 mb-4">🎤 Transcription & Summary</h3>
      <button
        onClick={toggleRecording}
        className={`mb-4 px-6 py-2 rounded-xl font-bold shadow-lex ${
          recording
            ? "bg-fuchsia-700 text-white"
            : "bg-purple-700 text-white hover:bg-purple-800"
        }`}
      >
        {recording ? "⏹ Stop Recording" : "🎙 Start Transcription"}
      </button>
      {transcript && (
        <div className="mt-4">
          <h4 className="font-bold text-white mb-2">📝 Transcript:</h4>
          <div className="p-3 bg-black text-white border border-purple-700 rounded-xl whitespace-pre-wrap">
            {transcript}
          </div>
        </div>
      )}
      {summary && (
        <div className="mt-4">
          <h4 className="font-bold text-purple-300 mb-2">🧠 Suggested Clinical Summary:</h4>
          <div className="mb-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-purple-700 text-white px-4 py-1 rounded hover:bg-purple-800"
            >
              {editMode ? "✅ Save & Lock" : "✏️ Edit Summary"}
            </button>
          </div>
          {editMode ? (
            <textarea
              rows="10"
              className="w-full p-2 border border-purple-700 bg-black text-white rounded-xl"
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                setPatientData({ anamnesis: e.target.value });
              }}
            />
          ) : (
            <div className="p-3 bg-black text-white border border-purple-700 rounded-xl whitespace-pre-wrap">
              {summary}
            </div>
          )}
          <div className="mt-4">
            <button
              onClick={downloadTranscriptSummary}
              className="bg-fuchsia-700 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              📥 Download Clinical Summary
            </button>
          </div>
          <div className="mt-2 font-semibold text-gray-400">
            ✔️ You can now run LexBrain Reasoning above using this summary.
          </div>
        </div>
      )}
    </div>
  );
}
