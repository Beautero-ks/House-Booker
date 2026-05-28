const DEFAULT_GOOGLE_CLIENT_ID = '361819434983-cm1se6aefolqdhc0hashnkh6v9rg5ut6.apps.googleusercontent.com';

export const API_CONFIG = {
  GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_URL || '/graphql',
  API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8083/graphql',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID,
};

export const CURRENCY = 'FCFA';

export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
};
