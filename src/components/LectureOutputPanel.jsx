import { memoryUrl } from '../lib/api';
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent } from "./ui/Card"; // <- Make sure this path is correct

// Section keys & icons
const sections = [
  { key: 'introduction', icon: '🔍', label: 'Introduction' },
  { key: 'pathophysiology', icon: '🧬', label: 'Pathophysiology' },
  { key: 'signs_and_symptoms', icon: '😷', label: 'Signs and Symptoms' },
  { key: 'diagnosis', icon: '🧪', label: 'Diagnosis' },
  { key: 'treatment', icon: '💊', label: 'Treatment' },
  { key: 'common_mistakes', icon: '❌', label: 'Common Mistakes' },
  { key: 'visual_flowchart', icon: '🧭', label: 'Visual Flowchart', isFlowchart: true },
  { key: 'summary_table', icon: '📊', label: 'Summary Table', isTable: true },
];

// Helper for formatting bullets and tables
function formatBullets(text) {
  if (!text) return 'Not included.';
  return text
    .split(/\n+/)
    .filter(line => line.trim() !== '')
    .map((item) => `• ${item.replace(/^[-•]\s*/, '')}`)
    .join('\n');
}
function parseTableString(tableStr) {
  const rows = tableStr.split('\n').filter(r => r.includes('|'));
  const header = rows.length ? rows[0].split('|').map(c => c.trim()).filter(Boolean) : [];
  const body = rows.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean));
  return { header, body };
}

