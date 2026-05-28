import { gql } from '@apollo/client';

export const GOOGLE_LOGIN_MUTATION = gql`
  mutation GoogleLogin($input: GoogleAuthInput) {
    googleLogin(input: $input) {
      success
      message
      accessToken
      refreshToken
      user {
        id
        name
        email
        isVerified
        enabled
        role
      }
    }
  }
`;
