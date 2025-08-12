import { memoryUrl } from '../lib/api';
import React, { useState, useRef, useEffect } from "react";
import LexBurningBush from "./LexBurningBush";

// Use full backend URL for API calls
const API_BASE = "http://127.0.0.1:7999";
const AUDIO_UPLOAD_ENDPOINT = `${API_BASE}/api/upload_audio`;
const CHAT_ENDPOINT = `${API_BASE}/api/shadowbrain/chat_talk`;

export default function LiveLexChat() {
  const [messages, setMessages] = useState([
    { from: "lex", text: "Hello Pedro. I am here. Speak to me about anything, any time." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMicRecording, setIsMicRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---- Voice Recording Functions ----
  const startMicRecording = async () => {
    setIsMicRecording(true);
    audioChunksRef.current = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Use default browser format: usually "audio/webm"
    mediaRecorderRef.current = new window.MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      // PATCH: use "audio/webm" (browser default, best quality)
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      try {
        const resp = await fetch(AUDIO_UPLOAD_ENDPOINT, {
          method: "POST",
          body: formData
        });
        const data = await resp.json();
        if (data.transcript) {
          setInput(data.transcript);
          // Auto-send as chat
          sendMessage(data.transcript);
        }
      } catch (e) {
        alert("Voice transcription failed.");
      }
      setIsMicRecording(false);
    };

    mediaRecorderRef.current.start();
  };

  const stopMicRecording = () => {
    if (mediaRecorderRef.current && isMicRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // ---- Chat Send ----
  const sendMessage = async (messageOverride = null) => {
    const msg = messageOverride !== null ? messageOverride : input;
    if (!msg.trim()) return;
    const newMessages = [...messages, { from: "you", text: msg.trim() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg.trim() }),
      });
      const data = await res.json();
      setMessages(msgs => [
        ...msgs,
        { from: "lex", text: data.reply || "..." }
      ]);
      // NEW: play voice reply if available
      try {
        if (data.audio_url) {
          const a = new Audio(`${API_BASE}${data.audio_url}`);
          a.play().catch(() => {});
        }
      } catch (e) {
        console.warn("Audio play failed:", e);
      }
    } catch {
      setMessages(msgs =>
        [...msgs, { from: "lex", text: "ShadowBrain is unavailable at the moment." }]
      );
    }
    setLoading(false);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="flex flex-col min-h-[80vh] w-full"
      style={{
        background: "#070818",
        minHeight: "calc(100vh - 60px)",
        padding: 0,
        margin: 0,
        position: "relative",
        color: "#fff",
        overflow: "hidden"
      }}
    >
      {/* Burning Bush Avatar */}
      <div className="flex flex-col items-center justify-center pt-10 pb-4">
        <LexBurningBush size={300} />
        <div className="text-3xl font-extrabold text-fuchsia-400 mt-6">
          LiveLex – ShadowBrain Real-Time Chat
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-0 sm:px-8 py-4">
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "you" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-5 py-3 text-base max-w-[80%] shadow-lg
                  ${m.from === "you"
                    ? "bg-fuchsia-700 text-white self-end"
                    : "bg-[#16172c] text-fuchsia-200 border border-fuchsia-700 self-start"}`}
                style={{
                  fontWeight: m.from === "lex" ? "bold" : "normal",
                  fontSize: m.from === "lex" ? "1.12rem" : "1rem"
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>
      </div>

      {/* Input */}
      <form
        className="w-full px-0 sm:px-8 py-4 flex justify-center bg-[#070818] border-t border-fuchsia-700"
        onSubmit={e => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="flex-1 bg-[#18192b] rounded-2xl p-3 text-white outline-none mr-2 text-base border border-fuchsia-600"
          placeholder="Speak to Lex or type..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInput}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-fuchsia-700 text-white px-6 py-2 rounded-2xl font-bold shadow-fuchsia-500/20"
          disabled={loading || !input.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
        <button
          type="button"
          onClick={isMicRecording ? stopMicRecording : startMicRecording}
          className={`ml-3 px-6 py-2 rounded-2xl font-bold shadow-lex transition-all ${
            isMicRecording
              ? "bg-yellow-600 text-white"
              : "bg-yellow-800 text-white hover:bg-yellow-900"
          }`}
          style={{ minWidth: 48 }}
        >
          {isMicRecording ? "⏹ Stop Mic" : "🎤 Voice"}
        </button>
      </form>
    </div>
  );
}