function renderPrettyFlowchart(flowStr) {
  if (!flowStr) return null;
  const steps = flowStr.split("->").map(s => s.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-4 py-4 px-2 bg-gradient-to-r from-fuchsia-950/60 to-blue-900/80 rounded-xl overflow-x-auto">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className="inline-block px-4 py-2 rounded-3xl bg-fuchsia-700 text-white font-bold text-base shadow-fuchsia-700/20">
            {step}
          </div>
          {idx !== steps.length - 1 && (
            <span className="text-2xl text-fuchsia-300 mx-1 font-bold select-none">⟶</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Section({
  title,
  icon,
  content,
  isTable,
  isFlowchart,
  topic,
  onExpand,
  expanding,
  expanded,
  expandResult,
}) {
  let formatted = content || 'Not included.';
  if (typeof content === 'string' && (title.includes('Symptoms') || title.includes('Mistakes'))) {
    formatted = formatBullets(content);
  }

  return (
    <div className="mb-7 p-5 bg-gray-900/80 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold flex items-center text-fuchsia-300 mb-2">
        <span className="mr-2">{icon}</span> {title}
      </h2>
      {isTable && content && content.includes('|') ? (
        (() => {
          const { header, body } = parseTableString(content);
          return (
            <table className="w-full border-collapse mt-3 text-blue-200 bg-gray-950/70 rounded">
              <thead>
                <tr>{header.map((h, i) => (
                  <th key={i} className="border border-fuchsia-700 px-2 py-2 bg-fuchsia-900/80">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {body.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} className="border border-blue-800 px-2 py-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()
      ) : isFlowchart && typeof content === 'string' ? (
        <div className="my-6">{renderPrettyFlowchart(content)}</div>
      ) : (
        <pre className="bg-gray-950/80 rounded p-4 text-white whitespace-pre-wrap font-mono text-base">
          {formatted}
        </pre>
      )}

      {/* Expand/Explain Feature */}
      <div className="mt-3">
        <button
          onClick={onExpand}
          className="bg-fuchsia-700 text-white px-4 py-2 rounded-xl font-bold transition disabled:opacity-60 mr-2"
          disabled={expanding}
        >
          {expanding ? 'Expanding...' : 'Expand / Explain'}
        </button>
        {expanded && (
          <div className="mt-4 p-4 bg-fuchsia-950/60 rounded-xl shadow-inner">
            {expanding ? (
              <div>
                <span role="img" aria-label="loading" className="text-2xl">🌀</span>
                <span className="ml-2">Generating detailed explanations...</span>
              </div>
            ) : (
              expandResult && (
                <div>
                  <div className="mb-3 font-semibold text-fuchsia-200">🧑‍⚕️ <span className="font-bold">Doctor summary:</span></div>
                  <div className="mb-4 text-fuchsia-100 bg-fuchsia-900/60 rounded p-3">
                    {expandResult.doctor_detail || "No detail."}
                  </div>
                  <div className="mb-2 font-semibold text-blue-300">🧑‍🎓 <span className="font-bold">Trainee summary:</span></div>
                  <div className="text-blue-100 bg-blue-900/60 rounded p-3">
                    {expandResult.trainee_summary || "No summary."}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LectureOutputPanel({ lectureText }) {
  const panelRef = useRef(null);

  const [expandedSections, setExpandedSections] = useState({});
  const [expandingSections, setExpandingSections] = useState({});
  const [expandResults, setExpandResults] = useState({});
  const [question, setQuestion] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState(null);

  if (!lectureText) return null;

  let parsed;
  try {
    parsed = typeof lectureText === 'string' ? JSON.parse(lectureText) : lectureText;
  } catch {
    return <p className="text-red-400">⚠️ Error parsing lecture content.</p>;
  }

  const topic = parsed?.topic || "Lecture";

  // Expand/explain handler
  const handleExpand = (sectionKey, sectionTitle, content) => async () => {
    if (expandingSections[sectionKey]) return; // already loading
    setExpandingSections((prev) => ({ ...prev, [sectionKey]: true }));
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: true }));
    // POST to /api/lexteacher/explain with topic + section text
    try {
      const res = await fetch('http://localhost:5002/api/lexteacher/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, point_text: `${sectionTitle}: ${content}` }),
      });
      const data = await res.json();
      setExpandResults((prev) => ({ ...prev, [sectionKey]: data }));
    } catch (err) {
      setExpandResults((prev) => ({ ...prev, [sectionKey]: { doctor_detail: "Error loading.", trainee_summary: "" } }));
    }
    setExpandingSections((prev) => ({ ...prev, [sectionKey]: false }));
  };

  // Question submit
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setQuestionLoading(true);
    setQuestionAnswer(null);
    try {
      const res = await fetch('http://localhost:5002/api/lexteacher/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lecture: parsed, question }),
      });
      const data = await res.json();
      setQuestionAnswer(data?.answer || "No answer.");
    } catch (err) {
      setQuestionAnswer("Error loading answer.");
    }
    setQuestionLoading(false);
  };

  // PDF Download Handler
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
    pdf.save(`${topic.replace(/\s+/g, '_')}_lecture_${new Date().toISOString().slice(0,10)}.pdf`);
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
        <div ref={panelRef} className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-blue-400 mb-6">
            📚 Lecture Output
          </h1>
          {sections.map(({ key, icon, label, isTable, isFlowchart }) => (
            <Section
              key={key}
              title={label}
              icon={icon}
              content={parsed[key]}
              isTable={isTable}
              isFlowchart={isFlowchart}
              topic={topic}
              onExpand={handleExpand(key, label, parsed[key])}
              expanding={!!expandingSections[key]}
              expanded={!!expandedSections[key]}
              expandResult={expandResults[key]}
            />
          ))}
          {/* ASK LEXTEACHER box */}
          <div className="mt-12 bg-fuchsia-950/60 p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-blue-300 mb-2">
              <span role="img" aria-label="student">🧑‍🎓</span> Ask LexTeacher about this lecture:
            </h3>
            <form onSubmit={handleQuestionSubmit} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Type your question (e.g. 'What are the risks of treatment?')"
                className="flex-1 px-4 py-2 rounded bg-gray-900 text-white border border-blue-700"
                disabled={questionLoading}
              />
              <button
                type="submit"
                className="bg-fuchsia-700 text-white px-6 py-2 rounded-xl font-bold transition"
                disabled={questionLoading}
              >
                {questionLoading ? (
                  <span><span role="img" aria-label="hourglass">⏳</span> Asking...</span>
                ) : "Ask"}
              </button>
            </form>
            {questionLoading && (
              <div className="mt-2 text-fuchsia-300 font-semibold">
                <span role="img" aria-label="loading">🌀</span> Getting answer...
              </div>
            )}
            {questionAnswer && (
              <div className="mt-5 bg-blue-950/70 text-blue-100 rounded p-4 font-semibold">
                <span className="mr-2 text-xl">🧑‍🏫</span>
                {questionAnswer}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LectureOutputPanel;
