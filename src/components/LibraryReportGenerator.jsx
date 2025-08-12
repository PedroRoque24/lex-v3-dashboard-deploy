import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

// --- Templates ---
const TEMPLATES = {
  EN: {
    absence:
      "To whom it may concern,\n\nThis is to certify that [PATIENT_NAME] was absent from [START_DATE] to [END_DATE] due to [REASON].\n\nDate: [DATE]\nDoctor: [DOCTOR_NAME]",
    robustness:
      "Medical Certificate of Fitness\n\nThis is to certify that [PATIENT_NAME] has been evaluated on [DATE] and is deemed physically and mentally fit.\n\nDoctor: [DOCTOR_NAME]",
    breastfeeding:
      "Declaration of Breastfeeding\n\nI hereby declare that [PATIENT_NAME] is currently breastfeeding and requires appropriate accommodation until [END_DATE].\n\nDate: [DATE]\nDoctor: [DOCTOR_NAME]",
    family_support:
      "Certificate of Family Support\n\nThis is to certify that [PATIENT_NAME] requires accompaniment for medical reasons from [START_DATE] to [END_DATE].\n\nDoctor: [DOCTOR_NAME]",
  },
  PT: {
    incapacidade:
`Atestado incapacidade

[DOCTOR_NAME], detentor da cédula profissional da OM n [CARD_NUMBER], declaro que observei, em consulta a utente [PATIENT_NAME] – nascido a [DATE_OF_BIRTH], com nr utente [SNS_NUMBER], no dia [DATE] as [HOURS].

Emito atestado incapacidade temporária entre as datas de:
[DATE_BEGINNING] - [DATE_FINISH]`,

    robustness:
`[DOCTOR_NAME], detentor da cédula profssional da OM n [CARD_NUMBER] declaro que tive, em consulta no dia [DATE] as [HOUR], o utente [PATIENT_NAME] - nascido a [DATE_OF_BIRTH], com nr utente [SNS_NUMBER].
Constata-se o seguinte:
Sexo [GENDER], [AGE], [WEIGHT]
Antecedentes Pessoais: [PERSONAL_HISTORY]
Medicação Habitual: [USUAL_MEDICATION]
Sem alergias medicamentosas conhecidas/ ALergias a [ALLERGIES]
Dieta variada, practica actividade fisica regularmente
HDA: Sem queixas, saudável
Na presente data atesta-se robustez fisica e psiquica, sem evidência de doença infecto-contagiosa aguda.
Apto.`,

    acompanhamento:
`[DOCTOR_NAME], detentor da cédula profissional da OM n [CARD_NUMBER], declaro que observei, em consulta a utente [PATIENT_NAME] – nascido a [DATE_OF_BIRTH], com nr utente [SNS_NUMBER], no dia [DATE] as [HOURS].

A necessitar de cuidados de acompanhamento familiar por parte de:
[ACCOMPANIER]

Emito atestado acompanhamento familiar entre as datas de:
[DATE_BEGINNING] - [DATE_END]`,

    amamentacao:
`[DOCTOR_NAME], detentor da cédula profissional da OM n [CARD_NUMBER], declaro que observei, em consulta a utente [PATIENT_NAME] - nascido a - [DATE_OF_BIRTH], com nr utente [SNS_NUMBER], no dia [DATE] as [HOURS].

Trata-se de utente, com filho de [AGE] idade ([AGE_MONTHS]), sendo que mantém regime de aleitamento materno, pelo que a mãe vem requer a redução de horário laboral, a que tem direito para o efeito (Decreto-Lei nº70/2000), a partir da data [DATE_START] e com a duração de 1 mês.

Dados filho(a):
Nome: [CHILD_NAME]
Nr utente: [CHILD_SNS]
Data de nascimento: [CHILD_DOB]

Por isto Ser verdade, emito a seguinte declaração`
  },
};

