
import { memoryUrl } from '../lib/api';
import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const DAYS_WINDOW = 30;
const MIN_POINTS_FOR_WINDOW = 5; // if too sparse in window, fall back to full history
const LS_KEY = "traitDrift.selectedTrait";

function inWindow(ts) {
  try {
    const t = new Date(ts).getTime();
    const now = Date.now();
    const cutoff = now - DAYS_WINDOW * 24 * 60 * 60 * 1000;
    return t >= cutoff && t <= now + 60 * 1000;
  } catch {
    return false;
  }
}

function flatten(data, useWindow = true) {
  const keep = (ts) => (useWindow ? inWindow(ts) : true);
  const pts = [];
  if (!data) return pts;

  // timeline array structure
  if (data.timeline && Array.isArray(data.timeline)) {
    for (const entry of data.timeline) {
      const ts = entry.timestamp || entry.ts || entry.time;
      const arr = Array.isArray(entry.traits) ? entry.traits : [];
      for (const t of arr) {
        const name = t.name || t.trait || t.dimension || "trait";
        const val = t.drift ?? t.value ?? t.delta ?? t.score ?? null;
        if (ts && typeof val === "number" && keep(ts)) pts.push({ ts, trait: name, val });
      }
    }
  }

  // per-trait arrays at root
  Object.keys(data).forEach((k) => {
    if (k === "timeline") return;
    const arr = data[k];
    if (Array.isArray(arr)) {
      for (const r of arr) {
        const ts = r.timestamp || r.ts || r.time;
        const from = r.from,
          to = r.to;
        let val = null;
        if (typeof r.drift === "number") val = r.drift;
        else if (typeof to === "number" && typeof from === "number") val = to - from;
        else if (typeof to === "number" && from == null) val = to;
        if (ts && typeof val === "number" && keep(ts)) pts.push({ ts, trait: k, val });
      }
    }
  });

  return pts.sort((a, b) => new Date(a.ts) - new Date(b.ts));
}

const DarkTooltip = (props) => {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#0b0b19",
        color: "#e5e7eb",
        border: "1px solid #374151",
        borderRadius: 8,
        padding: "8px 10px",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, marginTop: 4 }}>
          <span style={{ opacity: 0.9 }}>{p.name}</span>:{" "}
          <strong>{typeof p.value === "number" ? p.value.toFixed(3) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function TraitDriftChart() {
  const [data, setData] = useState([]);
  const [selectedTrait, setSelectedTrait] = useState(
    typeof window !== "undefined" ? window.localStorage.getItem(LS_KEY) || "" : ""
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const fetchJson = async (url) => {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error("bad");
          return res.json();
        };

        // Load from both files
        const [timelineData, symbolicData] = await Promise.allSettled([
          fetchJson("/memory/trait_drift_timeline.json"),
          fetchJson("/memory/symbolic_trait_drift_log.json"),
        ]);

        let combined = [];
        if (timelineData.status === "fulfilled") combined.push(...flatten(timelineData.value || {}, true));
        if (symbolicData.status === "fulfilled") combined.push(...flatten(symbolicData.value || {}, true));

        // Fallback to full history if window too sparse
        if (combined.length < MIN_POINTS_FOR_WINDOW) {
          let fullCombined = [];
          if (timelineData.status === "fulfilled") fullCombined.push(...flatten(timelineData.value || {}, false));
          if (symbolicData.status === "fulfilled") fullCombined.push(...flatten(symbolicData.value || {}, false));
          combined = fullCombined;
        }

        // Sort & dedupe
        combined.sort((a, b) => new Date(a.ts) - new Date(b.ts));
        const seen = new Set();
        const deduped = [];
        for (const p of combined) {
          const key = p.ts + "|" + p.trait;
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(p);
        }

        if (!cancelled) setData(deduped);
      } catch {
        if (!cancelled) setData([]);
      }
    }
    load();
    const id = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const traits = useMemo(() => Array.from(new Set(data.map((p) => p.trait))).sort(), [data]);

  // Ensure a valid selection
  useEffect(() => {
    if (!selectedTrait && traits.length) {
      setSelectedTrait(traits[0]);
    }
  }, [traits, selectedTrait]);

  // Persist selection
  useEffect(() => {
    try {
      if (selectedTrait) window.localStorage.setItem(LS_KEY, selectedTrait);
    } catch {}
  }, [selectedTrait]);

  const series = useMemo(() => data.filter((p) => p.trait === selectedTrait), [data, selectedTrait]);

  const tickFmt = (v) => {
    try {
      const d = new Date(v);
      return d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" });
    } catch {
      return v;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-tr from-[#201537d9] via-[#19172da9] to-[#2b174eea] text-fuchsia-100 rounded-2xl shadow-lex border border-fuchsia-900">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-fuchsia-300">Symbolic Trait Drift Timeline</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-80">Trait:</label>
          <select
            className="bg-fuchsia-950/50 border border-fuchsia-700 rounded px-2 py-1 text-sm focus:outline-none"
            value={selectedTrait}
            onChange={(e) => setSelectedTrait(e.target.value)}
          >
            {traits.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!series.length ? (
        <p className="text-sm italic text-fuchsia-400">No trait drift data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ts" tickFormatter={tickFmt} />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip content={<DarkTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="val" name={selectedTrait || "trait"} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
