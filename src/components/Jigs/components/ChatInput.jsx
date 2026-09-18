/* ============================================
   JIGS V3 — Chat Input
   Text input with send button.
   Supports Enter to send, Shift+Enter for newline.
   ============================================ */

import { useState, useRef, useEffect } from 'react';
import styles from '../Jigs.module.css';

export function ChatInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [disabled]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputRow}>
        <textarea
          ref={inputRef}
          className={styles.textareaInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Ask JIGS anything...'}
          rows={1}
          maxLength={1500}
          disabled={disabled}
        />
        <button
          className={styles.sendButton}
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          type="button"
        >
          →
        </button>
      </div>
    </div>
  );
}
