
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";

/**
 * Latest LexSim Reflection card
 * Primary source: /memory/clinical_reflection_log.json (array of {ts|timestamp, text, topic?, clarity?})
 * Fallback:       /memory/reflection-log.txt (legacy lines)
 */
export default function LexSimReflections() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    let canceled = false;

    async function load() {
      // 1) Try JSON (canonical)
      try {
        const res = await fetch("/memory/clinical_reflection_log.json", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const item = [...data].sort((a,b) => new Date(b.ts || b.timestamp || 0) - new Date(a.ts || a.timestamp || 0))[0];
            if (!canceled) setLatest({
              timestamp: item.ts || item.timestamp || null,
              topic: item.topic || "symbolic_reflection",
              clarity: typeof item.clarity === "number" ? item.clarity : undefined,
              text: item.text || ""
            });
            return;
          }
        }
      } catch {}

      // 2) Fallback to legacy TXT
      try {
        const txtRes = await fetch("/memory/reflection-log.txt", { cache: "no-store" });
        const text = await txtRes.text();
        const lines = text.split(/\\r?\\n/).filter(Boolean);
        // pick most recent line that looks like a reflection
        const last = lines.reverse().find(line => line && !line.includes("Ran:"));
        if (last) {
          const timeMatch = last.match(/\\[(.*?)\\]/);
          const timestamp = timeMatch ? timeMatch[1] : null;
          setLatest({ timestamp, topic: "symbolic_reflection", text: last.replace(/^\\[.*?\\]\\s*/, "") });
        } else {
          setLatest(null);
        }
      } catch {
        setLatest(null);
      }
    }

    load();
    const id = setInterval(load, 5000); // light poll to keep "latest" fresh
    return () => { canceled = true; clearInterval(id); };
  }, []);

  return (
    <div className="bg-gradient-to-tr from-yellow-900/20 via-yellow-900/10 to-yellow-900/5 border border-yellow-800 rounded-2xl shadow-lex p-6">
      <h3 className="text-lg font-bold mb-2 text-yellow-300 flex items-center gap-2">
        <span role="img" aria-label="spark">🔰</span>
        Latest LexSim Reflection
      </h3>
      {!latest ? (
        <p className="italic text-yellow-300/70">No LexSim reflections available.</p>
      ) : (
        <div className="border border-yellow-800 bg-yellow-900/40 p-4 rounded shadow-inner">
          <p className="text-xs text-yellow-200 mb-2">🕒 {latest.timestamp || "Unknown time"}</p>
          {latest.topic && <p><strong>🧠 Topic:</strong> <span className="text-yellow-100">{latest.topic}</span></p>}
          {typeof latest.clarity === "number" && <p><strong>✨ Clarity:</strong> <span className="text-yellow-200">{latest.clarity.toFixed(2)}</span></p>}
          {latest.text && <p className="mt-2 text-yellow-50 whitespace-pre-wrap">{latest.text}</p>}
        </div>
      )}
    </div>
  );
}
