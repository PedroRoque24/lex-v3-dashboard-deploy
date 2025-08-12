import { memoryUrl } from '../lib/api';
import React, { useState, useRef, useEffect } from "react";

// Universal (ShadowBrain) Transcriber — SYSTEM AUDIO (not classic mic!)
const API_BASE = "http://localhost:7999"; // <--- CHANGE THIS FOR PROD IF NEEDED
const AUDIO_UPLOAD_ENDPOINT = "http://localhost:7999/api/upload_audio";

export default function UniversalTranscriberBox() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [editMode, setEditMode] = useState(false);
  const pollingRef = useRef(null);

  // ====== NEW: Mic recording state and refs ======
  const [isMicRecording, setIsMicRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ====== NEW: Start mic (browser) recording ======
  const startMicRecording = async () => {
    setIsMicRecording(true);
    audioChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      // Upload to backend
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");
      const resp = await fetch(AUDIO_UPLOAD_ENDPOINT, {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();
      setTranscript(data.transcript || "");
      setIsMicRecording(false);
    };

    mediaRecorderRef.current.start();
  };

  // ====== NEW: Stop mic (browser) recording ======
  const stopMicRecording = () => {
    if (mediaRecorderRef.current && isMicRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Start universal transcriber (legacy system audio)
  const handleStart = async () => {
    try {
      console.log(`Sending POST to ${API_BASE}/api/start_audio_listener`);
      const resp = await fetch(`${API_BASE}/api/start_audio_listener`, { method: "POST" });
      const text = await resp.text();
      console.log("Raw start response:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Start: Not valid JSON! Raw response:", text);
        throw err;
      }
      console.log("Start response:", data);
      setRecording(true);
      pollingRef.current = setInterval(fetchTranscript, 1200);
    } catch (err) {
      alert("Failed to start universal transcriber.");
      console.error("Start error:", err);
    }
  };

  // Stop universal transcriber (legacy system audio)
  const handleStop = async () => {
    try {
      console.log(`Sending POST to ${API_BASE}/api/stop_audio_listener`);
      const resp = await fetch(`${API_BASE}/api/stop_audio_listener`, { method: "POST" });
      const text = await resp.text();
      console.log("Raw stop response:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Stop: Not valid JSON! Raw response:", text);
        throw err;
      }
      console.log("Stop response:", data);
      setRecording(false);
      clearInterval(pollingRef.current);
      fetchTranscript(); // get last transcript
    } catch (err) {
      alert("Failed to stop universal transcriber.");
      console.error("Stop error:", err);
    }
  };

  // Fetch transcript from backend (curated by default)
  const fetchTranscript = async () => {
    try {
      console.log(`Fetching ${API_BASE}/api/live_transcript?mode=curated`);
      const resp = await fetch(`${API_BASE}/api/live_transcript?mode=curated`);
      const data = await resp.json();
      console.log("Transcript fetch response:", data);
      if (data && typeof data.transcript === "string") setTranscript(data.transcript);
    } catch (err) {
      console.error("Transcript fetch error:", err);
      // Fail silently, avoid user noise on polling
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(pollingRef.current);
    };
  }, []);

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Universal_Transcript.txt";
    a.click();
  };

  return (
    <div className="mt-6 bg-gray-900 border border-fuchsia-700 rounded-2xl p-6 shadow-lex">
      <h3 className="text-xl font-bold text-fuchsia-300 mb-4">
        🧠 Universal (ShadowBrain) Transcriber
      </h3>
      <button
        onClick={recording ? handleStop : handleStart}
        className={`mb-4 px-6 py-2 rounded-xl font-bold shadow-lex ${
          recording
            ? "bg-fuchsia-700 text-white"
            : "bg-fuchsia-800 text-white hover:bg-fuchsia-900"
        }`}
      >
        {recording ? "⏹ Stop Universal Transcriber" : "🎙 Start Universal Transcriber"}
      </button>
      <button
        onClick={fetchTranscript}
        className="mb-4 ml-4 px-6 py-2 rounded-xl font-bold bg-fuchsia-950 text-fuchsia-200 hover:bg-fuchsia-900"
      >
        🔄 Refresh Transcript
      </button>
      {/* ====== NEW: Mic Recording Button ====== */}
      <button
        onClick={isMicRecording ? stopMicRecording : startMicRecording}
        className={`mb-4 ml-4 px-6 py-2 rounded-xl font-bold shadow-lex ${
          isMicRecording
            ? "bg-yellow-600 text-white"
            : "bg-yellow-800 text-white hover:bg-yellow-900"
        }`}
      >
        {isMicRecording ? "⏹ Stop Mic Recording" : "🎤 Start Mic Recording"}
      </button>

      {transcript && (
        <div className="mt-4">
          <h4 className="font-bold text-white mb-2">📄 Universal Transcript:</h4>
          <div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-fuchsia-800 text-fuchsia-200 px-4 py-1 rounded hover:bg-fuchsia-900 mr-2"
            >
              {editMode ? "✅ Save & Lock" : "✏️ Edit Transcript"}
            </button>
            <button
              onClick={downloadTranscript}
              className="bg-fuchsia-700 text-white px-4 py-1 rounded hover:bg-fuchsia-800"
            >
              📥 Download TXT
            </button>
          </div>
          {editMode ? (
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={12}
              className="w-full p-3 border border-fuchsia-700 bg-black text-white rounded-xl mt-2"
            />
          ) : (
            <div className="p-3 bg-black text-white border border-fuchsia-700 rounded-xl whitespace-pre-wrap mt-2">
              {transcript}
            </div>
          )}
        </div>
      )}

      {!transcript && (
        <div className="mt-4 text-fuchsia-200">
          <em>No transcript available yet. Start transcriber and speak or play system audio!</em>
        </div>
      )}
    </div>
  );
}
