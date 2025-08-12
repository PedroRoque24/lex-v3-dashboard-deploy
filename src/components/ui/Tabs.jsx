import React, { useState } from "react";

export function Tabs({ defaultValue, children }) {
  const tabs = React.Children.toArray(children);
  const [active, setActive] = useState(defaultValue || tabs[0].props.value);

  return (
    <div className="space-y-6">
      <div className="flex gap-3 border-b border-lex-accent/40">
        {tabs.map((tab) => (
          <button
            key={tab.props.value}
            onClick={() => setActive(tab.props.value)}
            className={`px-6 py-2 text-lg font-bold rounded-t-2xl transition-all duration-150 shadow-lex focus:outline-none
              ${
                active === tab.props.value
                  ? "bg-lex-accent text-white scale-105 border-b-4 border-lex-accent shadow-lex"
                  : "bg-lex-blue/60 text-white border-b-4 border-transparent hover:border-lex-accent/70 hover:bg-lex-blue/80 hover:text-lex-accent"
              }
            `}
            style={{
              minWidth: 130,
              letterSpacing: "0.03em",
            }}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div>{tabs.find((tab) => tab.props.value === active)}</div>
    </div>
  );
}

export function Tab({ children }) {
  return <div className="mt-6">{children}</div>;
}

