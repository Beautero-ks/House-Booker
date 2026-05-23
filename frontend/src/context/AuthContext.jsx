import { createContext, useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../services/graphql/mutations/login';
import { REGISTER_MUTATION } from '../services/graphql/mutations/register';
import { VERIFY_OTP_MUTATION } from '../services/graphql/mutations/verifyOtp';
import { REFRESH_TOKEN_MUTATION } from '../services/graphql/mutations/refreshToken';
import { RESEND_OTP_MUTATION } from '../services/graphql/mutations/resendOtp';
import { GOOGLE_LOGIN_MUTATION } from '../services/graphql/mutations/googleLogin';
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
  const [user, setUser] = useState(getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(isAccessTokenValid());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [verifyOtpMutation] = useMutation(VERIFY_OTP_MUTATION);
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);
  const [resendOtpMutation] = useMutation(RESEND_OTP_MUTATION);
  const [googleLoginMutation] = useMutation(GOOGLE_LOGIN_MUTATION);

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

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginMutation({
        variables: { input: { email, password } },
      });
      return handleAuthResponse(data, 'login');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loginMutation, handleAuthResponse]);

  const register = useCallback(async (name, email, password, phoneNumber) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await registerMutation({
        variables: { input: { name, email, password, phoneNumber } },
      });
      return handleAuthResponse(data, 'register');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [registerMutation, handleAuthResponse]);

  const verifyOtp = useCallback(async (userId, code) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await verifyOtpMutation({
        variables: { input: { userId, code } },
      });
      return handleAuthResponse(data, 'verifyOtp');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [verifyOtpMutation, handleAuthResponse]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshToken = useCallback(async () => {
    const currentRefresh = getRefreshToken();
    if (!currentRefresh) return null;
    try {
      const { data } = await refreshTokenMutation({
        variables: { input: { refreshToken: currentRefresh } },
      });
      return handleAuthResponse(data, 'refreshToken');
    } catch (err) {
      setError(getApiErrorMessage(err));
      logout();
      throw err;
    }
  }, [refreshTokenMutation, handleAuthResponse, logout]);

  const resendOtp = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await resendOtpMutation({
        variables: { userId },
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
  }, [resendOtpMutation]);

  const googleLogin = useCallback(async (idToken) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await googleLoginMutation({
        variables: { input: { idToken } },
      });
      return handleAuthResponse(data, 'googleLogin');
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [googleLoginMutation, handleAuthResponse]);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    verifyOtp,
    refreshToken,
    resendOtp,
    googleLogin,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
