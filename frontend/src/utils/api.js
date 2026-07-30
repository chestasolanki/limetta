const API_BASE = 'http://localhost:5051/api';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders = {};
  if (options.body && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const defaultOptions = {
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  // No content response
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
