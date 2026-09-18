/* ============================================
   JIGS V3 — Session Hook
   Manages API communication, session state,
   and enquiry lifecycle from the frontend.
   Persists active conversation across modal close/open.
   ============================================ */

import { useReducer, useCallback, useRef, useEffect } from 'react';
import { jigsReducer, createInitialState, ACTIONS, PHASES } from '../state/jigsReducer.js';

const API_ENDPOINT = '/api/jigs-chat';

// Module-scoped session cache to preserve active conversation across modal unmount/mount
let cachedSessionState = null;

/**
 * Custom hook that encapsulates all JIGS session logic.
 * Returns state + action dispatchers for the UI.
 */
export function useJigsSession() {
  const [state, dispatch] = useReducer(
    jigsReducer,
    undefined,
    () => cachedSessionState || createInitialState()
  );

  const submittingRef = useRef(false);
  const sendingRef = useRef(false);

  // Keep module cache synchronized with current state
  useEffect(() => {
    cachedSessionState = state;
  }, [state]);

  /**
   * Send a conversational message to JIGS.
   */
  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || sendingRef.current) return;

    sendingRef.current = true;
    dispatch({ type: ACTIONS.SEND_MESSAGE, payload: { text: trimmed } });

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'conversation',
          message: trimmed,
          sessionToken: state.sessionToken,
          history: state.messages.slice(-16).map(m => ({
            sender: m.sender,
            content: m.content,
          })),
          conversationSummary: state.conversationSummary,
          intent: state.intent,
          enquiryState: sanitizeEnquiryForAPI(state.enquiryData),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const data = await res.json();

      dispatch({
        type: ACTIONS.RECEIVE_RESPONSE,
        payload: {
          reply: data.reply,
          intent: data.intent,
          extracted_data: data.extracted_data,
          qualification_completeness: data.qualification_completeness,
          conversationSummary: data.conversationSummary,
          sessionToken: data.sessionToken,
          actions: data.actions || [],
        },
      });
    } catch (err) {
      dispatch({
        type: ACTIONS.AI_ERROR,
        payload: { message: err.message || 'Connection failed. Please try again.' },
      });
    } finally {
      sendingRef.current = false;
    }
  }, [state.sessionToken, state.messages, state.conversationSummary, state.intent, state.enquiryData]);

  /**
   * Start an enquiry (creates a record in Supabase).
   */
  const startEnquiry = useCallback(async () => {
    if (!state.sessionToken) return false;

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_enquiry',
          sessionToken: state.sessionToken,
          enquiryData: state.enquiryData,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create enquiry');
      }

      const data = await res.json();
      if (data.success && data.enquiryId) {
        dispatch({ type: ACTIONS.SET_ENQUIRY_ID, payload: { enquiryId: data.enquiryId } });
        return true;
      }
      return false;
    } catch (err) {
      console.error('[JIGS] startEnquiry error:', err.message);
      return false;
    }
  }, [state.sessionToken, state.enquiryData]);

  /**
   * Enter review mode.
   * Ensures an enquiry exists before allowing review.
   */
  const enterReview = useCallback(async () => {
    // Create enquiry if it doesn't exist yet
    if (!state.enquiryId) {
      const created = await startEnquiry();
      if (!created) {
        dispatch({
          type: ACTIONS.AI_ERROR,
          payload: { message: 'Could not prepare your enquiry for review. Please try again.' },
        });
        return;
      }
    }
    dispatch({ type: ACTIONS.START_REVIEW });
  }, [state.enquiryId, startEnquiry]);

  /**
   * Update a single enquiry field.
   */
  const updateField = useCallback((field, value) => {
    dispatch({ type: ACTIONS.UPDATE_FIELD, payload: { field, value } });
  }, []);

  /**
   * Set which field is being edited in review.
   */
  const editField = useCallback((field) => {
    dispatch({ type: ACTIONS.EDIT_FIELD, payload: { field } });
  }, []);

  /**
   * Cancel review and return to conversation.
   */
  const cancelReview = useCallback(() => {
    dispatch({ type: ACTIONS.CANCEL_REVIEW });
  }, []);

  /**
   * Submit the enquiry (finalize and persist).
   * Idempotent — prevents double submission via submittingRef.
   */
  const submitEnquiry = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    dispatch({ type: ACTIONS.START_SUBMIT });

    try {
      // Ensure enquiry exists
      if (!state.enquiryId) {
        const created = await startEnquiry();
        if (!created) throw new Error('Failed to create enquiry');
      }

      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_enquiry',
          sessionToken: state.sessionToken,
          enquiryData: state.enquiryData,
          messages: state.messages.map(m => ({
            sender: m.sender,
            content: m.content,
          })),
          conversationSummary: state.conversationSummary,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Submission failed');
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error('Server did not confirm submission');
      }

      dispatch({
        type: ACTIONS.SUBMIT_SUCCESS,
        payload: { enquiryId: data.enquiryId },
      });
    } catch (err) {
      dispatch({
        type: ACTIONS.SUBMIT_ERROR,
        payload: { message: err.message || 'Submission failed. Please try again.' },
      });
    } finally {
      submittingRef.current = false;
    }
  }, [state.sessionToken, state.enquiryId, state.enquiryData, state.messages, state.conversationSummary, startEnquiry]);

  /**
   * Clear error state.
   */
  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Explicitly end conversation and reset state.
   */
  const resetConversation = useCallback(() => {
    cachedSessionState = null;
    dispatch({ type: ACTIONS.RESET_SESSION });
  }, []);

  return {
    // State
    phase: state.phase,
    messages: state.messages,
    intent: state.intent,
    enquiryData: state.enquiryData,
    qualificationCompleteness: state.qualificationCompleteness,
    errorMessage: state.errorMessage,
    editingField: state.editingField,
    actions: state.actions,
    hasEnquiry: !!state.enquiryId,

    // Actions
    sendMessage,
    enterReview,
    updateField,
    editField,
    cancelReview,
    submitEnquiry,
    clearError,
    resetConversation,

    // Phase helpers
    isThinking: state.phase === PHASES.THINKING,
    isReview: state.phase === PHASES.REVIEW,
    isSubmitting: state.phase === PHASES.SUBMITTING,
    isSubmitted: state.phase === PHASES.SUBMITTED,
    isIdle: state.phase === PHASES.IDLE,
    isConversing: state.phase === PHASES.CONVERSING,
  };
}

/**
 * Strip PII from enquiry data before sending to AI conversation context.
 * Email and phone stay in application state but are NOT sent
 * in the enquiryState payload that reaches the AI prompt.
 */
function sanitizeEnquiryForAPI(enquiryData) {
  if (!enquiryData) return {};
  const { email: _email, phone: _phone, ...safe } = enquiryData;
  return safe;
}
