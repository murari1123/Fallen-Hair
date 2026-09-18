/* ============================================================
   JIGS V3 — Cloudflare Pages Functions Adapter Test Suite
   Validates standard Web Request/Response interface,
   context.env configuration, cf-connecting-ip detection,
   and response schema compatibility.
   ============================================================ */

import { onRequest } from '../functions/api/jigs-chat.js';
import { verifySessionToken } from '../api/jigs/session.js';
import { getClientIp } from '../api/jigs/security.js';

async function runTests() {
  console.log('====================================================');
  console.log(' JIGS V3 CLOUDFLARE PAGES FUNCTIONS ADAPTER TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
    }
  }

  const mockSecret = 'test_secret_cf_adapter_mock_12345678901234567890';
  const mockEnv = {
    JIGS_SESSION_SECRET: mockSecret,
    AI_PROVIDER_MODE: 'auto',
  };

  // --- TEST 1: GET method returns 405 Method Not Allowed ---
  console.log('--- TEST 1: Unsupported method handling (GET -> 405) ---');
  {
    const req = new Request('https://fallenhair.in/api/jigs-chat', { method: 'GET' });
    const res = await onRequest({ request: req, env: mockEnv });
    assert(res.status === 405, `Expected status 405, got ${res.status}`);
    assert(res.headers.get('content-type')?.includes('application/json'), 'Returns application/json');
    const data = await res.json();
    assert(data.error === 'Method not allowed', `Expected error message, got: ${data.error}`);
  }

  // --- TEST 2: OPTIONS returns 204 No Content ---
  console.log('\n--- TEST 2: Preflight CORS handling (OPTIONS -> 204) ---');
  {
    const req = new Request('https://fallenhair.in/api/jigs-chat', { method: 'OPTIONS' });
    const res = await onRequest({ request: req, env: mockEnv });
    assert(res.status === 204, `Expected status 204, got ${res.status}`);
    assert(res.headers.get('access-control-allow-methods')?.includes('POST'), 'CORS allows POST');
  }

  // --- TEST 3: Malformed JSON returns 400 Bad Request ---
  console.log('\n--- TEST 3: Malformed JSON handling (400) ---');
  {
    const req = new Request('https://fallenhair.in/api/jigs-chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"action": invalid_json_syntax',
    });
    const res = await onRequest({ request: req, env: mockEnv });
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const data = await res.json();
    assert(data.error === 'Invalid JSON request body', `Expected invalid JSON error, got: ${data.error}`);
  }

  // --- TEST 4: Invalid/unknown action returns 400 ---
  console.log('\n--- TEST 4: Unknown action handling (400) ---');
  {
    const req = new Request('https://fallenhair.in/api/jigs-chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'nonexistent_test_action' }),
    });
    const res = await onRequest({ request: req, env: mockEnv });
    assert(res.status === 400, `Expected status 400, got ${res.status}`);
    const data = await res.json();
    assert(data.error?.toLowerCase().includes('action'), `Expected action error, got: ${data.error}`);
  }

  // --- TEST 5: Client IP detection (cf-connecting-ip prioritized) ---
  console.log('\n--- TEST 5: Client IP detection (cf-connecting-ip) ---');
  {
    const reqWithCf = new Request('https://fallenhair.in/api/jigs-chat', {
      headers: {
        'cf-connecting-ip': '203.0.113.88',
        'x-forwarded-for': '198.51.100.1',
      },
    });
    const ipWithCf = getClientIp(reqWithCf);
    assert(ipWithCf === '203.0.113.88', `Expected cf-connecting-ip (203.0.113.88), got: ${ipWithCf}`);

    const reqFallback = new Request('https://fallenhair.in/api/jigs-chat', {
      headers: {
        'x-forwarded-for': '198.51.100.22, 10.0.0.1',
      },
    });
    const ipFallback = getClientIp(reqFallback);
    assert(ipFallback === '198.51.100.22', `Expected x-forwarded-for fallback (198.51.100.22), got: ${ipFallback}`);
  }

  // --- TEST 6: Rate limiting per IP ---
  console.log('\n--- TEST 6: Rate limiting behavior on Cloudflare adapter ---');
  {
    const testIp = '192.0.2.77';
    let blocked = false;
    for (let i = 0; i < 35; i++) {
      const req = new Request('https://fallenhair.in/api/jigs-chat', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'cf-connecting-ip': testIp,
        },
        body: JSON.stringify({ action: 'ping' }),
      });
      const res = await onRequest({ request: req, env: mockEnv });
      if (res.status === 429) {
        blocked = true;
        break;
      }
    }
    assert(blocked, 'Rate limiter activates when threshold is exceeded on Cloudflare IP');
  }

  // --- TEST 7: Conversational request & Session token creation ---
  console.log('\n--- TEST 7: Conversational request & Session token creation ---');
  {
    const req = new Request('https://fallenhair.in/api/jigs-chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'cf-connecting-ip': '192.0.2.105',
      },
      body: JSON.stringify({
        action: 'conversation',
        message: 'Hello, I want to learn more about your portfolio.',
      }),
    });

    const res = await onRequest({ request: req, env: mockEnv });
    assert(res.status === 200, `Expected status 200, got: ${res.status}`);
    const data = await res.json();
    assert(typeof data.reply === 'string' && data.reply.length > 0, 'Response includes reply string');
    assert(typeof data.sessionToken === 'string', 'Response includes sessionToken');
    assert(typeof data.intent === 'string', 'Response includes intent classification');
    assert(typeof data.conversationSummary === 'string', 'Response includes conversationSummary');

    // Verify token with mock secret
    const verification = verifySessionToken(data.sessionToken, mockEnv);
    assert(verification.valid === true, 'Session token verifies with mock environment secret');
    assert(typeof verification.sessionId === 'string', `Session ID resolved: ${verification.sessionId}`);
  }

  // --- TEST 8: Dual-runtime live environment test (if credentials present) ---
  console.log('\n--- TEST 8: Cloudflare adapter with live environment ---');
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const liveEnv = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      GROQ_MODEL: process.env.GROQ_MODEL,
      AI_PROVIDER_MODE: process.env.AI_PROVIDER_MODE,
      JIGS_SESSION_SECRET: process.env.JIGS_SESSION_SECRET,
    };

    const req = new Request('https://fallenhair.in/api/jigs-chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'cf-connecting-ip': '192.0.2.155',
      },
      body: JSON.stringify({
        action: 'conversation',
        message: 'What kind of design work do you do?',
      }),
    });

    const res = await onRequest({ request: req, env: liveEnv });
    assert(res.status === 200, `Live environment returns 200 (got ${res.status})`);
    const data = await res.json();
    assert(typeof data.reply === 'string' && data.reply.length > 0, 'Live AI response received');
    assert(typeof data.sessionToken === 'string', 'Live session token issued');
    const verification = verifySessionToken(data.sessionToken, liveEnv);
    assert(verification.valid === true, 'Live session token verified with live secret');
  } else {
    console.log('  SKIP: Live environment test skipped (no live env present)');
  }

  console.log('\n====================================================');
  console.log(` CLOUDFLARE ADAPTER TESTS: ${passed}/${total} PASSED`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
