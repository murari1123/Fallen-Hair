/* ============================================
   JIGS V3 — Message Stream
   Renders the conversation history.
   Left-aligned JIGS · Right-aligned User.
   ============================================ */

import styles from '../Jigs.module.css';

export function MessageStream({ messages }) {
  if (!messages || messages.length === 0) return null;

  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.messageBlock} ${msg.sender === 'jigs' ? styles.jigsBlock : styles.userBlock}`}
        >
          {msg.sender === 'jigs' ? (
            <div className={styles.jigsMessageGroup}>
              <span className={styles.jigsLabel}>JIGS</span>
              <p className={styles.jigsMessageText}>{msg.content}</p>
            </div>
          ) : (
            <div className={styles.userMessageGroup}>
              <span className={styles.userLabel}>YOU</span>
              <p className={styles.userMessageText}>{msg.content}</p>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
