
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";

async function loadSymbolicMemory() {
  // Try JSON rollups
  const candidates = ["symbolic_memory.json", "long_memory_index.json", "shadow_memory/symbolic_memory.json"];
  for (const p of candidates) {
    try { const r = await fetch(`/memory/${p}`, { cache: "no-store" }); if (r.ok) return { type:"json", body: await r.json() }; } catch {}
  }
  // Offline fallbacks
  for (const p of ["symbolic_memory.json","long_memory_index.json"]) {
    try { const r = await fetch(`/${p}`, { cache: "no-store" }); if (r.ok) return { type:"json", body: await r.json() }; } catch {}
  }
  return null;
}


/**
 * Memory panel — prefer symbolic_memory.json; fallback to long_memory_index.json.
 */
export default function MemorySymbolicViewer() {
  const [memory, setMemory] = useState(null);

  useEffect(() => {
    let canceled = false;

    async function load() {
      // Preferred source
      try {
        const __mm = await loadSymbolicMemory();
        if (__mm && __mm.type==="json") {
          const arr = __mm.body;
          if (Array.isArray(arr) && arr.length) {
            const latest = [...arr].sort((a,b)=> new Date(b.ts || b.timestamp || 0) - new Date(a.ts || a.timestamp || 0))[0];
            if (!canceled) setMemory({
              type: "symbolic_event",
              symbol: latest?.facts?.[0]?.text || latest?.facts?.[0] || latest?.summary || "(unspecified)",
              valence: latest?.valence,
              clarity: latest?.clarity,
              timestamp: latest?.ts || latest?.timestamp
            });
            return;
          }
        }
      } catch {}

      // Fallback
      try {
        const res = await fetch("/memory/long_memory_index.json", { cache: "no-store" });
        const data = await res.json();
        const latest = (data || []).slice().reverse().find(entry => entry && entry.symbol && entry.symbol !== "(unspecified)");
        if (!canceled) setMemory(latest || null);
      } catch {
        if (!canceled) setMemory(null);
      }
    }

    load();
    const id = setInterval(load, 8000);
    return () => { canceled = true; clearInterval(id); };
  }, []);

  return (
    <div className="bg-gradient-to-tr from-[#201537d9] via-[#19112ad9] to-[#140e1eea] border border-blue-900 rounded-2xl shadow-lex p-6">
      <h3 className="text-lg font-bold mb-2 text-fuchsia-300 flex items-center gap-2">
        <span role="img" aria-label="brain">🧠</span>
        Memory
      </h3>
      {!memory ? (
        <p className="text-fuchsia-400 italic">No memory entries available.</p>
      ) : (
        <div className="border border-blue-900 rounded-lg p-4 bg-blue-950/60 shadow-inner">
          <p><strong>Type:</strong> <span className="text-fuchsia-100">{memory.type || "Unknown"}</span></p>
          <p><strong>Symbol:</strong> <span className="text-fuchsia-200">{memory.symbol}</span></p>
          <p><strong>Valence:</strong> <span className="text-fuchsia-100">{memory.valence ?? "Not specified"}</span></p>
          <p><strong>Clarity:</strong> <span className="text-fuchsia-100">{memory.clarity ?? "Not specified"}</span></p>
          <p className="text-xs text-fuchsia-300 mt-1">🕒 {memory.timestamp || "Unknown time"}</p>
        </div>
      )}
    </div>
  );
}
