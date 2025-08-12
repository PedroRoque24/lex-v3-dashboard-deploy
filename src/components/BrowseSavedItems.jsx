import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import { Card, CardContent } from "./ui/Card"; // <- Ensure path is correct

// Map type to backend endpoints
const endpoints = {
  lecture: {
    list: "http://localhost:5002/api/lexteacher/list_saved_lectures",
    get: "http://localhost:5002/api/lexteacher/get_saved_lecture",
    label: "Lectures"
  },
  quiz: {
    list: "http://localhost:5002/api/lexteacher/list_saved_quizzes",
    get: "http://localhost:5002/api/lexteacher/get_saved_quiz",
    label: "Quizzes"
  },
  simulation: {
    list: "http://localhost:5002/api/lexteacher/list_saved_simulations",
    get: "http://localhost:5002/api/lexteacher/get_saved_simulation",
    label: "Simulations"
  }
};

export default function BrowseSavedItems({ onLoadLecture, onLoadQuiz, onLoadSimulation }) {
  const [tab, setTab] = useState("lecture");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async (itemType) => {
    setLoading(true);
    const res = await fetch(endpoints[itemType].list);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  React.useEffect(() => { fetchItems(tab); }, [tab]);

  const handleLoad = async (itemType, filename) => {
    const res = await fetch(`${endpoints[itemType].get}?filename=${encodeURIComponent(filename)}`);
    const data = await res.json();
    if (itemType === "lecture" && data.lecture && onLoadLecture) onLoadLecture(data.lecture, data.topic || filename);
    else if (itemType === "quiz" && onLoadQuiz) onLoadQuiz(data, data.topic || filename);
    else if (itemType === "simulation" && data.simulation && onLoadSimulation) onLoadSimulation(data.simulation, data.topic || filename);
    else alert("Could not load.");
  };

  return (
    <Card className="mb-6">
      <CardContent>
        <div>
          <b className="text-fuchsia-400">Browse Saved:</b>
          <div className="flex gap-2 mt-3 mb-4">
            {["lecture", "quiz", "simulation"].map((type) => (
              <button key={type}
                onClick={() => setTab(type)}
                className={`px-4 py-2 rounded-lg font-bold transition
                  ${tab === type
                    ? "bg-fuchsia-700 text-white"
                    : "bg-gray-900 text-fuchsia-200 border border-fuchsia-700 hover:bg-fuchsia-900/50"}
                `}
              >
                {endpoints[type].label}
              </button>
            ))}
          </div>
          {loading && <div className="text-fuchsia-200">Loading...</div>}
          {!loading && items.length === 0 && (
            <div className="text-blue-200">No saved {tab}s found.</div>
          )}
          <div className="mt-3 max-h-64 overflow-y-auto">
            {items.map((l, i) => (
              <div key={l.filename} className="flex items-center justify-between border-b border-fuchsia-900 py-3 px-2 hover:bg-fuchsia-950/40 transition">
                <div>
                  <span className="font-bold text-blue-200">{l.topic || "Untitled"}</span>
                  {" "}
                  <span className="text-fuchsia-400">{l.difficulty}</span>
                  <br />
                  <span className="text-gray-400 text-sm">{l.timestamp}</span>
                </div>
                <button
                  onClick={() => handleLoad(tab, l.filename)}
                  className="ml-3 bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-4 py-2 rounded font-bold"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}