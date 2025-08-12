import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function LibraryDocumentReader({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFilename(file.name);
    setLoading(true);

    try {
      if (file.type === "application/pdf") {
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const txt = await page.getTextContent();
          fullText += txt.items.map(item => item.str).join(" ") + "\n";
        }
        setText(fullText);
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".docx")
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        setText(value);
      } else if (
        file.type.startsWith("image/") ||
        file.name.match(/\.(png|jpg|jpeg)$/i)
      ) {
        const url = URL.createObjectURL(file);
        const { data: { text: ocrText } } = await Tesseract.recognize(url, "eng");
        setText(ocrText);
        URL.revokeObjectURL(url);
      } else if (
        file.type === "text/plain" ||
        file.type === "text/markdown" ||
        file.type === "application/json" ||
        file.name.match(/\.(txt|md|json|csv|log)$/i)
      ) {
        const raw = await file.text();
        setText(raw);
      } else {
        setText("Unsupported file type.");
      }
    } catch (err) {
      setText("Error parsing file: " + err.message);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="rounded-2xl shadow-lex mb-6 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow"
        onClick={() => onClick(section)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">📑</span>
          Document Reader
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>

      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          <input
            type="file"
            accept=".txt,.md,.json,.csv,.log,.pdf,.docx,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="block w-full bg-gray-900 text-blue-200 border border-blue-700 rounded-xl py-2 px-3 mb-2"
          />
          {loading && (
            <div className="my-2 text-blue-400 font-semibold">Extracting text... (PDF, OCR, or DOCX may take a few seconds)</div>
          )}
          {text && (
            <>
              <h4 className="mt-2 mb-1 font-semibold text-base text-blue-200">{filename}</h4>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={14}
                className="w-full border border-blue-700 p-3 text-base rounded bg-gray-800 text-blue-100"
              />
              <button
                className="bg-fuchsia-700 text-white px-4 py-2 rounded-xl hover:bg-fuchsia-800 transition mt-2 font-bold"
                onClick={handleCopy}
                type="button"
              >
                📋 Copy Extracted Text
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

