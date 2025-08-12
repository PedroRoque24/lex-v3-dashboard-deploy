import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import VisionUploader from "./VisionUploader";
import PDFExamUploader from "./PDFExamUploader";
import PatientInputBlock from "./PatientInputBlock";
import PatientAnamnesisBlock from "./PatientAnamnesisBlock";
import TranscribeAndDisplayBox from "./TranscribeAndDisplayBox";
import UniversalTranscriberBox from "./UniversalTranscriberBox";
import LexBrainOutputPanel from "./LexBrainOutputPanel";
import LexReportViewer from "./LexReportViewer";
import { Button } from "@/components/ui/Button";

export default function ClinicalModePage(props) {
  const {
    patientData, setPatientData,
    consentToUseName, setConsentToUseName,
    patientName, setPatientName,
    isLoading, handleRunReasoning,
    lexBrainOutput,
    discussionInput, setDiscussionInput,
    discussionReply, handleSubmitDiscussion,
    quickQuestion, setQuickQuestion,
    qaReply, handleSubmitQuestion
  } = props;

  // --- PATCH: allow multiple sections open ---
  const [openSections, setOpenSections] = useState(["uploads"]);
  const toggleSection = (section) =>
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );

  return (
    <div className="max-w-5xl mx-auto mt-4">
      {/* --- Uploads --- */}
      <AccordionSection
        title="Upload Medical Image / PDF for AI Review"
        section="uploads"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🖼️"
      >
        <VisionUploader />
        <PDFExamUploader />
      </AccordionSection>

      {/* --- Patient Input --- */}
      <AccordionSection
        title="Patient Input"
        section="patientinput"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🧾"
      >
        <PatientInputBlock patientData={patientData} setPatientData={setPatientData} />
      </AccordionSection>

      {/* --- Clinical History & Context --- */}
      <AccordionSection
        title="Clinical History & Context"
        section="anamnesis"
        openSections={openSections}
        onToggle={toggleSection}
        icon="📝"
      >
        <PatientAnamnesisBlock patientData={patientData} setPatientData={setPatientData} />
      </AccordionSection>

      {/* --- Transcribers --- */}
      <AccordionSection
        title="Transcription & Summary"
        section="transcriber"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🎙️"
      >
        <TranscribeAndDisplayBox setPatientData={setPatientData} />
        <UniversalTranscriberBox />
      </AccordionSection>

      {/* --- Consent & Name --- */}
      <AccordionSection
        title="Consent & Patient Name"
        section="consent"
        openSections={openSections}
        onToggle={toggleSection}
        icon="📝"
      >
        <div className="text-white mb-4">
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={consentToUseName}
              onChange={(e) => setConsentToUseName(e.target.checked)}
            />
            <span>Save with real patient name</span>
          </label>
          {consentToUseName && (
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="ml-4 px-2 py-1 text-black rounded"
            />
          )}
        </div>
      </AccordionSection>

      {/* --- Run LexBrain Reasoning --- */}
      <AccordionSection
        title="Run LexBrain Reasoning"
        section="runreasoning"
        openSections={openSections}
        onToggle={toggleSection}
        icon="⚡"
      >
        <div className="text-center py-2">
          <Button
            onClick={handleRunReasoning}
            className="bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-6 py-3 rounded-2xl text-lg shadow-lex"
          >
            {isLoading ? "Thinking..." : "Run LexBrain Reasoning"}
          </Button>
        </div>
      </AccordionSection>

      {/* --- LexBrain Output & Doctor Feedback --- */}
      <AccordionSection
        title="LexBrain Reasoning Output & Doctor Feedback"
        section="output"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🧠"
      >
        <LexBrainOutputPanel summary={lexBrainOutput} />
      </AccordionSection>

      {/* --- Report Download / Export --- */}
      <AccordionSection
        title="Download/Export Reasoning & SOAP"
        section="report"
        openSections={openSections}
        onToggle={toggleSection}
        icon="📥"
      >
        <LexReportViewer
          lexOutput={lexBrainOutput?.summary_raw || lexBrainOutput?.summary || ""}
          casePath={lexBrainOutput?.case_path}
          patientId={patientData?.name}
        />
      </AccordionSection>

      {/* --- Medical Discussion --- */}
      <AccordionSection
        title="Medical Discussion"
        section="discussion"
        openSections={openSections}
        onToggle={toggleSection}
        icon="💬"
      >
        <div className="bg-gray-900 border border-purple-700 rounded-xl p-5">
          <h3 className="text-xl font-bold text-purple-300 mb-2">🧠 Medical Discussion</h3>
          <textarea
            placeholder="Ask Lex why he made certain decisions..."
            className="w-full bg-black border border-purple-600 text-white p-3 rounded-md"
            rows="4"
            value={discussionInput}
            onChange={(e) => setDiscussionInput(e.target.value)}
          />
          <button
            onClick={handleSubmitDiscussion}
            className="bg-purple-700 text-white mt-2 px-4 py-2 rounded"
          >
            Ask About Lex's Reasoning
          </button>
          {discussionReply && (
            <div className="prose prose-invert bg-black text-green-300 p-4 mt-4 rounded border border-green-800 max-h-72 overflow-y-auto">
              {discussionReply.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}
        </div>
      </AccordionSection>

      {/* --- Quick Clinical Question --- */}
      <AccordionSection
        title="Quick Clinical Question"
        section="quickq"
        openSections={openSections}
        onToggle={toggleSection}
        icon="❓"
      >
        <div className="bg-gray-900 border border-blue-700 rounded-xl p-5">
          <h3 className="text-xl font-bold text-blue-300 mb-2">💬 Quick Clinical Question</h3>
          <input
            type="text"
            placeholder="e.g. Is azithromycin safe in pregnancy?"
            className="w-full bg-black border border-blue-600 text-white p-3 rounded-md"
            value={quickQuestion}
            onChange={(e) => setQuickQuestion(e.target.value)}
          />
          <button
            onClick={handleSubmitQuestion}
            className="bg-blue-700 text-white mt-2 px-4 py-2 rounded"
          >
            Ask Lex
          </button>
          {qaReply && (
            <div className="prose prose-invert bg-black text-blue-200 p-4 mt-4 rounded border border-blue-600 max-h-72 overflow-y-auto">
              {qaReply.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}
        </div>
      </AccordionSection>
    </div>
  );
}

// --- Accordion Section Helper ---
function AccordionSection({ title, section, openSections, onToggle, children, icon }) {
  const isOpen = Array.isArray(openSections) ? openSections.includes(section) : false;
  return (
    <div className="mb-4 rounded-2xl shadow-lex">
      <button
        className={`w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-2xl border-2 ${
          isOpen
            ? "bg-lex-accent/90 border-lex-accent text-white"
            : "bg-lex-card border-lex-accent/30 text-white hover:bg-lex-accent/20"
        } transition-all`}
        onClick={() => onToggle(section)}
      >
        <span>
          {icon && <span className="mr-2 text-2xl align-middle">{icon}</span>}
          {title}
        </span>
        <span className="ml-3 text-xl">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="bg-lex-card/90 border-t-2 border-lex-accent/20 p-6 rounded-b-2xl animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}
