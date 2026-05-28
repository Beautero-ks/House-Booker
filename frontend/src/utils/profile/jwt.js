import { getAccessToken } from '../../utils/tokenStorage';

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const getJwtStatus = () => {
  const token = getAccessToken();
  if (!token) {
    return { valid: false, expiresAt: null, expiresInSeconds: 0 };
  }

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) {
    return { valid: false, expiresAt: null, expiresInSeconds: 0 };
  }

  const expiresAt = new Date(payload.exp * 1000);
  const expiresInSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));

  return {
    valid: expiresInSeconds > 0,
    expiresAt,
    expiresInSeconds,
  };
};

export const formatJwtStatus = ({ valid, expiresAt }, lang, t) => {
  if (!expiresAt) {
    return t('profile_no_token');
  }

  const date = expiresAt.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR');
  return valid
    ? t('profile_token_valid', { date })
    : t('profile_token_expired', { date });
};
