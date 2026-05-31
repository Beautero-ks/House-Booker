const DEFAULT_GOOGLE_CLIENT_ID =
    '361819434983-cm1se6aefolqdhc0hashnkh6v9rg5ut6.apps.googleusercontent.com';

const trimTrailingSlash = (url) => url.replace(/\/+$/, '');

const normalizeGatewayBaseUrl = (url) => {
    const trimmedUrl = trimTrailingSlash(url);
    return trimmedUrl.replace(/\/graphql(?:\/(?:auth|house|houses|booking|bookings))?$/i, '');
};

const withBaseUrl = (path) => {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};

const graphQLEndpoint = (value, gatewayPath, legacyPathPattern) => {
    if (!value) {
        return withBaseUrl(gatewayPath);
    }

    const trimmedValue = trimTrailingSlash(value);
    const normalizedPath = legacyPathPattern.test(trimmedValue)
        ? trimmedValue.replace(legacyPathPattern, gatewayPath)
        : trimmedValue;

    return /^https?:\/\//i.test(normalizedPath)
        ? normalizedPath
        : withBaseUrl(normalizedPath);
};

const API_BASE_URL = normalizeGatewayBaseUrl(
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_GATEWAY_URL ||
    (import.meta.env.DEV ? 'http://localhost:8083' : '')
);

const AUTH_GRAPHQL_URL = graphQLEndpoint(
    import.meta.env.VITE_AUTH_GRAPHQL_URL,
    '/graphql/auth',
    /\/api\/auth\/graphql$/i
);

const HOUSE_GRAPHQL_URL = graphQLEndpoint(
    import.meta.env.VITE_HOUSE_GRAPHQL_URL,
    '/graphql/house',
    /\/api\/houses\/graphql$/i
);

const BOOKING_GRAPHQL_URL = graphQLEndpoint(
    import.meta.env.VITE_BOOKING_GRAPHQL_URL,
    '/graphql/booking',
    /\/api\/bookings\/graphql$/i
);

const GRAPHQL_URL = graphQLEndpoint(
    import.meta.env.VITE_GRAPHQL_URL,
    '/graphql/auth',
    /\/graphql$/i
);

export const API_CONFIG = {
    API_BASE_URL,
    API_GATEWAY_URL: API_BASE_URL,

    GRAPHQL_URL: GRAPHQL_URL === '/graphql/auth' ? AUTH_GRAPHQL_URL : GRAPHQL_URL,

    // =========================================================
    // GRAPHQL ENDPOINTS VIA API GATEWAY
    // =========================================================

    AUTH_GRAPHQL_URL,

    HOUSE_GRAPHQL_URL,

    BOOKING_GRAPHQL_URL,

    // =========================================================
    // REST / NOTIFICATION
    // =========================================================

    NOTIFICATION_API_URL:
        import.meta.env.VITE_NOTIFICATION_API_URL ||
        withBaseUrl('/api/v1/notifications'),

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
