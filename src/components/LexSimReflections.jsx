import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";

async function loadFirstAvailableReflections() {
  try {
    const r = await fetch("/memory/clinical_reflection_log.json", { cache: "no-store" });
    if (r.ok) return { type: "json", body: await r.json() };
  } catch {}

  try {
    const r = await fetch("/memory/reflection-log.txt", { cache: "no-store" });
    if (r.ok) return { type: "txt", body: await r.text() };
  } catch {}

  try {
    const r = await fetch("/reflection-log.txt", { cache: "no-store" });
    if (r.ok) return { type: "txt", body: await r.text() };
  } catch {}

  return null;
}

export default function LexSimReflections() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    let canceled = false;

    async function load() {
      try {
        const found = await loadFirstAvailableReflections();
        if (!found) {
          if (!canceled) setLatest(null);
          return;
        }

        if (found.type === "json") {
          const arr = Array.isArray(found.body) ? found.body : [];
          if (arr.length) {
            const item = [...arr].sort(
              (a, b) =>
                new Date(b.ts || b.timestamp || 0) - new Date(a.ts || a.timestamp || 0)
            )[0];

            if (!canceled) {
              setLatest({
                timestamp: item.ts || item.timestamp || null,
                topic: item.topic || "symbolic_reflection",
                clarity: typeof item.clarity === "number" ? item.clarity : undefined,
                text: item.text || ""
              });
            }
            return;
          }
        }

        if (found.type === "txt") {
          const text = found.body || "";
          const lines = text.split(/\r?\n/).filter(Boolean);
          const last = [...lines].reverse().find(line => line && !line.includes("Ran:"));
          if (!canceled) {
            if (last) {
              const timeMatch = last.match(/\[(.*?)\]/);
              const timestamp = timeMatch ? timeMatch[1] : null;
              setLatest({
                timestamp,
                topic: "symbolic_reflection",
                text: last.replace(/^\[.*?\]\s*/, "")
              });
            } else {
              setLatest(null);
            }
          }
          return;
        }

        if (!canceled) setLatest(null);
      } catch {
        if (!canceled) setLatest(null);
      }
    }

    load();
    const id = setInterval(load, 5000);
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
