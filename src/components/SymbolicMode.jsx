import { memoryUrl } from '../lib/api';
import React, { useState } from "react";
import SymbolicPromptFeed from "./SymbolicPromptFeed";
import DreamLexSimViewer from "./DreamLexSimViewer";
import IdentityTimelineChart from "./IdentityTimelineChart";
import TraitDriftChart from "./TraitDriftChart";
import ContradictionViewer from "./ContradictionViewer";
import MemorySymbolicViewer from "./MemorySymbolicViewer";
import LexSimReflections from "./LexSimReflections";
import LivingBrain from "./LivingBrain";
import { Card, CardContent } from "./ui/Card";

// Matches the symbolic regions in LivingBrain (keep in sync!)
const SECTIONS = [
  { key: "prompt", label: "💭 Prompt", component: SymbolicPromptFeed },
  { key: "dream", label: "🌌 Dreams", component: DreamLexSimViewer },
  { key: "trait_evolution", label: "🧬 Trait Evolution", component: IdentityTimelineChart },
  { key: "trait_drift", label: "🔀 Trait Drift", component: TraitDriftChart },
  { key: "contradictions", label: "⚖️ Contradictions", component: ContradictionViewer },
  { key: "memory", label: "🧠 Memory", component: MemorySymbolicViewer },
  { key: "reflections", label: "🪞 Reflections", component: LexSimReflections }
];

export default function SymbolicMode() {
  // No more tab navigation—use LivingBrain as symbolic navigator!
  const [selected, setSelected] = useState("prompt");

  // Find current section definition/component
  const currentSection = SECTIONS.find(sec => sec.key === selected) || SECTIONS[0];
  const PanelComponent = currentSection.component;

  return (
    <div
      className="p-8 min-h-screen"
      style={{
        background: "linear-gradient(135deg, #0a051d 0%, #251844 60%, #141c3a 100%)",
      }}
    >
      <Card className="max-w-4xl mx-auto shadow-2xl rounded-2xl bg-gradient-to-br from-[#271c39cc] via-[#19172d] to-[#251844e0] p-6 backdrop-blur border border-fuchsia-900/30">
        <CardContent>
          <h1 className="text-4xl font-black text-fuchsia-400 mb-6 tracking-tight flex items-center gap-2 drop-shadow">
            🧠 Symbolic Brain Mode
          </h1>

          {/* Living Brain UI — controls section by setSelected */}
          <LivingBrain selected={selected} setSelected={setSelected} />

          {/* Symbolic Panel for current section */}
          <div className="mt-6 min-h-[350px]">
            <PanelComponent />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
