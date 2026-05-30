import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { API_CONFIG } from '@/config/api';

export const houseApolloClient = new ApolloClient({
    link: new HttpLink({
        uri: API_CONFIG.HOUSE_GRAPHQL_URL,
        credentials: 'include',
    }),

    cache: new InMemoryCache(),
});