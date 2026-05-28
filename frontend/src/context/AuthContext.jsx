import { createContext, useState, useCallback, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../services/graphql/mutations/login';
import { REGISTER_MUTATION } from '../services/graphql/mutations/register';
import { VERIFY_OTP_MUTATION } from '../services/graphql/mutations/verifyOtp';
import { REFRESH_TOKEN_MUTATION } from '../services/graphql/mutations/refreshToken';
import { RESEND_OTP_MUTATION } from '../services/graphql/mutations/resendOtp';
import { GOOGLE_LOGIN_MUTATION } from '../services/graphql/mutations/googleLogin';
import { GET_CURRENT_USER_QUERY } from '../services/graphql/queries/getCurrentUser';
import {
  setTokens,
  setStoredUser,
  clearAuth,
  getStoredUser,
  getRefreshToken,
  isAccessTokenValid,
} from '../utils/tokenStorage';

const AuthContext = createContext(null);

const getApiErrorMessage = (err) =>
  err?.graphQLErrors?.[0]?.message ||
  err?.networkError?.result?.errors?.[0]?.message ||
  err?.networkError?.message ||
  err?.message ||
  'Erreur de communication avec le serveur';

export function AuthProvider({ children }) {
  const storedUser = getStoredUser();
  const [user, setUser] = useState(storedUser);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(storedUser?.isVerified && isAccessTokenValid())
  );
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [verifyOtpMutation] = useMutation(VERIFY_OTP_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);
  const [resendOtpMutation] = useMutation(RESEND_OTP_MUTATION);
  const [googleLoginMutation] = useMutation(GOOGLE_LOGIN_MUTATION);

  const [loadCurrentUser, { data: currentUserData, error: currentUserError }] = useLazyQuery(
    GET_CURRENT_USER_QUERY,
    { fetchPolicy: 'network-only' }
  );

  useEffect(() => {
    if (currentUserError) {
      console.error('[Auth] getCurrentUser failed', currentUserError);
    }
  }, [currentUserError]);

  useEffect(() => {
    const currentUser = currentUserData?.getCurrentUser;
    if (!currentUser) return;

    setStoredUser(currentUser);
    setUser(currentUser);
    if (currentUser.isVerified && isAccessTokenValid()) {
      setIsAuthenticated(true);
    }
  }, [currentUserData]);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const { data } = await loadCurrentUser();
      const currentUser = data?.getCurrentUser;
      if (currentUser) {
        setStoredUser(currentUser);
        setUser(currentUser);
        if (currentUser.isVerified && isAccessTokenValid()) {
          setIsAuthenticated(true);
        }
      }
      return currentUser;
    } catch (err) {
      console.error('[Auth] refreshCurrentUser failed', err);
      return null;
    }
  }, [loadCurrentUser]);

  const handleAuthResponse = useCallback((data, mutationName) => {
    const result = data?.[mutationName];
    if (!result) {
      throw new Error('Réponse serveur invalide');
    }

    if (result.success) {
      if (result.accessToken) {
        setTokens(result.accessToken, result.refreshToken);
      }
      if (result.user) {
        setStoredUser(result.user);
        setUser(result.user);
      }
      if (result.accessToken && result.user?.isVerified) {
        setIsAuthenticated(true);
      }
    }
    return result;
  }, []);

  const updateAuthUser = useCallback((nextUser) => {
    if (!nextUser) return;

    setStoredUser(nextUser);
    setUser(nextUser);
    if (nextUser.isVerified && isAccessTokenValid()) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await loginMutation({
          variables: { input: { email, password } },
          context: { skipRefresh: true },
        });
        return handleAuthResponse(data, 'login');
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loginMutation, handleAuthResponse]
  );

  const register = useCallback(
    async (name, email, password, phoneNumber) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await registerMutation({
          variables: { input: { name, email, password, phoneNumber } },
          context: { skipRefresh: true },
        });
        return handleAuthResponse(data, 'register');
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [registerMutation, handleAuthResponse]
  );

  const verifyOtp = useCallback(
    async (userId, code) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await verifyOtpMutation({
          variables: { input: { userId, code } },
          context: { skipRefresh: true },
        });
        return handleAuthResponse(data, 'verifyOtp');
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [verifyOtpMutation, handleAuthResponse]
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshToken = useCallback(
    async () => {
      const currentRefresh = getRefreshToken();
      if (!currentRefresh) return null;

      setLoading(true);
      setError(null);
      try {
        const { data } = await refreshTokenMutation({
          variables: { input: { refreshToken: currentRefresh } },
          context: { skipRefresh: true },
        });

        const result = data?.refreshToken;
        if (!result) {
          throw new Error('Réponse serveur invalide');
        }

        setTokens(result.accessToken, result.refreshToken);
        if (user?.isVerified && isAccessTokenValid()) {
          setIsAuthenticated(true);
        }
        return result;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        logout();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshTokenMutation, logout, user]
  );

  const resendOtp = useCallback(
    async (userId) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await resendOtpMutation({
          variables: { userId },
          context: { skipRefresh: true },
        });
        if (!data?.resendOtp) {
          throw new Error('Réponse serveur invalide');
        }
        return data.resendOtp;
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resendOtpMutation]
  );

  const googleLogin = useCallback(
    async (idToken) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await googleLoginMutation({
          variables: { input: { idToken } },
          context: { skipRefresh: true },
        });
        return handleAuthResponse(data, 'googleLogin');
      } catch (err) {
        const msg = getApiErrorMessage(err);
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [googleLoginMutation, handleAuthResponse]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAccessTokenValid()) {
        if (user?.isVerified) {
          setIsAuthenticated(true);
        }
        if (!user || !user.role) {
          try {
            await loadCurrentUser();
          } catch {
            // ignore
          }
        }
      } else if (getRefreshToken()) {
        try {
          await refreshToken();
          if (!user || !user.role) {
            await loadCurrentUser();
          }
        } catch {
          // ignore
        }
      }
      setAuthReady(true);
    };

    initializeAuth();
  }, [loadCurrentUser, refreshToken, user]);

  const value = {
    user,
    isAuthenticated,
    authReady,
    loading,
    error,
    login,
    register,
    verifyOtp,
    refreshToken,
    resendOtp,
    googleLogin,
    logout,
    refreshCurrentUser,
    updateAuthUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
