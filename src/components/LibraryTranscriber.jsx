import { memoryUrl } from '../lib/api';
import React, { useState, useRef } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function LibraryTranscriber({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const [recording, setRecording] = useState(false);
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
          // This expects your backend to return { transcript: "..." }
          const resp = await axios.post("/api/clinical/transcribe_and_fill", formData);
          const { transcript } = resp.data;
          setTranscript(transcript);
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

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "LibraryTranscript.txt";
    a.click();
  };

  return (
    <div className="rounded-2xl shadow-lex mb-6 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition max-w-xl mx-auto">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow"
        onClick={() => onClick(section)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">🎤</span>
          Transcription (Library Mode)
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          <button
            className={recording
              ? "bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
              : "bg-blue-700 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-800"}
            onClick={toggleRecording}
          >
            {recording ? "Stop Recording" : "Start Transcription"}
          </button>

          {transcript && (
            <div style={{ marginTop: "1em" }}>
              <h4 className="text-blue-300 mb-2 text-lg">📝 Transcript:</h4>
              <div className="mb-3">
                <button
                  className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-3 py-1 rounded-xl font-bold"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "✅ Save & Lock" : "✏️ Edit Transcript"}
                </button>
              </div>
              {editMode ? (
                <textarea
                  rows="10"
                  className="w-full p-3 border border-blue-700 rounded-xl bg-gray-800 text-blue-100"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              ) : (
                <div className="whitespace-pre-wrap bg-gray-800 text-blue-100 p-4 border border-blue-700 rounded-xl">
                  {transcript}
                </div>
              )}
              <div className="mt-3 flex gap-3">
                <button
                  className="bg-blue-700 text-white px-3 py-2 rounded-xl font-bold hover:bg-blue-800"
                  onClick={downloadTranscript}
                >
                  📥 Download Transcript
                </button>
                <button
                  className="bg-green-600 text-white px-3 py-2 rounded-xl font-bold hover:bg-green-700"
                  onClick={() => navigator.clipboard.writeText(transcript)}
                >
                  📋 Copy Transcript
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

