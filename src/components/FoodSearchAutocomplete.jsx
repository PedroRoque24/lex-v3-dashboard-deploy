
import { memoryUrl } from '../lib/api';
import React, { useState } from "react";

export default function FoodSearchAutocomplete({ onSelect }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/food/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      });
      const data = await res.json();
      const text = data.result || "";
      const match = text.match(/kcal\D*(\d+)[^\d]*protein\D*(\d+(\.\d+)?)g[^\d]*carbs\D*(\d+(\.\d+)?)g[^\d]*fat\D*(\d+(\.\d+)?)g/i);
      if (!match) return;

      const [, kcal, protein,, carbs,, fat] = match;
      onSelect({
        name: input,
        kcal: kcal || "0",
        protein: protein || "0",
        carbs: carbs || "0",
        fat: fat || "0"
      });
      setInput("");
    } catch (err) {
      alert("Failed to estimate macros");
    }
    setLoading(false);
  };

  return (
    <div className="bg-black border border-yellow-700 p-4 rounded mt-4 space-y-2 text-white">
      <label className="text-sm font-semibold text-yellow-300">Describe Food + Portion:</label>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. 1 egg, 100g tuna"
        className="w-full text-black p-2 rounded"
      />
      <button
        onClick={handleSubmit}
        className="mt-2 bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-1 rounded"
        disabled={loading}
      >
        {loading ? "Estimating..." : "Estimate & Add"}
      </button>
    </div>
  );
}