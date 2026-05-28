# Upload de Photos - Guide d'implémentation

## 📋 Vue d'ensemble

Cette fonctionnalité permet d'uploader jusqu'à **4 photos par logement** directement dans la base de données PostgreSQL (stockage BYTEA).

## 🏗️ Architecture implémentée

### Entités JPA
- **LogementPhoto** : Représente une photo uploadée
  - `id` (UUID) : Identifiant unique
  - `logementId` (UUID) : Référence au logement
  - `fileName` (String) : Nom du fichier
  - `contentType` (String) : Type MIME (image/jpeg, image/png, etc.)
  - `photoData` (BYTEA) : Contenu du fichier en binaire
  - `createdAt` (DateTime) : Date de création

### Services
- **LogementPhotoService** : Logique métier
  - Upload avec validation (max 4 photos, max 5 MB)
  - Gestion des photos (créer, lire, supprimer)
  - Encodage Base64 pour GraphQL

### Repository
- **LogementPhotoRepository** : Accès aux données
  - Recherche par logement
  - Comptage des photos
  - Suppressions en cascade

### Mappers
- **LogementPhotoMapper** : Conversion Entité ↔ DTO

## 📊 Schéma GraphQL

### Types
```graphql
type LogementPhoto {
    id: UUID!
    logementId: UUID!
    fileName: String!
    contentType: String!
    photoDataUrl: String        # Data URL Base64
    createdAt: DateTime!
}
```

### Scalars supportés
- `Upload` : Pour les uploads de fichiers multipart
- `UUID` : Identifiants
- `DateTime` : Timestamps
- `Long` : Compteurs

## 🚀 Utilisation GraphQL

### 1️⃣ Upload de photos

```graphql
mutation {
  uploadLogementPhotos(
    logementId: "123e4567-e89b-12d3-a456-426614174000"
    files: [file1.jpg, file2.png]
  ) {
    id
    fileName
    contentType
    createdAt
  }
}
```

**Règles de validation :**
- Max 4 photos par logement (vérifié : existing + new ≤ 4)
- Max 5 MB par fichier
- Types autorisés : JPG, PNG, GIF, WebP
- Tous les fichiers sont validés avant upload

**Codes d'erreur :**
```
"Logement avec l'ID ... non trouvé"
"Limite de photos dépassée: X existantes + Y nouvelles > 4 autorisées"
"Le fichier est vide"
"Le fichier est trop volumineux (max 5 MB)"
"Type de fichier non autorisé. Utilisez JPG, PNG ou GIF."
```

### 2️⃣ Récupérer les photos d'un logement

```graphql
query {
  getLogementPhotos(logementId: "123e4567-e89b-12d3-a456-426614174000") {
    id
    fileName
    contentType
    photoDataUrl    # "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    createdAt
  }
}
```

### 3️⃣ Récupérer une photo spécifique

```graphql
query {
  getPhotoById(
    photoId: "photo-id-uuid"
    logementId: "logement-id-uuid"
  ) {
    id
    fileName
    contentType
    photoDataUrl
    createdAt
  }
}
```

### 4️⃣ Compter les photos

```graphql
query {
  countLogementPhotos(logementId: "123e4567-e89b-12d3-a456-426614174000")
}
```

Retourne : `2` (nombre entier)

### 5️⃣ Supprimer une photo

```graphql
mutation {
  deleteLogementPhoto(
    photoId: "photo-id-uuid"
    logementId: "logement-id-uuid"
  )
}
```

Retourne : `true` ou erreur

### 6️⃣ Supprimer toutes les photos

```graphql
mutation {
  deleteAllLogementPhotos(logementId: "123e4567-e89b-12d3-a456-426614174000")
}
```

Retourne : `true` ou erreur

## 🔧 Configuration

### Spring Boot (application.yaml)
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 5MB         # Max par fichier
      max-request-size: 20MB     # Max par requête

  graphql:
    graphiql:
      enabled: true
```

### GraphQL Config (GraphQLConfig.java)
```java
wiringBuilder
    .scalar(ExtendedScalars.UUID)
    .scalar(ExtendedScalars.DateTime)
    .scalar(ExtendedScalars.Long)
    .scalar(ExtendedScalars.Upload)  // Support multipart
```

## 💾 Stockage PostgreSQL

### Table créée automatiquement (Hibernate DDL)
```sql
CREATE TABLE logement_photo (
    id UUID PRIMARY KEY,
    logement_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    photo_data BYTEA,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (logement_id) REFERENCES logement(id)
);

