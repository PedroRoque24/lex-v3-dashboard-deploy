import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import AccordionSection from "./ui/AccordionSection"; // Adjust path if needed

import PublicOutbreakReport from "./PublicOutbreakReport";
import PublicPrevalenceCalculator from "./PublicPrevalenceCalculator";
import PublicGeoMapping from "./PublicGeoMapping";
import PublicSymptomSurveillance from "./PublicSymptomSurveillance";
import PublicTrendTracker from "./PublicTrendTracker";

export default function PublicHealthAll() {
  const [openSections, setOpenSections] = useState([
    "outbreak",
    "prevalence",
    "geo",
    "symptom",
    "trend",
  ]); // Default: all open. Or start with [] if you want all collapsed.

  const toggleSection = (section) =>
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );

  return (
    <div className="max-w-5xl mx-auto mt-4">
      <AccordionSection
        title="Outbreak Report Generator"
        section="outbreak"
        openSections={openSections}
        onToggle={toggleSection}
        icon="📢"
        borderColor="fuchsia"
      >
        <PublicOutbreakReport />
      </AccordionSection>
      <AccordionSection
        title="Prevalence Calculator"
        section="prevalence"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🧮"
        borderColor="blue"
      >
        <PublicPrevalenceCalculator />
      </AccordionSection>
      <AccordionSection
        title="Geo-Mapping of Reported Cases"
        section="geo"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🗺️"
        borderColor="blue"
      >
        <PublicGeoMapping />
      </AccordionSection>
      <AccordionSection
        title="Symptom Surveillance Engine"
        section="symptom"
        openSections={openSections}
        onToggle={toggleSection}
        icon="🩺"
        borderColor="gray"
      >
        <PublicSymptomSurveillance />
      </AccordionSection>
      <AccordionSection
        title="Epidemiological Trend Tracker"
        section="trend"
        openSections={openSections}
        onToggle={toggleSection}
        icon="📊"
        borderColor="blue"
      >
        <PublicTrendTracker />
      </AccordionSection>
    </div>
  );
}