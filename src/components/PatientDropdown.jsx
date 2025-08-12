import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { useCaseContext } from "./CaseContext";

const PatientDropdown = () => {
  const { setPatientId } = useCaseContext();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch("/api/list_patients")
      .then(res => res.json())
      .then(data => {
        setPatients(data.patients || []);
      })
      .catch(err => console.error("Failed to load patients:", err));
  }, []);

  return (
    <div>
      <label>Select Patient:</label>
      <select onChange={(e) => setPatientId(e.target.value)}>
        <option value="">-- Choose --</option>
        {patients.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
};

export default PatientDropdown;