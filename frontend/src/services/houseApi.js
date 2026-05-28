import { API_CONFIG } from '../constants/app';
import { graphQLRequest } from './gatewayClient';

const HOUSE_FIELDS = `
  id
  titre
  description
  adresse
  type
  prix
  latitude
  longitude
  nombreChambres
  nombreCuisines
  nombreSallesBain
  nombreToilettes
  disponible
  proprietaireId
  statutValidation
  dateCreation
`;

const GET_ALL_HOUSES_QUERY = `
  query GetAllHouses {
    getAll {
      ${HOUSE_FIELDS}
      photos {
        id
        fileName
        contentType
        photoDataUrl
      }
      photoCount
    }
  }
`;

const GET_HOUSE_QUERY = `
  query GetHouse($id: UUID!) {
    getById(id: $id) {
      ${HOUSE_FIELDS}
      photos {
        id
        fileName
        contentType
        photoDataUrl
      }
      photoCount
    }
  }
`;

const GET_HOUSE_PHOTOS_QUERY = `
  query GetHousePhotos($id: UUID!) {
    getLogementPhotos(logementId: $id) {
      id
      fileName
      contentType
      photoDataUrl
    }
  }
`;

const GET_OWNER_HOUSES_QUERY = `
  query GetOwnerHouses($utilisateurId: UUID!) {
    mesLogements(utilisateurId: $utilisateurId) {
      ${HOUSE_FIELDS}
      photos {
        id
        fileName
        contentType
        photoDataUrl
      }
      photoCount
    }
  }
`;

const CREATE_HOUSE_MUTATION = `
  mutation CreateHouse($input: LogementCreateInput!) {
    create(input: $input) {
      ${HOUSE_FIELDS}
    }
  }
`;

const UPDATE_HOUSE_MUTATION = `
  mutation UpdateHouse($id: UUID!, $input: LogementUpdateInput!) {
    mettreAJourLogement(id: $id, input: $input) {
      ${HOUSE_FIELDS}
      photos {
        id
        fileName
        contentType
        photoDataUrl
      }
      photoCount
    }
  }
`;

const DELETE_HOUSE_MUTATION = `
  mutation DeleteHouse($id: UUID!) {
    supprimerLogement(id: $id)
  }
`;

const UPLOAD_HOUSE_PHOTOS_MUTATION = `
  mutation UploadHousePhotos($logementId: UUID!, $files: [Upload!]!) {
    uploadLogementPhotos(logementId: $logementId, files: $files) {
      id
      fileName
      contentType
    }
  }
`;

const validateHouseMutation = `
  mutation ValidateHouse($id: UUID!) {
    validerLogement(id: $id) {
      ${HOUSE_FIELDS}
    }
  }
`;

const rejectHouseMutation = `
  mutation RejectHouse($id: UUID!) {
    rejeterLogement(id: $id) {
      ${HOUSE_FIELDS}
    }
  }
`;

export const normalizeHouse = (house, photos = []) => {
  if (!house) return null;

  const housePhotos = photos
    .map((photo) => ({
      id: photo.id,
      fileName: photo.fileName,
      contentType: photo.contentType,
      url: photo.photoDataUrl,
    }))
    .filter((photo) => Boolean(photo.url));

  return {
    id: house.id,
    title: house.titre,
    description: house.description || '',
    location: house.adresse,
    type: String(house.type || '').toLowerCase(),
    price: Number(house.prix || 0),
    latitude: house.latitude,
    longitude: house.longitude,
    nombreChambres: house.nombreChambres ?? undefined,
    nombreCuisines: house.nombreCuisines ?? undefined,
    nombreSallesBain: house.nombreSallesBain ?? undefined,
    nombreToilettes: house.nombreToilettes ?? undefined,
    disponible: Boolean(house.disponible),
    proprietaireId: house.proprietaireId,
    statutValidation: house.statutValidation,
    dateCreation: house.dateCreation,
    // Do not invent fields client-side; only expose what the backend provides.
    // If the backend returns these fields, they will be present; otherwise omit them.
    rating: house.rating ?? undefined,
    reviewsCount: house.reviewsCount ?? undefined,
    rooms: house.nombreChambres ?? house.rooms ?? undefined,
    kitchens: house.nombreCuisines ?? house.kitchens ?? undefined,
    bathrooms: house.nombreSallesBain ?? house.bathrooms ?? undefined,
    toilets: house.nombreToilettes ?? house.toilets ?? undefined,
    amenities: house.amenities || undefined,
    photoCount: house.photoCount ?? housePhotos.length,
    photos: housePhotos,
    images: housePhotos.map((photo) => photo.url),
  };
};

