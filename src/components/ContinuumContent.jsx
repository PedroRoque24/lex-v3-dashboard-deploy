import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import ActiveProblemsPanel from "./ActiveProblemsPanel";
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
import ContinuumHealthTools from "./ContinuumHealthTools";
import WellnessTrackerV2 from "./WellnessTrackerV2";
import ChronicDiseaseBlock from "./ChronicDiseaseBlock";
import ChronicMedicationBlock from "./ChronicMedicationBlock";
import { Card, CardContent } from "@/components/ui/card";
import { useCaseContext } from "./CaseContext";

// --- Glassy Collapsible Section Helper ---
function AccordionSection({ title, section, openSections, onToggle, children, icon, borderColor = "purple", defaultOpen = false }) {
  const isOpen = openSections.includes(section) || defaultOpen;
  const border =
    borderColor === "blue"
      ? "border-blue-700"
      : borderColor === "green"
      ? "border-green-700"
      : borderColor === "yellow"
      ? "border-yellow-700"
      : borderColor === "cyan"
      ? "border-cyan-700"
      : "border-purple-700";
  const accent =
    borderColor === "blue"
      ? "bg-blue-900 text-blue-200"
      : borderColor === "green"
      ? "bg-green-900 text-green-200"
      : borderColor === "yellow"
      ? "bg-yellow-900 text-yellow-200"
      : borderColor === "cyan"
      ? "bg-cyan-900 text-cyan-200"
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

export default function ContinuumContent() {
  // Multi-open for collapsible bundles
  const [openSections, setOpenSections] = useState([
    "vitals", "mood", "chronic", "meds", "exams", "logs"
  ]);
  const toggleSection = (section) =>
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* === Top row: Always-on summary/report === */}
      <div className="md:col-span-1 flex flex-col gap-6">
        <Card className="glass-card">
          <CardContent>
            <ActiveProblemsPanel casePath={useCaseContext()?.casePath || ""} />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 flex flex-col gap-6">
        <Card className="glass-card">
          <CardContent>
            <DownloadPatientReportButton />
          </CardContent>
        </Card>
      </div>

      {/* === Row 2: Vitals (left), Mood (right) === */}
      <AccordionSection
        title="Vitals"
        section="vitals"
        openSections={openSections}
        onToggle={toggleSection}
        icon="💓"
        borderColor="blue"
      >
        <VitalsInputBlock />
        <VitalsLogViewer />
        <VitalsTrendGraph casePath={useCaseContext()?.casePath || "default"} />
      </AccordionSection>

      <AccordionSection
        title="Mood & Emotion"
        section="mood"
        openSections={openSections}
        onToggle={toggleSection}
        icon="😊"
        borderColor="purple"
      >
        <MoodTracker />
        <EmotionalLogViewer />
        <EmotionalSummaryViewer />
      </AccordionSection>

      {/* === Row 3: Chronic (left), Meds (right) === */}
      <AccordionSection
        title="Chronic Conditions"
        section="chronic"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🧬"
        borderColor="cyan"
      >
        <ChronicDiseaseBlock />
      </AccordionSection>

      <AccordionSection
        title="Chronic Medications"
        section="chronicmeds"
        openSections={openSections}
        onToggle={toggleSection}
        icon="💊"
        borderColor="green"
      >
        <ChronicMedicationBlock />
      </AccordionSection>

      {/* === Row 4: Meds/Exam/Journal bundles === */}
      <AccordionSection
        title="Acute Medications"
        section="meds"
        openSections={openSections}
        onToggle={toggleSection}
        icon="💊"
        borderColor="green"
      >
        <MedicationInputBlock />
        <MedicationViewer />
        <MedicationLogViewer />
        <UpcomingMedicationViewer />
      </AccordionSection>

      <AccordionSection
        title="Exams & Labs"
        section="exams"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🔬"
        borderColor="blue"
      >
        <ExamIntakeBlock />
        <ExamViewer />
      </AccordionSection>

      <AccordionSection
        title="Patient Journal"
        section="journal"
        openSections={openSections}
        onToggle={toggleSection}
        icon="📓"
        borderColor="purple"
      >
        <JournalInputBlock />
        <JournalLogViewer />
      </AccordionSection>

      {/* === Full-width (logs/history/tools) === */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccordionSection
          title="Timeline"
          section="timeline"
          openSections={openSections}
          onToggle={toggleSection}
          icon="⏳"
          borderColor="blue"
        >
          <ContinuumTimelineViewer />
        </AccordionSection>

        <AccordionSection
          title="Previous Reports"
          section="reports"
          openSections={openSections}
          onToggle={toggleSection}
          icon="📂"
          borderColor="fuchsia"
        >
          <ReportHistoryViewer />
        </AccordionSection>

        <AccordionSection
          title="Alerts"
          section="alerts"
          openSections={openSections}
          onToggle={toggleSection}
          icon="⚠️"
          borderColor="yellow"
        >
          <ContinuumAlertsViewer />
        </AccordionSection>

        <AccordionSection
          title="Companion & EQ"
          section="companion"
          openSections={openSections}
          onToggle={toggleSection}
          icon="🤖"
          borderColor="purple"
        >
          <CompanionPromptViewer />
          <CompanionEmotionHistoryViewer />
        </AccordionSection>

        <AccordionSection
          title="Emotion Trends"
          section="emotrend"
          openSections={openSections}
          onToggle={toggleSection}
          icon="📈"
          borderColor="purple"
        >
          <EmotionTrendChart />
          <WeeklyEmotionDigestViewer />
        </AccordionSection>

        <AccordionSection
          title="Wellness & Health Tools"
          section="wellness"
          openSections={openSections}
          onToggle={toggleSection}
          icon="🛠️"
          borderColor="cyan"
        >
          <ContinuumHealthTools />
          <WellnessTrackerV2 />
        </AccordionSection>
      </div>
    </div>
  );
}