import { API_CONFIG } from '../constants/app';
import { graphQLRequest } from './gatewayClient';

const BOOKING_FIELDS = `
  id
  userId
  houseId
  startDate
  endDate
  status
  totalPrice
  createdAt
  updatedAt
`;

const CREATE_BOOKING_MUTATION = `
  mutation CreateBooking($userId: UUID, $input: BookingCreateInput!) {
    createBooking(userId: $userId, input: $input) {
      ${BOOKING_FIELDS}
    }
  }
`;

const MY_BOOKINGS_QUERY = `
  query MyBookings($userId: UUID!, $status: BookingStatus, $page: Int, $size: Int) {
    myBookings(userId: $userId, status: $status, page: $page, size: $size) {
      ${BOOKING_FIELDS}
    }
  }
`;

const CHECK_AVAILABILITY_QUERY = `
  query CheckAvailability($houseId: UUID!, $startDate: Date!, $endDate: Date!) {
    checkAvailability(houseId: $houseId, startDate: $startDate, endDate: $endDate)
  }
`;

export const createBooking = async ({ userId, houseId, startDate, endDate }) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.BOOKING_GRAPHQL_URL,
    query: CREATE_BOOKING_MUTATION,
    variables: {
      userId,
      input: { houseId, startDate, endDate },
    },
  });
  return data.createBooking;
};

export const getMyBookings = async ({ userId, status = null, page = 0, size = 20 }) => {
  if (!userId) return [];
  const data = await graphQLRequest({
    endpoint: API_CONFIG.BOOKING_GRAPHQL_URL,
    query: MY_BOOKINGS_QUERY,
    variables: { userId, status, page, size },
  });
  return data.myBookings || [];
};

export const checkAvailability = async ({ houseId, startDate, endDate }) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.BOOKING_GRAPHQL_URL,
    query: CHECK_AVAILABILITY_QUERY,
    variables: { houseId, startDate, endDate },
  });
  return Boolean(data.checkAvailability);
};
