import { API_CONFIG } from '../constants/app';
import { restRequest } from './gatewayClient';

export const getUserNotifications = async (userId) => {
  if (!userId) return [];
  const response = await restRequest(`${API_CONFIG.NOTIFICATION_API_URL}/user/${userId}`);
  return response?.data?.content || response?.content || response?.data || response || [];
};

export const getUnreadNotificationCount = async (userId) => {
  if (!userId) return 0;
  const response = await restRequest(`${API_CONFIG.NOTIFICATION_API_URL}/user/${userId}/unread-count`);
  return Number(response?.data ?? response?.count ?? response ?? 0);
};
