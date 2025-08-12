
import { memoryUrl } from '../lib/api';
import React, { useEffect, useState } from "react";

export default function SymbolicPromptFeed() {
  const [thought, setThought] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    fetch("/memory/brain-thought.txt")
      .then((res) => res.text())
      .then((text) => {
        let trimmed = (text || "").trim();
        const isHTML = trimmed.startsWith("<") || trimmed.includes("<html");
        if (isHTML || trimmed.length === 0 || trimmed.includes("404")) {
          setIsValid(false);
          return;
        }

        // === Cleanup rules ===
        // Remove [Case: ...] blocks
        trimmed = trimmed.replace(/\[Case:[\s\S]*$/m, "").trim();
        // Remove markdown/section headers
        trimmed = trimmed.split("\n").filter(line => !line.startsWith("###")).join("\n").trim();
        // Collapse multiple blank lines
        trimmed = trimmed.replace(/\n{3,}/g, "\n\n");

        // Keep only the first ~500 chars for UI readability
        if (trimmed.length > 500) {
          const cut = trimmed.slice(0, 500);
          const lastSpace = cut.lastIndexOf(" ");
          trimmed = cut.slice(0, lastSpace > 0 ? lastSpace : 500) + "…";
        }

        // Optional: limit to first sentence if extremely verbose
        const sentences = trimmed.split(/(?<=[.?!])\s+/);
        if (sentences.length > 3) {
          trimmed = sentences.slice(0, 2).join(" ");
        }

        setThought(trimmed);
      })
      .catch(() => {
        setIsValid(false);
      });
  }, []);

  return (
    <div className="bg-gradient-to-tr from-[#201537d9] via-[#19172da9] to-[#2b174eea] border border-fuchsia-900 rounded-2xl shadow-lex p-6 mt-4">
      <h3 className="text-lg font-bold mb-2 text-fuchsia-300 flex items-center gap-2">
        <span role="img" aria-label="thought">💭</span>
        Latest Symbolic Prompt
      </h3>
      {isValid && thought && thought !== "(null)" && thought !== "(missing)" ? (
        <p className="whitespace-pre-wrap text-base italic text-fuchsia-100">{thought}</p>
      ) : (
        <p className="italic text-fuchsia-400/70">⚠️ No symbolic prompt available yet.</p>
      )}
    </div>
  );
}
