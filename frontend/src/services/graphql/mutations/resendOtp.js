import { gql } from '@apollo/client';

export const RESEND_OTP_MUTATION = gql`
  mutation ResendOtp($userId: String!) {
    resendOtp(userId: $userId) {
      success
      message
    }
  }
`;
