# MongoDB Schema Collection Design

Berdasarkan kebutuhan aplikasi pengarsipan, berikut adalah desain skema database MongoDB.

## 1. Users Collection (`users`)

Menyimpan data pengguna aplikasi.

```json
{
  "_id": "ObjectId",
  "email": {
    "type": "String",
    "required": true,
    "unique": true,
    "lowercase": true,
    "trim": true
  },
  "password": {
    "type": "String",
    "required": true,
    "select": false // Tidak dikembalikan secara default query
  },
  "fullName": {
    "type": "String",
    "required": true
  },
  "role": {
    "type": "String",
    "enum": ["user", "admin"],
    "default": "user"
  },
  "isActive": {
    "type": "Boolean",
    "default": true
  },
  "createdAt": {
    "type": "Date",
    "default": "Date.now"
  },
  "updatedAt": {
    "type": "Date",
    "default": "Date.now"
  }
}
```

### Indexes:
- `email`: Unique

---

## 2. Documents Collection (`documents`)

Menyimpan metadata dokumen yang diarsipkan.

```json
{
  "_id": "ObjectId",
  "title": {
    "type": "String",
    "required": true,
    "trim": true
  },
  "description": {
    "type": "String"
  },
  "originalName": {
    "type": "String",
    "required": true
  },
  "storagePath": {
    "type": "String",
    "required": true // Path relatif atau absolut di local storage
  },
  "mimeType": {
    "type": "String",
    "required": true
  },
  "size": {
    "type": "Number",
    "required": true // Dalam bytes
  },
  "category": {
    "type": "String",
    "index": true
  },
  "tags": [{
    "type": "String",
    "index": true
  }],
  "uploadedBy": {
    "type": "ObjectId",
    "ref": "User",
    "required": true
  },
  "isEncrypted": {
    "type": "Boolean",
    "default": false
  },
  "createdAt": {
    "type": "Date",
    "default": "Date.now"
  },
  "updatedAt": {
    "type": "Date",
    "default": "Date.now"
  }
}
```

### Indexes:
- `category`: Untuk filtering cepat.
- `tags`: Untuk filtering cepat.
- `title`: Text index untuk pencarian (opsional: compound index dengan category/tags).
- `uploadedBy`: Untuk melihat dokumen milik user tertentu.

---

## 3. Audit Logs Collection (`audit_logs`)

Mencatat aktivitas pengguna untuk keperluan audit trail.

```json
{
  "_id": "ObjectId",
  "userId": {
    "type": "ObjectId",
    "ref": "User",
    "required": true
  },
  "action": {
    "type": "String",
    "required": true,
    "enum": ["LOGIN", "LOGOUT", "UPLOAD", "DOWNLOAD", "DELETE", "UPDATE_PROFILE", "CHANGE_PASSWORD"]
  },
  "targetDocumentId": {
    "type": "ObjectId",
    "ref": "Document",
    "required": false // Jika aksi berhubungan dengan dokumen
  },
  "details": {
    "type": "String" // Deskripsi tambahan atau metadata JSON string
  },
  "ipAddress": {
    "type": "String"
  },
  "userAgent": {
    "type": "String"
  },
  "timestamp": {
    "type": "Date",
    "default": "Date.now",
    "index": true // TTL Index bisa ditambahkan jika log ingin dihapus otomatis setelah periode tertentu
  }
}
```

### Indexes:
- `timestamp`: Untuk sorting dan filtering berdasarkan waktu.
- `userId`: Untuk melihat aktivitas user tertentu.
