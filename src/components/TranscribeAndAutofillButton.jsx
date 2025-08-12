
import { memoryUrl } from '../lib/api';
import React, { useState, useRef } from "react";

export default function TranscribeAndAutofillButton() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
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

      if (blob.size < 500) {
        alert("Recording failed or was too short.");
        return;
      }

      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");

      try {
        const response = await fetch("http://localhost:5001/api/clinical/transcribe_and_fill", {
          method: "POST",
          body: formData,
        });

        const text = await response.text();
console.log("[LEX RAW TRANSCRIPT]", text);

let data;
try {
  data = JSON.parse(text);
} catch (err) {
  alert("Response was not valid JSON. See console.");
  return;
}

        if (!data || typeof data !== "object") {
  alert("Transcription failed (invalid response).");
  return;
}

if (data.error) {
          alert("Error: " + data.error);
          return;
        }

        if (data.anamnesis) document.getElementById("anamnesis-input").value = data.anamnesis;
        if (data.medications) document.getElementById("chronic-meds").value = data.medications;
        if (data.allergies) document.getElementById("allergy-input").value = data.allergies;
        if (data.family_history) document.getElementById("family-history-input").value = data.family_history;
        if (data.substance_use) document.getElementById("substance-use-input").value = data.substance_use;

        setTranscript(data.transcript || "");
      } catch (err) {
        alert("Transcription failed.");
      }
    };

    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={recording ? stopRecording : startRecording}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        {recording ? "⏹ Stop Transcription" : "🎙 Start Transcription"}
      </button>

      {transcript && (
        <details className="mt-2">
          <summary className="font-bold text-white">📄 View Transcript</summary>
          <pre className="p-2 bg-gray-800 text-white rounded mt-2 whitespace-pre-wrap">
            {transcript}
          </pre>
        </details>
      )}
    </div>
  );
}