const fieldsForType = {
  EN: {
    absence: ["PATIENT_NAME", "START_DATE", "END_DATE", "REASON", "DATE", "DOCTOR_NAME"],
    robustness: ["PATIENT_NAME", "DATE", "DOCTOR_NAME"],
    breastfeeding: ["PATIENT_NAME", "END_DATE", "DATE", "DOCTOR_NAME"],
    family_support: ["PATIENT_NAME", "START_DATE", "END_DATE", "DOCTOR_NAME"],
  },
  PT: {
    incapacidade: [
      "DOCTOR_NAME",
      "CARD_NUMBER",
      "PATIENT_NAME",
      "DATE_OF_BIRTH",
      "SNS_NUMBER",
      "DATE",
      "HOURS",
      "DATE_BEGINNING",
      "DATE_FINISH"
    ],
    robustness: [
      "DOCTOR_NAME",
      "CARD_NUMBER",
      "DATE",
      "HOUR",
      "PATIENT_NAME",
      "DATE_OF_BIRTH",
      "SNS_NUMBER",
      "GENDER",
      "AGE",
      "WEIGHT",
      "PERSONAL_HISTORY",
      "USUAL_MEDICATION",
      "ALLERGIES"
    ],
    acompanhamento: [
      "DOCTOR_NAME",
      "CARD_NUMBER",
      "PATIENT_NAME",
      "DATE_OF_BIRTH",
      "SNS_NUMBER",
      "DATE",
      "HOURS",
      "ACCOMPANIER",
      "DATE_BEGINNING",
      "DATE_END"
    ],
    amamentacao: [
      "DOCTOR_NAME",
      "CARD_NUMBER",
      "PATIENT_NAME",
      "DATE_OF_BIRTH",
      "SNS_NUMBER",
      "DATE",
      "HOURS",
      "AGE",
      "AGE_MONTHS",
      "DATE_START",
      "CHILD_NAME",
      "CHILD_SNS",
      "CHILD_DOB"
    ]
  }
};

const LABELS = {
  EN: {
    PATIENT_NAME: "Patient Name",
    START_DATE: "Start Date",
    END_DATE: "End Date",
    REASON: "Reason",
    DATE: "Date",
    DOCTOR_NAME: "Doctor",
  },
  PT: {
    DOCTOR_NAME: "Nome do Médico",
    CARD_NUMBER: "Cédula OM",
    PATIENT_NAME: "Nome Utente",
    DATE_OF_BIRTH: "Data de Nascimento",
    SNS_NUMBER: "Nº Utente SNS",
    DATE: "Data da Consulta",
    HOURS: "Hora",
    DATE_BEGINNING: "Data de Início",
    DATE_FINISH: "Data de Fim",
    HOUR: "Hora",
    GENDER: "Sexo",
    AGE: "Idade",
    WEIGHT: "Peso",
    PERSONAL_HISTORY: "Antecedentes Pessoais",
    USUAL_MEDICATION: "Medicação Habitual",
    ALLERGIES: "Alergias",
    ACCOMPANIER: "Acompanhante",
    DATE_END: "Data de Fim",
    AGE_MONTHS: "Idade em meses",
    DATE_START: "Data de início",
    CHILD_NAME: "Nome do filho(a)",
    CHILD_SNS: "Nº Utente filho(a)",
    CHILD_DOB: "Data nascimento filho(a)"
  }
};

