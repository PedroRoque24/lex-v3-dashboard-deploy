import { memoryUrl } from '../lib/api';
import React, { createContext, useContext, useState } from "react";

const CaseContext = createContext();

export function CaseContextProvider({ children }) {
  const [casePath, setCasePath] = useState(null);
  const [patientId, setPatientId] = useState(null);

  return (
    <CaseContext.Provider value={{ casePath, setCasePath, patientId, setPatientId }}>
      {children}
    </CaseContext.Provider>
  );
}

export const useCaseContext = () => useContext(CaseContext);
