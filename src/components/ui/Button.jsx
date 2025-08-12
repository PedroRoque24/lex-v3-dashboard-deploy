import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`bg-lex-accent hover:bg-lex-blue/90 text-white font-bold px-5 py-2 rounded-2xl shadow-lex transition duration-150 focus:outline-none focus:ring-2 focus:ring-lex-accent/80 ${className}`}
    >
      {children}
    </button>
  );
}

