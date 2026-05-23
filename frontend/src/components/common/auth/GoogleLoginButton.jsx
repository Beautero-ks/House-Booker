import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { API_CONFIG } from '../../../constants/app';

const GoogleLoginButton = ({ redirectTo = ROUTES.DASHBOARD, onSuccessCallback, onErrorCallback }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      if (credentialResponse.credential) {
        await googleLogin(credentialResponse.credential);
        if (onSuccessCallback) {
          onSuccessCallback();
        } else {
          navigate(redirectTo, { replace: true });
        }
      } else if (onErrorCallback) {
        onErrorCallback('Google Sign-In did not return a credential.');
      }
    } catch (err) {
      console.error('Google login failed:', err);
      if (onErrorCallback) onErrorCallback(err.message);
    }
  };

  if (!API_CONFIG.GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="w-full flex justify-center my-4 overflow-hidden">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          if (onErrorCallback) onErrorCallback('Google Sign-In was unsuccessful. Try again later.');
        }}
        useOneTap={false}
        shape="rectangular"
        theme="outline"
        size="large"
        text="continue_with"
        width="320"
      />
    </div>
  );
};

export default GoogleLoginButton;
