/* ============================================
   JIGS V3 — Session Management
   HMAC-signed session tokens for secure
   visitor-session-enquiry association.
   ============================================ */

import { createHmac, randomUUID, randomBytes, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Get the session signing secret.
 * Falls back to a generated ephemeral secret (logged as warning).
 */
function getSecret(config) {
  const secret = config?.JIGS_SESSION_SECRET || process.env.JIGS_SESSION_SECRET;
  if (!secret) {
    console.warn('[JIGS_SESSION] JIGS_SESSION_SECRET not configured. Using ephemeral secret — sessions will not survive restarts.');
    // Generate a per-process ephemeral secret
    if (!getSecret._ephemeral) {
      getSecret._ephemeral = randomBytes(32).toString('hex');
    }
    return getSecret._ephemeral;
  }
  return secret;
}

/**
 * Fallback Supabase client for session queries if not provided.
 */
let _fallbackClient = null;
function getSupabaseClient(providedClient, config) {
  if (providedClient && typeof providedClient === 'object' && typeof providedClient.from === 'function') {
    return providedClient;
  }
  if (_fallbackClient) return _fallbackClient;

  const url = config?.SUPABASE_URL || process.env.SUPABASE_URL || config?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = config?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  _fallbackClient = createClient(url, key, { auth: { persistSession: false } });
  return _fallbackClient;
}

/**
 * Create a signed session token.
 * Returns { token, sessionId }
 */
export function createSessionToken(config) {
  const sessionId = randomUUID();
  const createdAt = Date.now();
  const expiresAt = createdAt + (2 * 60 * 60 * 1000); // 2 hours

  const payload = JSON.stringify({ sessionId, createdAt, expiresAt });
  const payloadBase64 = Buffer.from(payload).toString('base64url');

  const signature = createHmac('sha256', getSecret(config))
    .update(payloadBase64)
    .digest('base64url');

  const token = `${payloadBase64}.${signature}`;

  return { token, sessionId };
}

/**
 * Verify and decode a session token.
 * Cryptographically verifies HMAC signature using timingSafeEqual.
 * Returns { valid, sessionId, expired, reason }
 */
export function verifySessionToken(token, config) {
  if (!token || typeof token !== 'string') {
    return { valid: false, sessionId: null, expired: false, reason: 'Missing token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, sessionId: null, expired: false, reason: 'Malformed token' };
  }

  const [payloadBase64, providedSignature] = parts;

  // Timing-safe HMAC verification
  const expectedSignature = createHmac('sha256', getSecret(config))
    .update(payloadBase64)
    .digest('base64url');

  const providedBuf = Buffer.from(providedSignature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf)) {
    return { valid: false, sessionId: null, expired: false, reason: 'Invalid signature' };
  }

  // Decode payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
  } catch {
    return { valid: false, sessionId: null, expired: false, reason: 'Corrupt payload' };
  }

  // Check expiry
  if (!payload.expiresAt || Date.now() > payload.expiresAt) {
    return { valid: false, sessionId: payload.sessionId || null, expired: true, reason: 'Token expired' };
  }

  if (!payload.sessionId) {
    return { valid: false, sessionId: null, expired: false, reason: 'Missing session ID' };
  }

  return { valid: true, sessionId: payload.sessionId, expired: false, reason: null };
}

/* ---- Persistent Database-Backed Session-Enquiry Ownership ---- */

let _hasSessionIdColumn = null;

/**
 * Detect whether the dedicated `session_id` column exists in `enquiries`.
 * Results are cached in-memory per invocation instance to avoid repeated schema errors.
 */
export async function hasDedicatedSessionIdColumn(supabaseClient) {
  if (_hasSessionIdColumn !== null) return _hasSessionIdColumn;

  const client = getSupabaseClient(supabaseClient);
  if (!client) return false;

  try {
    const { error } = await client.from('enquiries').select('session_id').limit(0);
    if (error && error.code === '42703') {
      _hasSessionIdColumn = false;
    } else if (!error) {
      _hasSessionIdColumn = true;
    } else {
      return false;
    }
  } catch {
    return false;
  }

  return _hasSessionIdColumn;
}

/**
 * Reset column cache (useful for testing or after migration execution).
 */
export function resetSchemaDetectionCache() {
  _hasSessionIdColumn = null;
}

/**
 * Authoritatively get the active enquiry associated with a session from Supabase.
 * Supports both:
 * 1. Dedicated `session_id` column (when migration has been run)
 * 2. `structured_brief->>session_id` JSONB field (works immediately on current DB)
 *
 * @param {object|string} supabaseOrSessionId - Supabase client or sessionId
 * @param {string} [maybeSessionId] - sessionId if client was passed as first arg
 * @returns {Promise<object|null>} The enquiry record or null
 */
export async function getEnquiryForSession(supabaseOrSessionId, maybeSessionId) {
  let client;
  let sessionId;

  if (typeof supabaseOrSessionId === 'string') {
    sessionId = supabaseOrSessionId;
    client = getSupabaseClient();
  } else {
    client = getSupabaseClient(supabaseOrSessionId);
    sessionId = maybeSessionId;
  }

  if (!client || !sessionId) return null;

  const hasCol = await hasDedicatedSessionIdColumn(client);
  if (hasCol) {
    const { data, error } = await client
      .from('enquiries')
      .select('id, conversation_status, status, created_at, structured_brief')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) return data;
  }

  // Authoritative fallback: query structured_brief JSONB
  const { data, error } = await client
    .from('enquiries')
    .select('id, conversation_status, status, created_at, structured_brief')
    .eq('structured_brief->>session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[JIGS_SESSION] Error fetching enquiry for session:', error.message);
    return null;
  }

  return data || null;
}

/**
 * Authoritatively verify that a session owns a specific enquiry in Supabase.
 * Returns true if and only if the enquiry belongs to this sessionId.
 */
export async function sessionOwnsEnquiry(supabaseOrSessionId, sessionIdOrEnquiryId, maybeEnquiryId) {
  let client;
  let sessionId;
  let enquiryId;

  if (typeof supabaseOrSessionId === 'string') {
    sessionId = supabaseOrSessionId;
    enquiryId = sessionIdOrEnquiryId;
    client = getSupabaseClient();
  } else {
    client = getSupabaseClient(supabaseOrSessionId);
    sessionId = sessionIdOrEnquiryId;
    enquiryId = maybeEnquiryId;
  }

  if (!sessionId || !enquiryId) return false;

  const enquiry = await getEnquiryForSession(client, sessionId);
  return enquiry?.id === enquiryId;
}

/**
 * Deprecated in-memory link function (retained for backward compatibility).
 * Authoritative ownership is now maintained exclusively in Supabase.
 */
export function linkSessionToEnquiry() {
  // No-op: Supabase is authoritative.
}
