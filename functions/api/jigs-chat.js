/* ============================================
   JIGS V3 — Cloudflare Pages Functions Adapter
   Route: /api/jigs-chat
   Environment: Cloudflare Pages / Edge Runtime
   ============================================ */

import { processJigsChat } from '../../api/jigs-chat.js';
import { getClientIp } from '../../api/jigs/security.js';

/**
 * Extract allowed server-side configuration from Cloudflare context.env.
 * Never leaks to the client or browser bundle.
 */
function extractServerConfig(env = {}) {
  return {
    SUPABASE_URL: env.SUPABASE_URL || env.VITE_SUPABASE_URL || process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY || process.env?.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: env.GEMINI_API_KEY || process.env?.GEMINI_API_KEY,
    GEMINI_MODEL: env.GEMINI_MODEL || process.env?.GEMINI_MODEL,
    GROQ_API_KEY: env.GROQ_API_KEY || process.env?.GROQ_API_KEY,
    GROQ_MODEL: env.GROQ_MODEL || process.env?.GROQ_MODEL,
    AI_PROVIDER_MODE: env.AI_PROVIDER_MODE || process.env?.AI_PROVIDER_MODE || 'auto',
    JIGS_SESSION_SECRET: env.JIGS_SESSION_SECRET || process.env?.JIGS_SESSION_SECRET,
    JIGS_MAX_MESSAGE_LENGTH: env.JIGS_MAX_MESSAGE_LENGTH || process.env?.JIGS_MAX_MESSAGE_LENGTH,
    JIGS_RATE_LIMIT_REQUESTS: env.JIGS_RATE_LIMIT_REQUESTS || process.env?.JIGS_RATE_LIMIT_REQUESTS,
    JIGS_RATE_LIMIT_WINDOW: env.JIGS_RATE_LIMIT_WINDOW || process.env?.JIGS_RATE_LIMIT_WINDOW,
  };
}

/**
 * Standard Cloudflare Pages Functions entry point.
 */
export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS / preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Enforce POST method
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST, OPTIONS',
      },
    });
  }

  // Parse JSON request body
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Extract client IP (prioritizing cf-connecting-ip)
  const ip = getClientIp(request);

  // Convert headers to plain lowercase dictionary
  const headers = {};
  if (request.headers && typeof request.headers.entries === 'function') {
    for (const [k, v] of request.headers.entries()) {
      headers[k.toLowerCase()] = v;
    }
  }

  // Build clean config object from context.env (without mutating global process.env)
  const config = extractServerConfig(env);

  // Delegate directly to existing JIGS pipeline
  const result = await processJigsChat({
    method: request.method,
    headers,
    body,
    ip,
    config,
  });

  return new Response(JSON.stringify(result.data), {
    status: result.status,
    headers: {
      'Content-Type': 'application/json',
      ...result.headers,
    },
  });
}
