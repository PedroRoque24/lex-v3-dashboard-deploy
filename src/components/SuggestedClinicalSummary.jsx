
import { memoryUrl } from '../lib/api';
import React from 'react';

const SuggestedClinicalSummary = ({ summary }) => {
  const downloadTranscriptSummary = () => {
    const styledHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Suggested Clinical Summary</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 2rem;
      background-color: #ffffff;
      color: #111;
      line-height: 1.6;
    }
    h2 {
      color: #d97706;
    }
    h3 {
      margin-top: 1em;
      color: #444;
    }
    p {
      margin: 0.3em 0;
    }
  </style>
</head>
<body>
  <h2>🩺 Suggested Clinical Summary</h2>
  <h3>Anamnesis</h3><p>${summary.anamnesis}</p>
  <h3>Symptoms</h3><p>${summary.symptoms}</p>
  <h3>Medications</h3><p>${summary.medications}</p>
  <h3>Chronic Medications</h3><p>${summary.chronic_meds}</p>
  <h3>Previous Illnesses</h3><p>${summary.previous_illnesses}</p>
  <h3>Allergies</h3><p>${summary.allergies}</p>
  <h3>Family History</h3><p>${summary.family_history}</p>
  <h3>Substance Use</h3><p>${summary.substance_use}</p>
</body>
</html>
    `.trim();
    const blob = new Blob([styledHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Transcript_Clinical_Summary.html";
    a.click();
  };

  return (
    <div>
      <h2>📋 Suggested Clinical Summary:</h2>
      <button onClick={downloadTranscriptSummary} style={{
        backgroundColor: '#7c3aed',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        marginTop: '1rem'
      }}>
        📥 Download Clinical Summary
      </button>
    </div>
  );
};

export default SuggestedClinicalSummary;