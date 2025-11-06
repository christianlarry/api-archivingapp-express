# Archiving App REST API

## Description
This project is a RESTful API for an Archiving Application, built with Node.js and Express.js. It provides a robust backend for managing archived data, offering various endpoints for data manipulation and retrieval. The API interacts with a MySQL database to store and manage the application's data.

## Technologies Used
- Node.js
- Express.js
- MySQL (Database)
- TypeScript
- Zod (for environment variable validation)

## Features
- User Authentication (Registration, Login)
- CRUD operations for archived items
- Secure API endpoints
- Environment variable validation

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- MySQL Server

### Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd api-archivingapp-express
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=3000
MONGODB_URI=mysql://user:password@host:port/database_name
MONGODB_NAME=archiving_app_db
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRATION_MINUTE=30
```

**Note:** The `MONGODB_URI` and `MONGODB_NAME` are placeholders. Since the project uses MySQL, you should replace `MONGODB_URI` with your MySQL connection string and `MONGODB_NAME` with your MySQL database name. The `env.ts` file currently validates for MongoDB, which will need to be updated to reflect MySQL.

### Database Setup
1. Ensure your MySQL server is running.
2. Create a database named `archiving_app_db` (or whatever you set `MONGODB_NAME` to in your `.env` file).
3. Run database migrations (if any) or schema synchronization commands (e.g., using an ORM like Prisma or Sequelize).

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
1. Build the TypeScript code:
   ```bash
   npm run build
   ```
2. Start the application:
   ```bash
   npm start
   ```

## API Endpoints (Examples)

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in a user

### Archived Items
- `GET /api/items`: Get all archived items
- `GET /api/items/:id`: Get a single archived item by ID
- `POST /api/items`: Create a new archived item
- `PUT /api/items/:id`: Update an archived item by ID
- `DELETE /api/items/:id`: Delete an archived item by ID

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License
This project is licensed under the ISC License.