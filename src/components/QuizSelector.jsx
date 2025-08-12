import { memoryUrl } from '../lib/api';
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent } from "./ui/Card"; // <- Ensure correct path

// Universal helper: find questions array in any shape (quiz, quizze, etc)
function findQuestions(obj) {
  if (!obj || typeof obj !== "object") return [];
  if (Array.isArray(obj)) return obj;
  if (Array.isArray(obj.questions)) return obj.questions;
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase().includes("quiz") && obj[key] && Array.isArray(obj[key].questions))
      return obj[key].questions;
  }
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object") {
      const found = findQuestions(obj[key]);
      if (found.length) return found;
    }
  }
  return [];
}

function extractTopic(obj) {
  if (!obj) return "Quiz";
  if (obj.topic) return obj.topic;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object" && obj[key].topic) return obj[key].topic;
  }
  return "Quiz";
}

function QuizSelector({ quizData }) {
  const panelRef = useRef(null);

  const questions = findQuestions(quizData);
  const topic = extractTopic(quizData);

  if (!questions.length) return (
    <Card className="p-6 mb-4">
      <CardContent>
        <div className="text-fuchsia-200 text-lg">No quiz data available.</div>
      </CardContent>
    </Card>
  );

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [forceShowAll, setForceShowAll] = useState(false);

  const handleAnswer = (qIndex, option) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    setShowExplanation(prev => ({ ...prev, [qIndex]: true })); // Auto-show explanation
  };

  const toggleExplanation = (qIndex) => {
    setShowExplanation(prev => ({ ...prev, [qIndex]: !prev[qIndex] }));
  };

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    setForceShowAll(true); // reveal answers for snapshot
    await new Promise(requestAnimationFrame);

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
      `quiz_${topic.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`
    );

    setForceShowAll(false); // hide again for normal use
  };

  return (
    <Card className="p-6 mb-4">
      <CardContent>
        <div className="text-right mb-4">
          <button
            onClick={handleDownloadPDF}
            className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 py-2 rounded-xl font-bold shadow-lex transition"
          >
            Download as PDF
          </button>
        </div>
        <div ref={panelRef} className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">❓ LexQuiz: {topic}</h2>
          {questions.map((q, idx) => (
            <div key={idx} className="mb-8 p-5 bg-gray-900/80 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-fuchsia-400 mb-2">❓ {q.question}</h3>
              <div className="flex flex-wrap gap-3 mb-3">
                {q.options && Object.entries(q.options).map(([letter, opt], oidx) => (
                  <button
                    key={oidx}
                    onClick={() => handleAnswer(idx, letter)}
                    className={`px-5 py-2 rounded-xl font-bold transition border
                      ${selectedAnswers[idx] === letter
                        ? "border-fuchsia-400 bg-fuchsia-700 text-white"
                        : "border-gray-700 bg-gray-950 text-fuchsia-200 hover:bg-fuchsia-900/40"}
                    `}
                  >
                    {letter}: {opt}
                  </button>
                ))}
              </div>
              {selectedAnswers[idx] && (
                <div className="mt-3">
                  {selectedAnswers[idx] === q.correct ? (
                    <div className="text-green-400 font-bold">✅ Correct!</div>
                  ) : (
                    <div className="text-red-400 font-bold">
                      ❌ Incorrect. Correct Answer: {q.correct}
                    </div>
                  )}
                  <button
                    onClick={() => toggleExplanation(idx)}
                    className="mt-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded font-bold"
                  >
                    {showExplanation[idx] ? "Hide Explanation" : "Show Explanation"}
                  </button>
                  {showExplanation[idx] && (
                    <div className="mt-3 bg-blue-950/60 text-blue-100 rounded p-3">
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
              {/* Show correct answer/explanation only in PDF or after answering */}
              {(forceShowAll || selectedAnswers[idx]) && (
                <div className="mt-6 bg-gray-950/70 p-3 rounded">
                  <b className="text-blue-300">Correct Answer:</b>{" "}
                  <span className="text-fuchsia-200">{q.correct}</span><br />
                  <b className="text-blue-300">Explanation:</b>{" "}
                  <span className="text-fuchsia-200">{q.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default QuizSelector;

