# ============================================================
# GRAPHQL QUERIES & MUTATIONS - Photo Upload
# ============================================================
# À copier-coller dans GraphiQL (http://localhost:8083/api/v1/graphiql)
#
# Instructions:
# 1. Ouvrir GraphiQL dans le navigateur
# 2. Copier une requête ci-dessous dans le panneau gauche
# 3. Remplacer les IDs par les vôtres
# 4. Cliquer sur le bouton play ▶️
# ============================================================

# ============================================================
# 1. COMPTER LES PHOTOS D'UN LOGEMENT
# ============================================================
# Description: Retourne le nombre de photos uploadées
# Remplacer: {LOGEMENT_ID} par l'UUID réel du logement

query CountPhotos {
  countLogementPhotos(logementId: "123e4567-e89b-12d3-a456-426614174000")
}

# ============================================================
# 2. RÉCUPÉRER TOUTES LES PHOTOS (Sans données Base64)
# ============================================================
# Description: Liste les métadonnées de toutes les photos
# Remplacer: {LOGEMENT_ID} par l'UUID réel du logement

query GetAllPhotos {
  getLogementPhotos(logementId: "123e4567-e89b-12d3-a456-426614174000") {
    id
    logementId
    fileName
    contentType
    createdAt
  }
}

# ============================================================
# 3. RÉCUPÉRER UNE PHOTO AVEC DATA URL (Base64)
# ============================================================
# Description: Récupère une photo avec l'URL Data encodée
# Remplacer: 
#   {PHOTO_ID} par l'UUID de la photo
#   {LOGEMENT_ID} par l'UUID du logement

query GetSinglePhoto {
  getPhotoById(
    photoId: "photo-uuid-here"
    logementId: "123e4567-e89b-12d3-a456-426614174000"
  ) {
    id
    fileName
    contentType
    photoDataUrl
    createdAt
  }
}

# ============================================================
# 4. UPLOADER DES PHOTOS
# ============================================================
# Description: Upload 1 ou plusieurs photos (max 4 total)
# 
# Instructions pour GraphiQL:
# 1. Copier cette mutation
# 2. Remplacer {LOGEMENT_ID} par l'UUID réel
# 3. Cliquer sur "Choose Files" en bas si disponible
# 4. Sélectionner 1-4 fichiers JPG/PNG
# 5. Exécuter

mutation UploadPhotos {
  uploadLogementPhotos(
    logementId: "123e4567-e89b-12d3-a456-426614174000"
    files: []
  ) {
    id
    fileName
    contentType
    createdAt
  }
}

# ============================================================
# 5. SUPPRIMER UNE PHOTO SPÉCIFIQUE
# ============================================================
# Description: Supprime une seule photo
# Remplacer:
#   {PHOTO_ID} par l'UUID de la photo à supprimer
#   {LOGEMENT_ID} par l'UUID du logement

mutation DeleteSinglePhoto {
  deleteLogementPhoto(
    photoId: "photo-uuid-here"
    logementId: "123e4567-e89b-12d3-a456-426614174000"
  )
}

# ============================================================
# 6. SUPPRIMER TOUTES LES PHOTOS D'UN LOGEMENT
# ============================================================
# Description: Supprime toutes les photos du logement
# Remplacer: {LOGEMENT_ID} par l'UUID réel du logement

mutation DeleteAllPhotos {
  deleteAllLogementPhotos(logementId: "123e4567-e89b-12d3-a456-426614174000")
}

# ============================================================
# SCÉNARIO DE TEST COMPLET
# ============================================================
#
# Étape 1: Créer un logement (mutation existante)
# Étape 2: Noter l'ID du logement
# Étape 3: Utiliser "COMPTER LES PHOTOS (Query 1)" → doit retourner 0
# Étape 4: Utiliser "UPLOADER DES PHOTOS (Mutation 4)" avec 2 fichiers
# Étape 5: Utiliser "COMPTER LES PHOTOS (Query 1)" → doit retourner 2
# Étape 6: Utiliser "RÉCUPÉRER TOUTES (Query 2)" → voir les 2 photos
# Étape 7: Noter un photoId
# Étape 8: Utiliser "RÉCUPÉRER UNE PHOTO (Query 3)" avec ce photoId
# Étape 9: Utiliser "SUPPRIMER UNE (Mutation 5)" → supprime cette photo
# Étape 10: Utiliser "COMPTER LES PHOTOS (Query 1)" → doit retourner 1
# Étape 11: Utiliser "SUPPRIMER TOUTES (Mutation 6)" → supprime la dernière
# Étape 12: Utiliser "COMPTER LES PHOTOS (Query 1)" → doit retourner 0

# ============================================================
# EXEMPLE DE RÉPONSE: Mutation Upload
# ============================================================
#
# {
#   "data": {
#     "uploadLogementPhotos": [
#       {
#         "id": "550e8400-e29b-41d4-a716-446655440000",
#         "fileName": "salon.jpg",
#         "contentType": "image/jpeg",
#         "createdAt": "2026-05-25T14:30:00+02:00"
#       },
#       {
#         "id": "550e8400-e29b-41d4-a716-446655440001",
#         "fileName": "chambre.png",
#         "contentType": "image/png",
#         "createdAt": "2026-05-25T14:30:01+02:00"
#       }
#     ]
#   }
# }

# ============================================================
# EXEMPLE DE RÉPONSE: Query avec photoDataUrl
# ============================================================
#
# {
#   "data": {
#     "getPhotoById": {
#       "id": "550e8400-e29b-41d4-a716-446655440000",
#       "fileName": "salon.jpg",
#       "contentType": "image/jpeg",
#       "photoDataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg==...",
#       "createdAt": "2026-05-25T14:30:00+02:00"
#     }
#   }
# }

# ============================================================
# MESSAGES D'ERREUR POSSIBLES
# ============================================================
#
# "Logement avec l'ID ... non trouvé"
#   → Vérifier que le logementId existe
#
# "Limite de photos dépassée: 4 existantes + 1 nouvelles > 4 autorisées"
#   → Supprimer au moins 1 photo avant d'en uploader
#
# "Le fichier est trop volumineux (max 5 MB)"
#   → Le fichier est > 5 MB, réduire la taille
#
# "Type de fichier non autorisé. Utilisez JPG, PNG ou GIF."
#   → Uploader un fichier image valide (pas PDF, doc, etc.)
#
# "Le fichier est vide"
#   → Le fichier sélectionné est vide ou corrompu

# ============================================================
# VARIABLES GraphQL (pour requêtes avec paramètres)
# ============================================================
#
# Si vous utilisez les "Query Variables" dans GraphiQL:
#
# {
#   "logementId": "123e4567-e89b-12d3-a456-426614174000",
#   "photoId": "550e8400-e29b-41d4-a716-446655440000",
#   "files": null
# }
#
# Puis utiliser:
# query GetPhotos($logementId: UUID!) {
#   getLogementPhotos(logementId: $logementId) { ... }
# }

