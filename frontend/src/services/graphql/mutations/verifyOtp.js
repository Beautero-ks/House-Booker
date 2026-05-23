import { gql } from '@apollo/client';

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      success
      message
      accessToken
      refreshToken
      user {
        id
        name
        email
        isVerified
      }
    }
  }
`;
