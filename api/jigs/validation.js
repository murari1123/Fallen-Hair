/* ============================================
   JIGS V3 — Response Validation
   Validates and normalizes AI-generated responses.
   Never trusts AI for authorization or security.
   ============================================ */

const VALID_INTENTS = [
  'casual',
  'about_murari',
  'about_fallen_hair',
  'work_exploration',
  'creative_discussion',
  'technical_discussion',
  'project_intent',
  'enquiry_qualification',
  'human_handoff',
];

const VALID_ACTION_TYPES = [
  'OPEN_PROJECT',
  'OPEN_WORK',
  'START_ENQUIRY',
  'SHOW_ENQUIRY_REVIEW',
];

const VERIFIED_PROJECT_IDS = [
  'spirit-2026',
  'tiranga-yatra-2026',
  'project-03',
];

/**
 * Validate and normalize an AI response.
 * Returns a safe, predictable response object regardless of what the AI produced.
 */
export function validateAIResponse(rawResponse) {
  // Handle string responses (if AI returned raw text instead of JSON)
  if (typeof rawResponse === 'string') {
    return {
      reply: sanitizeReply(rawResponse),
      intent: 'casual',
      extracted_data: {},
      qualification_completeness: 0,
      summary: '',
      actions: [],
      valid: true,
    };
  }

  if (!rawResponse || typeof rawResponse !== 'object') {
    return createFallbackResponse();
  }

  // Extract and validate each field
  const reply = sanitizeReply(rawResponse.reply);
  if (!reply) {
    return createFallbackResponse();
  }

  const intent = validateIntent(rawResponse.intent);
  const extracted_data = validateExtractedData(rawResponse.extracted_data);
  const qualification_completeness = validateCompleteness(rawResponse.qualification_completeness);
  const summary = typeof rawResponse.summary === 'string'
    ? rawResponse.summary.slice(0, 1000)
    : '';
  const actions = validateActions(rawResponse.actions);

  return {
    reply,
    intent,
    extracted_data,
    qualification_completeness,
    summary,
    actions,
    valid: true,
  };
}

/**
 * Clean and parse JSON from LLM output.
 * Handles markdown code fences and whitespace.
 */
export function cleanAndParseJson(rawText) {
  if (!rawText) return null;
  let cleaned = String(rawText).trim();

  // Strip markdown code fence if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from surrounding text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/* ---- Private helpers ---- */

function validateIntent(intent) {
  if (typeof intent === 'string' && VALID_INTENTS.includes(intent)) {
    return intent;
  }
  return 'casual';
}

function validateExtractedData(data) {
  if (!data || typeof data !== 'object') return {};

  const allowed = [
    'project_type',
    'project_description',
    'creative_direction',
    'deliverables',
    'timeline',
    'budget',
    'name',
    'additional_notes',
  ];

  const result = {};
  for (const key of allowed) {
    if (data[key] && typeof data[key] === 'string') {
      result[key] = data[key].slice(0, 2000);
    }
  }
  return result;
}

function validateCompleteness(value) {
  const num = parseInt(value, 10);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function validateActions(actions) {
  if (!Array.isArray(actions)) return [];

  const safeActions = [];
  for (const act of actions) {
    if (!act || typeof act !== 'object') continue;
    if (!VALID_ACTION_TYPES.includes(act.type)) continue;

    if (act.type === 'OPEN_PROJECT') {
      if (VERIFIED_PROJECT_IDS.includes(act.projectId)) {
        safeActions.push({ type: 'OPEN_PROJECT', projectId: act.projectId });
      }
    } else {
      safeActions.push({ type: act.type });
    }
  }

  return safeActions;
}

function sanitizeReply(reply) {
  if (typeof reply !== 'string') return '';
  return reply.trim().slice(0, 3000) || '';
}

function createFallbackResponse() {
  return {
    reply: '',
    intent: 'casual',
    extracted_data: {},
    qualification_completeness: 0,
    summary: '',
    actions: [],
    valid: false,
  };
}
