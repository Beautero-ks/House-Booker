import { ApolloClient, InMemoryCache, createHttpLink, from, fromPromise } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { API_CONFIG } from '../constants/app';
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from '../utils/tokenStorage';
import { REFRESH_TOKEN_MUTATION } from './graphql/mutations/refreshToken';

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

let apolloClient;

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Refresh token manquant');
  }

  const response = await apolloClient.mutate({
    mutation: REFRESH_TOKEN_MUTATION,
    variables: { input: { refreshToken } },
    context: { skipRefresh: true },
  });

  const result = response?.data?.refreshToken;
  if (!result?.accessToken) {
    throw new Error('Impossible de rafraîchir le token');
  }

  setTokens(result.accessToken, result.refreshToken);
  return result.accessToken;
};

const shouldRefreshToken = ({ graphQLErrors, networkError, operation }) => {
  if (operation.getContext()?.skipRefresh) {
    return false;
  }

  if (networkError && networkError.statusCode === 401) {
    return true;
  }

  if (graphQLErrors) {
    return graphQLErrors.some(({ message, extensions }) => {
      const normalized = String(message || '').toLowerCase();
      if (normalized.includes('unauthorized') || normalized.includes('unauthenticated') || normalized.includes('jwt') || normalized.includes('token')) {
        return true;
      }
      if (extensions?.classification === 'UNAUTHENTICATED') {
        return true;
      }
      return false;
    });
  }

  return false;
};

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (!shouldRefreshToken({ graphQLErrors, networkError, operation })) {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      );
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }

    return;
  }

  return fromPromise(
    refreshAccessToken().catch((error) => {
      clearAuth();
      console.error('[ApolloClient] refresh token failed', error);
      throw error;
    })
  ).flatMap(() => forward(operation));
});

apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    mutate: { errorPolicy: 'none' },
  },
});

export default apolloClient;
