import React from "react";

export default function AccordionSection({
  title,
  section,
  openSections,
  onToggle,
  children,
  icon,
  borderColor = "purple"
}) {
  const isOpen = openSections.includes(section);
  const border =
    borderColor === "blue"
      ? "border-blue-700"
      : borderColor === "gray"
      ? "border-gray-700"
      : "border-purple-700";
  const accent =
    borderColor === "blue"
      ? "bg-blue-900 text-blue-200"
      : borderColor === "gray"
      ? "bg-gray-800 text-white"
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
