const TOKEN_KEYS = {
  ACCESS: 'hb_access_token',
  REFRESH: 'hb_refresh_token',
  USER: 'hb_user',
};

export const getAccessToken = () => localStorage.getItem(TOKEN_KEYS.ACCESS);
export const getRefreshToken = () => localStorage.getItem(TOKEN_KEYS.REFRESH);
export const getStoredUser = () => {
  const data = localStorage.getItem(TOKEN_KEYS.USER);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    clearAuth();
    return null;
  }
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(normalized);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isAccessTokenValid = () => {
  const token = getAccessToken();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;

  return payload.exp * 1000 > Date.now();
};

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(TOKEN_KEYS.ACCESS, accessToken);
  if (refreshToken) localStorage.setItem(TOKEN_KEYS.REFRESH, refreshToken);
};

export const setStoredUser = (user) => {
  localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.USER);
};
