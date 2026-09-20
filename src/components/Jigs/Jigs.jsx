/* ============================================
   JIGS V3 — Main Component
   AI Studio Assistant for Fallen Hair
   Modal interface with editorial UI/UX.

   Conversational-first. No rigid questionnaire.
   Session persists across modal open/close.
   Intentional reset via NEW CHAT action.
   ============================================ */

import { useRef, useEffect, useCallback } from 'react';
import { useJigsSession } from './hooks/useJigsSession';
import { MessageStream } from './components/MessageStream';
import { StarterPrompts } from './components/StarterPrompts';
import { ChatInput } from './components/ChatInput';
import { EnquiryReview } from './components/EnquiryReview';
import { TypingIndicator } from './components/TypingIndicator';
import styles from './Jigs.module.css';

const LOCKED_INTRO = "Hey, I'm JIGS. Curious about Murari, the work, or how we make things? Ask me anything.";

export function Jigs({ onClose }) {
  const {
    messages,
    intent,
    enquiryData,
    qualificationCompleteness,
    errorMessage,
    editingField,
    hasEnquiry,
    sendMessage,
    enterReview,
    updateField,
    editField,
    cancelReview,
    submitEnquiry,
    clearError,
    resetConversation,
    isThinking,
    isReview,
    isSubmitting,
    isSubmitted,
    isIdle,
  } = useJigsSession();

  const conversationRef = useRef(null);
  const modalRef = useRef(null);

  /* Scroll conversation to bottom when messages change */
  const scrollToBottom = useCallback(() => {
    if (conversationRef.current) {
      requestAnimationFrame(() => {
        conversationRef.current.scrollTo({
          top: conversationRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 80);
    return () => clearTimeout(timer);
  }, [messages, isThinking, isReview, scrollToBottom]);

  /* Close on ESC — intentional close mechanism (does not destroy session) */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /* Handle backdrop click — intentional close, does NOT destroy state */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  /* Handle starter prompt selection */
  const handleStarterSelect = (text) => {
    sendMessage(text);
  };

  /* Determine if we should show the enquiry review action button */
  const showEnquiryAction = (
    !isReview &&
    !isSubmitting &&
    !isSubmitted &&
    !isIdle &&
    hasEnquiry &&
    qualificationCompleteness >= 30
  );

  /* Determine if we should show the "start enquiry" nudge */
  const showStartEnquiry = (
    !isReview &&
    !isSubmitting &&
    !isSubmitted &&
    !isIdle &&
    !hasEnquiry &&
    (intent === 'project_intent' || intent === 'enquiry_qualification') &&
    qualificationCompleteness >= 20
  );

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="JIGS — Fallen Hair Studio Assistant"
    >
      <div ref={modalRef} className={styles.modalDialogue} onClick={(e) => e.stopPropagation()} data-lenis-prevent>

        {/* ---- Header ---- */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerDot} aria-hidden="true" />
            <span className={styles.headerTitle}>JIGS</span>
            <span className={styles.headerSub}>// STUDIO ASSISTANT</span>
          </div>
          <div className={styles.headerRight}>
            {messages.length > 0 && !isSubmitting && (
              <button
                className={styles.resetButton}
                onClick={resetConversation}
                title="End conversation and start fresh"
                type="button"
              >
                NEW CHAT
              </button>
            )}
            {isReview && <span className={styles.stepCounter}>REVIEW</span>}
            {isSubmitted && <span className={styles.stepCounter}>SENT</span>}
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close JIGS assistant"
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        {/* ---- Conversation Viewport ---- */}
        <div ref={conversationRef} className={styles.conversationViewport} data-lenis-prevent>
          <div className={styles.conversationStream}>

            {/* Locked intro message */}
            <div className={`${styles.messageBlock} ${styles.jigsBlock}`}>
              <div className={styles.jigsMessageGroup}>
                <span className={styles.jigsLabel}>JIGS</span>
                <p className={styles.jigsMessageText}>{LOCKED_INTRO}</p>
              </div>
            </div>

            {/* Starter prompts — only before first message */}
            {isIdle && messages.length === 0 && (
              <StarterPrompts onSelect={handleStarterSelect} />
            )}

            {/* Message stream */}
            <MessageStream messages={messages} />

            {/* Typing indicator */}
            {isThinking && <TypingIndicator />}

            {/* Enquiry review */}
            {isReview && (
              <EnquiryReview
                enquiryData={enquiryData}
                editingField={editingField}
                onEditField={editField}
                onUpdateField={updateField}
                onSubmit={submitEnquiry}
                onCancel={cancelReview}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
              />
            )}

            {/* Success state */}
            {isSubmitted && (
              <div className={styles.successSection}>
                <div className={styles.successConfirmation}>
                  <span className={styles.successCheck}>✓</span>
                  <span className={styles.successHeading}>ENQUIRY RECEIVED</span>
                  <span className={styles.successSub}>A record has been registered in the studio log.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---- Footer / Input Area ---- */}
        <div className={styles.modalFooter}>

          {/* Error banner */}
          {errorMessage && !isReview && (
            <div className={styles.errorBanner}>
              <span className={styles.errorBannerText}>{errorMessage}</span>
              <button className={styles.errorDismiss} onClick={clearError} type="button">×</button>
            </div>
          )}

          {/* Chat input — shown in idle, conversing, and thinking states */}
          {!isReview && !isSubmitting && !isSubmitted && (
            <>
              <ChatInput
                onSend={sendMessage}
                disabled={isThinking}
                placeholder={isIdle ? 'Ask JIGS anything...' : 'Reply to JIGS...'}
              />

              {/* Enquiry action buttons */}
              {(showStartEnquiry || showEnquiryAction) && (
                <div className={styles.footerActions}>
                  <button
                    className={styles.enquiryNudge}
                    onClick={enterReview}
                    type="button"
                  >
                    REVIEW & SUBMIT ENQUIRY →
                  </button>
                </div>
              )}
            </>
          )}

          {/* Submitting state */}
          {isSubmitting && (
            <div className={styles.submittingState}>
              <span className={styles.submittingPulse} />
              <span className={styles.submittingText}>SUBMITTING ENQUIRY...</span>
            </div>
          )}

          {/* Success close button */}
          {isSubmitted && (
            <div className={styles.successActions}>
              <button className={styles.closeSuccessButton} onClick={onClose} type="button">
                CLOSE
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
