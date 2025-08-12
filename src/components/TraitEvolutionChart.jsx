
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

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
  const series = [];

  async function pushFrom(url, mapper) {
    try {
      const data = await fetchJson(url);
      mapper(data, series);
    } catch {}
  }

  await pushFrom("/memory/identity-trend.json", (arr, out) => {
    if (!Array.isArray(arr)) return;
    for (const r of arr) {
      const ts = r.timestamp || r.ts || r.time;
      const bag = r.scores || r.traits || r.trait_scores || {};
      const avg = avgFromObj(bag);
      if (ts && avg != null) out.push({ ts, avg });
    }
  });

  await pushFrom("/memory/identity_score_history.json", (arr, out) => {
    if (!Array.isArray(arr)) return;
    for (const r of arr) {
      const ts = r.ts || r.timestamp || r.time;
      const bag = r.traits || r.scores || r.trait_scores || {};
      const avg = avgFromObj(bag);
      if (ts && avg != null) out.push({ ts, avg });
    }
  });

  // Sort, dedupe
  const ordered = series
    .filter(p => p && p.ts && typeof p.avg === "number")
    .sort((a,b)=> new Date(a.ts) - new Date(b.ts));
  const seen = new Set();
  const deduped = [];
  for (const p of ordered) {
    if (seen.has(p.ts)) continue;
    seen.add(p.ts);
    deduped.push(p);
  }

  // Window to last N days
  const windowed = deduped.filter(p => withinWindow(p.ts)).slice(-120);

  // Always append a "now" snapshot from latest weights to show current state
  async function snapshotPoint() {
    const nowIso = new Date().toISOString();
    // Try trait_weights_adjusted.json then last_trait_weights.json
    try {
      const obj = await fetchJson("/memory/trait_weights_adjusted.json");
      const avg = avgFromObj(obj);
      if (avg != null) return { ts: nowIso, avg };
    } catch {}
    try {
      const obj = await fetchJson("/memory/last_trait_weights.json");
      const avg = avgFromObj(obj);
      if (avg != null) return { ts: nowIso, avg };
    } catch {}
    try {
      const arr = await fetchJson("/memory/identity-profile.json");
      if (Array.isArray(arr) && arr.length) {
        const bag = Object.fromEntries(arr.map(it => [it.trait, it.score]));
        const avg = avgFromObj(bag);
        if (avg != null) return { ts: nowIso, avg };
      }
    } catch {}
    return null;
  }

  const snap = await snapshotPoint();
  if (snap) {
    if (windowed.length) windowed[windowed.length-1] = snap;
    else windowed.push(snap);
  }

  return windowed;
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

export default function TraitEvolutionChart() {
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
    <div className="bg-gradient-to-tr from-[#201537d9] via-[#19112ad9] to-[#140e1eea] border border-emerald-900 rounded-2xl shadow-lex p-6">
      <h3 className="text-lg font-bold mb-3 text-emerald-300 flex items-center gap-2">
        <span role="img" aria-label="dna">🧬</span>
        Trait Evolution Chart
      </h3>
      {!data.length ? (
        <p className="italic text-emerald-300/80">No trait evolution data in the last {DAYS_WINDOW} days.</p>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ts" tickFormatter={tickFmt} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip content={<DarkTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="avg" name="Avg Trait Score" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
