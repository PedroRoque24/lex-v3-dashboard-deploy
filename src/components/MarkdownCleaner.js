// MarkdownCleaner.js

import { memoryUrl } from '../lib/api';
export function cleanMarkdown(text) {
  if (!text) return '';

  // Fix multiple hashes ## -> proper spacing
  text = text.replace(/###\s*/g, '### ').replace(/##\s*/g, '## ').replace(/#\s*/g, '# ');

  // Remove duplicate flowchart words
  text = text.replace(/\b(\w+) \1\b/g, '$1');

  // Normalize flowchart arrows
  text = text.replace(/-+>/g, '→');
  text = text.replace(/\s*->\s*/g, ' → ');

  // Normalize table pipes
  text = text.replace(/\|\s+/g, '|').replace(/\s+\|/g, '|');

  // Remove triple+ line breaks
  text = text.replace(/\n{3,}/g, '\n\n');

  // Clean up extra spaces
  text = text.replace(/[ ]{2,}/g, ' ');

  return text.trim();
}
