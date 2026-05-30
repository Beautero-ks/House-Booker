import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { API_CONFIG } from '@/config/api';

export const bookingApolloClient = new ApolloClient({
    link: new HttpLink({
        uri: API_CONFIG.BOOKING_GRAPHQL_URL,
        credentials: 'include',
    }),

    cache: new InMemoryCache(),
});