/* ============================================
   JIGS V3 — Groq Provider Adapter
   OpenAI-compatible REST integration with Groq.
   Configured model via GROQ_MODEL environment variable.
   ============================================ */

import { cleanAndParseJson } from '../validation.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const TIMEOUT_MS = 25000;

/**
 * Custom error class for provider-specific errors.
 */
export class ProviderError extends Error {
  constructor(type, message, status = null) {
    super(message);
    this.name = 'ProviderError';
    this.type = type; // 'config_error' | 'rate_limited' | 'api_error' | 'empty_response' | 'parse_error' | 'timeout'
    this.status = status;
  }
}

/**
 * Groq AI provider.
 * Uses OpenAI-compatible chat completions endpoint.
 */
export const groqProvider = {
  name: 'groq',

  /**
   * Check whether the provider is properly configured.
   */
  isConfigured(config) {
    return !!(config?.GROQ_API_KEY || process.env.GROQ_API_KEY);
  },

  /**
   * Call Groq with a system prompt and user prompt.
   * Returns parsed JSON response or throws ProviderError.
   */
  async call({ systemPrompt, userPrompt, temperature = 0.4, config }) {
    const apiKey = config?.GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new ProviderError('config_error', 'GROQ_API_KEY is not configured');
    }

    const model = config?.GROQ_MODEL || process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

    let res;
    try {
      res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: Math.max(temperature, 1e-8), // Groq requires > 0
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (fetchErr) {
      if (fetchErr.name === 'TimeoutError' || fetchErr.name === 'AbortError') {
        throw new ProviderError('timeout', 'Groq request timed out');
      }
      throw new ProviderError('api_error', `Groq network error: ${fetchErr.message}`);
    }

    if (!res.ok) {
      const status = res.status;
      let errorDetail = '';
      try {
        const errBody = await res.json();
        errorDetail = errBody?.error?.message || '';
      } catch { /* ignore */ }

      if (status === 429) {
        throw new ProviderError('rate_limited', `Groq rate limited: ${errorDetail}`, status);
      }
      throw new ProviderError('api_error', `Groq API error ${status}: ${errorDetail}`, status);
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      throw new ProviderError('empty_response', 'Groq returned empty response');
    }

    const parsed = cleanAndParseJson(rawText);
    if (!parsed) {
      throw new ProviderError('parse_error', 'Failed to parse Groq JSON response');
    }

    return parsed;
  },
};
