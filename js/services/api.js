/**
 * MATH/OS - Frontend API Client Helper
 * 
 * Communicates with the Node.js / Express REST API.
 * Provides graceful offline fallback detection if the server is unreachable.
 */

const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

/**
 * Performs an HTTP request against the MATH/OS REST API.
 * 
 * @param {string} endpoint - API path (e.g. '/formulas', '/history')
 * @param {RequestInit} [options={}] - Standard fetch options
 * @returns {Promise<{ success: boolean, data?: any, count?: number, message?: string, isOffline?: boolean }>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json().catch(() => ({
      success: false,
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));

    if (!response.ok) {
      return {
        success: false,
        message: result.message || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    return result;
  } catch (err) {
    const isNetworkError = err.name === 'AbortError' || err.name === 'TypeError' || err.message.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Subtle console info for developers without crashing the UI
      console.info(
        `%c[MATH/OS API]%c Backend unreachable at ${url}. Operating with local client-side data.`,
        'color: #E4FD97; font-weight: bold; background: #10140F; padding: 2px 6px; border-radius: 3px;',
        'color: #A9B29F;'
      );
    } else {
      console.warn('[MATH/OS API Error]', err.message);
    }

    return {
      success: false,
      isOffline: true,
      message: 'Backend server is offline or unreachable. Using local client fallback.',
      error: err,
    };
  }
}

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
};
