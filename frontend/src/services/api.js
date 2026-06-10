// Resolve base API URL:
// 1. Check if VITE_API_URL is defined in env
// 2. If not, use relative '/api' in production, or 'http://localhost:5000/api' in development
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api';
};

export const API_URL = getApiUrl();

/**
 * Centralized fetch wrapper to handle authorization headers, request body parsing,
 * and standard error response formatting.
 * 
 * Returns a Response-like object to maintain compatibility with existing `res.ok`
 * checks in pages, but wraps network exceptions with clear error messages.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = { ...options.headers };
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const token = localStorage.getItem('token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Read the response content as text
    const text = await response.text();
    let data = null;
    
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    } else {
      data = {};
    }

    // Return a compatible Response object wrapper
    return {
      ok: response.ok,
      status: response.status,
      headers: response.headers,
      json: async () => data,
      text: async () => text
    };
  } catch (error) {
    // Check if it's a connection / fetch error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Could not connect to the BeginUPSC server. Please check your internet connection or verify the backend is running.'
      );
    }
    throw error;
  }
}
