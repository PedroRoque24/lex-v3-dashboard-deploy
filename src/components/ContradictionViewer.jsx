
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";

/**
 * Shows latest contradiction with graceful fallbacks.
 * Source: /memory/contradictions.json (array)
 */
export default function ContradictionViewer() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    fetch("/memory/contradictions.json", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        const latest = arr.slice().sort((a,b)=> new Date(b.ts || b.timestamp || 0) - new Date(a.ts || a.timestamp || 0))[0];
        setItem(latest || null);
      })
      .catch(() => setItem(null));
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
