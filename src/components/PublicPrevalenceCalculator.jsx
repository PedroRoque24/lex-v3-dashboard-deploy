import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import { Card, CardContent } from "./ui/Card"; // Use your glassy Card component

export default function PublicPrevalenceCalculator() {
  const [population, setPopulation] = useState("");
  const [cases, setCases] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const pop = parseFloat(population);
    const num = parseFloat(cases);
    if (!pop || !num || pop === 0) return;
    const rate = (num / pop) * 100000;
    setResult(rate.toFixed(2));
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <h2 className="text-xl font-bold text-fuchsia-400 mb-4">
          🧮 Prevalence Calculator
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            type="number"
            placeholder="Total Population"
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
          />
          <input
            type="number"
            placeholder="Number of Cases"
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
            value={cases}
            onChange={(e) => setCases(e.target.value)}
          />
        </div>

        <button
          onClick={calculate}
          disabled={!population || !cases}
          className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-60"
        >
          Calculate Prevalence per 100,000
        </button>

        {result && (
          <div className="mt-4 text-lg text-blue-300">
            Estimated Prevalence: <strong>{result}</strong> cases per 100,000
          </div>
        )}
      </CardContent>
    </Card>
  );
}