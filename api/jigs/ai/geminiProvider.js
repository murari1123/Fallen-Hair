/* ============================================
   JIGS V3 — Gemini Provider Adapter
   Google Gemini REST API integration.
   Configured model via GEMINI_MODEL environment variable.
   ============================================ */

import { cleanAndParseJson } from '../validation.js';
import { ProviderError } from './groqProvider.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const TIMEOUT_MS = 25000;

/**
 * Gemini AI provider.
 * Uses Google Gemini REST generateContent endpoint.
 */
export const geminiProvider = {
  name: 'gemini',

  /**
   * Check whether the provider is properly configured.
   */
  isConfigured(config) {
    return !!(config?.GEMINI_API_KEY || process.env.GEMINI_API_KEY);
  },

  /**
   * Call Gemini with a system prompt and user prompt.
   * Returns parsed JSON response or throws ProviderError.
   */
  async call({ systemPrompt, userPrompt, temperature = 0.4, config }) {
    const apiKey = config?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ProviderError('config_error', 'GEMINI_API_KEY is not configured');
    }

    const model = config?.GEMINI_MODEL || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [{
            parts: [{ text: userPrompt }],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature,
            maxOutputTokens: 1024,
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (fetchErr) {
      if (fetchErr.name === 'TimeoutError' || fetchErr.name === 'AbortError') {
        throw new ProviderError('timeout', 'Gemini request timed out');
      }
      throw new ProviderError('api_error', `Gemini network error: ${fetchErr.message}`);
    }

    if (!res.ok) {
      const status = res.status;
      let errorDetail = '';
      try {
        const errBody = await res.json();
        errorDetail = errBody?.error?.message || '';
      } catch { /* ignore */ }

      if (status === 429) {
        throw new ProviderError('rate_limited', `Gemini rate limited: ${errorDetail}`, status);
      }
      throw new ProviderError('api_error', `Gemini API error ${status}: ${errorDetail}`, status);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new ProviderError('empty_response', 'Gemini returned empty response');
    }

    const parsed = cleanAndParseJson(rawText);
    if (!parsed) {
      throw new ProviderError('parse_error', 'Failed to parse Gemini JSON response');
    }

    return parsed;
  },
};
