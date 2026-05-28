import { getAccessToken } from './tokenStorage';

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

export const getAuthenticatedUserId = (user) => {
  const userId = user?.id || user?.userId || user?.sub;
  if (userId) return userId;

  const payload = decodeJwtPayload(getAccessToken() || '');
  return payload?.sub || payload?.userId || payload?.id || null;
};
