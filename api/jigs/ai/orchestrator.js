/* ============================================
   JIGS V3 — AI Orchestrator
   Provider selection, fallback, retry, and
   response normalization.
   Provider-agnostic — the rest of JIGS doesn't
   know which provider generated the response.
   ============================================ */

import { groqProvider } from './groqProvider.js';
import { geminiProvider } from './geminiProvider.js';
import { validateAIResponse } from '../validation.js';

/* ---- Provider Registry ---- */
const PROVIDERS = {
  groq: groqProvider,
  gemini: geminiProvider,
};

/* ---- Safe Static Fallback ---- */
const STATIC_FALLBACK = {
  reply: "I'm having a moment — my connection to the studio systems is a bit unreliable right now. Feel free to try again, or you can reach Murari directly at muraridamalapati@gmail.com.",
  intent: 'casual',
  extracted_data: {},
  qualification_completeness: 0,
  summary: '',
  actions: [],
  valid: true,
  _fallback: true,
};

/**
 * Get the ordered list of providers to try based on configuration.
 *
 * AI_PROVIDER_MODE:
 * - 'groq': Groq preferred, Gemini fallback
 * - 'gemini': Gemini preferred, Groq fallback
 * - 'auto' (default): Automatically selects configured provider; if both configured, Groq first with Gemini fallback
 */
function getProviderOrder(config) {
  const mode = (config?.AI_PROVIDER_MODE || process.env.AI_PROVIDER_MODE || 'auto').toLowerCase().trim();

  if (mode === 'groq') {
    return ['groq', 'gemini'];
  }

  if (mode === 'gemini') {
    return ['gemini', 'groq'];
  }

  // mode === 'auto'
  // If Groq is not configured but Gemini is, start with Gemini to avoid wasted call
  if (!groqProvider.isConfigured(config) && geminiProvider.isConfigured(config)) {
    return ['gemini', 'groq'];
  }

  return ['groq', 'gemini'];
}

/**
 * Call the AI with provider fallback and response validation.
 *
 * @param {Object} params
 * @param {string} params.systemPrompt - The system instruction
 * @param {string} params.userPrompt - The formatted user prompt
 * @param {number} [params.temperature=0.4] - Temperature for generation
 * @param {Object} [params.config] - Optional configuration/env object
 * @returns {Object} Validated response object
 */
export async function callAI({ systemPrompt, userPrompt, temperature = 0.4, config }) {
  const providerOrder = getProviderOrder(config);
  const errors = [];

  for (const providerName of providerOrder) {
    const provider = PROVIDERS[providerName];

    // Skip unconfigured providers
    if (!provider || !provider.isConfigured(config)) {
      errors.push({ provider: providerName, error: 'Not configured' });
      continue;
    }

    // Attempt the call with one retry for transient failures
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const rawResponse = await provider.call({
          systemPrompt,
          userPrompt,
          temperature,
          config,
        });

        // Validate and normalize the response
        const validated = validateAIResponse(rawResponse);

        if (validated.valid && validated.reply) {
          return {
            ...validated,
            _provider: providerName,
            _attempt: attempt + 1,
          };
        }

        // Invalid response structure — try next provider immediately
        errors.push({
          provider: providerName,
          attempt: attempt + 1,
          error: 'Invalid response structure',
        });
        break;

      } catch (err) {
        errors.push({
          provider: providerName,
          attempt: attempt + 1,
          error: err.message || 'Unknown error',
          type: err.type || 'unknown',
        });

        // Rate limits or config errors -> move to next provider immediately
        if (err.type === 'rate_limited' || err.type === 'config_error') {
          break;
        }

        // For transient errors, retry once
        if (attempt === 0 && isTransientError(err)) {
          await sleep(600);
          continue;
        }

        break;
      }
    }
  }

  // All providers failed — log and return static fallback
  console.error('[JIGS_AI_ORCHESTRATOR] All providers failed:', JSON.stringify(errors));
  return { ...STATIC_FALLBACK };
}

/**
 * Check if an error is transient (worth retrying).
 */
function isTransientError(err) {
  if (err.name === 'TimeoutError' || err.name === 'AbortError' || err.type === 'timeout') return true;
  if (err.type === 'empty_response') return true;
  if (err.status >= 500 && err.status < 600) return true;
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
