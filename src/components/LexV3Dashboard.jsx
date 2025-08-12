import { memoryUrl } from '../lib/api';
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { Card, CardContent } from "@/components/ui/Card";
import Sidebar from "./ui/Sidebar";
import LiveLexChat from "./LiveLexChat";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import CaseDropdown from "./CaseDropdown";
import { useCaseContext } from "./CaseContext";

import MicTest from "./MicTest";
import SymbolicMode from "./SymbolicMode";
import ClinicalModePage from "./ClinicalModePage";
import PatientInputBlock from "./PatientInputBlock";
import PatientAnamnesisBlock from "./PatientAnamnesisBlock";
import LexReasoningPanel from "./LexReasoningPanel";
import LexBrainOutputPanel from "./LexBrainOutputPanel";
import TeachingPanel from "./TeachingPanel";
import SimulationSelector from "./SimulationSelector";           // ✅ ADDED/ENSURED
import DownloadPatientReportButton from "./DownloadPatientReportButton";
import ReportHistoryViewer from "./ReportHistoryViewer";
import MoodTracker from "./MoodTracker";
import VitalsInputBlock from "./VitalsInputBlock";
import VitalsLogViewer from "./VitalsLogViewer";
import VitalsTrendGraph from "./VitalsTrendGraph";
import ExamIntakeBlock from "./ExamIntakeBlock";
import ExamViewer from "./ExamViewer";
import JournalInputBlock from "./JournalInputBlock";
import JournalLogViewer from "./JournalLogViewer";
import EmotionalLogViewer from "./EmotionalLogViewer";
import EmotionalSummaryViewer from "./EmotionalSummaryViewer";
import ContinuumTimelineViewer from "./ContinuumTimelineViewer";
import ContinuumAlertsViewer from "./ContinuumAlertsViewer";
import CompanionPromptViewer from "./CompanionPromptViewer";
import CompanionEmotionHistoryViewer from "./CompanionEmotionHistoryViewer";
import MedicationInputBlock from "./MedicationInputBlock";
import MedicationViewer from "./MedicationViewer";
import MedicationLogViewer from "./MedicationLogViewer";
import UpcomingMedicationViewer from "./UpcomingMedicationViewer";
import EmotionTrendChart from "./EmotionTrendChart";
import WeeklyEmotionDigestViewer from "./WeeklyEmotionDigestViewer";
import VisionUploader from "./VisionUploader";
import PDFExamUploader from "./PDFExamUploader";
import ContinuumHealthTools from "./ContinuumHealthTools";
import WellnessTrackerV2 from "./WellnessTrackerV2";
import TranscribeAndDisplayBox from './TranscribeAndDisplayBox';
import LexReportViewer from './LexReportViewer';

import UniversalTranscriberBox from "./UniversalTranscriberBox";
import ActiveProblemsPanel from "./ActiveProblemsPanel";

// === Library components ===
import LibraryReportGenerator from "./LibraryReportGenerator";
import LibraryExternalExport from "./LibraryExternalExport";
import LibraryDocumentReader from "./LibraryDocumentReader";
import LibraryCertificateArchive from "./LibraryCertificateArchive";
import LibraryEditorSnippets from "./LibraryEditorSnippets";
import LibraryKnowledgeJournal from "./LibraryKnowledgeJournal";
import LibraryTimelineNavigator from "./LibraryTimelineNavigator";
import LibrarySymbolicReflection from "./LibrarySymbolicReflection";
import LibraryTranscriber from "./LibraryTranscriber";
import LibraryAccordion from "./LibraryAccordion";
import ContinuumContent from "./ContinuumContent";

// === Public Health components ===
import PublicGeoMapping from "./PublicGeoMapping";
import PublicOutbreakReport from "./PublicOutbreakReport";
import PublicPrevalenceCalculator from "./PublicPrevalenceCalculator";
import PublicSymptomSurveillance from "./PublicSymptomSurveillance";
import PublicTrendTracker from "./PublicTrendTracker";
import PublicHealthAll from "./PublicHealthAll";

// === Chronic Disease/Medication blocks ===
import ChronicDiseaseBlock from "./ChronicDiseaseBlock";
import ChronicMedicationBlock from "./ChronicMedicationBlock";

// === Lex Avatar ===
import LexBurningBush from "./LexBurningBush";

