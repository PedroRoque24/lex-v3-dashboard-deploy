import { memoryUrl } from '../lib/api';
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent } from "./ui/Card"; // <- Ensure this path is correct

// Helper: Recursively search for decisions array
function findDecisions(obj) {
  if (!obj || typeof obj !== "object") return [];
  if (Array.isArray(obj.decisions)) return obj.decisions;
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase().includes("decision") && Array.isArray(obj[key]))
      return obj[key];
    if (typeof obj[key] === "object") {
      const found = findDecisions(obj[key]);
      if (found.length) return found;
    }
  }
  return [];
}

// Helper: Find the simulation case object (HPI, labs, etc)
function findCase(obj) {
  if (!obj || typeof obj !== "object") return {};
  if (obj.simulation && typeof obj.simulation === "object") return obj.simulation;
  if (obj.case && typeof obj.case === "object") return obj.case;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object") {
      const found = findCase(obj[key]);
      if (Object.keys(found).length) return found;
    }
  }
  // fallback: maybe the object itself is a simulation case
  if (obj.hpi || obj.exam || obj.labs || obj.summary) return obj;
  return {};
}

// For pretty labs display
function renderNestedLab(obj, indent = 0) {
  if (!obj || typeof obj !== 'object') return String(obj);
  return Object.entries(obj).map(([k, v]) => {
    if (typeof v === 'object') {
      return (
        <div key={k} style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
          {k.toUpperCase()}:
          <div style={{ marginLeft: '1rem', fontWeight: 'normal' }}>
            {renderNestedLab(v, indent + 12)}
          </div>
        </div>
      );
    }
    return (
      <div key={k} style={{ marginLeft: '1rem', paddingBottom: '0.25rem' }}>
        {k}: <span style={{ fontWeight: 500 }}>{v}</span>
      </div>
    );
  });
}

function SimulationSelector({ simulationData }) {
  const panelRef = useRef(null);

  // NEW: Use universal loaders
  const caseData = findCase(simulationData);
  const decisions = findDecisions(simulationData);

  const [responses, setResponses] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [showAnswer, setShowAnswer] = useState({});
  const [completed, setCompleted] = useState(false);

  const handleChoice = (questionPrompt, choice) => {
    setResponses(prev => ({ ...prev, [questionPrompt]: choice }));
    setShowFeedback(prev => ({ ...prev, [questionPrompt]: true }));
  };

  const submitSimulation = () => {
    setCompleted(true);
  };

  const safeExplanation = (q) => {
    if (!q) return "Explanation not provided.";
    if (typeof q.explanation === 'string' && q.explanation.trim() !== '') {
      return q.explanation;
    }
    return "Explanation not provided.";
  };

  const safeSummary = (data) => {
    const sum = data?.summary;
    return typeof sum === 'string' && sum.trim() !== '' ? sum : "Summary not provided.";
  };

  // PDF Download Handler (now includes decisions)
  const handleDownloadPDF = async () => {
    const element = panelRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(
      `simulation_${caseData.topic ? caseData.topic.replace(/\s+/g, "_") : "case"}_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <div style={{ textAlign: 'right', marginBottom: '1em' }}>
          <button
            onClick={handleDownloadPDF}
            className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 py-2 rounded-xl font-bold shadow-lex transition"
          >
            Download as PDF
          </button>
        </div>
        <div ref={panelRef} className="max-w-2xl mx-auto text-white">
          <h2 className="text-2xl font-bold text-fuchsia-400 mb-4">🧠 Simulated Patient Case</h2>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-blue-300">📋 HPI:</h3>
            <p className="bg-gray-900 rounded p-2">{caseData.hpi || "No HPI available."}</p>
            <h3 className="text-lg font-bold text-blue-300 mt-4">🩺 Physical Exam:</h3>
            <p className="bg-gray-900 rounded p-2">{caseData.exam || "No exam available."}</p>
            <h3 className="text-lg font-bold text-blue-300 mt-4">🧪 Labs:</h3>
            <div className="bg-gray-900 rounded p-2 font-mono">
              {renderNestedLab(caseData.labs)}
            </div>
            <h3 className="text-lg font-bold text-blue-300 mt-4">🖼️ Imaging:</h3>
            <p className="bg-gray-900 rounded p-2">{caseData.imaging || "No imaging available."}</p>
          </div>
          {Array.isArray(decisions) && decisions.length > 0 ? (
            decisions.map((q, idx) => (
              <div key={idx} className="mb-8">
                <h4 className="text-fuchsia-400 text-lg font-bold">🧩 {q.question}</h4>
                <div>
                  {q.options && Array.isArray(q.options) && q.options.map((opt, oidx) => {
                    const selected = responses[q.question] === opt;
                    const isCorrect = opt === q.correct;
                    const show = showFeedback[q.question];
                    const style = {
                      margin: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '5px',
                      border: selected ? '2px solid #34d399' : '1px solid #555',
                      backgroundColor: show && selected ? (isCorrect ? '#065f46' : '#991b1b') : '#232347',
                      color: '#fff',
                      fontWeight: selected ? 700 : 500,
                      boxShadow: selected ? '0 0 6px #8b5cf6' : 'none',
                      cursor: 'pointer'
                    };
                    return (
                      <button key={oidx} style={style} onClick={() => handleChoice(q.question, opt)}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {showFeedback[q.question] && responses[q.question] && (
                  <div className="mt-3">
                    {responses[q.question] === q.correct ? (
                      <span className="text-green-400 font-bold">✅ Correct</span>
                    ) : (
                      <span className="text-red-400 font-bold">❌ Incorrect. Correct: {q.correct}</span>
                    )}
                    <div className="italic mt-2 bg-fuchsia-950/60 text-fuchsia-100 rounded p-3">
                      Explanation: {safeExplanation(q)}
                    </div>
                  </div>
                )}
                {/* Show "Show Answer" button if not revealed, then show answer/explanation after click */}
                {!showAnswer[q.question] ? (
                  <button
                    onClick={() => setShowAnswer(prev => ({ ...prev, [q.question]: true }))}
                    className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold"
                  >
                    Show Answer
                  </button>
                ) : (
                  <div className="mt-3 bg-blue-950/60 text-blue-100 rounded p-3">
                    <b>Correct Answer:</b> {q.correct}<br />
                    <b>Explanation:</b> {q.explanation}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-fuchsia-200">No decisions/questions available.</p>
          )}

          {!completed && decisions.length > 0 && (
            <button
              onClick={submitSimulation}
              className="mt-4 px-6 py-2 bg-fuchsia-700 hover:bg-fuchsia-800 text-white rounded-xl font-bold shadow-lex transition"
            >
              Submit Case
            </button>
          )}

          {completed && (
            <div className="mt-8 bg-green-950/60 text-green-200 rounded p-4">
              <h3 className="font-bold text-green-400">📝 Final Summary</h3>
              <p>{safeSummary(caseData)}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SimulationSelector;