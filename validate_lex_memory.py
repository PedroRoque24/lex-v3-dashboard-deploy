
import os
import json
from pathlib import Path

# Path to memory directory
MEMORY_DIR = Path(__file__).parent / "public" / "memory"

# Critical files to check
files = [
    "brain-thought.txt",
    "trait_drift_timeline.json",
    "reflection-log.txt",
    "long_memory_index.json",
    "memory-core.json",
    "contradictions.json"
]

print("🔍 Lex Memory Validator")
print("=" * 40)

for filename in files:
    path = MEMORY_DIR / filename
    if not path.exists():
        print(f"❌ MISSING: {filename}")
    elif path.stat().st_size == 0:
        print(f"⚠️ EMPTY:   {filename}")
    else:
        size_kb = round(path.stat().st_size / 1024, 1)
        print(f"✅ OK:      {filename} ({size_kb} KB)")