export default function LibraryReportGenerator({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const [lang, setLang] = useState("EN");
  const [type, setType] = useState(lang === "PT" ? "incapacidade" : "absence");
  const [inputs, setInputs] = useState({
    // English
    PATIENT_NAME: "",
    START_DATE: "",
    END_DATE: "",
    REASON: "",
    DATE: "",
    DOCTOR_NAME: "",
    // Portuguese
    DOCTOR_NAME: "",
    CARD_NUMBER: "",
    PATIENT_NAME: "",
    DATE_OF_BIRTH: "",
    SNS_NUMBER: "",
    DATE: "",
    HOURS: "",
    DATE_BEGINNING: "",
    DATE_FINISH: "",
    HOUR: "",
    GENDER: "",
    AGE: "",
    WEIGHT: "",
    PERSONAL_HISTORY: "",
    USUAL_MEDICATION: "",
    ALLERGIES: "",
    ACCOMPANIER: "",
    DATE_END: "",
    AGE_MONTHS: "",
    DATE_START: "",
    CHILD_NAME: "",
    CHILD_SNS: "",
    CHILD_DOB: ""
  });
  const [customReport, setCustomReport] = useState("");

  const generateReport = () => {
    let result = TEMPLATES[lang][type];
    const langFields = fieldsForType[lang][type];
    langFields.forEach((field) => {
      const placeholder = `[${field}]`;
      result = result.replaceAll(placeholder, inputs[field] || "___");
    });
    if (lang === "EN") {
      Object.entries(inputs).forEach(([key, value]) => {
        const placeholder = `[${key}]`;
        result = result.replaceAll(placeholder, value || "___");
      });
    }
    return result;
  };

  React.useEffect(() => {
    setCustomReport(generateReport());
    // eslint-disable-next-line
  }, [lang, type, ...fieldsForType[lang][type].map(f => inputs[f])]);

  const handleTextareaChange = (e) => {
    setCustomReport(e.target.value);
  };

  const handleLangTypeChange = (lang, type) => {
    setCustomReport(TEMPLATES[lang][type]);
  };

  const typeOptionsPT = [
    { value: "incapacidade", label: "Atestado Incapacidade" },
    { value: "robustness", label: "Atestado Robustez" },
    { value: "acompanhamento", label: "Atestado Acompanhamento Familiar" },
    { value: "amamentacao", label: "Atestado Amamentação" }
  ];
  const typeOptionsEN = [
    { value: "absence", label: "Absence Declaration" },
    { value: "robustness", label: "Fitness Statement" },
    { value: "breastfeeding", label: "Breastfeeding Declaration" },
    { value: "family_support", label: "Family Support Certificate" }
  ];

  return (
    <div className="rounded-2xl shadow-lex mb-6 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow"
        onClick={() => onClick(section)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">📄</span>
          Report Generator
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all space-y-4">
          <div className="flex gap-4 items-center">
            <label className="text-base font-medium text-blue-200">
              Language:
              <select
                className="ml-2 border border-blue-700 px-2 py-1 bg-gray-950 text-white rounded-xl"
                value={lang}
                onChange={e => {
                  setLang(e.target.value);
                  const newType = e.target.value === "PT" ? "incapacidade" : "absence";
                  setType(newType);
                  handleLangTypeChange(e.target.value, newType);
                }}
              >
                <option value="PT">Português 🇵🇹</option>
                <option value="EN">English 🇺🇸</option>
              </select>
            </label>
            <label className="text-base font-medium text-blue-200">
              Type:
              <select
                className="ml-2 border border-blue-700 px-2 py-1 bg-gray-950 text-white rounded-xl"
                value={type}
                onChange={e => {
                  setType(e.target.value);
                  handleLangTypeChange(lang, e.target.value);
                }}
              >
                {(lang === "PT" ? typeOptionsPT : typeOptionsEN).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {fieldsForType[lang][type].map((field) => (
              <input
                key={field}
                className="border border-blue-700 px-2 py-2 text-base bg-gray-800 text-blue-200 rounded placeholder:text-blue-400"
                placeholder={LABELS[lang][field] || field}
                value={inputs[field]}
                onChange={(e) => setInputs((prev) => ({ ...prev, [field]: e.target.value }))}
              />
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 text-blue-300">📄 Preview:</h3>
            <textarea
              className="w-full border border-blue-700 p-3 text-base rounded bg-gray-800 text-blue-100"
              rows={14}
              value={customReport}
              onChange={handleTextareaChange}
            />
          </div>

          <button
            className="mt-2 bg-fuchsia-700 hover:bg-fuchsia-800 text-white px-4 py-2 rounded-xl text-base font-bold shadow-lex"
            onClick={() => navigator.clipboard.writeText(customReport)}
            type="button"
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

