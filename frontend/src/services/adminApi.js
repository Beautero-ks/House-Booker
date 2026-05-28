import { API_CONFIG } from '../constants/app';
import { graphQLRequest } from './gatewayClient';

const GET_USERS_QUERY = `
  query GetUsers($page: Int, $size: Int) {
    getUsers(page: $page, size: $size) {
      items {
        id
        name
        email
        username
        phoneNumber
        photoUrl
        role
        enabled
        isVerified
        createdAt
      }
      page
      size
      totalElements
      totalPages
    }
  }
`;

const USER_FIELDS = `
  id
  name
  email
  username
  phoneNumber
  photoUrl
  role
  enabled
  isVerified
  createdAt
`;

const BLOCK_USER_MUTATION = `
  mutation BlockUser($userId: String!) {
    blockUser(userId: $userId) {
      ${USER_FIELDS}
    }
  }
`;

const UNBLOCK_USER_MUTATION = `
  mutation UnblockUser($userId: String!) {
    unblockUser(userId: $userId) {
      ${USER_FIELDS}
    }
  }
`;

const DELETE_USER_MUTATION = `
  mutation DeleteUserByAdmin($userId: String!) {
    deleteUserByAdmin(userId: $userId) {
      success
      message
    }
  }
`;

const ASSIGN_ROLE_MUTATION = `
  mutation AssignRole($input: AssignRoleInput!) {
    assignRole(input: $input) {
      ${USER_FIELDS}
    }
  }
`;

export const getUsers = async ({ page = 0, size = 50 } = {}) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.AUTH_GRAPHQL_URL,
    query: GET_USERS_QUERY,
    variables: { page, size },
  });
  const result = data.getUsers;
  return {
    users: result?.items || [],
    total: result?.totalElements || 0,
    page: result?.page || 0,
    size: result?.size || size,
    totalPages: result?.totalPages || 0,
  };
};

export const blockUser = async (userId) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.AUTH_GRAPHQL_URL,
    query: BLOCK_USER_MUTATION,
    variables: { userId },
  });
  return data.blockUser;
};

export const unblockUser = async (userId) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.AUTH_GRAPHQL_URL,
    query: UNBLOCK_USER_MUTATION,
    variables: { userId },
  });
  return data.unblockUser;
};

export const deleteUserByAdmin = async (userId) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.AUTH_GRAPHQL_URL,
    query: DELETE_USER_MUTATION,
    variables: { userId },
  });
  return data.deleteUserByAdmin;
};

export const assignRole = async ({ userId, role }) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.AUTH_GRAPHQL_URL,
    query: ASSIGN_ROLE_MUTATION,
    variables: {
      input: { userId, role },
    },
  });
  return data.assignRole;
};
