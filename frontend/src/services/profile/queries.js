import { gql } from '@apollo/client';

export const GET_CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      name
      username
      email
      photoUrl
      phoneNumber
      isVerified
      enabled
      provider
      role
      createdAt
      updatedAt
    }
  }
`;
