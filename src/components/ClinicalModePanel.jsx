import { memoryUrl } from '../lib/api';
import React, { useState } from 'react';
import TranscribeAndAutofillButton from './TranscribeAndAutofillButton';
import UniversalTranscriberBox from './UniversalTranscriberBox';

export default function ClinicalModePanel() {
  const [openSections, setOpenSections] = useState(['anamnesis']);

  const toggleSection = (section) =>
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );

  const isOpen = (section) => openSections.includes(section);

  return (
    <div className="clinical-mode-panel p-4">
      <h2 className="text-2xl font-black mb-6 text-lex-accent drop-shadow">Clinical Mode</h2>

      {/* Accordion: Anamnesis */}
      <div className="mb-3">
        <button
          className={`w-full text-left py-3 px-4 rounded-2xl font-bold text-lg bg-lex-card border border-lex-accent shadow-lex flex justify-between items-center transition-all ${
            isOpen('anamnesis') ? 'bg-lex-accent/20 text-lex-accent' : 'text-white'
          }`}
          onClick={() => toggleSection('anamnesis')}
        >
          Anamnesis
          <span className="ml-2">{isOpen('anamnesis') ? '▲' : '▼'}</span>
        </button>
        {isOpen('anamnesis') && (
          <div className="bg-lex-card/80 p-4 rounded-b-2xl mt-1 shadow-inner">
            <label className="block font-semibold">Anamnesis</label>
            <textarea id="anamnesis-input" className="w-full border border-lex-accent bg-black text-white p-2 rounded-xl my-2" rows="4"></textarea>
          </div>
        )}
      </div>

      {/* Accordion: Chronic Medications */}
      <div className="mb-3">
        <button
          className={`w-full text-left py-3 px-4 rounded-2xl font-bold text-lg bg-lex-card border border-lex-accent shadow-lex flex justify-between items-center transition-all ${
            isOpen('chronic') ? 'bg-lex-accent/20 text-lex-accent' : 'text-white'
          }`}
          onClick={() => toggleSection('chronic')}
        >
          Chronic Medications
          <span className="ml-2">{isOpen('chronic') ? '▲' : '▼'}</span>
        </button>
        {isOpen('chronic') && (
          <div className="bg-lex-card/80 p-4 rounded-b-2xl mt-1 shadow-inner">
            <label className="block font-semibold">Chronic Medications</label>
            <input id="chronic-meds" className="w-full border border-lex-accent bg-black text-white p-2 rounded-xl my-2" />
          </div>
        )}
      </div>

      {/* Accordion: Drug Allergies */}
      <div className="mb-3">
        <button
          className={`w-full text-left py-3 px-4 rounded-2xl font-bold text-lg bg-lex-card border border-lex-accent shadow-lex flex justify-between items-center transition-all ${
            isOpen('allergies') ? 'bg-lex-accent/20 text-lex-accent' : 'text-white'
          }`}
          onClick={() => toggleSection('allergies')}
        >
          Drug Allergies
          <span className="ml-2">{isOpen('allergies') ? '▲' : '▼'}</span>
        </button>
        {isOpen('allergies') && (
          <div className="bg-lex-card/80 p-4 rounded-b-2xl mt-1 shadow-inner">
            <label className="block font-semibold">Drug Allergies</label>
            <input id="allergy-input" className="w-full border border-lex-accent bg-black text-white p-2 rounded-xl my-2" />
          </div>
        )}
      </div>

      {/* Accordion: Family History */}
      <div className="mb-3">
        <button
          className={`w-full text-left py-3 px-4 rounded-2xl font-bold text-lg bg-lex-card border border-lex-accent shadow-lex flex justify-between items-center transition-all ${
            isOpen('family') ? 'bg-lex-accent/20 text-lex-accent' : 'text-white'
          }`}
          onClick={() => toggleSection('family')}
        >
          Family History
          <span className="ml-2">{isOpen('family') ? '▲' : '▼'}</span>
        </button>
        {isOpen('family') && (
          <div className="bg-lex-card/80 p-4 rounded-b-2xl mt-1 shadow-inner">
            <label className="block font-semibold">Family History</label>
            <input id="family-history-input" className="w-full border border-lex-accent bg-black text-white p-2 rounded-xl my-2" />
          </div>
        )}
      </div>

      {/* Accordion: Substance Use */}
      <div className="mb-3">
        <button
          className={`w-full text-left py-3 px-4 rounded-2xl font-bold text-lg bg-lex-card border border-lex-accent shadow-lex flex justify-between items-center transition-all ${
            isOpen('substance') ? 'bg-lex-accent/20 text-lex-accent' : 'text-white'
          }`}
          onClick={() => toggleSection('substance')}
        >
          Substance Use
          <span className="ml-2">{isOpen('substance') ? '▲' : '▼'}</span>
        </button>
        {isOpen('substance') && (
          <div className="bg-lex-card/80 p-4 rounded-b-2xl mt-1 shadow-inner">
            <label className="block font-semibold">Substance Use</label>
            <input id="substance-use-input" className="w-full border border-lex-accent bg-black text-white p-2 rounded-xl my-2" />
          </div>
        )}
      </div>

      {/* Transcription and ShadowBrain sections (always visible) */}
      <div className="my-5">
        <TranscribeAndAutofillButton />
        <UniversalTranscriberBox />
      </div>
    </div>
  );
}
