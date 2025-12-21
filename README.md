# Archiving App REST API

## Description
This project is a robust, production-grade RESTful API for an Archiving Application, built with **Node.js**, **Express**, and **TypeScript**. It is designed to simulate a real-world enterprise environment, featuring advanced patterns like **Graceful Shutdown**, **Rate Limiting (Redis)**, **Storage Adapter Pattern**, and comprehensive **API Documentation (Swagger/OpenAPI)**.

The API serves as the backend for managing digital documents, user authentication, and profile management, backed by **MongoDB** for data persistence and **Redis** for caching and security limiting.

## 🛠 Technologies Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (via Mongoose ODM)
- **Caching & Rate Limiting:** Redis (ioredis)
- **Validation:** Zod
- **Documentation:** Swagger UI & OpenAPI 3.0
- **Security:** Helmet, CORS, JWT (JSON Web Tokens), Bcrypt
- **Logging:** Winston & Morgan

## ✨ Key Features

- **Authentication & Authorization**:
  - Secure Register & Login (JWT Access + Refresh Tokens).
  - Password Management (Change Password).
  - Role-based protection middleware.
- **Document Management**:
  - File Upload (Multer) with Metadata extraction.
  - **Storage Adapter Pattern**: Decoupled storage logic (currently Local Storage, easily switchable to S3/MinIO).
  - Full Text Search & Filtering (Tags, Categories).
  - Metadata caching strategies.
- **Performance & Security**:
  - **Distributed Rate Limiting**: Redis-backed limiters (Strict for Auth, General for API).
  - **Graceful Shutdown**: Ensures zero-downtime deployments and safe connection closing for DB/Redis.
  - **Caching**: Optimized query caching for lists and details.
- **Developer Experience**:
  - Interactive Swagger UI Documentation.
  - Strict Typing & Linting (ESLint + Prettier).
  - Centralized Configuration.

## 🚀 Setup Instructions

### Prerequisites
Ensure you have the following installed on your local machine:
1.  **Node.js** (v18 or higher)
2.  **npm** (Node Package Manager)
3.  **MongoDB** (Local instance or Atlas Connection URI)
4.  **Redis** (Required for Rate Limiting)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd api-archivingapp-express
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the root directory based on the example below:

    ```env
    # Server Config
    PORT=3000
    NODE_ENV=development

    # MongoDB Config
    MONGODB_URI=mongodb://localhost:27017
    MONGODB_NAME=archiving_app_db

    # JWT Security
    JWT_SECRET=your_super_secret_access_key
    JWT_ACCESS_EXPIRATION_MINUTE=15
    JWT_REFRESH_SECRET=your_super_secret_refresh_key
    JWT_REFRESH_EXPIRATION_DAYS=7

    # Redis Config (Required)
    REDIS_HOST=localhost
    REDIS_PORT=6379
    REDIS_PASSWORD=
    ```

### Running the Application

#### Development Mode
Runs the server with hot-reloading (nodemon):
```bash
npm run dev
```

#### Production Build
Builds the TypeScript source into JavaScript (`dist/`) and runs it:
```bash
npm run build
npm start
```

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:

**URL:** `http://localhost:3000/api/docs`

This interface allows you to:
- Explore all available endpoints.
- View Request/Response schemas.
- Test endpoints directly from the browser (Try it out).

## 🏛 Architecture Highlights

### Storage Adapter Pattern
The application uses an interface-based approach for file storage (`IStorageService`).
- **Current Implementation:** `LocalStorageService` (Files saved to `public/uploads`).
- **Future Proof:** Can be swapped with `S3StorageService` or `GCSStorageService` without changing business logic in controllers/services.

### Graceful Shutdown
The application handles `SIGINT` and `SIGTERM` signals to:
1. Stop accepting new HTTP requests.
2. Wait for pending requests to complete (or timeout).
3. Safely disconnect MongoDB and Redis connections.
4. Exit the process cleanly.

### Rate Limiting
To prevent abuse, the API enforces limits using Redis:
- **General API:** 100 requests / 15 mins.
- **Auth Endpoints:** 20 requests / 15 mins (Stricter protection against brute force).

## 📂 Project Structure

```
src/
├── config/         # Environment, Logger, DB Connectors
├── controllers/    # Request Handlers
├── interfaces/     # Core Interfaces (e.g., Storage)
├── middlewares/    # Auth, Error, RateLimit, Upload
├── models/         # Mongoose Schemas
├── routes/         # Express Routes
├── services/       # Business Logic
│   └── storage/    # Storage Strategies (Local, S3, etc.)
├── types/          # TypeScript Type Definitions
├── utils/          # Helpers (JWT, Cache, Response)
├── validations/    # Zod Schemas
├── app.ts          # Express App Setup
└── main.ts         # Entry Point (Server & Shutdown Logic)
```

## License
This project is licensed under the ISC License.
