import { gql } from '@apollo/client';

export const GET_CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      name
      email
      username
      phoneNumber
      photoUrl
      isVerified
      enabled
      role
      createdAt
      updatedAt
    }
  }
`;
