/* ============================================
   JIGS V3 — Starter Prompts
   Initial suggestion chips that disappear
   after the first user message.
   ============================================ */

import styles from '../Jigs.module.css';

const PROMPTS = [
  { id: 'about', label: 'Tell me about Murari' },
  { id: 'work', label: 'Explore the work' },
  { id: 'editing', label: 'Ask me about editing' },
  { id: 'project', label: 'I have a project' },
];

export function StarterPrompts({ onSelect }) {
  return (
    <div className={styles.starterPrompts}>
      {PROMPTS.map((prompt) => (
        <button
          key={prompt.id}
          className={styles.starterChip}
          onClick={() => onSelect(prompt.label)}
          type="button"
        >
          {prompt.label}
        </button>
      ))}
    </div>
  );
}
