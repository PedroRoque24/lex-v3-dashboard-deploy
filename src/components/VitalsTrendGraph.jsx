
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export default function VitalsTrendGraph({ casePath }) {
  const [data, setData] = useState([]);

  
  const calcStats = (arr) => {
    if (!arr.length) return {};
    const sorted = [...arr].sort((a, b) => a - b);
    const sum = arr.reduce((a, b) => a + b, 0);
    return {
      avg: (sum / arr.length).toFixed(1),
      min: Math.min(...arr),
      max: Math.max(...arr),
      median: sorted.length % 2 === 0
        ? ((sorted[sorted.length / 2] + sorted[sorted.length / 2 - 1]) / 2).toFixed(1)
        : sorted[Math.floor(sorted.length / 2)].toFixed(1)
    };
  };

  const hrStats = calcStats(data.map(e => Number(e.hr)).filter(Boolean));
  const sysStats = calcStats(data.map(e => Number(e.sys)).filter(Boolean));
  const diaStats = calcStats(data.map(e => Number(e.dia)).filter(Boolean));
  const tempStats = calcStats(data.map(e => Number(e.temp)).filter(Boolean));
  const spo2Stats = calcStats(data.map(e => Number(e.spo2)).filter(Boolean));

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const res = await fetch(`/memory/${casePath}/vital_trend_log.json`);
        const json = await res.json();
        const entries = Object.entries(json || {}).map(([date, v]) => ({
          date,
          temp: v.temperature,
          hr: v.hr,
          spo2: v.spo2,
          sys: v.bp?.split("/")?.[0] || null,
          dia: v.bp?.split("/")?.[1] || null
        }));
        setData(entries.reverse());
      } catch {
        console.warn("Vitals trend not found");
      }
    };

    fetchVitals();
  }, [casePath]);

  return (
    <div className="bg-gray-950 border border-blue-700 border-blue-700-yellow-800 mt-10 p-4 rounded-xl-xl text-white">
      <h3 className="font-bold mb-4 text-xl text-yellow-300">📊 Vitals Trends</h3>
      
      <div className="gap-2 grid grid-cols-1 mb-4 md:grid-cols-3 sm:grid-cols-2 text-sm text-yellow-300">
        <div>❤️ HR → Avg: {hrStats.avg} | Med: {hrStats.median} | Min: {hrStats.min} | Max: {hrStats.max}</div>
        <div>💉 Sys → Avg: {sysStats.avg} | Med: {sysStats.median} | Min: {sysStats.min} | Max: {sysStats.max}</div>
        <div>💉 Dia → Avg: {diaStats.avg} | Med: {diaStats.median} | Min: {diaStats.min} | Max: {diaStats.max}</div>
        <div>🌡️ Temp → Avg: {tempStats.avg} | Med: {tempStats.median} | Min: {tempStats.min} | Max: {tempStats.max}</div>
        <div>🫁 O₂ Sat → Avg: {spo2Stats.avg} | Med: {spo2Stats.median} | Min: {spo2Stats.min} | Max: {spo2Stats.max}</div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#444" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temp" stroke="#ffc658" name="🌡️ Temp °C" />
          <Line type="monotone" dataKey="hr" stroke="#ff4d4f" name="❤️ HR bpm" />
          <Line type="monotone" dataKey="spo2" stroke="#00c49f" name="🫁 O₂ Sat %" />
          <Line type="monotone" dataKey="sys" stroke="#8884d8" name="💉 Sys" strokeWidth={2} />
          <Line type="monotone" dataKey="dia" stroke="#82ca9d" name="💉 Dia" strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}