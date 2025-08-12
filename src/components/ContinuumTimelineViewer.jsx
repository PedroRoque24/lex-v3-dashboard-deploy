
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Scatter
} from "recharts";
import { useCaseContext } from "./CaseContext";

export default function ContinuumTimelineViewer() {
  const { casePath } = useCaseContext();
  const [data, setData] = useState([]);
  const [meds, setMeds] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!casePath) return;
    fetch(`/memory/${casePath}/continuum_timeline.json`)
      .then(res => res.json())
      .then(json => {
        const deduped = {};
        const processed = json.map(entry => ({
          timestamp: new Date(entry.timestamp).toISOString().split("T")[0],
          clarity: entry.clarity ?? null,
          type: entry.type ?? "general",
          y: entry.y ?? null,
          medication: entry.medication ?? "unknown",
          dose: entry.dose ?? "—"
        }))
        .filter(entry => {
          const key = `${entry.timestamp}-${entry.type}-${entry.medication}`;
          if (deduped[key]) return false;
          deduped[key] = true;
          return true;
        });

        const medEvents = processed
          .filter(e => e.type === "medication_reminder")
          .map(e => ({ ...e, y: 1.1 }));

        setData(processed);
        setMeds(medEvents);
      })
      .catch(err => {
        console.error("Failed to load continuum timeline:", err);
        setError(true);
      });
  }, [casePath]);

  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div >
          <strong>💊 {item.medication}</strong><br />
          Dose: {item.dose}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 mt-4 p-4 rounded-xl shadow text-white">
      <h2 className="font-bold mb-2 text-lg">📈 Continuum Timeline</h2>
      {error && <p className="italic text-red-600 text-sm">⚠️ Could not load timeline data.</p>}
      {!error && data.length === 0 && <p className="italic text-blue-300 text-sm">No continuum events found.</p>}
      {!error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="timestamp" />
            <YAxis yAxisId="left" domain={[0, 1.3]} />
            <Tooltip content={renderCustomTooltip} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="clarity"
              stroke="#8884d8"
              name="Clarity"
              dot={{ r: 3 }}
            />
            {meds.length > 0 && (
              <Scatter
                data={meds}
                yAxisId="left"
                dataKey="y"
                fill="#d62728"
                shape="circle"
                name="💊 Med Reminders"
                line={{ stroke: "#d62728", strokeWidth: 0 }}
                legendType="circle"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}