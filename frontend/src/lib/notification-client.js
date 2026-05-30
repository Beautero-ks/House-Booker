import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { API_CONFIG } from '@/config/api';

export const authApolloClient = new ApolloClient({
    link: new HttpLink({
        uri: API_CONFIG.NOTIFICATION_API_URL,
        credentials: 'include',
    }),

    cache: new InMemoryCache(),
});