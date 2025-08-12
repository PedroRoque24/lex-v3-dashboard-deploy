
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export default function WeeklyWellnessGraph({ logData }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const days = Object.keys(logData).sort().slice(-7);
    const graph = days.map(day => {
      const entry = logData[day] || {};
      const totalKcal = (entry.foods || []).reduce((sum, f) => sum + Number(f.kcal || 0), 0);
      const steps = entry.steps || 0;
      return { date: day.slice(5), kcal: totalKcal, steps };
    });

    const avgKcal = graph.reduce((a, b) => a + b.kcal, 0) / graph.length;
    const avgSteps = graph.reduce((a, b) => a + b.steps, 0) / graph.length;

    setData(graph.map(entry => ({
      ...entry,
      avgKcal,
      avgSteps
    })));
  }, [logData]);

  return (
    <div className="mt-10 bg-gray-950 border border-yellow-800 p-4 rounded-xl text-white">
      <h3 className="text-xl font-bold text-yellow-300 mb-4">📈 Weekly Wellness Summary</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid stroke="#444" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="kcal" stroke="#ffcc00" name="Kcal" strokeWidth={2} />
          <Line type="monotone" dataKey="avgKcal" stroke="#8884d8" name="Avg Kcal" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="steps" stroke="#00ff99" name="Steps" strokeWidth={2} />
          <Line type="monotone" dataKey="avgSteps" stroke="#66b2ff" name="Avg Steps" strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