export const getHousePhotos = async (id) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: GET_HOUSE_PHOTOS_QUERY,
    variables: { id },
  });
  return data.getLogementPhotos || [];
};

export const getHouses = async () => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: GET_ALL_HOUSES_QUERY,
  });
  const houses = data.getAll || [];

  return houses.map((house) => normalizeHouse(house, house.photos || []));
};

export const getOwnerHouses = async (proprietaireId) => {
  if (!proprietaireId) {
    return [];
  }

  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: GET_OWNER_HOUSES_QUERY,
    variables: { utilisateurId: proprietaireId },
  });

  return (data.mesLogements || []).map((house) => normalizeHouse(house, house.photos || []));
};

export const getHouseById = async (id) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: GET_HOUSE_QUERY,
    variables: { id },
  });
  return normalizeHouse(data.getById, data.getById?.photos || []);
};

export const createHouse = async ({
  title,
  titre,
  description,
  price,
  prix,
  location,
  adresse,
  type = 'MAISON',
  latitude = null,
  longitude = null,
  nombreChambres = null,
  nombreCuisines = null,
  nombreSallesBain = null,
  nombreToilettes = null,
  disponible = true,
  proprietaireId,
  photos = [],
}) => {
  if (!proprietaireId) {
    throw new Error('Le proprietaireId est obligatoire pour créer un logement.');
  }

  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: CREATE_HOUSE_MUTATION,
    variables: {
      input: {
        titre: titre || title,
        description,
        adresse: adresse || location,
        type,
        prix: Number(prix ?? price),
        latitude,
        longitude,
        nombreChambres,
        nombreCuisines,
        nombreSallesBain,
        nombreToilettes,
        disponible,
        proprietaireId,
      },
    },
  });

  const createdHouse = data.create;
  if (!photos.length) {
    return normalizeHouse(createdHouse);
  }

  try {
    const uploadData = await graphQLRequest({
      endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
      query: UPLOAD_HOUSE_PHOTOS_MUTATION,
      variables: {
        logementId: createdHouse.id,
        files: photos.map(() => null),
      },
      files: photos,
    });

    return normalizeHouse(createdHouse, uploadData.uploadLogementPhotos || []);
  } catch (error) {
    return {
      ...normalizeHouse(createdHouse),
      photoUploadError: error.message,
    };
  }
};

export const updateHouse = async (id, input) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: UPDATE_HOUSE_MUTATION,
    variables: {
      id,
      input,
    },
  });

  return normalizeHouse(data.mettreAJourLogement, data.mettreAJourLogement?.photos || []);
};

export const deleteHouse = async (id) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: DELETE_HOUSE_MUTATION,
    variables: { id },
  });

  return Boolean(data.supprimerLogement);
};

export const validateHouse = async (id) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: validateHouseMutation,
    variables: { id },
  });
  return normalizeHouse(data.validerLogement);
};

export const rejectHouse = async (id) => {
  const data = await graphQLRequest({
    endpoint: API_CONFIG.HOUSE_GRAPHQL_URL,
    query: rejectHouseMutation,
    variables: { id },
  });
  return normalizeHouse(data.rejeterLogement);
};

export default {
  createHouse,
  deleteHouse,
  getHouseById,
  getHousePhotos,
  getHouses,
  getOwnerHouses,
  rejectHouse,
  updateHouse,
  validateHouse,
};
