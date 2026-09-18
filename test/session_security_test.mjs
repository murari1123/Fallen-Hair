/* ============================================================
   JIGS V3 — Session Security & Ownership Hardening Test Suite
   Tests A through L for production serverless deployment.
   ============================================================ */

import { createClient } from '@supabase/supabase-js';
import { createHmac, randomUUID } from 'crypto';
import handler from '../api/jigs-chat.js';
import {
  createSessionToken,
  verifySessionToken,
  getEnquiryForSession,
  sessionOwnsEnquiry,
} from '../api/jigs/session.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JIGS_SESSION_SECRET = process.env.JIGS_SESSION_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

// Track test enquiries to clean up after test suite completes
const createdEnquiryIds = [];

function mockReqRes(body, headers = {}) {
  const req = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': `127.0.0.${Math.floor(Math.random() * 250) + 1}`,
      ...headers,
    },
    body,
  };
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  return { req, res };
}

async function runTests() {
  console.log('====================================================');
  console.log(' JIGS V3 PRODUCTION SESSION SECURITY HARDENING TESTS');
  console.log('====================================================\n');

  let passedCount = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  FAIL: ${message}`);
      throw new Error(message);
    } else {
      console.log(`  PASS: ${message}`);
      passedCount++;
    }
  }

  let sessionAToken = null;
  let sessionAId = null;
  let sessionBToken = null;
  let sessionBId = null;
  let enquiryAId = null;
  let enquiryBId = null;

  try {
    // -------------------------------------------------------------
    console.log('--- TEST A: New visitor receives a valid session token ---');
    // -------------------------------------------------------------
    {
      const { req, res } = mockReqRes({
        action: 'conversation',
        message: 'Hello, I want to edit a 3-minute video.',
      });
      await handler(req, res);
      assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
      assert(!!res.data?.sessionToken, 'Response includes new sessionToken');
      const verification = verifySessionToken(res.data.sessionToken);
      assert(verification.valid === true, 'Token verifies with HMAC signature');
      assert(!!verification.sessionId, `Valid session ID extracted: ${verification.sessionId}`);
      sessionAToken = res.data.sessionToken;
      sessionAId = verification.sessionId;
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST B: Same session can continue conversation ---');
    // -------------------------------------------------------------
    {
      const { req, res } = mockReqRes({
        action: 'conversation',
        message: 'My budget is around $2,000.',
        sessionToken: sessionAToken,
      });
      await handler(req, res);
      assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
      // If no new token was issued, the original session remains active
      const currentToken = res.data.sessionToken || sessionAToken;
      const verification = verifySessionToken(currentToken);
      assert(verification.valid === true, 'Session token remains valid');
      assert(verification.sessionId === sessionAId, 'Session identity is preserved');
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST C: Same session can create one enquiry ---');
    // -------------------------------------------------------------
    {
      const { req, res } = mockReqRes({
        action: 'start_enquiry',
        sessionToken: sessionAToken,
        enquiryData: {
          name: 'Security Test User A',
          email: 'test-user-a@example.com',
          project_type: 'VIDEO PRODUCTION',
          budget: '$2,000 - $3,000',
        },
      });
      await handler(req, res);
      assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
      assert(res.data?.success === true, 'Enquiry creation confirmed success');
      assert(!!res.data?.enquiryId, `Enquiry ID generated: ${res.data?.enquiryId}`);
      enquiryAId = res.data.enquiryId;
      createdEnquiryIds.push(enquiryAId);

      // Verify persistent ownership directly in Supabase
      const persistentEnquiry = await getEnquiryForSession(supabase, sessionAId);
      assert(persistentEnquiry !== null, 'Enquiry found in Supabase via persistent session lookup');
      assert(persistentEnquiry?.id === enquiryAId, 'Supabase enquiry matches returned enquiry ID');
      const isOwner = await sessionOwnsEnquiry(supabase, sessionAId, enquiryAId);
      assert(isOwner === true, 'sessionOwnsEnquiry authoritatively confirms ownership');
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST D: Same session can update its own enquiry ---');
    // -------------------------------------------------------------
    {
      const { req, res } = mockReqRes({
        action: 'update_enquiry',
        sessionToken: sessionAToken,
        enquiryId: enquiryAId, // optional hint
        enquiryData: {
          project_description: 'Updated video project description via session A.',
          budget: '$3,500',
        },
      });
      await handler(req, res);
      assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
      assert(res.data?.success === true, 'Update confirmed success');

      // Verify in database
      const { data: row } = await supabase.from('enquiries').select('project_description, budget').eq('id', enquiryAId).single();
      assert(row?.project_description === 'Updated video project description via session A.', 'Database was updated with new description');
      assert(row?.budget === '$3,500', 'Database was updated with new budget');
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST E: Same session can submit its own enquiry ---');
    // -------------------------------------------------------------
    {
      const { req, res } = mockReqRes({
        action: 'submit_enquiry',
        sessionToken: sessionAToken,
        enquiryId: enquiryAId,
        enquiryData: {
          name: 'Security Test User A Final',
          email: 'test-user-a@example.com',
        },
        messages: [
          { sender: 'user', content: 'Here is my final brief.' },
          { sender: 'jigs', content: 'Understood. Reviewing your project details.' },
        ],
      });
      await handler(req, res);
      assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
      assert(res.data?.success === true, 'Submission confirmed success');
      assert(res.data?.enquiryId === enquiryAId, 'Returned correct submitted enquiry ID');

      // Verify status in database
      const { data: row } = await supabase.from('enquiries').select('conversation_status, qualification_score').eq('id', enquiryAId).single();
      assert(row?.conversation_status === 'QUALIFIED', `Enquiry status updated to QUALIFIED (got: ${row?.conversation_status})`);
      assert(row?.qualification_score === 'HIGH', 'Qualification score updated to HIGH');
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST F: Tampered session token is rejected ---');
    // -------------------------------------------------------------
    {
      // 1. Altered payload with original signature
      const [payload, sig] = sessionAToken.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
      decoded.sessionId = randomUUID(); // Tamper with session identity
      const tamperedPayload = Buffer.from(JSON.stringify(decoded)).toString('base64url');
      const tamperedToken = `${tamperedPayload}.${sig}`;

      const { req: req1, res: res1 } = mockReqRes({
        action: 'update_enquiry',
        sessionToken: tamperedToken,
        enquiryData: { name: 'Hacker' },
      });
      await handler(req1, res1);
      assert(res1.statusCode === 401, `Tampered payload rejected with 401 (got: ${res1.statusCode})`);

      // 2. Altered signature
      const tamperedSig = sig.slice(0, -4) + 'AAAA';
      const tamperedSigToken = `${payload}.${tamperedSig}`;

      const { req: req2, res: res2 } = mockReqRes({
        action: 'submit_enquiry',
        sessionToken: tamperedSigToken,
      });
      await handler(req2, res2);
      assert(res2.statusCode === 401, `Tampered signature rejected with 401 (got: ${res2.statusCode})`);

      // 3. Malformed token
      const { req: req3, res: res3 } = mockReqRes({
        action: 'start_enquiry',
        sessionToken: 'not.a.valid.jwt.or.token',
      });
      await handler(req3, res3);
      assert(res3.statusCode === 401, `Malformed token rejected with 401 (got: ${res3.statusCode})`);
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST G: Expired session token is rejected for protected mutations ---');
    // -------------------------------------------------------------
    {
      const expiredPayload = JSON.stringify({
        sessionId: randomUUID(),
        createdAt: Date.now() - (4 * 60 * 60 * 1000), // 4 hours ago
        expiresAt: Date.now() - (2 * 60 * 60 * 1000), // expired 2 hours ago
      });
      const expiredBase64 = Buffer.from(expiredPayload).toString('base64url');
      const expiredSig = createHmac('sha256', JIGS_SESSION_SECRET)
        .update(expiredBase64)
        .digest('base64url');
      const expiredToken = `${expiredBase64}.${expiredSig}`;

      // Test on start_enquiry
      const { req: req1, res: res1 } = mockReqRes({
        action: 'start_enquiry',
        sessionToken: expiredToken,
        enquiryData: { name: 'Expired User' },
      });
      await handler(req1, res1);
      assert(res1.statusCode === 401, `Expired token rejected for start_enquiry with 401 (got: ${res1.statusCode})`);

      // Test on update_enquiry
      const { req: req2, res: res2 } = mockReqRes({
        action: 'update_enquiry',
        sessionToken: expiredToken,
        enquiryData: { name: 'Expired User' },
      });
      await handler(req2, res2);
      assert(res2.statusCode === 401, `Expired token rejected for update_enquiry with 401 (got: ${res2.statusCode})`);

      // Test on submit_enquiry
      const { req: req3, res: res3 } = mockReqRes({
        action: 'submit_enquiry',
        sessionToken: expiredToken,
      });
      await handler(req3, res3);
      assert(res3.statusCode === 401, `Expired token rejected for submit_enquiry with 401 (got: ${res3.statusCode})`);
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST H: Valid Session A + Enquiry ID of Session B is rejected ---');
    // -------------------------------------------------------------
    {
      // Create session B and its enquiry
      const tokenBObj = createSessionToken();
      sessionBToken = tokenBObj.token;
      sessionBId = tokenBObj.sessionId;

      const { req: reqB, res: resB } = mockReqRes({
        action: 'start_enquiry',
        sessionToken: sessionBToken,
        enquiryData: {
          name: 'Victim User B',
          email: 'victim-b@example.com',
          project_type: 'DIRECTION',
        },
      });
      await handler(reqB, resB);
      assert(resB.statusCode === 200, `Session B enquiry created (got: ${resB.statusCode})`);
      enquiryBId = resB.data?.enquiryId;
      createdEnquiryIds.push(enquiryBId);

      // Now ATTACK: Session A tries to update Session B's enquiry by sending enquiryId: enquiryBId
      const { req: attackUpdate, res: resAttackUpdate } = mockReqRes({
        action: 'update_enquiry',
        sessionToken: sessionAToken, // Session A
        enquiryId: enquiryBId,       // Attempting to hijack Session B's enquiry!
        enquiryData: {
          name: 'Attacker A Injected Name',
          project_description: 'Malicious modification of Session B enquiry',
        },
      });
      await handler(attackUpdate, resAttackUpdate);
      assert(resAttackUpdate.statusCode === 403, `Ownership violation rejected with 403 Forbidden (got: ${resAttackUpdate.statusCode})`);

      // ATTACK: Session A tries to submit Session B's enquiry
      const { req: attackSubmit, res: resAttackSubmit } = mockReqRes({
        action: 'submit_enquiry',
        sessionToken: sessionAToken,
        enquiryId: enquiryBId,
      });
      await handler(attackSubmit, resAttackSubmit);
      assert(resAttackSubmit.statusCode === 403, `Ownership violation on submit rejected with 403 Forbidden (got: ${resAttackSubmit.statusCode})`);

      // Confirm Session B's record in Supabase was NOT tampered with
      const { data: bRow } = await supabase.from('enquiries').select('name').eq('id', enquiryBId).single();
      assert(bRow?.name === 'Victim User B', `Victim B enquiry intact in Supabase (got name: "${bRow?.name}")`);
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST I: Unknown/random enquiry ID is rejected ---');
    // -------------------------------------------------------------
    {
      const randomFakeId = randomUUID();
      const { req, res } = mockReqRes({
        action: 'update_enquiry',
        sessionToken: sessionAToken,
        enquiryId: randomFakeId,
        enquiryData: { name: 'Attempt' },
      });
      await handler(req, res);
      assert(res.statusCode === 403, `Unknown enquiry ID rejected with 403 (got: ${res.statusCode})`);
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST J: Repeated start_enquiry does not create duplicate enquiry ---');
    // -------------------------------------------------------------
    {
      const { req, res } = mockReqRes({
        action: 'start_enquiry',
        sessionToken: sessionAToken,
        enquiryData: {
          name: 'Security Test User A (Repeated Click)',
        },
      });
      await handler(req, res);
      assert(res.statusCode === 200, `Repeated start_enquiry returns 200 (got: ${res.statusCode})`);
      assert(res.data?.enquiryId === enquiryAId, `Reuses existing enquiry ID (${enquiryAId})`);
      assert(res.data?.message?.includes('already exists'), 'Informs client enquiry already exists');

      // Verify exactly ONE enquiry exists for sessionAId in Supabase
      const { data: countData } = await supabase
        .from('enquiries')
        .select('id')
        .eq('structured_brief->>session_id', sessionAId);
      assert(countData?.length === 1, `Database contains exactly 1 enquiry for Session A (count: ${countData?.length})`);
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST K: NEW CHAT creates a clean conversation/session boundary ---');
    // -------------------------------------------------------------
    {
      // Simulating user clicking NEW CHAT (sessionToken cleared on client)
      const { req, res } = mockReqRes({
        action: 'conversation',
        message: 'Starting a brand new chat for a music video.',
        sessionToken: null, // Cleared on NEW CHAT
      });
      await handler(req, res);
      assert(res.statusCode === 200, `Expected 200 for new chat conversation`);
      const newChatToken = res.data?.sessionToken;
      assert(!!newChatToken, 'New chat received a fresh session token');
      const verification = verifySessionToken(newChatToken);
      assert(verification.sessionId !== sessionAId, 'New chat has distinct session ID from session A');
      assert(verification.sessionId !== sessionBId, 'New chat has distinct session ID from session B');

      // Verify that this new session does not own Session A or Session B's enquiries
      const ownedEnquiry = await getEnquiryForSession(supabase, verification.sessionId);
      assert(ownedEnquiry === null, 'New chat session has NO associated enquiry yet (clean boundary)');
    }

    // -------------------------------------------------------------
    console.log('\n--- TEST L: Serverless simulation (stateless persistence) ---');
    // -------------------------------------------------------------
    {
      // In serverless, memory is isolated between lambdas.
      // We simulate this by creating a separate session C with an enquiry,
      // and verifying that another "instance" with ZERO shared memory can resolve and verify ownership
      // authoritatively from Supabase using only the signed sessionToken.
      const sessionCTokenObj = createSessionToken();
      const sessionCToken = sessionCTokenObj.token;
      const sessionCId = sessionCTokenObj.sessionId;

      // Instance 1: creates enquiry
      const { req: inst1Req, res: inst1Res } = mockReqRes({
        action: 'start_enquiry',
        sessionToken: sessionCToken,
        enquiryData: {
          name: 'Serverless User C',
          email: 'user-c@example.com',
          project_type: 'POST-PRODUCTION',
        },
      });
      await handler(inst1Req, inst1Res);
      assert(inst1Res.statusCode === 200, `Instance 1 created enquiry for Session C`);
      const enquiryCId = inst1Res.data?.enquiryId;
      createdEnquiryIds.push(enquiryCId);

      // Instance 2 (Simulating cold start / separate serverless container):
      // Direct query through clean Supabase client without any process-memory dependencies
      const freshSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
      const resolvedFromDb = await getEnquiryForSession(freshSupabase, sessionCId);
      assert(resolvedFromDb !== null, 'Instance 2 resolved enquiry C directly from Supabase');
      assert(resolvedFromDb?.id === enquiryCId, 'Resolved enquiry ID matches across serverless boundary');

      // Instance 2: updates enquiry using only sessionToken
      const { req: inst2Req, res: inst2Res } = mockReqRes({
        action: 'update_enquiry',
        sessionToken: sessionCToken,
        enquiryData: {
          budget: '$10,000',
        },
      });
      await handler(inst2Req, inst2Res);
      assert(inst2Res.statusCode === 200, `Instance 2 updated enquiry C via persistent ownership`);

      // Verify update in Supabase
      const { data: cRow } = await freshSupabase.from('enquiries').select('budget').eq('id', enquiryCId).single();
      assert(cRow?.budget === '$10,000', 'Serverless update verified in Supabase');
    }

    console.log('\n====================================================');
    console.log(` ALL ${passedCount} SECURITY ASSERTIONS PASSED!`);
    console.log('====================================================\n');
  } finally {
    // Clean up test records from Supabase
    if (createdEnquiryIds.length > 0) {
      console.log(`Cleaning up ${createdEnquiryIds.length} test enquiries from Supabase...`);
      // Delete enquiry_messages first
      await supabase.from('enquiry_messages').delete().in('enquiry_id', createdEnquiryIds);
      // Delete enquiries
      await supabase.from('enquiries').delete().in('id', createdEnquiryIds);
      console.log('Cleanup complete.');
    }
  }
}

runTests().catch(err => {
  console.error('\nTest suite failed with error:', err);
  process.exit(1);
});
