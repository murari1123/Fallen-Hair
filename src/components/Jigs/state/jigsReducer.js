/* ============================================
   JIGS V3 — State Machine
   useReducer-based state management for JIGS.
   Clean separation of state transitions.
   ============================================ */

export const PHASES = {
  IDLE: 'idle',             // Initial state — intro + starter prompts visible
  CONVERSING: 'conversing', // Active conversation — free text input
  THINKING: 'thinking',     // Waiting for AI response
  REVIEW: 'review',         // Enquiry review before submission
  SUBMITTING: 'submitting', // Submitting enquiry to backend
  SUBMITTED: 'submitted',   // Enquiry successfully submitted
  ERROR: 'error',           // Error state (recoverable)
};

export const ACTIONS = {
  SEND_MESSAGE: 'SEND_MESSAGE',
  RECEIVE_RESPONSE: 'RECEIVE_RESPONSE',
  AI_ERROR: 'AI_ERROR',
  START_REVIEW: 'START_REVIEW',
  EDIT_FIELD: 'EDIT_FIELD',
  UPDATE_FIELD: 'UPDATE_FIELD',
  CANCEL_REVIEW: 'CANCEL_REVIEW',
  START_SUBMIT: 'START_SUBMIT',
  SUBMIT_SUCCESS: 'SUBMIT_SUCCESS',
  SUBMIT_ERROR: 'SUBMIT_ERROR',
  SET_SESSION_TOKEN: 'SET_SESSION_TOKEN',
  SET_ENQUIRY_ID: 'SET_ENQUIRY_ID',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESTORE_SESSION: 'RESTORE_SESSION',
  RESET_SESSION: 'RESET_SESSION',
};

export function createInitialState() {
  return {
    phase: PHASES.IDLE,
    messages: [],
    sessionToken: null,
    enquiryId: null,
    intent: 'casual',
    conversationSummary: '',

    // Enquiry data — collected through conversation, not through forms
    enquiryData: {
      name: '',
      email: '',
      phone: '',
      project_type: '',
      project_description: '',
      creative_direction: '',
      deliverables: '',
      timeline: '',
      budget: '',
      additional_notes: '',
    },

    qualificationCompleteness: 0,
    errorMessage: '',
    actions: [],

    // For review editing
    editingField: null,
  };
}

export function jigsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SEND_MESSAGE: {
      const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender: 'user',
        content: action.payload.text,
        timestamp: Date.now(),
      };
      return {
        ...state,
        phase: PHASES.THINKING,
        messages: [...state.messages, newMessage],
        errorMessage: '',
      };
    }

    case ACTIONS.RECEIVE_RESPONSE: {
      const {
        reply,
        intent,
        extracted_data,
        qualification_completeness,
        conversationSummary,
        sessionToken,
        actions = [],
      } = action.payload;

      const jigsMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender: 'jigs',
        content: reply,
        timestamp: Date.now(),
      };

      // Merge extracted data into enquiry state (only update non-empty fields)
      const updatedEnquiry = { ...state.enquiryData };
      if (extracted_data) {
        for (const [key, value] of Object.entries(extracted_data)) {
          if (value && typeof value === 'string' && value.trim() && key in updatedEnquiry) {
            updatedEnquiry[key] = value.trim();
          }
        }
      }

      // Check if AI requested SHOW_ENQUIRY_REVIEW action
      const shouldShowReview = actions.some(a => a.type === 'SHOW_ENQUIRY_REVIEW');

      return {
        ...state,
        phase: shouldShowReview ? PHASES.REVIEW : PHASES.CONVERSING,
        messages: [...state.messages, jigsMessage],
        intent: intent || state.intent,
        enquiryData: updatedEnquiry,
        qualificationCompleteness: qualification_completeness ?? state.qualificationCompleteness,
        conversationSummary: conversationSummary || state.conversationSummary,
        sessionToken: sessionToken || state.sessionToken,
        actions,
        errorMessage: '',
      };
    }

    case ACTIONS.AI_ERROR: {
      return {
        ...state,
        phase: PHASES.CONVERSING, // Stay in conversation, don't block
        errorMessage: action.payload?.message || 'Something went wrong. Please try again.',
      };
    }

    case ACTIONS.START_REVIEW: {
      return {
        ...state,
        phase: PHASES.REVIEW,
        editingField: null,
      };
    }

    case ACTIONS.EDIT_FIELD: {
      return {
        ...state,
        editingField: action.payload.field,
      };
    }

    case ACTIONS.UPDATE_FIELD: {
      const { field, value } = action.payload;
      return {
        ...state,
        enquiryData: {
          ...state.enquiryData,
          [field]: value,
        },
        editingField: null,
      };
    }

    case ACTIONS.CANCEL_REVIEW: {
      return {
        ...state,
        phase: PHASES.CONVERSING,
        editingField: null,
      };
    }

    case ACTIONS.START_SUBMIT: {
      return {
        ...state,
        phase: PHASES.SUBMITTING,
        errorMessage: '',
      };
    }

    case ACTIONS.SUBMIT_SUCCESS: {
      const successMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender: 'jigs',
        content: action.payload?.message ||
          `Your enquiry has been submitted${state.enquiryData.name ? `, ${state.enquiryData.name}` : ''}. Murari will review the brief and get back to you.`,
        timestamp: Date.now(),
      };

      return {
        ...state,
        phase: PHASES.SUBMITTED,
        messages: [...state.messages, successMessage],
        enquiryId: action.payload?.enquiryId || state.enquiryId,
        errorMessage: '',
      };
    }

    case ACTIONS.SUBMIT_ERROR: {
      return {
        ...state,
        phase: PHASES.REVIEW, // Return to review, not a dead state
        errorMessage: action.payload?.message || 'Submission failed. Please try again.',
      };
    }

    case ACTIONS.SET_SESSION_TOKEN: {
      return {
        ...state,
        sessionToken: action.payload.token,
      };
    }

    case ACTIONS.SET_ENQUIRY_ID: {
      return {
        ...state,
        enquiryId: action.payload.enquiryId,
      };
    }

    case ACTIONS.CLEAR_ERROR: {
      return {
        ...state,
        errorMessage: '',
      };
    }

    case ACTIONS.RESTORE_SESSION: {
      return {
        ...state,
        ...action.payload,
        phase: action.payload.messages?.length > 0 ? PHASES.CONVERSING : PHASES.IDLE,
      };
    }

    case ACTIONS.RESET_SESSION: {
      return createInitialState();
    }

    default:
      return state;
  }
}
