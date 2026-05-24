/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} name
 * @property {string|null} username
 * @property {string} email
 * @property {string|null} photoUrl
 * @property {string|null} phoneNumber
 * @property {boolean} isVerified
 * @property {boolean} enabled
 * @property {string|null} provider
 * @property {string|null} role
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 */

export const PROFILE_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  PROPRIETAIRE: 'PROPRIETAIRE',
};

export const ROLE_PERMISSIONS = {
  ADMIN: ['Gestion des utilisateurs', 'Accès à l’administration', 'Modification de rôles'],
  USER: ['Réservation', 'Messagerie', 'Accès standard'],
  PROPRIETAIRE: ['Gestion de logements', 'Accès propriétaire'],
};