// NEW: sidebar brand block (logo + Alexis line)
// --- Multi-Open Accordion Section Helper ---
function AccordionSection({ title, section, openSections, onToggle, children, icon, borderColor = "purple" }) {
  const isOpen = openSections.includes(section);
  const border =
    borderColor === "blue"
      ? "border-blue-700"
      : borderColor === "gray"
      ? "border-gray-700"
      : "border-purple-700";
  const accent =
    borderColor === "blue"
      ? "bg-blue-900 text-blue-200"
      : borderColor === "gray"
      ? "bg-gray-800 text-white"
      : "bg-fuchsia-900 text-fuchsia-200";

  return (
    <div className={`mb-6 rounded-2xl shadow-lex`}>
      <button
        className={`w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-2xl border-2 ${border} ${
          isOpen
            ? `${accent} shadow-lex`
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
        <div
          className={`rounded-b-2xl p-6 border-t-2 ${border} bg-gray-900/80 animate-fadeIn`}
          style={{ marginTop: "-2px" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function LexV3Dashboard() {
  const location = useLocation();
  const [discussionInput, setDiscussionInput] = useState("");
  const [discussionReply, setDiscussionReply] = useState("");
  const [quickQuestion, setQuickQuestion] = useState("");
  const [qaReply, setQaReply] = useState("");

  const [patientData, setPatientData] = useState({
    respiratoryRate: "",
    name: "",
    age: "",
    sex: "",
    heartRate: "",
    bloodPressure: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    anamnesis: "",
    medications: "",
    chronicConditions: "",
    allergies: "",
    familyHistory: "",
    examsAndLabs: "",
    physicalExam: "",
    substanceUse: "",
    rawInput: "",
    useRawInput: false
  });

  const [lexBrainOutput, setLexBrainOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [consentToUseName, setConsentToUseName] = useState(false);
  const [patientName, setPatientName] = useState("");

  const handleSubmitDiscussion = async () => {
    if (!discussionInput || !lexBrainOutput?.summary_raw) return;
    try {
      const res = await fetch("/api/clinical/discuss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: discussionInput,
          lex_output: lexBrainOutput.summary_raw || lexBrainOutput.summary || ""
        })
      });
      const data = await res.json();
      setDiscussionReply(data.reply || "No response.");
    } catch (err) {
      setDiscussionReply("Lex is unavailable.");
    }
  };

  const handleSubmitQuestion = async () => {
    if (!quickQuestion) return;
    try {
      const res = await fetch("/api/clinical/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: quickQuestion })
      });
      const data = await res.json();
      setQaReply(data.answer || "No response.");
    } catch (err) {
      setQaReply("Lex is unavailable.");
    }
  };

  const handleRunReasoning = async () => {
    if (!patientData.useRawInput && patientData.rawInput) {
      setPatientData(prev => ({ ...prev, useRawInput: true }));
    }
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
              ...patientData,
              name: patientName,
              consentToUseName: consentToUseName,
              patient_id: "fallback_if_missing"
            })
      });
      const result = await response.json();
      setLexBrainOutput(result);
    } catch (error) {
      console.error("LexBrain fetch error:", error);
      setLexBrainOutput({ error: "Failed to reach LexBrain API." });
    }
    setIsLoading(false);
  };

  return (
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 p-6 dashboard-bg space-y-6">
          {/* ======= HEADER: Add Lex-glass color for visual punch ======= */}
          <h1 className="text-4xl font-extrabold text-fuchsia-400 drop-shadow mb-2">🧠 Lex V3 Interface</h1>
          <CaseDropdown />
          {useCaseContext()?.casePath && (
            <p className="text-sm text-gray-500 mb-4">
              Selected: <code>{useCaseContext().casePath}</code>
            </p>
          )}

          {/* ======= ROUTES: Simulation & Teaching separated ======= */}
          <Routes>
            <Route path="/symbolic" element={<SymbolicMode />} />
            <Route
              path="/clinical"
              element={
                <ClinicalModePage
                  patientData={patientData}
                  setPatientData={setPatientData}
                  consentToUseName={consentToUseName}
                  setConsentToUseName={setConsentToUseName}
                  patientName={patientName}
                  setPatientName={setPatientName}
                  isLoading={isLoading}
                  handleRunReasoning={handleRunReasoning}
                  lexBrainOutput={lexBrainOutput}
                  setLexBrainOutput={setLexBrainOutput}
                  discussionInput={discussionInput}
                  setDiscussionInput={setDiscussionInput}
                  discussionReply={discussionReply}
                  handleSubmitDiscussion={handleSubmitDiscussion}
                  quickQuestion={quickQuestion}
                  setQuickQuestion={setQuickQuestion}
                  qaReply={qaReply}
                  handleSubmitQuestion={handleSubmitQuestion}
                />
              }
            />
            <Route path="/continuum/doctor" element={<ContinuumContent />} />
            <Route path="/continuum/patient" element={<ContinuumContent />} />
            <Route path="/library" element={<LibraryAccordion />} />

            {/* ========== Public Health modules ========== */}
            <Route path="/public-health/outbreak" element={<PublicOutbreakReport />} />
            <Route path="/public-health/prevalence" element={<PublicPrevalenceCalculator />} />
            <Route path="/public-health/geo" element={<PublicGeoMapping />} />
            <Route path="/public-health/trend" element={<PublicTrendTracker />} />
            <Route path="/public-health/symptom" element={<PublicSymptomSurveillance />} />
            <Route path="/public-health/all" element={<PublicHealthAll />} />

            {/* ========== Simulation & Teaching FIXED ========== */}
            <Route path="/teaching" element={<TeachingPanel />} />

            <Route path="/livelex" element={<LiveLexChat />} />
            <Route path="/mictest" element={<MicTest />} />
            <Route path="*" element={<Navigate to="/symbolic" />} />
          </Routes>

          {/* AVATAR: Floating Burning Bush */}
          {location.pathname !== "/livelex" && (
            <div
              style={{
                position: "fixed",
                right: "32px",
                bottom: "32px",
                zIndex: 2000,
                pointerEvents: "none",
                opacity: 1
              }}
            >
              <LexBurningBush size={260} />
            </div>
          )}
          <div className="fixed bottom-4 right-4">
            <Tooltip content="Toolbox / Options">
              <Button className="rounded-full bg-gray-800 w-12 h-12">⋮</Button>
            </Tooltip>
          </div>
        </main>
      </div>
    
  );
}