CREATE INDEX idx_logement_photo_logement_id ON logement_photo(logement_id);
```

## 🔐 Règles métier appliquées

| Règle | Implémentation | Vérification |
|-------|-----------------|--------------|
| Max 4 photos/logement | LogementPhotoService | ✅ Avant chaque upload |
| Max 5 MB/fichier | validateFile() | ✅ Validation MultipartFile |
| Types image valides | isValidImageType() | ✅ Content-Type check |
| Logement existe | LogementRepository.existsById() | ✅ Validation au démarrage |
| Suppression en cascade | deleteByLogementId() | ✅ Repository custom |
| Encodage Base64 | convertToDto() | ✅ Data URL pour frontend |

## 📝 DTOs utilisés

### LogementPhotoDto
```java
UUID id
UUID logementId
String fileName
String contentType
String photoDataUrl        // Base64 encoded
OffsetDateTime createdAt
```

### LogementResponseDto (pour intégration future)
```java
// ... champs logement
List<LogementPhotoDto> photos
Integer photoCount
```

## ⚙️ Intégration avec le frontend

### Upload avec FormData (JavaScript)
```javascript
const formData = new FormData();
const logementId = "123e4567-e89b-12d3-a456-426614174000";
formData.append('logementId', logementId);
formData.append('files', fileInput1);
formData.append('files', fileInput2);

const query = `
  mutation($logementId: UUID!, $files: [Upload!]!) {
    uploadLogementPhotos(logementId: $logementId, files: $files) {
      id
      fileName
      photoDataUrl
      createdAt
    }
  }
`;

fetch('/graphql', {
  method: 'POST',
  body: formData,
  headers: {
    'Accept': 'application/json'
  }
});
```

### Affichage des photos (HTML)
```html
<img src="data:image/jpeg;base64,..." alt="Photo logement" />
```

## 🧪 Tests manuels

### Avec GraphiQL (http://localhost:8083/api/v1/graphiql)

1. **Upload simple**
   - Créer un logement d'abord
   - Uploader 1 photo
   - Vérifier en base: `SELECT COUNT(*) FROM logement_photo WHERE logement_id = '...'`

2. **Validation limite de photos**
   - Uploader 4 photos
   - Essayer d'en uploader une 5e → Erreur attendue

3. **Validation taille fichier**
   - Créer un fichier > 5MB
   - Uploader → Erreur attendue

4. **Validation type fichier**
   - Uploader un PDF au lieu d'image → Erreur attendue

## 🐛 Logs disponibles

```bash
# Niveau DEBUG activé dans application.yaml
logging:
  level:
    com.intergiciel.house_service: DEBUG
    org.springframework.graphql: DEBUG
```

Logs disponibles:
- `uploadLogementPhotos` : Début upload avec count
- `Validation du fichier` : Pour chaque fichier
- `Photo sauvegardée` : Confirmations d'upload
- `Error uploading photos` : En cas d'exception

## 📦 Fichiers créés/modifiés

### Créés
✅ LogementPhoto.java (Entité)
✅ LogementPhotoDto.java (DTO)
✅ LogementResponseDto.java (DTO Response)
✅ LogementPhotoRepository.java (Repository)
✅ LogementPhotoService.java (Service)
✅ LogementPhotoMapper.java (Mapper)
✅ PHOTO_UPLOAD_GUIDE.md (Cette doc)

### Modifiés
✅ LogementController.java (+6 mutations/queries)
✅ schema.graphqls (+type, +queries, +mutations)
✅ GraphQLConfig.java (+scalars Upload, Long)
✅ application.yaml (+multipart config)

## 🚀 Démarrage du service

```bash
cd backend/house-service
mvn clean install
mvn spring-boot:run
```

Service accessible à: http://localhost:8083/api/v1
GraphiQL: http://localhost:8083/api/v1/graphiql

## ⚡ Performances

- **Stockage en BYTEA** : ✅ Plus simple que filesystem
- **Encodage Base64** : ⚠️ +33% taille en GraphQL (normal)
- **Indexation** : ✅ Créée sur logement_id
- **Limite de requête** : 20MB (configurable)

## 🔍 Prochaines améliorations possibles

1. Compression des images avant stockage
2. Génération de thumbnails
3. Endpoint REST pour télécharger photos directement
4. Validation des dimensions d'image
5. Stockage CDN optionnel (S3, etc.)
6. Rotation d'image basée sur EXIF
7. Pagination des photos
8. Watermarking

---

**Version** : 1.0
**Date** : Mai 2026
**Java** : 21
**Spring Boot** : 3.5.14
