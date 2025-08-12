import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";
import axios from "axios";
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
    <div className="space-y-4 text-slate-100">
      <h2 className="flex font-bold items-center text-xl text-fuchsia-300">💊 Chronic Medications</h2>
      <ul className="list-disc ml-6 text-slate-200">
        {meds.map((m, i) => (
          <li key={i}>
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
            <button onClick={() => removeMed(i)} className="ml-2 text-red-500">remove</button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="px-2 py-1 text-white bg-gray-800 rounded-lg border border-gray-700 placeholder:text-slate-400"
          placeholder="Medication"
          value={medInput}
          onChange={(e) => setMedInput(e.target.value)}
          style={{ minWidth: "120px" }}
        />
        <input
          className="px-2 py-1 text-white bg-gray-800 rounded-lg border border-gray-700 placeholder:text-slate-400"
          placeholder="Dose (e.g. 10mg)"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          style={{ width: "85px" }}
        />
        <select
          className="px-2 py-1 text-white bg-gray-800 rounded-lg border border-gray-700 placeholder:text-slate-400 bg-gray-800 rounded-lg border border-gray-700 text-white"
          value={freq}
          onChange={(e) => setFreq(e.target.value)}
        >
          {freqOptions.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <input
          className="px-2 py-1 text-white bg-gray-800 rounded-lg border border-gray-700 placeholder:text-slate-400"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: "85px" }}
        />
        <button onClick={addMed} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-xl text-white" disabled={!medInput.trim()}>Add</button>
        {isSuggesting && <span className="ml-2 text-xs text-yellow-300">GPT...</span>}
      </div>
      {suggestion && (
        <div className="bg-blue-950/80 ml-2 p-2 rounded-xl text-blue-300 text-xs">
          <b>Suggestion:</b> {suggestion.name}
        </div>
      )}
    </div>
  );
}
