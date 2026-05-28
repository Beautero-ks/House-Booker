import { ApolloProvider } from '@apollo/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { API_CONFIG } from '../constants/app';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import client from '../services/apolloClient';

const AppProviders = ({ children }) => {
  const app = (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );

  return (
    <BrowserRouter>
      <ApolloProvider client={client}>
        {API_CONFIG.GOOGLE_CLIENT_ID ? (
          <GoogleOAuthProvider clientId={API_CONFIG.GOOGLE_CLIENT_ID}>
            {app}
          </GoogleOAuthProvider>
        ) : app}
      </ApolloProvider>
    </BrowserRouter>
  );
};

export default AppProviders;
