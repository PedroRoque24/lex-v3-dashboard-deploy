import { memoryUrl } from '../lib/api';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const LexBrainOutputPanel = ({ summary }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const summaryText = summary?.summary_raw || summary?.["🩺 Clinical Impression"] || "⚠️ No summary available.";
  const case_id = summary?.case_id || summary?.name || summary?.Name || "unknown_case";
  const prescriberRaw = summary?.prescriber_raw || null;

  const smartNormalize = (text) => {
    let fixed = text
      .replace(/(^|\n)(#{0,3}\s*)?Clinical Impression[:]*/gi, "\n### 🩺 Clinical Impression")
      .replace(/(^|\n)(#{0,3}\s*)?Reasoning[:]*/gi, "\n### 🤔 Reasoning")
      .replace(/(^|\n)(#{0,3}\s*)?Differential Diagnoses \(Ranked\)[:]*/gi, "\n### 🤔 Differential Diagnoses (Ranked)")
      .replace(/(^|\n)(#{0,3}\s*)?Risk Summary[:]*/gi, "\n### 📊 Risk Summary")
      .replace(/(^|\n)(#{0,3}\s*)?Red Flags[:]*/gi, "\n### ⚠️ Red Flags")
      .replace(/(^|\n)(#{0,3}\s*)?Suggested Workup[:]*/gi, "\n### 🧪 Suggested Workup")
      .replace(/(^|\n)(#{0,3}\s*)?Treatment Plan[:]*/gi, "\n### 💊 Treatment Plan")
      .replace(/(^|\n)(#{0,3}\s*)?Patient Explanation[:]*/gi, "\n### 🧘 Patient Explanation")
      .replace(/(^|\n)(#{0,3}\s*)?Confidence or Bias Commentary[:]*/gi, "\n### 🎯 Confidence or Bias Commentary");

    const lines = fixed.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('**Clinical Impression')) return '### 🩺 Clinical Impression';
      if (trimmed.startsWith('**Reasoning')) return '### 🤔 Reasoning';
      if (trimmed.startsWith('**Differential Diagnoses (Ranked')) return '### 🤔 Differential Diagnoses (Ranked)';
      if (trimmed.startsWith('**Risk Summary')) return '### 📊 Risk Summary';
      if (trimmed.startsWith('**Red Flags')) return '### ⚠️ Red Flags';
      if (trimmed.startsWith('**Suggested Workup')) return '### 🧪 Suggested Workup';
      if (trimmed.startsWith('**Treatment Plan')) return '### 💊 Treatment Plan';
      if (trimmed.startsWith('**Patient Explanation')) return '### 🧘 Patient Explanation';
      if (trimmed.startsWith('**Confidence or Bias Commentary')) return '### 🎯 Confidence or Bias Commentary';
      return line;
    });

    return lines.join('\n');
  };

  let displayText = smartNormalize(summaryText);

  const downloadAsHTML = () => {
    const cleanedText = displayText.replace(/^###\s*/gm, '');
    const styledHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Lex Reasoning Summary</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 2rem;
      background-color: #fff;
      color: #222;
      line-height: 1.6;
    }
    h2 {
      color: #7c3aed;
      font-size: 1.8em;
    }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 1rem;
    }
  </style>
</head>
<body>
  <h2 style={{ color: '#f0abfc', fontWeight: 700, marginBottom: '0.5rem' }}>🧠 Lex Reasoning Summary</h2>
  <pre>${cleanedText}</pre>
</body>
</html>`;
    const blob = new Blob([styledHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Lex_Reasoning_Summary.html";
    a.click();
  };

  if (prescriberRaw && !/💊 Prescriber/i.test(displayText)) {
    displayText += `\n\n### 💊 Prescriber\n\n${prescriberRaw}`;
  }

  // PATCHED: feedback is sent as {text: comment}
  const handleSubmit = async () => {
    const feedback = { case_id, rating, text: comment };
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("❌ Error submitting feedback.");
      }
    } catch (err) {
      console.error("Feedback error:", err);
      alert("❌ Feedback submission failed.");
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => setRating(star)}
        style={{
          cursor: 'pointer',
          color: star <= rating ? '#FFD700' : '#ccc',
          fontSize: '1.8rem',
          marginRight: '5px',
        }}
      >
        ★
      </span>
    ));
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ color: '#f0abfc', fontWeight: 700, marginBottom: '0.5rem' }}>🧠 Lex Reasoning Summary</h2>
      <div style={{ color: '#E5E7EB', opacity: 1 }}>
  <ReactMarkdown
    components={{
      h2: ({node, ...props}) => <h2 style={{ color:'#f0abfc', fontWeight:700, marginBottom:'0.5rem' }} {...props} />,
      h3: ({node, ...props}) => <h3 style={{ color:'#c4b5fd', fontWeight:600, marginTop:'1rem' }} {...props} />,
      p:  ({node, ...props}) => <p style={{ marginTop:'0.5rem' }} {...props} />,
      li: ({node, ...props}) => <li style={{ marginTop:'0.25rem' }} {...props} />
    }}
  >
    {displayText}
  </ReactMarkdown>
</div>
      <button onClick={downloadAsHTML} style={{ marginTop: "1em", backgroundColor: "#4c51bf", color: "white", padding: "0.5rem 1rem", borderRadius: "5px" }}>📥 Download Summary (HTML)</button>

      <hr style={{ margin: '2rem 0' }} />

      <div>
        <h3 style={{ color:"#c4b5fd", fontWeight:600 }}>🩺 Doctor Feedback</h3>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          {renderStars()}
          <span style={{ marginLeft: '10px', fontSize: '1.3rem' }}>
            {['❌', '⚠️', '🟡', '✅', '🌟'][rating - 1]}
          </span>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did Lex get right or wrong?" style={{ background:"#111827", color:"#E5E7EB", border:"1px solid #334155", borderRadius:8 }}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        />

        {!submitted ? (
          <button onClick={handleSubmit} style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Submit Feedback
          </button>
        ) : (
          <p style={{ color: 'green' }}>✅ Feedback submitted!</p>
        )}
      </div>
    </div>
  );
};

export default LexBrainOutputPanel;
