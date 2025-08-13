
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";

async function listFiles(glob) {
  try { const r = await fetch(`/api/list-files?glob=${encodeURIComponent(glob)}`, { cache: "no-store" }); if (!r.ok) return []; return await r.json(); } catch { return []; }
}
async function loadFirstAvailableContradictions() {
  for (const p of ["shadow_memory/contradictions.json"]) {
    try { const r = await fetch(`/memory/${p}`, { cache: "no-store" }); if (r.ok) return await r.json(); } catch {}
  }
  for (const g of ["shadow_memory/**/contradictions*.json"]) {
    const files = (await listFiles(g)).sort().reverse();
    for (const f of files) { try { const r = await fetch(`/memory/${f}`, { cache: "no-store" }); if (r.ok) return await r.json(); } catch {} }
  }
  try { const r2 = await fetch(`/contradictions.json`, { cache: "no-store" }); if (r2.ok) return await r2.json(); } catch {}
  return [];
}



/**
 * Shows latest contradiction with graceful fallbacks.
 * Source: /memory/contradictions.json (array)
 */
export default function ContradictionViewer() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    loadFirstAvailableContradictions().then((data)=>{ const arr = Array.isArray(data) ? data : []; const latest = arr.slice().sort((a,b)=> new Date(b.ts || b.timestamp || 0) - new Date(a.ts || a.timestamp || 0))[0]; setItem(latest || null); }).catch(()=> setItem(null));
  }, []);

  return (
    <div className="bg-gradient-to-tr from-[#201537d9] via-[#19112ad9] to-[#140e1eea] border border-red-900 rounded-2xl shadow-lex p-6">
      <h3 className="text-lg font-bold mb-2 text-red-300 flex items-center gap-2">
        <span role="img" aria-label="axe">🪓</span>
        Symbolic Contradiction
      </h3>
      {!item ? (
        <p className="text-fuchsia-400 italic">No contradictions detected.</p>
      ) : (
        <div className="border border-red-800 rounded-lg p-4 bg-red-950/50 shadow-inner">
          {item.conflict && <p><strong>Conflict:</strong> <span className="text-red-200">{item.conflict}</span></p>}
          {item.source_a && <p><strong>Source A:</strong> <span className="text-red-100">{item.source_a}</span></p>}
          {item.source_b && <p><strong>Source B:</strong> <span className="text-red-100">{item.source_b}</span></p>}
          {item.details && <p className="mt-1 text-red-100/90 whitespace-pre-wrap">{item.details}</p>}
          <p className="text-xs text-fuchsia-300 mt-2">🕒 {item.ts || item.timestamp || "Unknown time"}</p>
        </div>
      )}
    </div>
  );
}
