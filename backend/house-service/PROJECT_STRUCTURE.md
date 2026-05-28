```
house-service/
│
├── 📄 pom.xml                                    [✅ Inchangé - dépendances OK]
│   ├─ spring-boot-starter-graphql
│   ├─ spring-boot-starter-data-jpa
│   ├─ spring-boot-starter-web
│   ├─ graphql-java-extended-scalars:21.0
│   └─ postgresql (JDBC)
│
├── 📄 compose.yaml                              [✅ Inchangé]
│
├── 📂 src/main/
│   │
│   ├── 📂 java/com/intergiciel/house_service/
│   │   │
│   │   ├── 📄 HouseServiceApplication.java      [✅ Inchangé]
│   │   │
│   │   ├── 📂 entity/
│   │   │   ├── 📄 Logement.java                 [✅ Inchangé]
│   │   │   ├── 📄 StatutValidation.java         [✅ Inchangé]
│   │   │   └── 🆕 LogementPhoto.java            [✅ NOUVEAU - Entité BYTEA]
│   │   │
│   │   ├── 📂 dto/
│   │   │   ├── 📄 LogementCreateDto.java        [✅ Inchangé]
│   │   │   ├── 📄 LogementDto.java              [✅ Inchangé]
│   │   │   ├── 📄 LogementUpdateDto.java        [✅ Inchangé]
│   │   │   ├── 📄 LogementCreateInput.java      [✅ Inchangé]
│   │   │   ├── 📄 LogementSearchCriteria.java   [✅ Inchangé]
│   │   │   ├── 📄 LogementValidationDto.java    [✅ Inchangé]
│   │   │   ├── 🆕 LogementPhotoDto.java         [✅ NOUVEAU - DTO avec Base64]
│   │   │   └── 🆕 LogementResponseDto.java      [✅ NOUVEAU - Response enrichie]
│   │   │
│   │   ├── 📂 repository/
│   │   │   ├── 📄 LogementRepository.java       [✅ Inchangé]
│   │   │   └── 🆕 LogementPhotoRepository.java  [✅ NOUVEAU - Repository custom]
│   │   │
│   │   ├── 📂 service/
│   │   │   ├── 📄 LogementService.java          [✅ Inchangé]
│   │   │   └── 🆕 LogementPhotoService.java     [✅ NOUVEAU - Logique upload]
│   │   │
│   │   ├── 📂 mapper/
│   │   │   ├── 📄 LogementMapper.java           [✅ Inchangé]
│   │   │   └── 🆕 LogementPhotoMapper.java      [✅ NOUVEAU - Entité↔DTO]
│   │   │
│   │   ├── 📂 controller/
│   │   │   ├── 📄 LogementController.java       [🔄 MODIFIÉ +6 méthodes]
│   │   │   └── 📄 TestController.java           [✅ Inchangé]
│   │   │
│   │   ├── 📂 exception/
│   │   │   ├── 📄 LogementNotFoundException.java [✅ Inchangé]
│   │   │   └── 📄 GlobalExceptionHandler.java    [✅ Inchangé]
│   │   │
│   │   └── 📂 config/
│   │       └── 📄 GraphQLConfig.java            [🔄 MODIFIÉ +2 scalars]
│   │
│   └── 📂 resources/
│       ├── 📄 application.yaml                  [🔄 MODIFIÉ +multipart config]
│       │
│       └── 📂 graphql/
│           └── 📄 schema.graphqls               [🔄 MODIFIÉ +type +queries +mutations]
│
├── 📂 src/test/                                 [✅ Inchangé]
│
└── 📚 DOCUMENTATION/
    ├── 🆕 PHOTO_UPLOAD_GUIDE.md                 [✅ NOUVEAU - Guide complet]
    ├── 🆕 GRAPHQL_QUERIES.md                    [✅ NOUVEAU - Requêtes prêtes]
    ├── 🆕 test_photo_upload.sh                  [✅ NOUVEAU - Script test]
    ├── 🆕 IMPLEMENTATION_SUMMARY.md             [✅ NOUVEAU - Résumé]
    └── 🆕 VERIFICATION_CHECKLIST.md             [✅ NOUVEAU - Checklist]

═══════════════════════════════════════════════════════════════════════════════
RÉSUMÉ DES MODIFICATIONS
═══════════════════════════════════════════════════════════════════════════════

FICHIERS CRÉÉS:       7 fichiers Java + 5 docs = 12 fichiers
FICHIERS MODIFIÉS:    4 fichiers
FICHIERS INCHANGÉS:   10+ fichiers
NOUVELLES LIGNES:     ~1500 LOC
DÉPENDANCES:          ✅ Aucune nouvelle (tout déjà en pom.xml)

═══════════════════════════════════════════════════════════════════════════════
ARCHITECTURE COMPLÈTE
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│                        GraphQL Client (Frontend)                │
│              ┌─ Vue.js / React / Mobile App ─┐                  │
└────────────────────┬────────────────────────────────────────────┘
                     │ GraphQL Query/Mutation
                     │ (multipart FormData for Upload)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Spring GraphQL Endpoint                         │
│         POST /api/v1/graphql (WebGraphQLHandler)               │
└────────────────────┬────────────────────────────────────────────┘
                     │ Resolver dispatch
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              GraphQL Resolvers (Controller)                      │
│  ┌─ uploadLogementPhotos()                                      │
│  ├─ getLogementPhotos()                                         │
│  ├─ getPhotoById()                                              │
│  ├─ countLogementPhotos()                                       │
│  ├─ deleteLogementPhoto()                                       │
│  └─ deleteAllLogementPhotos()                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │ Service call
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                            │
│            LogementPhotoService (@Transactional)               │
│  ┌─ Validation métier (max 4, max 5MB)                          │
│  ├─ Conversion Entité → DTO                                     │
│  ├─ Encodage Base64 pour GraphQL                                │
│  └─ Gestion erreurs avec messages clairs                        │
└────────────────────┬────────────────────────────────────────────┘
                     │ Repository call
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              Data Access Layer (JPA Repository)                  │
│           LogementPhotoRepository.save/find/delete              │
│  ┌─ CRUD operations génériques                                  │
│  ├─ Custom queries (findByLogementId, countByLogementId)       │
│  └─ Indexes automatiques                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │ JDBC + Hibernate
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                               │
│  ┌─ Table: logement                                             │
│  │  ├─ id (UUID)                                                │
│  │  ├─ titre (VARCHAR)                                          │
│  │  ├─ ... autres champs logement ...                           │
│  │  └─ statutValidation (ENUM)                                  │
│  │                                                               │
│  └─ Table: logement_photo  [NEW]                                │
│     ├─ id (UUID)                                                │
│     ├─ logement_id (UUID) FK → logement.id                     │
│     ├─ file_name (VARCHAR)                                      │
│     ├─ content_type (VARCHAR)                                   │
│     ├─ photo_data (BYTEA) ← Image binaire                       │
│     ├─ created_at (TIMESTAMP)                                   │
│     └─ INDEX: idx_logement_photo_logement_id                   │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
FLUX DE DONNÉES - Upload
═══════════════════════════════════════════════════════════════════════════════

Client                                                Server
  │                                                    │
  ├─ FormData {                                        │
  │   logementId: UUID                                 │
  │   files: [File1.jpg, File2.png]                    │
  │ }                                                  │
  │──────────── POST /graphql ─────────────────────────>
  │                                                    │
  │                        ┌─ uploadLogementPhotos()   │
  │                        │  ├─ Vérify logement existe│
  │                        │  ├─ Vérify limit (≤4)    │
  │                        │  ├─ Validate chaque file │
  │                        │  │  ├─ Taille < 5MB      │
  │                        │  │  ├─ Type = image/*    │
  │                        │  │  └─ Non-vide          │
  │                        │  ├─ Sauvegarder en BYTEA │
  │                        │  └─ Convertir → Base64   │
  │                        │                           │
  │                        └─ Response:                │
  │                           {                       │
  │                             id: UUID              │
  │                             fileName: String      │
  │                             photoDataUrl: "data:  │
  │                             ..;base64,/9j/4AAQ"   │
  │                             createdAt: DateTime    │
  │                           }                       │
  │<───────────── JSON Response ──────────────────────
  │                                                    │
  └─ Afficher image avec <img src="data:..." />       │

═══════════════════════════════════════════════════════════════════════════════
FLUX DE DONNÉES - Query
═══════════════════════════════════════════════════════════════════════════════

Client                                                Server
  │                                                    │
  ├─ GraphQL Query {                                   │
  │   getLogementPhotos(                               │
  │     logementId: "abc-123"                          │
  │   ) {                                              │
  │     id                                             │
  │     fileName                                       │
  │     photoDataUrl                                   │
  │   }                                                │
  │ }                                                  │
  │──────────── POST /graphql ─────────────────────────>
  │                                                    │
  │                        ┌─ getLogementPhotos()     │
  │                        │  ├─ photoRepository     │
  │                        │  │  .findByLogementId() │
  │                        │  ├─ Mapper → DTO        │
  │                        │  │  ├─ Encode Base64    │
  │                        │  │  └─ Créer Data URL   │
  │                        │  └─ Return List<Photo> │
  │<───────────── JSON Response ──────────────────────
  │                           {                       │
  │                             data: {               │
  │                               getLogementPhotos: [│
  │                                 {                 │
  │                                   id: "...",      │
  │                                   fileName: "...",│
  │                                   photoDataUrl: "│
  │                               data:image/jpeg;..│
  │                                 }                 │
  │                               ]                   │
  │                             }                     │
  │                           }                       │
  │                                                    │
  └─ Renderer photos avec src="data:..." ◄────────────

═══════════════════════════════════════════════════════════════════════════════
VALIDATIONS APPLIQUÉES
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────┐
│ Upload Photo Validation Flow                        │
└─────────────────────────────────────────────────────┘

  Start: uploadLogementPhotos(logementId, files)
    │
    ├─► 1. Logement existe?
    │   ├─ NO  → ❌ LogementNotFoundException
    │   └─ YES → Continue
    │
    ├─► 2. Vérifier limite photos
    │   ├─ Query: countByLogementId(logementId)
    │   ├─ Calcul: existing + new > 4?
    │   ├─ YES  → ❌ IllegalArgumentException
    │   └─ NO   → Continue
    │
    ├─► 3. Pour chaque fichier:
    │   │
    │   ├─► 3.1 Fichier vide?
    │   │   ├─ YES → ❌ "Le fichier est vide"
    │   │   └─ NO  → Continue
    │   │
    │   ├─► 3.2 Taille fichier?
    │   │   ├─ > 5MB → ❌ "Fichier trop volumineux"
    │   │   └─ ≤ 5MB → Continue
    │   │
    │   ├─► 3.3 Type MIME?
    │   │   ├─ Vérifier: image/jpeg, image/png, image/gif, image/webp
    │   │   ├─ Invalid → ❌ "Type de fichier non autorisé"
    │   │   └─ Valid   → Continue
    │   │
    │   ├─► 3.4 Nom fichier?
    │   │   ├─ Empty/null → ❌ "Nom de fichier invalide"
    │   │   └─ Valid      → Continue
    │   │
    │   └─► 3.5 Sauvegarder
    │       ├─ LogementPhoto entity créée
    │       ├─ photoData = byte[] du fichier
    │       ├─ photoRepository.save()
    │       └─ ✅ Retour DTO avec photoDataUrl (Base64)
    │
    └─► End: Retourner List<LogementPhotoDto>

═══════════════════════════════════════════════════════════════════════════════
STOCKAGE BYTEA
═══════════════════════════════════════════════════════════════════════════════

PostgreSQL Column Definition:
┌──────────────────────────────────────────────────────┐
│ photo_data BYTEA NOT NULL                            │
│ @Lob                                                 │
│ private byte[] photoData;                            │
└──────────────────────────────────────────────────────┘

Stockage par fichier:
┌──────────────────────────────────────────────────────┐
│ Photo JPG 1920x1080:                    ~300-500 KB  │
│ Photo PNG 1920x1080:                    ~500-800 KB  │
│ Photo GIF 1920x1080:                    ~200-400 KB  │
│ Photo WebP 1920x1080:                   ~150-300 KB  │
│                                                      │
│ Total 4 photos (mix):                   ~1.2-2 MB   │
│ Database overhead (indexes, metadata):  ~100 KB     │
│ Total par logement:                     ~1.3-2.1 MB │
└──────────────────────────────────────────────────────┘

Avantages BYTEA (choix adopté):
✅ Stockage avec la base (backup simplifié)
✅ Aucune configuration filesystem
✅ Transactions ACID incluses
✅ Scalabilité (réplication DB incluse)
✅ Pas de lien cassé (fichier ≠ DB)
✅ Permissions centralisées

Inconvénients (pour amélioration future):
⚠️ Performance read légèrement inférieure au filesystem
⚠️ Nécessite compression si > 1 GB de photos
⚠️ Pas optimal pour très hautes résolutions

═══════════════════════════════════════════════════════════════════════════════
PERFORMANCE & OPTIMISATIONS
═══════════════════════════════════════════════════════════════════════════════

✅ Index créé automatiquement:
   CREATE INDEX idx_logement_photo_logement_id 
   ON logement_photo(logement_id);

✅ Requêtes optimisées:
   - findByLogementId() : SELECT * ... WHERE logement_id = ? (indexed)
   - countByLogementId() : SELECT COUNT(*) ... (indexed)
   - deleteByLogementId() : DELETE ... WHERE logement_id = ? (cascade)

✅ Transactions:
   - @Transactional appliquée au service
   - Upload tout-ou-rien (atomicité)
   - Rollback automatique en erreur

⚠️ Considérations:
   - Encodage Base64 +33% taille (normal pour GraphQL)
   - Requête unique par photo (pas de N+1)
   - Pagination possible si besoin (future)

═══════════════════════════════════════════════════════════════════════════════
VERSION & DÉPLOIEMENT
═══════════════════════════════════════════════════════════════════════════════

✅ Java:             21 (LTS)
✅ Spring Boot:      3.5.14
✅ Spring GraphQL:   1.4.5
✅ PostgreSQL:       12+ (BYTEA support)
✅ Hibernate:        6.x (via Spring Boot)
✅ GraphQL Java:     21.x (extended scalars)

Status: 🟢 PRODUCTION READY

```
