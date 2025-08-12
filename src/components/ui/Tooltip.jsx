import React from "react";

export function Tooltip({ content, children }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute z-50 hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-max px-4 py-2 text-base font-bold text-white bg-lex-accent/95 rounded-2xl shadow-lex backdrop-blur-xl pointer-events-none transition">
        {content}
      </div>
    </div>
  );
}
