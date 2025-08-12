import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import { useCaseContext } from "./CaseContext";

export default function CaseDropdown() {
  const context = useCaseContext();
  const { casePath, setCasePath, patientId, setPatientId } = context || {};

  const [patients, setPatients] = useState([]);
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState({ patient: "", case: "" });

  useEffect(() => {
    fetch("/api/list_patients")
      .then(res => res.json())
      .then(setPatients);
  }, []);

  useEffect(() => {
    if (selected.patient) {
      fetch(`/api/list_cases?patient_id=${selected.patient}`)
        .then(res => res.json())
        .then(setCases);
    }
  }, [selected.patient]);

  useEffect(() => {
    if (
      selected.patient &&
      selected.case &&
      typeof setCasePath === "function" &&
      typeof setPatientId === "function"
    ) {
      const fullPath = `patients/${selected.patient}/case_${selected.case}`;
      console.log("✅ Setting case path:", fullPath);
      setCasePath(fullPath);
      setPatientId(selected.patient);
    } else {
      console.warn("❌ setCasePath or setPatientId is not defined");
    }
  }, [selected.case]);

  return (
    <div className="mb-4 flex items-center space-x-4 text-black">
      <label className="text-white font-semibold">Patient:</label>
      <select
        value={selected.patient}
        onChange={(e) => setSelected(prev => ({ ...prev, patient: e.target.value }))}
      >
        <option value="">Select Patient</option>
        {patients.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <label className="text-white font-semibold">Case:</label>
      <select
        value={selected.case}
        onChange={(e) => setSelected(prev => ({ ...prev, case: e.target.value }))}
        disabled={!selected.patient}
      >
        <option value="">Select Case</option>
        {cases.map(c => (
          <option key={c.case_id} value={c.case_id}>{c.case_id}</option>
        ))}
      </select>
    </div>
  );
}
