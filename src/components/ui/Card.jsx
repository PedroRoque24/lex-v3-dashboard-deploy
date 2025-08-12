import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`lex-card ${className}`}
      // lex-card sets: bg-lex-card, rounded-2xl, shadow-lex, border, glassy look
    >
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="text-white space-y-2">{children}</div>;
}

