/* ============================================
   JIGS V3 — Intent Engine
   Deterministic intent classification from
   conversation state. Not keyword-regex driven.
   ============================================ */

/**
 * Valid intent states.
 * The visitor can move between these naturally.
 */
export const INTENTS = {
  CASUAL: 'casual',
  ABOUT_MURARI: 'about_murari',
  ABOUT_FALLEN_HAIR: 'about_fallen_hair',
  WORK_EXPLORATION: 'work_exploration',
  CREATIVE_DISCUSSION: 'creative_discussion',
  TECHNICAL_DISCUSSION: 'technical_discussion',
  PROJECT_INTENT: 'project_intent',
  ENQUIRY_QUALIFICATION: 'enquiry_qualification',
  HUMAN_HANDOFF: 'human_handoff',
};

/**
 * Classify intent from the current conversation state.
 *
 * This is a lightweight, deterministic classifier that runs
 * BEFORE the AI call to help select the right system prompt context.
 *
 * The AI also returns its own intent classification, which is used
 * to UPDATE the state after the response. This pre-classification
 * is used for prompt preparation only.
 *
 * IMPORTANT: This does NOT use brittle single-keyword regex.
 * It uses multi-signal heuristics from conversation state.
 */
export function classifyIntent({
  currentMessage = '',
  previousIntent = 'casual',
  hasEnquiry = false,
  enquiryFields = {},
  turnCount = 0,
}) {
  const msg = currentMessage.toLowerCase().trim();

  // If there's an active enquiry with collected fields, stay in qualification
  if (hasEnquiry && countFilledFields(enquiryFields) >= 2) {
    return INTENTS.ENQUIRY_QUALIFICATION;
  }

  // Human handoff signals (strong signals only)
  if (isHandoffRequest(msg)) {
    return INTENTS.HUMAN_HANDOFF;
  }

  // Project intent signals (multiple indicators, not single keywords)
  if (isProjectIntent(msg, previousIntent)) {
    return hasEnquiry ? INTENTS.ENQUIRY_QUALIFICATION : INTENTS.PROJECT_INTENT;
  }

  // Work exploration
  if (isWorkExploration(msg)) {
    return INTENTS.WORK_EXPLORATION;
  }

  // About Murari
  if (isAboutMurari(msg)) {
    return INTENTS.ABOUT_MURARI;
  }

  // About Fallen Hair
  if (isAboutFallenHair(msg)) {
    return INTENTS.ABOUT_FALLEN_HAIR;
  }

  // Technical/creative editing discussion
  if (isTechnicalDiscussion(msg)) {
    return INTENTS.TECHNICAL_DISCUSSION;
  }

  if (isCreativeDiscussion(msg)) {
    return INTENTS.CREATIVE_DISCUSSION;
  }

  // Maintain previous intent if the message is a short continuation
  if (msg.length < 30 && turnCount > 0 && previousIntent !== INTENTS.CASUAL) {
    return previousIntent;
  }

  return INTENTS.CASUAL;
}

/**
 * Determine if AI-classified intent should override the pre-classification.
 * The AI has richer context so its classification is generally preferred,
 * but we guard against nonsensical classifications.
 */
export function resolveIntent(preClassified, aiClassified, conversationState) {
  const validIntents = Object.values(INTENTS);

  // AI returned invalid intent — use pre-classified
  if (!validIntents.includes(aiClassified)) {
    return preClassified;
  }

  // If AI says project_intent but there's already an enquiry, upgrade to qualification
  if (aiClassified === INTENTS.PROJECT_INTENT && conversationState.hasEnquiry) {
    return INTENTS.ENQUIRY_QUALIFICATION;
  }

  // Trust AI classification in most cases
  return aiClassified;
}

/* ---- Private helpers ---- */

function isHandoffRequest(msg) {
  // Strong multi-word patterns only
  const patterns = [
    /\b(talk|speak|chat|connect)\s+(to|with)\s+murari\b/,
    /\bcontact\s+murari\b/,
    /\breach\s+(out\s+to\s+)?murari\b/,
    /\bhuman\b.*\b(please|instead|rather)\b/,
    /\breal\s+person\b/,
  ];
  return patterns.some(p => p.test(msg));
}

