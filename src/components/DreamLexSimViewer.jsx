
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";

/**
 * DreamLexSimViewer
 * - Loads /memory/scored-dreams.json
 * - Sorts newest first
 * - Per-item Show more / Show less
 * - Graceful fallbacks for different dream payload shapes
 */
export default function DreamLexSimViewer() {
  const [dreams, setDreams] = useState([]);
  const [expandedList, setExpandedList] = useState(false);
  const [openMap, setOpenMap] = useState({}); // {id: boolean}

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/memory/scored-dreams.json", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setDreams(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancelled) setDreams([]);
      }
    }

    load();
    const id = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const items = Array.isArray(dreams) ? dreams.slice().sort((a, b) => {
    const ta = new Date(a.ts || a.timestamp || a.time || 0).getTime();
    const tb = new Date(b.ts || b.timestamp || b.time || 0).getTime();
    return tb - ta;
  }) : [];

  const visible = expandedList ? items : items.slice(0, 3);

  const getText = (d) => {
    return (
      d.text ||
      d.dream_text ||
      d.content ||
      d.body ||
      d.summary ||
      d.description ||
      d.dream ||
      (Array.isArray(d.paragraphs) ? d.paragraphs.join("\n\n") : "")
    ) || "";
  };

  const toggleOpen = (id) => setOpenMap((m) => ({ ...m, [id]: !m[id] }));

  return (
    <div className="bg-gradient-to-tr from-[#201537d9] via-[#19112ad9] to-[#140e1eea] border border-fuchsia-900 rounded-2xl shadow-lex p-6">
      <h3 className="text-lg font-bold mb-2 text-fuchsia-300 flex items-center gap-2">
        <span role="img" aria-label="dream">🌌</span>
        Dream
      </h3>

      {visible.map((d, idx) => {
        const id = (d.id ?? d.uid ?? `${d.timestamp || d.ts || "t"}-${idx}`) + "";
        const isOpen = !!openMap[id];
        const full = getText(d);
        const preview = full.length > 260 && !isOpen ? full.slice(0, 260) + "…" : full;
        const title = d.title || d.type || "symbolic_override_dream";
        const time = d.timestamp || d.ts || d.time || "Unknown time";

        return (
          <div key={id} className="border border-fuchsia-800 rounded-lg p-4 bg-fuchsia-950/40 shadow-inner mb-4">
            <p className="font-semibold text-fuchsia-100 mb-1">{title}</p>
            <p className="text-xs text-fuchsia-300 mb-2">{time}</p>
            <p className="text-fuchsia-50 whitespace-pre-wrap">{preview}</p>
            {full.length > 260 && (
              <button
                className="text-blue-400 underline mt-2"
                onClick={() => toggleOpen(id)}
                type="button"
              >
                {isOpen ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        );
      })}

      {items.length > 3 && (
        <button
          className="text-blue-400 underline mt-1"
          onClick={() => setExpandedList((v) => !v)}
          type="button"
        >
          {expandedList ? "Show Fewer" : `Show All (${items.length})`}
        </button>
      )}

      {(!items || items.length === 0) && (
        <p className="text-fuchsia-400 italic">No dreams available.</p>
      )}
    </div>
  );
}
