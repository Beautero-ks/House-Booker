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

const CANCEL_BOOKING_MUTATION = `
  mutation CancelBooking($bookingId: UUID!, $reason: String, $userId: UUID) {
    cancelBooking(bookingId: $bookingId, reason: $reason, userId: $userId) {
      ${BOOKING_FIELDS}
    }
  }
`;

const CANCEL_BOOKING_BY_OWNER_MUTATION = `
  mutation CancelBookingByOwner($bookingId: UUID!, $reason: String, $ownerId: UUID) {
    cancelBookingByOwner(bookingId: $bookingId, reason: $reason, ownerId: $ownerId) {
      ${BOOKING_FIELDS}
    }
  }
`;

const DELETE_BOOKING_BY_OWNER_MUTATION = `
  mutation DeleteBookingByOwner($bookingId: UUID!, $ownerId: UUID) {
    deleteBookingByOwner(bookingId: $bookingId, ownerId: $ownerId)
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

const ALL_BOOKINGS_QUERY = `
  query AllBookings($page: Int, $size: Int) {
    allBookings(page: $page, size: $size) {
      ${BOOKING_FIELDS}
    }
  }
`;

const OWNER_BOOKINGS_QUERY = `
  query OwnerBookings($ownerId: UUID) {
    ownerBookings(ownerId: $ownerId) {
      ${BOOKING_FIELDS}
    }
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

export const cancelBooking = async ({ bookingId, userId, reason = 'Annulation utilisateur' }) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.BOOKING_GRAPHQL_URL,
    query: CANCEL_BOOKING_MUTATION,
    variables: { bookingId, userId, reason },
  });
  return data.cancelBooking;
};

export const cancelBookingByOwner = async ({ bookingId, ownerId, reason = 'Annulation propriétaire' }) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.BOOKING_GRAPHQL_URL,
    query: CANCEL_BOOKING_BY_OWNER_MUTATION,
    variables: { bookingId, ownerId, reason },
  });
  return data.cancelBookingByOwner;
};

export const deleteBookingByOwner = async ({ bookingId, ownerId }) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.BOOKING_GRAPHQL_URL,
    query: DELETE_BOOKING_BY_OWNER_MUTATION,
    variables: { bookingId, ownerId },
  });
  return Boolean(data.deleteBookingByOwner);
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

export const getAllBookings = async ({ page = 0, size = 50 } = {}) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.BOOKING_GRAPHQL_URL,
    query: ALL_BOOKINGS_QUERY,
    variables: { page, size },
  });
  return data.allBookings || [];
};

export const getOwnerBookings = async (ownerId) => {
  if (!ownerId) return [];
  const data = await graphQLRequest({
    endpoint: API_CONFIG.BOOKING_GRAPHQL_URL,
    query: OWNER_BOOKINGS_QUERY,
    variables: { ownerId },
  });
  return data.ownerBookings || [];
};
