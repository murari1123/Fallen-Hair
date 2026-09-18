/* ============================================
   JIGS V3 — Main API Handler
   Route: /api/jigs-chat
   Environment: Dual-compatible (Vercel Serverless / Cloudflare Pages Functions)

   Thin router that delegates to:
   - Security Guardian
   - Session Manager
   - Context Manager
   - Intent Engine
   - AI Orchestrator
   - Response Validator

   The AI is NEVER the security boundary.
   The backend is ALWAYS authoritative.
   ============================================ */

import { createClient } from '@supabase/supabase-js';
import { getClientIp, checkRateLimit, validateRequestBody, validateMessage, detectInjection } from './jigs/security.js';
import { createSessionToken, verifySessionToken, getEnquiryForSession, hasDedicatedSessionIdColumn } from './jigs/session.js';
import { buildSystemPrompt } from './jigs/knowledge.js';
import { buildAIContext, updateConversationSummary } from './jigs/context.js';
import { classifyIntent, resolveIntent } from './jigs/intent.js';
import { callAI } from './jigs/ai/orchestrator.js';
import { randomUUID } from 'crypto';

/* ---- Supabase Admin (service role — server-side only) ---- */
function getSupabaseAdmin(config) {
  const url = config?.SUPABASE_URL || process.env.SUPABASE_URL || config?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = config?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Core JIGS chat processing pipeline.
 * Platform-agnostic: accepts plain request arguments and optional environment config.
 * Returns standard { status, data, headers } result object.
 */
export async function processJigsChat({ method = 'POST', _headers = {}, body = {}, ip = 'unknown', config = process.env } = {}) {
  // ---- Method check ----
  if (method !== 'POST') {
    return { status: 405, data: { error: 'Method not allowed' } };
  }

  // ---- Security check ----
  const rateLimit = checkRateLimit(ip, config);
  if (!rateLimit.allowed) {
    return { status: 429, data: { error: 'Too many requests. Please wait a moment.' } };
  }

  // ---- Parse and validate body ----
  const { valid: bodyValid, body: validatedBody, reason: bodyReason } = validateRequestBody(body);
  if (!bodyValid) {
    return { status: 400, data: { error: bodyReason } };
  }

  const { action } = validatedBody;

  // ---- Route to action handler ----
  try {
    switch (action) {
      case 'conversation':
        return await handleConversation(validatedBody, config);
      case 'start_enquiry':
        return await handleStartEnquiry(validatedBody, config);
      case 'update_enquiry':
        return await handleUpdateEnquiry(validatedBody, config);
      case 'submit_enquiry':
        return await handleSubmitEnquiry(validatedBody, config);
      default:
        return { status: 400, data: { error: 'Unknown action' } };
    }
  } catch (err) {
    console.error('[JIGS_HANDLER_ERROR]', err.message || err);
    return { status: 500, data: { error: 'An internal error occurred.' } };
  }
}

/**
 * Standard Vercel Serverless / Node.js HTTP Handler.
 * Preserves existing (req, res) signature for complete backward compatibility.
 */
export default async function handler(req, res) {
  const ip = getClientIp(req);
  const result = await processJigsChat({
    method: req.method,
    headers: req.headers,
    body: req.body,
    ip,
    config: process.env,
  });

  if (result.headers) {
    for (const [k, v] of Object.entries(result.headers)) {
      res.setHeader(k, v);
    }
  }

  return res.status(result.status).json(result.data);
}

/* ==============================================================
   ACTION: conversation
   Main JIGS conversational turn.
   Issues session token on first request.
   ============================================================== */
async function handleConversation(body, config) {
  const {
    message,
    sessionToken,
    history = [],
    conversationSummary = '',
    intent: clientIntent = 'casual',
    enquiryState = {},
  } = body;

  // Validate message
  const { valid: msgValid, sanitized, reason: msgReason } = validateMessage(message, config);
  if (!msgValid) {
    return { status: 400, data: { error: msgReason } };
  }

  // Session handling — issue new token or verify existing
  let sessionId;
  let newToken = null;

  if (sessionToken) {
    const verification = verifySessionToken(sessionToken, config);
    if (!verification.valid) {
      // Expired or invalid — issue a new one (don't block conversation)
      const created = createSessionToken(config);
      sessionId = created.sessionId;
      newToken = created.token;
    } else {
      sessionId = verification.sessionId;
    }
  } else {
    // First request — issue a new session token
    const created = createSessionToken(config);
    sessionId = created.sessionId;
    newToken = created.token;
  }

  // Detect prompt injection
  const injectionInfo = detectInjection(sanitized);

  // Pre-classify intent (deterministic, before AI call)
  const supabase = getSupabaseAdmin(config);
  const activeEnquiry = (supabase && sessionId) ? await getEnquiryForSession(supabase, sessionId) : null;
  const hasEnquiry = !!activeEnquiry;
  const preIntent = classifyIntent({
    currentMessage: sanitized,
    previousIntent: clientIntent,
    hasEnquiry,
    enquiryFields: enquiryState,
    turnCount: history.length,
  });

  // Build system prompt with context
  const systemPrompt = buildSystemPrompt({
    intent: preIntent,
    hasEnquiry,
  });

  // Build sanitized AI context (PII stripped)
  const aiContext = buildAIContext({
    currentMessage: sanitized,
    conversationHistory: sanitizeHistory(history),
    conversationSummary,
    intent: preIntent,
    enquiryState,
    injectionInfo,
  });

  // Call AI orchestrator
  const aiResponse = await callAI({
    systemPrompt,
    userPrompt: aiContext.promptText,
    temperature: 0.4,
    config,
  });

  // Resolve intent (AI classification vs pre-classification)
  const resolvedIntent = resolveIntent(
    preIntent,
    aiResponse.intent,
    { hasEnquiry }
  );

  // Update conversation summary
  const updatedSummary = updateConversationSummary(
    conversationSummary,
    aiResponse.summary
  );

  // Persist conversation turn if there's an active enquiry
  if (activeEnquiry?.id) {
    await persistConversationTurn(activeEnquiry.id, sanitized, aiResponse.reply, updatedSummary, config);
  }

  // Build response
  const response = {
    reply: aiResponse.reply,
    intent: resolvedIntent,
    extracted_data: aiResponse.extracted_data || {},
    qualification_completeness: aiResponse.qualification_completeness || 0,
    conversationSummary: updatedSummary,
    actions: aiResponse.actions || [],
  };

  if (newToken) {
    response.sessionToken = newToken;
  }

  if (aiResponse._fallback) {
    response.fallback = true;
  }

  return { status: 200, data: response };
}

/* ==============================================================
   ACTION: start_enquiry
   Creates a new enquiry record in Supabase.
   Associates it with the current session.
   ============================================================== */
async function handleStartEnquiry(body, config) {
  const { sessionToken, enquiryData = {} } = body;

  // Verify session
  const verification = verifySessionToken(sessionToken, config);
  if (!verification.valid) {
    return {
      status: 401,
      data: {
        error: verification.expired ? 'Session expired. Please start a new session.' : 'Invalid or expired session.',
      },
    };
  }

  const { sessionId } = verification;

  const supabase = getSupabaseAdmin(config);
  if (!supabase) {
    return { status: 503, data: { error: 'Database service unavailable.' } };
  }

  // Check for existing enquiry persistently — prevent duplicates (Idempotency)
  const existingEnquiry = await getEnquiryForSession(supabase, sessionId);
  if (existingEnquiry) {
    return {
      status: 200,
      data: {
        success: true,
        enquiryId: existingEnquiry.id,
        message: 'Enquiry already exists for this session.',
      },
    };
  }

  // Generate server-side enquiry ID
  const enquiryId = randomUUID();

  // Parse date/time
  const { formattedDate, formattedTime } = parseDateField(enquiryData.timeline);

  const hasCol = await hasDedicatedSessionIdColumn(supabase);

  const insertPayload = {
    id: enquiryId,
    name: sanitizeField(enquiryData.name, 200) || 'Studio Visitor',
    email: sanitizeField(enquiryData.email, 200) || 'pending@jigs.chat',
    phone: sanitizeField(enquiryData.phone, 30) || null,
    project_type: sanitizeField(enquiryData.project_type, 100) || 'CREATIVE PROJECT',
    project_description: sanitizeField(enquiryData.project_description, 2000) || 'Enquiry initiated via JIGS assistant.',
    preferred_date: formattedDate,
    preferred_time: formattedTime,
    budget: sanitizeField(enquiryData.budget, 200) || null,
    additional_message: sanitizeField(enquiryData.additional_notes, 2000) || null,
    conversation_status: 'QUALIFYING',
    ai_summary: sanitizeField(enquiryData.summary, 1000) || null,
    qualification_score: 'UNASSESSED',
    status: 'NEW',
    structured_brief: {
      session_id: sessionId,
      creative_direction: enquiryData.creative_direction || null,
      deliverables: enquiryData.deliverables || null,
      timeline: enquiryData.timeline || null,
      budget: enquiryData.budget || null,
    },
    honeypot: '',
  };

  if (hasCol) {
    insertPayload.session_id = sessionId;
  }

  const { error } = await supabase.from('enquiries').insert([insertPayload]);

  if (error) {
    console.error('[JIGS_DB_ERROR] Enquiry insert failed:', error.message);
    return { status: 500, data: { error: 'Failed to create enquiry.' } };
  }

  return {
    status: 200,
    data: {
      success: true,
      enquiryId,
    },
  };
}

/* ==============================================================
   ACTION: update_enquiry
   Updates an existing enquiry. Requires session ownership.
   ============================================================== */
async function handleUpdateEnquiry(body, config) {
  const { sessionToken, enquiryId: requestedEnquiryId, enquiryData = {} } = body;

  // 1. Verify session token
  const verification = verifySessionToken(sessionToken, config);
  if (!verification.valid) {
    return {
      status: 401,
      data: {
        error: verification.expired ? 'Session expired. Please start a new session.' : 'Invalid or expired session.',
      },
    };
  }

  const { sessionId } = verification;

  const supabase = getSupabaseAdmin(config);
  if (!supabase) {
    return { status: 503, data: { error: 'Database service unavailable.' } };
  }

  // 2. Resolve associated enquiry authoritatively
  const ownedEnquiry = await getEnquiryForSession(supabase, sessionId);
  if (!ownedEnquiry) {
    return { status: 404, data: { error: 'No enquiry found for this session.' } };
  }

  // 3. Confirm requested enquiry belongs to that session (if client provided an untrusted hint)
  if (requestedEnquiryId && requestedEnquiryId !== ownedEnquiry.id) {
    return { status: 403, data: { error: 'Access denied: You do not have permission to update this enquiry.' } };
  }

  const targetEnquiryId = ownedEnquiry.id;

  // 4. Build update payload (only include provided fields)
  const updatePayload = {};
  if (enquiryData.name) updatePayload.name = sanitizeField(enquiryData.name, 200);
  if (enquiryData.email) updatePayload.email = sanitizeField(enquiryData.email, 200);
  if (enquiryData.phone !== undefined) updatePayload.phone = sanitizeField(enquiryData.phone, 30) || null;
  if (enquiryData.project_type) updatePayload.project_type = sanitizeField(enquiryData.project_type, 100);
  if (enquiryData.project_description) updatePayload.project_description = sanitizeField(enquiryData.project_description, 2000);
  if (enquiryData.budget !== undefined) updatePayload.budget = sanitizeField(enquiryData.budget, 200) || null;
  if (enquiryData.additional_notes !== undefined) updatePayload.additional_message = sanitizeField(enquiryData.additional_notes, 2000) || null;
  if (enquiryData.summary) updatePayload.ai_summary = sanitizeField(enquiryData.summary, 1000);

  if (enquiryData.timeline !== undefined) {
    const { formattedDate, formattedTime } = parseDateField(enquiryData.timeline);
    updatePayload.preferred_date = formattedDate;
    updatePayload.preferred_time = formattedTime;
  }

  // Update structured brief preserving session_id
  const hasCol = await hasDedicatedSessionIdColumn(supabase);
  if (hasCol) {
    updatePayload.session_id = sessionId;
  }

  const prevBrief = ownedEnquiry.structured_brief || {};
  const briefUpdate = {
    ...prevBrief,
    session_id: sessionId,
  };
  if (enquiryData.creative_direction) briefUpdate.creative_direction = enquiryData.creative_direction;
  if (enquiryData.deliverables) briefUpdate.deliverables = enquiryData.deliverables;
  if (enquiryData.timeline) briefUpdate.timeline = enquiryData.timeline;
  if (enquiryData.budget) briefUpdate.budget = enquiryData.budget;
  updatePayload.structured_brief = briefUpdate;

  // 5. Authoritative update on verified targetEnquiryId
  const { error } = await supabase
    .from('enquiries')
    .update(updatePayload)
    .eq('id', targetEnquiryId);

  if (error) {
    console.error('[JIGS_DB_ERROR] Enquiry update failed:', error.message);
    return { status: 500, data: { error: 'Failed to update enquiry.' } };
  }

  return { status: 200, data: { success: true, enquiryId: targetEnquiryId } };
}

/* ==============================================================
   ACTION: submit_enquiry
   Finalizes an enquiry. Persists remaining messages.
   ============================================================== */
async function handleSubmitEnquiry(body, config) {
  const { sessionToken, enquiryId: requestedEnquiryId, enquiryData = {}, messages = [], conversationSummary = '' } = body;

  // 1. Session verification
  const verification = verifySessionToken(sessionToken, config);
  if (!verification.valid) {
    return {
      status: 401,
      data: {
        error: verification.expired ? 'Session expired. Please start a new session.' : 'Invalid or expired session.',
      },
    };
  }

  const { sessionId } = verification;

  const supabase = getSupabaseAdmin(config);
  if (!supabase) {
    return { status: 503, data: { error: 'Database service unavailable.' } };
  }

  // 2. Resolve associated enquiry authoritatively
  const ownedEnquiry = await getEnquiryForSession(supabase, sessionId);
  if (!ownedEnquiry) {
    return { status: 404, data: { error: 'No enquiry found for this session.' } };
  }

  // If client provided an untrusted hint, confirm ownership
  if (requestedEnquiryId && requestedEnquiryId !== ownedEnquiry.id) {
    return { status: 403, data: { error: 'Access denied: You do not have permission to submit this enquiry.' } };
  }

  const targetEnquiryId = ownedEnquiry.id;

  // 3. Idempotency check: if already submitted, return early with success
  if (ownedEnquiry.conversation_status === 'QUALIFIED' || ownedEnquiry.status === 'CONFIRMED' || ownedEnquiry.status === 'SUBMITTED') {
    return { status: 200, data: { success: true, enquiryId: targetEnquiryId, alreadySubmitted: true } };
  }

  // 4. Persist any remaining conversation messages
  if (Array.isArray(messages) && messages.length > 0) {
    const { data: existingRows } = await supabase
      .from('enquiry_messages')
      .select('sender, content')
      .eq('enquiry_id', targetEnquiryId);

    const existingSet = new Set(
      (existingRows || []).map(r => `${r.sender}:::${String(r.content || '').trim()}`)
    );

    const rowsToInsert = [];
    for (const m of messages) {
      const sender = m.sender || (m.from === 'jigs' ? 'jigs' : 'user');
      const content = String(m.content || m.text || '').trim();
      if (content && (sender === 'jigs' || sender === 'user')) {
        const key = `${sender}:::${content}`;
        if (!existingSet.has(key)) {
          existingSet.add(key);
          rowsToInsert.push({
            enquiry_id: targetEnquiryId,
            sender,
            content: content.slice(0, 1500),
          });
        }
      }
    }

    if (rowsToInsert.length > 0) {
      const { error: insErr } = await supabase.from('enquiry_messages').insert(rowsToInsert);
      if (insErr) {
        console.error('[JIGS_DB_ERROR] Message insert failed:', insErr.message);
      }
    }
  }

  // 5. Build final update
  const { formattedDate, formattedTime } = parseDateField(enquiryData.timeline);

  const updatePayload = {
    conversation_status: 'QUALIFIED',
    qualification_score: 'HIGH',
    status: 'NEW',
  };

  if (enquiryData.name) updatePayload.name = sanitizeField(enquiryData.name, 200);
  if (enquiryData.email) updatePayload.email = sanitizeField(enquiryData.email, 200);
  if (enquiryData.phone !== undefined) updatePayload.phone = sanitizeField(enquiryData.phone, 30) || null;
  if (enquiryData.project_type) updatePayload.project_type = sanitizeField(enquiryData.project_type, 100);
  if (enquiryData.project_description) updatePayload.project_description = sanitizeField(enquiryData.project_description, 2000);
  if (formattedDate !== undefined) updatePayload.preferred_date = formattedDate;
  if (formattedTime !== undefined) updatePayload.preferred_time = formattedTime;
  if (enquiryData.budget !== undefined) updatePayload.budget = sanitizeField(enquiryData.budget, 200) || null;
  if (enquiryData.additional_notes !== undefined) updatePayload.additional_message = sanitizeField(enquiryData.additional_notes, 2000) || null;
  if (conversationSummary) updatePayload.ai_summary = sanitizeField(conversationSummary, 1000);

  const hasCol = await hasDedicatedSessionIdColumn(supabase);
  if (hasCol) {
    updatePayload.session_id = sessionId;
  }

  const prevBrief = ownedEnquiry.structured_brief || {};
  updatePayload.structured_brief = {
    ...prevBrief,
    session_id: sessionId,
    creative_direction: enquiryData.creative_direction || prevBrief.creative_direction || null,
    deliverables: enquiryData.deliverables || prevBrief.deliverables || null,
    timeline: enquiryData.timeline || prevBrief.timeline || null,
    budget: enquiryData.budget || prevBrief.budget || null,
    conversation_turns: Array.isArray(messages) ? messages.length : (prevBrief.conversation_turns || 0),
  };

  const { error: updateErr } = await supabase
    .from('enquiries')
    .update(updatePayload)
    .eq('id', targetEnquiryId);

  if (updateErr) {
    console.error('[JIGS_DB_ERROR] Enquiry submit failed:', updateErr.message);
    return { status: 500, data: { error: 'Failed to submit enquiry.' } };
  }

  return { status: 200, data: { success: true, enquiryId: targetEnquiryId } };
}

/* ---- Shared Helpers ---- */

function sanitizeField(value, maxLen) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-20).map(item => ({
    sender: item.sender === 'user' ? 'user' : 'jigs',
    content: String(item.content || item.text || '').slice(0, 1500),
  }));
}

