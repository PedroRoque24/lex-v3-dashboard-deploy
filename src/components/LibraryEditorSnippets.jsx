import { memoryUrl } from '../lib/api';
import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const DEFAULT_SNIPPETS = [
  "O paciente encontra-se em boas condições gerais.",
  "Paciente orientado e colaborante.",
];

export default function LibraryEditorSnippets({ open, onClick, section }) {
  const isOpen = open.includes(section);
  const [text, setText] = useState("");
  const [snippets, setSnippets] = useState([]);
  const [newSnippet, setNewSnippet] = useState("");

  // Load snippets from localStorage (or fallback to defaults)
  useEffect(() => {
    const saved = localStorage.getItem("custom_snippets");
    setSnippets(saved ? JSON.parse(saved) : DEFAULT_SNIPPETS);
  }, []);

  // Save snippets to localStorage on change
  useEffect(() => {
    localStorage.setItem("custom_snippets", JSON.stringify(snippets));
  }, [snippets]);

  const handleSnippetInsert = (snippet) => {
    setText((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + snippet);
  };

  const handleSnippetCopy = (snippet) => {
    navigator.clipboard.writeText(snippet);
  };

  const handleAddSnippet = () => {
    if (!newSnippet.trim()) return;
    setSnippets((prev) => [...prev, newSnippet.trim()]);
    setNewSnippet("");
  };

  const handleDeleteSnippet = (idx) => {
    setSnippets((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="rounded-2xl shadow-lex mb-6 border-2 border-blue-700 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 transition max-w-xl mx-auto">
      {/* Collapsible Header */}
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-lg font-bold rounded-t-2xl border-b-2 border-blue-700 bg-blue-900/80 text-blue-200 shadow"
        onClick={() => onClick(section)}
        style={{ letterSpacing: 1.2 }}
      >
        <span>
          <span className="mr-2 text-2xl align-middle">✂️</span>
          Editor de Snippets
        </span>
        <span className="ml-3 text-xl">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>
      {isOpen && (
        <div className="p-6 rounded-b-2xl bg-gray-900/80 border-t-2 border-blue-700 animate-fadeIn transition-all">
          <label className="block text-base font-medium mb-2 text-blue-200">
            Texto principal:
          </label>
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-blue-700 bg-gray-800 text-blue-100 p-3 mb-4"
            placeholder="Edite ou cole o texto aqui..."
            value={text}
            onChange={e => setText(e.target.value)}
          />

          <div className="mb-4">
            <span className="block text-base font-semibold mb-1 text-blue-200">Snippets rápidos:</span>
            <div className="flex flex-wrap gap-2 mb-2">
              {snippets.map((snippet, i) => (
                <div key={i} className="flex gap-1 items-center">
                  <button
                    className="bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-800 transition"
                    onClick={() => handleSnippetInsert(snippet)}
                    type="button"
                  >
                    Inserir
                  </button>
                  <button
                    className="bg-gray-600 text-white rounded-xl px-2 py-1"
                    onClick={() => handleSnippetCopy(snippet)}
                    type="button"
                    title="Copiar snippet"
                  >
                    📋
                  </button>
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-blue-100">{snippet}</span>
                  <button
                    className="ml-1 text-red-400 hover:text-red-600"
                    onClick={() => handleDeleteSnippet(i)}
                    type="button"
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="border border-blue-700 px-2 py-1 rounded-xl bg-gray-800 text-blue-100"
                placeholder="Novo snippet"
                value={newSnippet}
                onChange={e => setNewSnippet(e.target.value)}
              />
              <button
                className="bg-green-600 text-white px-3 py-1 rounded-xl font-bold"
                onClick={handleAddSnippet}
                type="button"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition"
              disabled={!text}
              onClick={() => alert("Texto salvo:\n\n" + text)}
              type="button"
            >
              Salvar Texto
            </button>
            <button
              className="bg-fuchsia-700 text-white px-4 py-2 rounded-xl font-bold hover:bg-fuchsia-800 transition"
              disabled={!text}
              onClick={handleCopyAll}
              type="button"
            >
              📋 Copiar tudo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


