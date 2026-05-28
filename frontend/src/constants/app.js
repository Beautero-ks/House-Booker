const DEFAULT_GOOGLE_CLIENT_ID = '361819434983-cm1se6aefolqdhc0hashnkh6v9rg5ut6.apps.googleusercontent.com';

export const API_CONFIG = {
  GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_URL || '/graphql',
  API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8083/graphql',
  AUTH_GRAPHQL_URL: import.meta.env.VITE_AUTH_GRAPHQL_URL || '/api/auth/graphql',
  HOUSE_GRAPHQL_URL: import.meta.env.VITE_HOUSE_GRAPHQL_URL || '/api/houses/graphql',
  BOOKING_GRAPHQL_URL: import.meta.env.VITE_BOOKING_GRAPHQL_URL || '/api/bookings/graphql',
  NOTIFICATION_API_URL: import.meta.env.VITE_NOTIFICATION_API_URL || '/api/notifications',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID,
};

API_CONFIG.GRAPHQL_URL = API_CONFIG.AUTH_GRAPHQL_URL;

export const CURRENCY = 'FCFA';

export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
};
