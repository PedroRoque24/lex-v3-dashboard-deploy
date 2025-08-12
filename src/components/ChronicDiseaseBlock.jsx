import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCaseContext } from "./CaseContext";

const freqOptions = [
  "Once a day", "Twice a day", "Three times a day", "Four times a day",
  "Every other day", "Weekly", "As needed"
];

export default function ChronicMedicationBlock() {
  const { patientId, casePath } = useCaseContext() || {};
  const [meds, setMeds] = useState([]);
  const [medInput, setMedInput] = useState("");
  const [dose, setDose] = useState("");
  const [freq, setFreq] = useState(freqOptions[0]);
  const [notes, setNotes] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!casePath) return;
    axios.post("http://localhost:5000/api/chronic/get", {
      case_path: casePath,
      type: "chronic_medications.json"
    }).then(res => setMeds(res.data || []));
  }, [casePath]);

  useEffect(() => {
    if (!medInput.trim()) {
      setSuggestion(null);
      return;
    }
    setIsSuggesting(true);
    axios.post("http://localhost:5000/api/gpt/med_suggest", {
      q: medInput.trim()
    }).then(res => {
      setSuggestion(res.data && res.data.name ? res.data : null);
      setIsSuggesting(false);
    }).catch(() => setIsSuggesting(false));
  }, [medInput]);

  const addMed = async () => {
    let entry = {
      name: (suggestion && suggestion.name) || medInput.trim(),
      dose,
      freq,
      notes
    };
    const updated = [...meds, entry];
    await axios.post("http://localhost:5000/api/chronic/save", {
      case_path: casePath,
      type: "chronic_medications.json",
      array: updated
    });
    setMeds(updated);
    setMedInput(""); setDose(""); setFreq(freqOptions[0]); setNotes(""); setSuggestion(null);
  };

  const removeMed = async (i) => {
    const updated = meds.filter((_, idx) => idx !== i);
    await axios.post("http://localhost:5000/api/chronic/save", {
      case_path: casePath,
      type: "chronic_medications.json",
      array: updated
    });
    setMeds(updated);
  };

  return (
    <div className="rounded-2xl shadow-lex mb-4 border-2 border-green-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-green-700 bg-green-900/80 text-green-200 shadow"
        onClick={() => setIsOpen(x => !x)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">💊</span>
          Chronic Medications
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-green-700 animate-fadeIn transition-all">
          <ul className="list-disc ml-6 text-green-100 space-y-2">
            {meds.map((m, i) => (
              <li key={i} className="flex items-center gap-2 bg-green-900/30 px-3 py-2 rounded-lg border border-green-800 shadow">
                <span>
                  {typeof m === "string"
                    ? m
                    : (
                      <>
                        <span>{m.name}</span>
                        {m.dose && <span className="ml-2 text-purple-300">{m.dose}</span>}
                        {m.freq && <span className="ml-2 text-green-300">{m.freq}</span>}
                        {m.notes && <span className="ml-2 text-yellow-300">{m.notes}</span>}
                      </>
                    )
                  }
                </span>
                <button onClick={() => removeMed(i)} className="ml-2 text-red-300 hover:text-red-500 text-xs font-bold">remove</button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 items-center mt-4">
            <input
              className="px-3 py-2 text-white bg-gray-800 rounded-lg border border-green-700 placeholder:text-green-400"
              placeholder="Medication"
              value={medInput}
              onChange={(e) => setMedInput(e.target.value)}
              style={{ minWidth: "120px" }}
            />
            <input
              className="px-3 py-2 text-white bg-gray-800 rounded-lg border border-green-700 placeholder:text-green-400"
              placeholder="Dose (e.g. 10mg)"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              style={{ width: "85px" }}
            />
            <select
              className="px-3 py-2 text-white bg-gray-800 rounded-lg border border-green-700"
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
            >
              {freqOptions.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <input
              className="px-3 py-2 text-white bg-gray-800 rounded-lg border border-green-700 placeholder:text-green-400"
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: "85px" }}
            />
            <button
              onClick={addMed}
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-xl text-white font-bold"
              disabled={!medInput.trim()}
            >
              Add
            </button>
            {isSuggesting && <span className="ml-2 text-xs text-yellow-300">GPT...</span>}
          </div>
          {suggestion && (
            <div className="bg-green-950/80 ml-2 mt-2 p-2 rounded-xl text-green-200 text-xs font-bold">
              <b>Suggestion:</b> {suggestion.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
