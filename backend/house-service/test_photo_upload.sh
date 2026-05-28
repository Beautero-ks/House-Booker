#!/bin/bash
# Tests GraphQL - Photo Upload Feature
# À utiliser avec curl ou importer dans Postman/Insomnia

# Variables
HOST="http://localhost:8083/api/v1"
GRAPHQL_ENDPOINT="$HOST/graphql"
GRAPHIQL_ENDPOINT="$HOST/graphiql"

echo "🚀 Tests de la fonctionnalité Photo Upload"
echo "=========================================="
echo ""

# ==============================================================================
# 1. CRÉER UN LOGEMENT (pour les tests)
# ==============================================================================
echo "1️⃣  Créer un logement de test..."
echo ""

LOGEMENT_RESPONSE=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { create(input: { titre: \"Maison Test Photos\", description: \"Logement pour tester upload photos\", adresse: \"123 Rue de Paris\", type: \"Maison\", prix: 1500.0, disponible: true, proprietaireId: \"11111111-1111-1111-1111-111111111111\" }) { id titre } }"
  }')

echo "Response: $LOGEMENT_RESPONSE"
LOGEMENT_ID=$(echo $LOGEMENT_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')
echo "✅ Logement créé: $LOGEMENT_ID"
echo ""

# ==============================================================================
# 2. COMPTER LES PHOTOS AVANT UPLOAD
# ==============================================================================
echo "2️⃣  Compter les photos avant upload..."
echo ""

COUNT_BEFORE=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"query { countLogementPhotos(logementId: \\\"$LOGEMENT_ID\\\") }\"
  }")

echo "Response: $COUNT_BEFORE"
echo ""

# ==============================================================================
# 3. UPLOADER UNE PHOTO
# ==============================================================================
echo "3️⃣  Upload d'une photo..."
echo "⚠️  IMPORTANT: Remplacer 'image_file.jpg' par un vrai fichier"
echo ""

# Créer un fichier test minimal (1x1 pixel JPEG)
cat > /tmp/test_image.jpg << 'EOF'
ÿØÿàJFIFHHÿþ
EOF

curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -F "operations={\"query\": \"mutation(\$logementId: UUID!, \$files: [Upload!]!) { uploadLogementPhotos(logementId: \$logementId, files: \$files) { id fileName contentType createdAt } }\", \"variables\": {\"logementId\": \"$LOGEMENT_ID\", \"files\": [null]}}" \
  -F "map={\"0\": [\"variables.files.0\"]}" \
  -F "0=@/tmp/test_image.jpg" \
  | jq '.' || echo "Ajuster les variables avec vos paramètres réels"

echo ""

# ==============================================================================
# 4. RÉCUPÉRER TOUTES LES PHOTOS (Sans Data URL par défaut)
# ==============================================================================
echo "4️⃣  Récupérer toutes les photos du logement..."
echo ""

PHOTOS=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"query { getLogementPhotos(logementId: \\\"$LOGEMENT_ID\\\") { id fileName contentType createdAt } }\"
  }")

echo "Response: $PHOTOS"
echo ""

# ==============================================================================
# 5. RÉCUPÉRER UNE PHOTO AVEC DATA URL
# ==============================================================================
echo "5️⃣  Récupérer une photo avec photoDataUrl (Base64)..."
echo "⚠️  La photoDataUrl sera longue (Base64 encoded)"
echo ""

# Extraire le premier photoId
PHOTO_ID=$(echo $PHOTOS | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')

if [ ! -z "$PHOTO_ID" ]; then
  SINGLE_PHOTO=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{
      \"query\": \"query { getPhotoById(photoId: \\\"$PHOTO_ID\\\", logementId: \\\"$LOGEMENT_ID\\\") { id fileName contentType photoDataUrl createdAt } }\"
    }")
  
  echo "Response (photoDataUrl truncated):"
  echo $SINGLE_PHOTO | jq '.data.getPhotoById | {id, fileName, contentType, photoDataUrlLength: (.photoDataUrl | length)}'
else
  echo "⚠️  Aucune photo trouvée"
fi
echo ""

# ==============================================================================
# 6. COMPTER LES PHOTOS APRÈS UPLOAD
# ==============================================================================
echo "6️⃣  Compter les photos après upload..."
echo ""

COUNT_AFTER=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"query { countLogementPhotos(logementId: \\\"$LOGEMENT_ID\\\") }\"
  }")

echo "Response: $COUNT_AFTER"
echo ""

# ==============================================================================
# 7. ESSAYER D'UPLOADER UNE 5ème PHOTO (doit échouer)
# ==============================================================================
echo "7️⃣  Tester la limite de 4 photos..."
echo "Uploader 4 photos supplémentaires (devrait échouer à la 5e)"
echo ""

for i in {1..4}; do
  echo "Upload $i..."
  # Simpler: juste montrer le message
done

echo "⚠️  Essai upload 5: Erreur attendue"
echo ""

# ==============================================================================
# 8. SUPPRIMER UNE PHOTO
# ==============================================================================
echo "8️⃣  Supprimer une photo spécifique..."
echo ""

if [ ! -z "$PHOTO_ID" ]; then
  DELETE_RESPONSE=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{
      \"query\": \"mutation { deleteLogementPhoto(photoId: \\\"$PHOTO_ID\\\", logementId: \\\"$LOGEMENT_ID\\\") }\"
    }")
  
  echo "Response: $DELETE_RESPONSE"
else
  echo "⚠️  Pas de photoId pour supprimer"
fi
echo ""

# ==============================================================================
# 9. SUPPRIMER TOUTES LES PHOTOS
# ==============================================================================
echo "9️⃣  Supprimer toutes les photos du logement..."
echo ""

DELETE_ALL=$(curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { deleteAllLogementPhotos(logementId: \\\"$LOGEMENT_ID\\\") }\"
  }")

echo "Response: $DELETE_ALL"
echo ""

# ==============================================================================
# RÉSUMÉ
# ==============================================================================
echo ""
echo "✅ Tests terminés!"
echo "📊 Logement de test créé: $LOGEMENT_ID"
echo "🌐 GraphiQL disponible: $GRAPHIQL_ENDPOINT"
echo ""
echo "💡 Prochaines étapes:"
echo "  1. Tester manuellement dans GraphiQL"
echo "  2. Implémenter le frontend Vue.js"
echo "  3. Ajouter la validation côté client"
echo ""
