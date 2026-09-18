/* ============================================
   JIGS V3 — Security Guardian
   Rate limiting, input validation, abuse detection.
   Application-level security — never delegated to AI.
   ============================================ */

/* ---- Configuration defaults ---- */
const DEFAULT_MAX_MESSAGE_LENGTH = '1500';
const DEFAULT_RATE_LIMIT_WINDOW = '60000';
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = '30';

/* ---- In-memory rate limiting ---- */
const rateLimitMap = new Map();

// Periodic cleanup to prevent unbounded memory growth
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [ip, record] of rateLimitMap) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

/**
 * Check and increment rate limit for an IP.
 * Returns { allowed, remaining, resetIn }
 */
export function checkRateLimit(ip, config) {
  cleanupRateLimits();
  const windowMs = parseInt(config?.JIGS_RATE_LIMIT_WINDOW || process.env.JIGS_RATE_LIMIT_WINDOW || DEFAULT_RATE_LIMIT_WINDOW, 10);
  const maxRequests = parseInt(config?.JIGS_RATE_LIMIT_REQUESTS || process.env.JIGS_RATE_LIMIT_REQUESTS || DEFAULT_RATE_LIMIT_MAX_REQUESTS, 10);
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now };
}

/**
 * Extract client IP from request headers.
 * Supports Cloudflare (cf-connecting-ip), Vercel (x-forwarded-for), and local Node sockets.
 */
export function getClientIp(req) {
  if (!req) return 'unknown';

  // 1. Web Request Headers instance (.get)
  if (typeof req.headers?.get === 'function') {
    const cfIp = req.headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
  }

  // 2. Cloudflare header in standard object map
  if (req.headers?.['cf-connecting-ip']) {
    return String(req.headers['cf-connecting-ip']).trim();
  }

  // 3. Vercel / proxy standard forwarded header
  if (req.headers?.['x-forwarded-for']) {
    return String(req.headers['x-forwarded-for']).split(',')[0].trim();
  }

  // 4. Node.js socket remote address fallback
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }

  return 'unknown';
}

/**
 * Sanitize and validate a user message.
 * Returns { valid, sanitized, reason }
 */
export function validateMessage(message, config) {
  const maxLen = parseInt(config?.JIGS_MAX_MESSAGE_LENGTH || process.env.JIGS_MAX_MESSAGE_LENGTH || DEFAULT_MAX_MESSAGE_LENGTH, 10);

  if (typeof message !== 'string') {
    return { valid: false, sanitized: '', reason: 'Message must be a string' };
  }

  const trimmed = message.trim();

  if (!trimmed) {
    return { valid: false, sanitized: '', reason: 'Message cannot be empty' };
  }

  if (trimmed.length > maxLen) {
    return { valid: false, sanitized: '', reason: `Message exceeds ${maxLen} characters` };
  }

  // Basic sanitization: strip null bytes and control characters (keep newlines/carriage returns/tabs)
  let sanitized = '';
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (code >= 32 || code === 10 || code === 13 || code === 9) {
      if (code !== 127) {
        sanitized += trimmed[i];
      }
    }
  }

  return { valid: true, sanitized, reason: null };
}

/**
 * Validate the entire request body structure.
 * Returns { valid, body, reason }
 */
export function validateRequestBody(rawBody) {
  let body = rawBody;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return { valid: false, body: null, reason: 'Invalid JSON' };
    }
  }

  if (!body || typeof body !== 'object') {
    return { valid: false, body: null, reason: 'Request body must be a JSON object' };
  }

  const validActions = ['conversation', 'start_enquiry', 'update_enquiry', 'submit_enquiry'];
  const action = body.action || 'conversation';

  if (!validActions.includes(action)) {
    return { valid: false, body: null, reason: `Invalid action: ${action}` };
  }

  return { valid: true, body: { ...body, action }, reason: null };
}

/* ---- Prompt Injection Detection ---- */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|rules?|prompts?|directives?)/i,
  /disregard\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|rules?|prompts?)/i,
  /system\s*prompt/i,
  /reveal\s+(your|the|hidden)\s+(instructions?|prompt|rules?|system)/i,
  /show\s+(me\s+)?(your|the|hidden)\s+(instructions?|prompt|rules?|system)/i,
  /what\s+are\s+your\s+(hidden\s+)?(instructions?|rules?|system\s*prompt)/i,
  /give\s+me\s+(the\s+)?(api|secret)\s*key/i,
  /print\s+(your\s+)?(api|secret)\s*key/i,
  /output\s+(your\s+)?(system|initial)\s*(prompt|instruction)/i,
  /act\s+as\s+(if\s+)?(you\s+(are|were)\s+)?(?:a\s+)?(?:different|new|unrestricted)/i,
  /you\s+are\s+now\s+(?:a\s+)?(?:different|unrestricted|evil|DAN)/i,
  /jailbreak/i,
  /\bDAN\b/,
  /bypass\s+(your\s+)?(safety|security|restrictions?|filters?|rules?)/i,
  /access\s+(another|other|different)\s+(user|visitor|enquiry|session)/i,
  /supabase.*service.?role/i,
  /process\.env/i,
];

/**
 * Detect potential prompt injection attempts.
 * Returns { suspicious, severity, patterns }
 * severity: 'none' | 'low' | 'high'
 */
export function detectInjection(message) {
  if (typeof message !== 'string') {
    return { suspicious: false, severity: 'none', patterns: [] };
  }

  const matchedPatterns = [];
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(message)) {
      matchedPatterns.push(pattern.source.slice(0, 40));
    }
  }

  if (matchedPatterns.length === 0) {
    return { suspicious: false, severity: 'none', patterns: [] };
  }

  // Multiple pattern matches or specifically dangerous patterns → high severity
  const severity = matchedPatterns.length >= 2 ? 'high' : 'low';

  return { suspicious: true, severity, patterns: matchedPatterns };
}

/**
 * Build a security context object for the request.
 * This is used by the main handler to make security decisions.
 */
export function buildSecurityContext(req, config) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, config);

  const userAgent = typeof req?.headers?.get === 'function'
    ? req.headers.get('user-agent') || 'unknown'
    : (req?.headers?.['user-agent'] || 'unknown');

  return {
    ip,
    rateLimit,
    method: req?.method,
    userAgent,
  };
}