function isProjectIntent(msg, previousIntent) {
  // Already in project/qualification flow — continue
  if (previousIntent === INTENTS.PROJECT_INTENT || previousIntent === INTENTS.ENQUIRY_QUALIFICATION) {
    return true;
  }

  // Multiple project-related signals in combination
  const projectSignals = [
    /\b(i\s+(have|need|want|got)|we\s+(have|need|want|got))\s+(a\s+)?(project|video|edit|film|content|reel|music\s*video)\b/,
    /\b(looking\s+(for|to)\s+(get|hire|commission|work\s+with))\b/,
    /\b(edit|cut|produce|create|make)\s+(a|my|our|the|this)\b/,
    /\bhow\s+much\s+(do|does|would)\s+(you|it|murari)\s+(charge|cost)\b/,
    /\b(rates?|pricing|quote|estimate|budget)\b.*\b(for|on|your)\b/,
    /\bwork\s+(with|for)\s+(us|me|my|our)\b/,
    /\bhire\s+(you|murari)\b/,
    /\b(enquiry|inquiry|enquire|inquire)\b/,
    /\bstart\s+(a\s+)?(project|enquiry|inquiry)\b/,
  ];

  const matchCount = projectSignals.filter(p => p.test(msg)).length;
  return matchCount >= 1;
}

function isWorkExploration(msg) {
  const patterns = [
    /\b(show|see|view|check)\s+(me\s+)?(the\s+)?(work|portfolio|projects?|edits?)\b/,
    /\bwhat\s+(have\s+)?(you|murari)\s+(done|made|created|worked\s+on|edited)\b/,
    /\b(previous|past|recent)\s+(work|projects?|edits?)\b/,
    /\b(explore|browse)\s+(the\s+)?work\b/,
    /\bspirit\s*2026\b/i,
    /\btiranga\s*yatra\b/i,
  ];
  return patterns.some(p => p.test(msg));
}

function isAboutMurari(msg) {
  const patterns = [
    /\b(who|tell\s+me\s+about|about)\s+murari\b/,
    /\bwho\s+(is|are)\s+(he|murari|pandu|the\s+editor|the\s+person)\b/,
    /\bmurari('?s)?\s+(background|experience|story|journey|education)\b/,
    /\bwhat\s+does\s+murari\s+do\b/,
  ];
  return patterns.some(p => p.test(msg));
}

function isAboutFallenHair(msg) {
  const patterns = [
    /\b(what\s+is|about|tell\s+me\s+about)\s+fallen\s*hair\b/,
    /\bthe\s+studio\b/,
    /\bfallen\s*hair('?s)?\s+(story|philosophy|approach|about)\b/,
  ];
  return patterns.some(p => p.test(msg));
}

function isTechnicalDiscussion(msg) {
  const patterns = [
    /\b(after\s*effects?|premiere|davinci|resolve|lightroom|final\s*cut|avid)\b/i,
    /\b(codec|bitrate|frame\s*rate|resolution|4k|1080|export|render|proxy|timeline)\b/i,
    /\b(lut|color\s*(grade|grading|correction)|denoise|stabilize)\b/i,
    /\b(keyframe|motion\s*(track|blur|graphic)|composit|mask)\b/i,
  ];
  return patterns.some(p => p.test(msg));
}

function isCreativeDiscussion(msg) {
  const patterns = [
    /\b(pacing|rhythm|tone|mood|aesthetic|visual\s*(style|language|direction))\b/i,
    /\b(storytelling|narrative|emotional?\s*(arc|impact|direction))\b/i,
    /\b(sound\s*design|music|audio|sfx|foley)\b/i,
    /\b(cinematography|camera\s*(work|movement|angle)|shot\s*(composition|selection))\b/i,
    /\b(color\s*(palette|theory|mood)|lighting)\b/i,
    /\b(editing\s*(style|philosophy|approach|technique|tip))\b/i,
  ];
  return patterns.some(p => p.test(msg));
}

function countFilledFields(fields) {
  if (!fields || typeof fields !== 'object') return 0;
  return Object.values(fields).filter(v => v && String(v).trim()).length;
}
