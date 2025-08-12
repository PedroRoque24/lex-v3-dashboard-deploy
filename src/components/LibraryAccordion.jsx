import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import LibraryReportGenerator from "./LibraryReportGenerator";
import LibraryExternalExport from "./LibraryExternalExport";
import LibraryDocumentReader from "./LibraryDocumentReader";
import LibraryCertificateArchive from "./LibraryCertificateArchive";
import LibraryEditorSnippets from "./LibraryEditorSnippets";
import LibraryKnowledgeJournal from "./LibraryKnowledgeJournal";
import LibraryTimelineNavigator from "./LibraryTimelineNavigator";
import LibrarySymbolicReflection from "./LibrarySymbolicReflection";
import LibraryTranscriber from "./LibraryTranscriber";

export default function LibraryAccordion() {
  // MULTI-OPEN LOGIC
  const [openSections, setOpenSections] = useState([
    "library_report_generator"
  ]);
  const toggle = (section) =>
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );

  return (
    <div className="max-w-4xl mx-auto mt-4">
      <LibraryReportGenerator open={openSections} onClick={toggle} section="library_report_generator" />
      <LibraryExternalExport open={openSections} onClick={toggle} section="library_external_export" />
      <LibraryDocumentReader open={openSections} onClick={toggle} section="library_document_reader" />
      <LibraryCertificateArchive open={openSections} onClick={toggle} section="library_certificate_archive" />
      <LibraryEditorSnippets open={openSections} onClick={toggle} section="library_editor_snippets" />
      <LibraryKnowledgeJournal open={openSections} onClick={toggle} section="library_knowledge_journal" />
      <LibraryTimelineNavigator open={openSections} onClick={toggle} section="library_timeline_navigator" />
      <LibrarySymbolicReflection open={openSections} onClick={toggle} section="library_symbolic_reflection" />
      <LibraryTranscriber open={openSections} onClick={toggle} section="library_transcriber" />
    </div>
  );
}