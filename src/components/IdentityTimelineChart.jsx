
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const DAYS_WINDOW = 30;

function avgFromObj(obj) {
  const vals = Object.values(obj || {}).map(v => Number(v)).filter(n => !isNaN(n));
  if (!vals.length) return null;
  return vals.reduce((a,b)=>a+b, 0) / vals.length;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("bad");
  return res.json();
}

function withinWindow(ts) {
  try {
    const t = new Date(ts).getTime();
    const now = Date.now();
    const cutoff = now - DAYS_WINDOW*24*60*60*1000;
    return t >= cutoff && t <= now + 60*1000;
  } catch { return false; }
}

async function loadSeries() {
  const points = [];

  // Try known historical sources
  const histSources = [
    "/memory/identity-trend.json",
    "/memory/identity_score_history.json"
  ];
  for (const url of histSources) {
    try {
      const arr = await fetchJson(url);
      if (Array.isArray(arr)) {
        for (const r of arr) {
          const ts = r.timestamp || r.ts || r.time;
          const bag = r.scores || r.traits || r.trait_scores || {};
          const avg = avgFromObj(bag);
          if (ts && avg != null && withinWindow(ts)) points.push({ ts, avg });
        }
      }
    } catch {}
  }

  // Always append a snapshot for "now"
  const nowIso = new Date().toISOString();
  const snapshotSources = [
    "/memory/trait_weights_adjusted.json",
    "/memory/last_trait_weights.json"
  ];
  let snapAvg = null;
  for (const url of snapshotSources) {
    try {
      const obj = await fetchJson(url);
      snapAvg = avgFromObj(obj);
      if (snapAvg != null) break;
    } catch {}
  }
  if (snapAvg == null) {
    try {
      const arr = await fetchJson("/memory/identity-profile.json");
      if (Array.isArray(arr) && arr.length) {
        const bag = Object.fromEntries(arr.map(it => [it.trait, it.score]));
        snapAvg = avgFromObj(bag);
      }
    } catch {}
  }
  if (snapAvg != null) points.push({ ts: nowIso, avg: snapAvg });

  // Sort & dedupe
  const ordered = points.sort((a,b)=> new Date(a.ts) - new Date(b.ts));
  const seen = new Set();
  const deduped = [];
  for (const p of ordered) {
    if (seen.has(p.ts)) continue;
    seen.add(p.ts);
    deduped.push(p);
  }

  return deduped;
}

const DarkTooltip = (props) => {
  const { active, payload, label } = props;
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

export default function IdentityTimelineChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const pts = await loadSeries();
      if (!cancelled) setData(pts);
    }
    refresh();
    const id = setInterval(refresh, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const tickFmt = (v) => {
    try {
      const d = new Date(v);
      return d.toLocaleDateString(undefined, { month:'2-digit', day:'2-digit' });
    } catch { return v; }
  };

  return (
    <div className="p-6 bg-gradient-to-tr from-[#201537d9] via-[#19172da9] to-[#2b174eea] text-fuchsia-100 rounded-2xl shadow-lex border border-fuchsia-900">
      <h2 className="text-lg font-bold mb-2 text-fuchsia-300">🧬 Trait Evolution Chart</h2>
      {!data.length ? (
        <p className="text-sm italic text-fuchsia-400">No trait evolution data in the last {DAYS_WINDOW} days.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ts" tickFormatter={tickFmt} stroke="#a78bfa" />
            <YAxis stroke="#fff" domain={['auto','auto']} />
            <Tooltip content={<DarkTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#a7f3d0"
              name="Avg Score"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}