import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { API_CONFIG } from '../constants/app';
import { getAccessToken } from '../utils/tokenStorage';

const httpLink = createHttpLink({
  uri: API_CONFIG.GRAPHQL_URL,
});

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  const nextHeaders = { ...headers };

  if (token) {
    nextHeaders.authorization = `Bearer ${token}`;
  }

  return {
    headers: nextHeaders,
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    mutate: { errorPolicy: 'none' },
  },
});

export default client;
