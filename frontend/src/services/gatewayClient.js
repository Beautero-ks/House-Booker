import { getAccessToken } from '../utils/tokenStorage';

const withGatewayBase = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${path}`;
};

export const graphQLRequest = async ({ endpoint, query, variables, files = [] }) => {
  const headers = {};
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let body;
  if (files.length > 0) {
    body = new FormData();
    body.append('operations', JSON.stringify({ query, variables }));

    const map = files.reduce((acc, _, index) => {
      acc[index] = [`variables.files.${index}`];
      return acc;
    }, {});
    body.append('map', JSON.stringify(map));

    files.forEach((file, index) => {
      body.append(String(index), file);
    });
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ query, variables });
  }

  const response = await fetch(withGatewayBase(endpoint), {
    method: 'POST',
    headers,
    body,
    credentials: 'include',
  });

  const result = await response.json();
  if (!response.ok || result.errors?.length) {
    throw new Error(result.errors?.[0]?.message || 'Erreur de communication avec le backend.');
  }

  return result.data;
};

export const restRequest = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(withGatewayBase(path), {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(payload?.message || payload || 'Erreur de communication avec le backend.');
  }

  return payload;
};
