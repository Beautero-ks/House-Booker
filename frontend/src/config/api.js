const DEFAULT_GOOGLE_CLIENT_ID =
    '361819434983-cm1se6aefolqdhc0hashnkh6v9rg5ut6.apps.googleusercontent.com';

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost';

export const API_CONFIG = {
    API_BASE_URL,

    // =========================================================
    // GRAPHQL ENDPOINTS VIA API GATEWAY
    // =========================================================

    AUTH_GRAPHQL_URL:
        import.meta.env.VITE_AUTH_GRAPHQL_URL ||
        `${API_BASE_URL}/graphql/auth`,

    HOUSE_GRAPHQL_URL:
        import.meta.env.VITE_HOUSE_GRAPHQL_URL ||
        `${API_BASE_URL}/graphql/houses`,

    BOOKING_GRAPHQL_URL:
        import.meta.env.VITE_BOOKING_GRAPHQL_URL ||
        `${API_BASE_URL}/graphql/booking`,

    // =========================================================
    // REST / NOTIFICATION
    // =========================================================

    NOTIFICATION_API_URL:
        import.meta.env.VITE_NOTIFICATION_API_URL ||
        `${API_BASE_URL}/api/v1/notifications`,

    // =========================================================
    // GOOGLE AUTH
    // =========================================================

    GOOGLE_CLIENT_ID:
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        DEFAULT_GOOGLE_CLIENT_ID,
};

export const CURRENCY = 'FCFA';

export const LANGUAGES = {
    FR: 'fr',
    EN: 'en',
};