# Roadmap to Production-Grade API (Local Implementation)

This document outlines the step-by-step plan to upgrade the Archiving App API to meet 2025 Enterprise standards. These improvements focus on Developer Experience (DX), Security, and Architectural Scalability, all optimized for a **Local Development Environment**.

---

## 🚀 Phase 1: Interactive API Documentation (Swagger UI)
**Objective**: Replace raw YAML reading with a user-friendly, interactive web interface.
**Value**: Allows frontend developers and QA to test endpoints directly from the browser without Postman.

### Implementation Steps:
1.  **Install Dependencies**:
    ```bash
    npm install swagger-ui-express yamljs
    npm install -D @types/swagger-ui-express @types/yamljs
    ```
2.  **Create Docs Route**:
    *   Load `@docs/openapi.yaml`.
    *   Serve it via `swagger-ui-express` at `/api/docs`.
3.  **Update `app.ts`**: Register the documentation route.

---

## 🛡 Phase 2: Distributed Rate Limiting (Redis)
**Objective**: Secure the API against brute-force and DDoS attacks using the existing Redis infrastructure.
**Value**: Unlike memory-based limiting, Redis-based limiting persists across server restarts and works in multi-process setups (clustering).

### Implementation Steps:
1.  **Install Dependencies**:
    ```bash
    npm install express-rate-limit rate-limit-redis
    ```
2.  **Create Middleware (`src/middlewares/rateLimit.middleware.ts`)**:
    *   Import existing `redisClient`.
    *   Configure specific limits (e.g., Strict limit for Auth, wider limit for General API).
3.  **Apply Middleware**:
    *   Apply globally in `app.ts`.
    *   Apply stricter limits on `/auth/*` routes.

---

## 🛑 Phase 3: Graceful Shutdown
**Objective**: Ensure the server closes connections safely when stopped (e.g., Ctrl+C or deployment updates).
**Value**: Prevents data corruption and "hanging" connections in Database and Redis.

### Implementation Steps:
1.  **Refactor `src/main.ts`**:
    *   Listen for `SIGTERM` and `SIGINT` signals.
    *   Create a shutdown function that:
        1.  Stops the HTTP Server (stops accepting new requests).
        2.  Closes MongoDB Connection.
        3.  Closes Redis Connection.
        4.  Exits process with Code 0.

---

## ☁️ Phase 4: Storage Adapter Pattern (Preparation for S3/MinIO)
**Objective**: Decouple the "Saving File" logic from the "Business Logic". Currently, `fs.writeFile` is hardcoded in `document.service.ts`.
**Value**: Allows switching between Local Disk, AWS S3, or Google Cloud Storage simply by changing an Environment Variable, without touching the Service code.

### Implementation Steps:
1.  **Define Interface (`src/interfaces/storage.interface.ts`)**:
    ```typescript
    export interface IStorageService {
      upload(file: Express.Multer.File, path: string): Promise<string>;
      delete(path: string): Promise<void>;
      getFileStream(path: string): Promise<ReadStream>;
    }
    ```
2.  **Implement Local Strategy (`src/services/storage/local.storage.ts`)**:
    *   Move the current `fs` logic here.
3.  **Refactor `DocumentService`**:
    *   Remove `fs` imports.
    *   Inject/Use `StorageService` instead.
    *   *Note*: For now, we will use the `LocalStorage` implementation, but the code is now ready for S3 whenever you want.

---

## 📋 Execution Order
We will execute these phases sequentially. I will pause after each phase to ensure verification.

**Next Action**: Provide instruction to start **Phase 1**.
