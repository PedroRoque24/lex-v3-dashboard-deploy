import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext.jsx";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const EmotionTrendChart = () => {
  const { casePath } = useCaseContext();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!casePath) return;

    fetch(`/memory/${casePath}/emotional_log.json`)
      .then(res => res.json())
      .then(entries => {
        const byDate = {};

        entries.forEach(entry => {
          const date = new Date(entry.timestamp).toISOString().split("T")[0];
          const emotion = entry.gpt_emotion || "unknown";
          if (!byDate[date]) byDate[date] = {};
          byDate[date][emotion] = (byDate[date][emotion] || 0) + 1;
        });

        const structured = Object.entries(byDate).map(([date, counts]) => ({
          date,
          ...counts
        }));

        setData(structured);
      })
      .catch(err => {
        console.error("Failed to load emotion log:", err);
        setData([]);
      });
  }, [casePath]);

  const colors = {
    Anxious: "#f59e0b",
    Stressed: "#ef4444",
    Calm: "#10b981",
    Overwhelmed: "#6366f1",
    unknown: "#6b7280"
  };

  return (
    <div className="bg-gray-900 max-w-4xl mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-3 text-xl">📊 Emotional Trend Over Time</h2>
      {data.length === 0 ? (
        <p className="italic text-blue-300 text-sm">No emotional data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {Object.keys(colors).map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[key]}
                name={key}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EmotionTrendChart;
