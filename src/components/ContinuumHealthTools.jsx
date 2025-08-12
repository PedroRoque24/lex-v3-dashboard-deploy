
import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";

export default function ContinuumHealthTools() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [selfInput, setSelfInput] = useState("");
  const [nutritionPlan, setNutritionPlan] = useState("");
  const [trainingPlan, setTrainingPlan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (weight && height) {
      const hMeters = parseFloat(height) / 100;
      const calcBmi = parseFloat(weight) / (hMeters * hMeters);
      setBmi(parseFloat(calcBmi.toFixed(1)));
    } else {
      setBmi(null);
    }
  }, [weight, height]);

  const getBmiStatus = (value) => {
    if (value < 18.5) return "Underweight";
    if (value < 25) return "Normal";
    if (value < 30) return "Overweight";
    return "Obese";
  };

  const getBmiColor = (value) => {
    if (value < 18.5) return "#00bfff";
    if (value < 25) return "#00ff88";
    if (value < 30) return "#ffcc00";
    return "#ff4444";
  };

  const BmiGauge = ({ value }) => {
    const percent = Math.min(Math.max((value - 10) / 40, 0), 1);
    const angle = percent * Math.PI;
    const x = 100 + 80 * Math.cos(Math.PI - angle);
    const y = 100 - 80 * Math.sin(Math.PI - angle);
    const color = getBmiColor(value);
    const status = getBmiStatus(value);

    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 120" className="max-w-sm w-full">
          <path d="M10,100 A90,90 0 0,1 190,100" fill="none" stroke="#444" strokeWidth="8" />
          <path
            d="M10,100 A90,90 0 0,1 190,100"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${percent * 283} 283`}
          />
          <circle cx={x} cy={y} r="6" fill={color} />
          <text x="100" y="115" textAnchor="middle" fill="#00ffdd" fontSize="16" fontWeight="bold">
            BMI {value} – {status}
          </text>
        </svg>
      </div>
    );
  };

  const handleGenerate = async () => {
    if (!selfInput.trim()) {
      alert("Please describe yourself first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ self_description: selfInput })
      });
      const data = await res.json();
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        const sections = data.plan.split("###");
        setNutritionPlan(sections[1]?.trim() || "");
        setTrainingPlan(sections[2]?.trim() || "");
      }
    } catch (err) {
      alert("Failed to fetch plan.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-950 border border-blue-700 border-blue-700-green-700 mt-10 p-6 rounded-xl-xl space-y-6 text-white">
      <h3 className="font-bold mb-4 text-2xl text-green-300">🌿 Wellness Tools</h3>

      <div className="gap-6 grid grid-cols-2">
        <div>
          <label className="block mb-1 text-green-300 text-sm">Weight (kg):</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="px-3 py-2 rounded-xl text-white w-full"
          />
        </div>
        <div>
          <label className="block mb-1 text-green-300 text-sm">Height (cm):</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            className="px-3 py-2 rounded-xl text-white w-full"
          />
        </div>
      </div>

      {bmi && <BmiGauge value={bmi} />}

      <div className="space-y-3">
        <label className="block mb-1 text-green-300 text-sm">
          🧠 Describe yourself (goals, lifestyle, issues, diet, restrictions):
        </label>
        <textarea
          rows={5}
          value={selfInput}
          onChange={e => setSelfInput(e.target.value)}
          className="bg-gray-900 p-3 rounded-xl text-white w-full"
          placeholder="E.g. I'm 42, 82kg, 173cm, have a sedentary job, knee pain, want to lose belly fat, vegetarian, dislike early mornings..."
        />
      </div>

      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-green-600 font-semibold hover:bg-green-500 px-6 py-2 rounded-xl text-white"
        >
          {loading ? "Generating Plan..." : "Generate Personalized Plan"}
        </button>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2 text-green-300 text-lg">🍎 Nutrition Plan</h4>
        <textarea
          rows={6}
          value={nutritionPlan}
          onChange={e => setNutritionPlan(e.target.value)}
          className="bg-gray-900 p-3 rounded-xl text-white w-full"
          placeholder="Nutrition strategy will appear here..."
        />
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2 text-lg text-orange-300">🏋️ Training Program</h4>
        <textarea
          rows={6}
          value={trainingPlan}
          onChange={e => setTrainingPlan(e.target.value)}
          className="bg-gray-900 p-3 rounded-xl text-white w-full"
          placeholder="Training plan will appear here..."
        />
      </div>
    </div>
  );
}