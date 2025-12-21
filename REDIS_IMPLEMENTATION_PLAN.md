# Redis Implementation Plan: Caching Strategy

This document outlines the plan to integrate Redis into the Archiving App to improve performance using the **Cache-Aside Pattern**.

## 🎯 Objectives
1.  **Reduce Latency**: Serve frequent read requests from memory (Redis) instead of disk (MongoDB).
2.  **Database Offloading**: Reduce the number of queries hitting MongoDB.
3.  **Cache Management**: Implement automatic expiration (TTL) and manual invalidation on data updates.

---

## 🛠 Architecture Changes

We will introduce a **Cache Layer** (Utility) that helps Services interact with Redis.

### affected Endpoints
| Endpoint | Method | Action | Redis Strategy |
| :--- | :--- | :--- | :--- |
| `/documents` | `GET` | List/Search | **Cache Read**: Key `docs:list:{queryParams}` |
| `/documents/{id}` | `GET` | Detail | **Cache Read**: Key `docs:id:{id}` |
| `/documents/upload` | `POST` | Create | **Invalidate**: Delete `docs:list:*` |
| `/documents/{id}` | `PUT` | Update | **Invalidate**: Delete `docs:id:{id}` AND `docs:list:*` |
| `/documents/{id}` | `DELETE` | Delete | **Invalidate**: Delete `docs:id:{id}` AND `docs:list:*` |

---

## 📝 Implementation Steps

### 1. Prerequisites & Installation
*   Ensure Redis Server is running (Localhost or Cloud).
*   Install client library: `npm install ioredis`.
*   Install types: `npm install -D @types/ioredis`.

### 2. Environment Configuration (`src/config/env.ts`)
Add Redis connection details.
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Redis Connection Module (`src/config/redis.ts`)
Create a singleton Redis client instance to be reused across the app.

### 4. Cache Utility (`src/utils/cache.ts`)
Create helper functions to standardize caching logic.
*   `getOrSet(key, cb, ttl)`: Tries to get from cache. If missing, runs the callback (DB query), saves result, and returns it.
*   `clearKeys(pattern)`: Deletes keys matching a pattern (e.g., `docs:list:*`) when data changes.

### 5. Modify `DocumentService` (`src/services/document.service.ts`)

#### A. Refactor `findAll` (Read)
Wrap the MongoDB query with the cache utility.
```typescript
// Key generation example
const cacheKey = `docs:list:${JSON.stringify(queryParams)}`;
return cache.getOrSet(cacheKey, async () => {
    // ... original MongoDB query ...
}, 3600); // Cache for 1 hour
```

#### B. Refactor `create`, `update`, `delete` (Write)
After successful DB operation, trigger cache clearing.
```typescript
// After updating document
await cache.clearKeys("docs:list:*"); // Invalidate all list caches
await cache.del(`docs:id:${id}`);     // Invalidate specific detail cache
```

---

## ⚠️ Key Concepts for Developer

1.  **TTL (Time To Live)**: Always set an expiration time (e.g., 1 hour). This ensures that if invalidation fails, the data eventually corrects itself.
2.  **Cache Keys**: Naming is crucial. Use colons to separate namespaces (e.g., `resource:action:params`).
3.  **Serialization**: Redis only stores strings. Objects must be `JSON.stringify()` when saving and `JSON.parse()` when reading. (Our utility will handle this).

---

## ✅ Checklist
- [ ] Redis Server running?
- [ ] Environment variables set?
- [ ] Cache invalidation logic added to ALL write operations?
