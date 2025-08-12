import { memoryUrl } from '../lib/api';
import React from "react";

export default function PatientInputBlock({ patientData, setPatientData }) {
  const handleChange = (field, value) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const inputClass =
    "w-full p-2 rounded-xl bg-black text-white border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400";

  return (
    <div className="p-6 bg-gray-900 border border-blue-700 rounded-2xl shadow-lex space-y-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-300 mb-4">🧾 Patient Input</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            value={patientData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Age</label>
          <input
            type="number"
            placeholder="Age"
            value={patientData.age}
            onChange={(e) => handleChange("age", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Sex</label>
          <select
            value={patientData.sex}
            onChange={(e) => handleChange("sex", e.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Heart Rate (bpm)</label>
          <input
            type="text"
            placeholder="e.g. 90"
            value={patientData.heartRate}
            onChange={(e) => handleChange("heartRate", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Respiratory Rate (breaths/min)</label>
          <input
            type="text"
            placeholder="e.g. 16"
            value={patientData.respiratoryRate}
            onChange={(e) => handleChange("respiratoryRate", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Blood Pressure (mmHg)</label>
          <input
            type="text"
            placeholder="e.g. 120/80"
            value={patientData.bloodPressure}
            onChange={(e) => handleChange("bloodPressure", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Temperature (°C)</label>
          <input
            type="text"
            placeholder="e.g. 37.5"
            value={patientData.temperature}
            onChange={(e) => handleChange("temperature", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">SpO₂ (%)</label>
          <input
            type="text"
            placeholder="e.g. 98"
            value={patientData.oxygenSaturation}
            onChange={(e) => handleChange("oxygenSaturation", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Weight (kg)</label>
          <input
            type="text"
            placeholder="e.g. 75"
            value={patientData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">Height (cm)</label>
          <input
            type="text"
            placeholder="e.g. 170"
            value={patientData.height}
            onChange={(e) => handleChange("height", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

