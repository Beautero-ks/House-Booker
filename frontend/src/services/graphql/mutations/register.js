import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      accessToken
      refreshToken
      user {
        id
        name
        email
        phoneNumber
        isVerified
        enabled
        role
        createdAt
      }
    }
  }
`;
