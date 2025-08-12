
import { memoryUrl } from '../lib/api';
import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const DAYS_WINDOW = 30;
const MIN_POINTS_FOR_WINDOW = 5; // if fewer points, fall back to full history

function inWindow(ts) {
  try {
    const t = new Date(ts).getTime();
    const now = Date.now();
    const cutoff = now - DAYS_WINDOW*24*60*60*1000;
    return t >= cutoff && t <= now + 60*1000;
  } catch { return false; }
}

function flatten(data, useWindow=true) {
  const keep = (ts) => (useWindow ? inWindow(ts) : true);
  const pts = [];
  if (!data) return pts;

  // Support {"timeline":[{timestamp, traits:[{name, drift}]}]}
  if (data.timeline && Array.isArray(data.timeline)) {
    for (const entry of data.timeline) {
      const ts = entry.timestamp || entry.ts || entry.time;
      const arr = Array.isArray(entry.traits) ? entry.traits : [];
      for (const t of arr) {
        const name = t.name || t.trait || t.dimension || "trait";
        const val = t.drift ?? t.value ?? t.delta ?? t.score ?? null;
        if (ts && typeof val === "number" && keep(ts)) {
          pts.push({ ts, trait: name, val });
        }
      }
    }
  }

  // Support per-trait arrays: {"emotional_volatility":[{timestamp, from,to,drift}]}
  Object.keys(data).forEach(k => {
    if (k === "timeline") return;
    const arr = data[k];
    if (Array.isArray(arr)) {
      for (const r of arr) {
        const ts = r.timestamp || r.ts || r.time;
        let val = null;
        if (typeof r.drift === "number") val = r.drift;
        else if (typeof r.to === "number" && typeof r.from === "number") val = r.to - r.from;
        else if (typeof r.to === "number" && r.from == null) val = r.to;
        if (ts && typeof val === "number" && keep(ts)) {
          pts.push({ ts, trait: k, val });
        }
      }
    }
  });

  return pts.sort((a,b)=> new Date(a.ts) - new Date(b.ts));
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background:'#0b0b19', color:'#e5e7eb', border:'1px solid #374151', borderRadius:8, padding:'8px 10px' }}>
      <div style={{ fontSize:12, opacity:0.8 }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ fontSize:13, marginTop:4 }}>
          <span style={{ opacity:0.9 }}>{p.name}</span>: <strong>{typeof p.value==='number' ? p.value.toFixed(3) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function TraitDriftTimeline() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/memory/trait_drift_timeline.json", { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        // First try windowed data
        let pts = flatten(json || {}, true);
        // If too sparse, fall back to full history
        if (pts.length < MIN_POINTS_FOR_WINDOW) {
          pts = flatten(json || {}, false);
        }
        setPoints(pts);
      } catch {
        if (!cancelled) setPoints([]);
      }
    }
    load();
    const id = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // Group by trait, show the first series (we can add a selector later)
  const traits = useMemo(() => Array.from(new Set(points.map(p => p.trait))), [points]);
  const primary = traits[0] || null;
  const series = useMemo(() => points.filter(p => p.trait === primary), [points, primary]);

  const tickFmt = (v) => {
    try {
      const d = new Date(v);
      return d.toLocaleDateString(undefined, { month:'2-digit', day:'2-digit' });
    } catch { return v; }
  };

  return (
    <div className="p-6 bg-gradient-to-tr from-[#201537d9] via-[#19172da9] to-[#2b174eea] text-fuchsia-100 rounded-2xl shadow-lex border border-fuchsia-900">
      <h2 className="text-xl font-bold mb-3 text-fuchsia-300">Symbolic Trait Drift Timeline</h2>
      {!series.length ? (
        <p className="text-sm italic text-fuchsia-400">No trait drift data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ts" tickFormatter={tickFmt} />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip content={<DarkTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="val" name={primary || 'trait'} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
