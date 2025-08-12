import { memoryUrl } from '../lib/api';
import React, { useState, useRef } from "react";

export default function MicTest() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startMic = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      setIsRecording(false);
      alert("Stopped recording! (This means mic permissions and MediaRecorder work)");
    };
    mediaRecorderRef.current.start();
  };

  const stopMic = () => {
    if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop();
  };

  return (
    <div style={{padding: 40}}>
      <button
        onClick={isRecording ? stopMic : startMic}
        style={{fontSize: 28, padding: 20, background: "#222", color: "#fff", borderRadius: 10}}
      >
        {isRecording ? "⏹ Stop Mic" : "🎤 Start Mic (Test)"}
      </button>
      <div style={{marginTop: 20}}>Try clicking the button. If you see permissions popup, mic works.</div>
    </div>
  );
}
