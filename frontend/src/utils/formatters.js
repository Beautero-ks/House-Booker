import { CURRENCY } from '../constants/app';

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' ' + CURRENCY;
};

export const formatDate = (dateStr, locale = 'fr-FR') => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateLong = (dateStr, locale = 'fr-FR') => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const calculateNights = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
