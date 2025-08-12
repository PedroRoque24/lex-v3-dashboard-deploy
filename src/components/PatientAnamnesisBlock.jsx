import { memoryUrl } from '../lib/api';
import React from "react";

export default function PatientAnamnesisBlock({ patientData, setPatientData }) {
  const handleChange = (field, value) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const inputClass =
    "w-full h-28 p-2 rounded-xl bg-black text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400";

  return (
    <div className="p-6 bg-gray-900 border border-purple-700 rounded-2xl shadow-lex space-y-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">📝 Clinical History & Context</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">🗒️ Anamnesis (Complaints & History)</label>
          <textarea
            value={patientData.anamnesis || ""}
            onChange={(e) => handleChange("anamnesis", e.target.value)}
            placeholder="Describe patient's current complaint, symptoms, and context"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">💊 Chronic Medications</label>
          <textarea
            value={patientData.medications || ""}
            onChange={(e) => handleChange("medications", e.target.value)}
            placeholder="List all current medications"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">🩺 Previous Health Problems</label>
          <textarea
            value={patientData.chronicConditions || ""}
            onChange={(e) => handleChange("chronicConditions", e.target.value)}
            placeholder="e.g., diabetes, hypertension, etc."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">⚠️ Drug Allergies</label>
          <textarea
            value={patientData.allergies || ""}
            onChange={(e) => handleChange("allergies", e.target.value)}
            placeholder="Known medication allergies"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">🧬 Family History / Genetic Risk</label>
          <textarea
            value={patientData.familyHistory || ""}
            onChange={(e) => handleChange("familyHistory", e.target.value)}
            placeholder="Relevant family diseases, genetic predispositions..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">📑 Past / Current Exams & Labs</label>
          <textarea
            value={patientData.examsAndLabs || ""}
            onChange={(e) => handleChange("examsAndLabs", e.target.value)}
            placeholder="Relevant imaging, labs, or previous reports"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">🩻 Physical Exam Findings</label>
          <textarea
            value={patientData.physicalExam || ""}
            onChange={(e) => handleChange("physicalExam", e.target.value)}
            placeholder="Relevant physical exam findings"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-white">🚬 Substance Use (Drugs/Alcohol/Tobacco)</label>
          <textarea
            value={patientData.substanceUse || ""}
            onChange={(e) => handleChange("substanceUse", e.target.value)}
            placeholder="Describe any known substance use"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}

