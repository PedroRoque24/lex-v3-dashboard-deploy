import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { useCaseContext } from "./CaseContext";
import FoodSearchAutocomplete from "./FoodSearchAutocomplete";
import WeeklyWellnessGraph from "./WeeklyWellnessGraph";

export default function WellnessTrackerV2() {
  const context = useCaseContext() || {};
  const casePath = context.casePath;

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [logData, setLogData] = useState({});
  const [activity, setActivity] = useState({ steps: "", minutes: "" });
  const [workoutInput, setWorkoutInput] = useState("");
  const [workoutOutput, setWorkoutOutput] = useState("");

  if (!casePath) {
    return (
      <div className="bg-red-100 mt-4 p-4 rounded-xl text-red-700">
        Please select a patient and case first.
      </div>
    );
  }

  // Utility to always recalculate totals from food list
  const getTotals = (foods) =>
    foods.reduce(
      (acc, item) => ({
        kcal: acc.kcal + Number(item.kcal || 0),
        protein: acc.protein + Number(item.protein || 0),
        carbs: acc.carbs + Number(item.carbs || 0),
        fat: acc.fat + Number(item.fat || 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

  const loadWellnessLog = async (day) => {
    try {
      const res = await fetch("http://localhost:5000/api/wellness/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_path: casePath, day })
      });
      const data = await res.json();
      if (data.foods || data.steps || data.workout) {
        const safeFoods = data.foods || [];
        const recalculatedTotals = getTotals(safeFoods);
        setLogData(prev => ({
          ...prev,
          [day]: { ...data, totals: recalculatedTotals }
        }));
      }
    } catch {
      console.warn("Could not load wellness data");
    }
  };

  const saveWellnessLog = (day, entry) => {
    fetch("http://localhost:5000/api/wellness/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_path: casePath, day, entry })
    }).catch(() => console.warn("Save failed"));
  };

  useEffect(() => {
    if (casePath) {
      loadWellnessLog(selectedDate);
      if (!logData[selectedDate]) {
        setLogData(prev => ({
          ...prev,
          [selectedDate]: { foods: [], totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 }, minutes: 0, steps: 0, workout: "" }
        }));
      }
    }
    // eslint-disable-next-line
  }, [selectedDate, casePath]);

  const currentLog = logData[selectedDate] || { foods: [], totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 }, minutes: 0, steps: 0, workout: "" };
  const currentTotals = (currentLog && currentLog.totals)
    ? currentLog.totals
    : { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  const handleAddFood = (food) => {
    const newFoods = [...currentLog.foods, food];
    const totals = getTotals(newFoods);

    const saveEntry = {
      foods: newFoods,
      totals,
      minutes: currentLog.minutes,
      steps: currentLog.steps,
      workout: currentLog.workout
    };

    setLogData(prev => ({
      ...prev,
      [selectedDate]: { ...saveEntry }
    }));

    saveWellnessLog(selectedDate, saveEntry);
  };

  // Remove food by index
  const handleRemoveFood = (idx) => {
    const newFoods = currentLog.foods.filter((_, i) => i !== idx);
    const totals = getTotals(newFoods);
    const saveEntry = {
      foods: newFoods,
      totals,
      minutes: currentLog.minutes,
      steps: currentLog.steps,
      workout: currentLog.workout
    };
    setLogData(prev => ({
      ...prev,
      [selectedDate]: { ...saveEntry }
    }));
    saveWellnessLog(selectedDate, saveEntry);
  };

  // Reset/remove activity for the day
  const handleRemoveActivity = () => {
    const saveEntry = {
      foods: currentLog.foods,
      totals: currentTotals,
      minutes: "",
      steps: "",
      workout: currentLog.workout
    };
    setActivity({ steps: "", minutes: "" });
    setLogData(prev => ({
      ...prev,
      [selectedDate]: { ...saveEntry }
    }));
    saveWellnessLog(selectedDate, saveEntry);
  };

  const handleActivityUpdate = () => {
    const saveEntry = {
      foods: currentLog.foods,
      totals: currentTotals,
      minutes: activity.minutes,
      steps: activity.steps,
      workout: currentLog.workout
    };
    setLogData(prev => ({
      ...prev,
      [selectedDate]: { ...saveEntry }
    }));
    saveWellnessLog(selectedDate, saveEntry);
  };

  const handleWorkoutAnalyze = async () => {
    if (!workoutInput.trim()) return;
    try {
      const res = await fetch("http://localhost:5000/api/workout/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: workoutInput })
      });
      const data = await res.json();
      let output = data.result || "No analysis.";

      output = output
        .replaceAll("**Estimated Calories Burned**", "Calories Burned")
        .replaceAll("**Key Muscle Groups Worked**", "Muscles Worked")
        .replaceAll("**Cardiovascular Impact**", "Cardio Impact")
        .replaceAll("**Tips or Cautions**", "Advice & Caution")
        .replaceAll("**", "");

      const blocks = output.split(/(?=Calories Burned|Muscles Worked|Cardio Impact|Advice & Caution)/).map((block, i) => (
        `<div key=${i} class='mb-3 text-sm leading-relaxed'>${block.trim()}</div>`
      )).join("");

      const container = document.getElementById("workout_output");
      if (container) {
        container.innerHTML = "";
        blocks.split(/\n+/).forEach(line => {
          if (line.startsWith("Calories Burned")) {
            container.innerHTML += `<h4 class='mt-3 mb-1 text-yellow-300 text-md font-bold'>${line}</h4>`;
          } else if (line.startsWith("Muscles Worked")) {
            container.innerHTML += `<h4 class='mt-3 mb-1 text-yellow-300 text-md font-bold'>${line}</h4>`;
          } else if (line.startsWith("Cardio Impact")) {
            container.innerHTML += `<h4 class='mt-3 mb-1 text-yellow-300 text-md font-bold'>${line}</h4>`;
          } else if (line.startsWith("Advice & Caution")) {
            container.innerHTML += `<h4 class='mt-3 mb-1 text-yellow-300 text-md font-bold'>${line}</h4>`;
          } else {
            container.innerHTML += `<p class='text-sm text-yellow-300 mb-1'>${line}</p>`;
          }
        });
      }
      setWorkoutOutput(output);

      const saveEntry = {
        foods: currentLog.foods,
        totals: currentTotals,
        minutes: currentLog.minutes,
        steps: currentLog.steps,
        workout: output
      };

      setLogData(prev => ({
        ...prev,
        [selectedDate]: { ...saveEntry }
      }));

      saveWellnessLog(selectedDate, saveEntry);
    } catch {
      setWorkoutOutput("Failed to analyze workout.");
    }
  };

  const burnFromSteps = Math.round((currentLog.steps || 0) * 0.04);
  const workoutKcalMatch = (currentLog.workout || "").match(/(?:burned[^\d]{0,20})?(\d{2,4})\s*calories/i);
  const workoutKcal = workoutKcalMatch ? parseInt(workoutKcalMatch[1]) : 0;
  const totalBurned = burnFromSteps + workoutKcal;

  return (
    <div className="bg-gray-900 border border-yellow-700 mt-8 p-6 rounded-2xl space-y-6 text-white">
      <h3 className="font-bold text-2xl text-yellow-300">Daily Wellness Tracker (v2)</h3>

      <div className="flex gap-4 items-center">
        <label className="text-sm text-yellow-300">Select Date:</label>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-2 py-1 rounded-xl text-yellow-200 bg-gray-800 border border-yellow-700" />
      </div>

      <div className="mt-4 space-y-4">
        <h4 className="font-semibold text-lg text-yellow-300">Food Log</h4>
        <FoodSearchAutocomplete onSelect={handleAddFood} />
        <div className="mt-3 space-y-1">
          <label className="font-semibold text-sm text-yellow-300">Manually Add Food:</label>
          <div className="gap-2 grid grid-cols-2 md:grid-cols-5">
            <input placeholder="Name" id="manual_name" className="px-2 py-1 rounded-xl text-yellow-200 bg-gray-800 border border-yellow-700" />
            <input placeholder="kcal" id="manual_kcal" type="number" className="px-2 py-1 rounded-xl text-yellow-200 bg-gray-800 border border-yellow-700" />
            <input placeholder="Protein" id="manual_protein" type="number" className="px-2 py-1 rounded-xl text-yellow-200 bg-gray-800 border border-yellow-700" />
            <input placeholder="Carbs" id="manual_carbs" type="number" className="px-2 py-1 rounded-xl text-yellow-200 bg-gray-800 border border-yellow-700" />
            <input placeholder="Fat" id="manual_fat" type="number" className="px-2 py-1 rounded-xl text-yellow-200 bg-gray-800 border border-yellow-700" />
          </div>
          <button
            className="bg-yellow-700 hover:bg-yellow-500 mt-2 px-3 py-1 rounded-xl text-white"
            onClick={() => {
              const name = document.getElementById("manual_name").value;
              const kcal = document.getElementById("manual_kcal").value;
              const protein = document.getElementById("manual_protein").value;
              const carbs = document.getElementById("manual_carbs").value;
              const fat = document.getElementById("manual_fat").value;
              if (!name || !kcal) return;
              handleAddFood({ name, kcal, protein, carbs, fat });
              document.getElementById("manual_name").value = "";
              document.getElementById("manual_kcal").value = "";
              document.getElementById("manual_protein").value = "";
              document.getElementById("manual_carbs").value = "";
              document.getElementById("manual_fat").value = "";
            }}
          >
            Add Manual Food
          </button>
        </div>
        <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-yellow-300">
          {currentLog.foods.map((f, idx) => (
            <li key={idx}>
              <strong>{f.name}</strong> – {f.kcal} kcal | {f.protein}g protein | {f.carbs}g carbs | {f.fat}g fat
              <button onClick={() => handleRemoveFood(idx)} className="hover:text-red-600 ml-2 text-red-400 text-xs underline">remove</button>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-sm">
          <strong>Today:</strong> {currentTotals.kcal} kcal | {currentTotals.protein}g protein | {currentTotals.carbs}g carbs | {currentTotals.fat}g fat
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h4 className="font-semibold text-lg text-yellow-300">Daily Movement</h4>
        <div className="gap-2 grid grid-cols-2 md:grid-cols-4">
          <input placeholder="Steps" value={activity.steps} onChange={e => setActivity(prev => ({ ...prev, steps: e.target.value }))} className="px-2 py-1 rounded-xl text-yellow-200 bg-gray-800 border border-yellow-700" />
          <input placeholder="Active Minutes" value={activity.minutes} onChange={e => setActivity(prev => ({ ...prev, minutes: e.target.value }))} className="px-2 py-1 rounded-xl text-yellow-200 bg-gray-800 border border-yellow-700" />
        </div>
        <button onClick={handleActivityUpdate} className="bg-yellow-700 hover:bg-yellow-500 mt-2 px-4 py-1 rounded-xl text-white">Save Activity</button>
        <button onClick={handleRemoveActivity} className="bg-red-500 hover:bg-red-700 ml-2 mt-2 px-4 py-1 rounded-xl text-white">Remove Activity</button>
        <div className="text-sm text-yellow-300">
          Approx. km walked: {(currentLog.steps * 0.0008).toFixed(2)} km<br/>
          Estimated calories from steps: {burnFromSteps} kcal
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <h4 className="font-semibold text-lg text-yellow-300">Workout Log</h4>
        <textarea
          rows={3}
          value={workoutInput}
          onChange={e => setWorkoutInput(e.target.value)}
          placeholder="Describe your workout..."
          className="bg-gray-800 text-yellow-200 p-2 rounded-xl w-full border border-yellow-700"
        />
        <button onClick={handleWorkoutAnalyze} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-1 rounded-xl text-white">
          Analyze Workout
        </button>
        <div id="workout_output" className="bg-gray-800 border border-yellow-700 mt-3 overflow-auto p-3 rounded-xl text-sm text-yellow-300 whitespace-pre-wrap"></div>
      </div>

      <div className="border border-yellow-700 font-semibold mt-6 pt-4 text-sm text-yellow-300">
        <strong>Total Burn Today (steps + workout):</strong> {totalBurned} kcal (includes workout: {workoutKcal} kcal)
      </div>

      <WeeklyWellnessGraph logData={logData} />
    </div>
  );
}