function parseDateField(dateValue) {
  let formattedDate = null;
  let formattedTime = null;

  if (dateValue) {
    const raw = String(dateValue).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split('-').map(Number);
      const parsed = new Date(Date.UTC(y, m - 1, d));
      if (parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d) {
        formattedDate = raw;
      } else {
        formattedTime = raw;
      }
    } else {
      formattedTime = raw;
    }
  }

  return { formattedDate, formattedTime };
}

async function persistConversationTurn(enquiryId, userMessage, jigsReply, summary, config) {
  const supabase = getSupabaseAdmin(config);
  if (!supabase || !enquiryId) return;

  try {
    const turns = [];
    if (userMessage) turns.push({ enquiry_id: enquiryId, sender: 'user', content: userMessage.slice(0, 1500) });
    if (jigsReply) turns.push({ enquiry_id: enquiryId, sender: 'jigs', content: jigsReply.slice(0, 1500) });

    if (turns.length > 0) {
      const { error: turnErr } = await supabase.from('enquiry_messages').insert(turns);
      if (turnErr) console.error('[JIGS_DB_ERROR]', turnErr.message);
    }

    if (summary) {
      const { error: sumErr } = await supabase
        .from('enquiries')
        .update({ ai_summary: summary.slice(0, 1000) })
        .eq('id', enquiryId);
      if (sumErr) console.error('[JIGS_DB_ERROR]', sumErr.message);
    }
  } catch (err) {
    console.error('[JIGS_DB_ERROR]', err.message);
  }
}
