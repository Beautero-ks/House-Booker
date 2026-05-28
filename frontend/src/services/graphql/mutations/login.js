import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
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
