import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/Card"; // Lex-glass Card
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_COORDS = [38.7169, -9.1399]; // Lisbon, Portugal

// API helpers
async function loadGeoPoints() {
  const res = await fetch("/api/public/load", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "geo" }),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function appendGeoPoint(point) {
  const res = await fetch("/api/public/append", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "geo", entry: point }),
  });
  return await res.json();
}

async function clearGeoPoints() {
  const res = await fetch("/api/public/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "geo", data: [] }),
  });
  return await res.json();
}

export default function PublicGeoMapping() {
  const [points, setPoints] = useState([]);
  const [newPoint, setNewPoint] = useState({ disease: "", lat: "", lng: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGeoPoints().then((saved) => {
      setPoints(Array.isArray(saved) ? saved : []);
      setLoading(false);
    });
  }, []);

  const addPoint = async () => {
    if (!newPoint.disease || !newPoint.lat || !newPoint.lng) return;
    const entry = { ...newPoint };
    setPoints([...points, entry]);
    setNewPoint({ disease: "", lat: "", lng: "" });
    await appendGeoPoint(entry);
  };

  const clearAll = async () => {
    setPoints([]);
    await clearGeoPoints();
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <h2 className="text-xl font-bold text-fuchsia-400 mb-4">
          🗺️ Geo-Mapping of Reported Cases
        </h2>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <input
            placeholder="Disease"
            value={newPoint.disease}
            onChange={(e) => setNewPoint({ ...newPoint, disease: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          />
          <input
            placeholder="Latitude"
            value={newPoint.lat}
            onChange={(e) => setNewPoint({ ...newPoint, lat: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          />
          <input
            placeholder="Longitude"
            value={newPoint.lng}
            onChange={(e) => setNewPoint({ ...newPoint, lng: e.target.value })}
            className="bg-gray-900 text-white border border-blue-700 px-3 py-2 rounded-xl"
          />
        </div>

        <button
          className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 py-2 rounded-xl font-bold transition disabled:opacity-60"
          onClick={addPoint}
        >
          ➕ Add Case to Map
        </button>
        <button
          className="ml-3 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-bold transition"
          onClick={clearAll}
        >
          🗑️ Clear All
        </button>

        <div className="my-6">
          <h3 className="text-md font-semibold mb-2 text-blue-300">🗺️ Map Visualization</h3>
          <div className="rounded-2xl border border-blue-900 shadow-lex overflow-hidden bg-gray-900">
            <MapContainer
              center={DEFAULT_COORDS}
              zoom={6}
              style={{ height: "500px", width: "100%" }}
              className="rounded-2xl"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {!loading &&
                points.map((p, idx) => (
                  <Marker key={idx} position={[parseFloat(p.lat), parseFloat(p.lng)]}>
                    <Popup>
                      <strong>{p.disease}</strong>
                      <br />
                      Lat: {p.lat}, Lng: {p.lng}
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
