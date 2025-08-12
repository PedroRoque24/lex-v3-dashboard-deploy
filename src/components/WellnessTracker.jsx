
import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";

export default function WellnessTracker() {
  const [foods, setFoods] = useState([]);
  const [newFood, setNewFood] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [steps, setSteps] = useState("");
  const [activeMinutes, setActiveMinutes] = useState("");

  const totals = foods.reduce(
    (acc, item) => ({
      calories: acc.calories + Number(item.calories || 0),
      protein: acc.protein + Number(item.protein || 0),
      carbs: acc.carbs + Number(item.carbs || 0),
      fat: acc.fat + Number(item.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAddFood = () => {
    if (!newFood.name || !newFood.calories) return;
    setFoods([...foods, newFood]);
    setNewFood({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  };

  return (
    <div className="bg-gray-900 border border-yellow-700 p-5 rounded-xl mt-6 text-white space-y-6">
      <h3 className="text-xl font-bold text-yellow-300">📊 Daily Wellness Tracker</h3>

      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-yellow-200">🍽️ Log Food Item</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <input placeholder="Food" value={newFood.name} onChange={e => setNewFood(prev => ({ ...prev, name: e.target.value }))} className="text-black px-2 py-1 rounded" />
          <input placeholder="kcal" type="number" value={newFood.calories} onChange={e => setNewFood(prev => ({ ...prev, calories: e.target.value }))} className="text-black px-2 py-1 rounded" />
          <input placeholder="Protein (g)" type="number" value={newFood.protein} onChange={e => setNewFood(prev => ({ ...prev, protein: e.target.value }))} className="text-black px-2 py-1 rounded" />
          <input placeholder="Carbs (g)" type="number" value={newFood.carbs} onChange={e => setNewFood(prev => ({ ...prev, carbs: e.target.value }))} className="text-black px-2 py-1 rounded" />
          <input placeholder="Fat (g)" type="number" value={newFood.fat} onChange={e => setNewFood(prev => ({ ...prev, fat: e.target.value }))} className="text-black px-2 py-1 rounded" />
        </div>
        <button onClick={handleAddFood} className="mt-2 bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-500">Add Food</button>
      </div>

      <div className="text-sm text-yellow-200">
        <strong>Daily Totals:</strong> {totals.calories} kcal | {totals.protein}g protein | {totals.carbs}g carbs | {totals.fat}g fat
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-semibold text-yellow-200">🚶 Daily Activity</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <input placeholder="Steps" type="number" value={steps} onChange={e => setSteps(e.target.value)} className="text-black px-2 py-1 rounded" />
          <input placeholder="Active Minutes" type="number" value={activeMinutes} onChange={e => setActiveMinutes(e.target.value)} className="text-black px-2 py-1 rounded" />
        </div>
      </div>
    </div>
  );
}