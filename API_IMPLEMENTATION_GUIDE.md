# API Implementation Guide

This guide outlines the standard flow, architecture, and patterns for implementing new API endpoints in this project. Adhering to this guide ensures consistency and maintainability across the codebase.

## Architecture Overview

The application follows a **Layered Architecture**:

1.  **Types** (`src/types/`): Define TypeScript interfaces and Data Transfer Objects (DTOs).
2.  **Models** (`src/models/`): Define Database Schemas (Mongoose).
3.  **Validations** (`src/validations/`): Define Zod schemas for input validation.
4.  **Services** (`src/services/`): Contain business logic, perform validation, and interact with the database.
5.  **Controllers** (`src/controllers/`): Handle HTTP requests, parse inputs, call services, and send responses.
6.  **Routes** (`src/routes/`): Define endpoints and map them to controllers.

---

## Step-by-Step Implementation Flow

To add a new feature (e.g., "Product"), follow these steps in order:

### 1. Define Types (`src/types/product.types.ts`)
Define the shape of your data (DTOs) for requests and responses.

```typescript
export interface CreateProductDTO {
  name: string;
  price: number;
  description?: string;
}

export interface UpdateProductDTO {
  name?: string;
  price?: number;
}
```

### 2. Create Model (`src/models/product.model.ts`)
Define the Mongoose schema and interface.

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  description?: string;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
  }, 
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
```

### 3. Define Validation (`src/validations/product.validation.ts`)
Create Zod schemas matching your DTOs.

```typescript
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
});
```

### 4. Create Service (`src/services/product.service.ts`)
Implement business logic. **Validation should happen here.**

```typescript
import { CreateProductDTO } from "@/types/product.types";
import { validate } from "@/validations/validate"; // Use global validator
import { createProductSchema } from "@/validations/product.validation";
import { Product } from "@/models/product.model";
import { ResponseError } from "@/errors/ResponseError";

export const create = async (data: CreateProductDTO) => {
  // 1. Validate Input
  const payload = validate(createProductSchema, data);

  // 2. Business Logic checks
  const existing = await Product.findOne({ name: payload.name });
  if (existing) {
    throw new ResponseError(400, "Product already exists");
  }

  // 3. Database Operation
  const product = await Product.create(payload);
  
  return product;
};
```

### 5. Create Controller (`src/controllers/product.controller.ts`)
Handle the request/response cycle. Keep controllers thin.

```typescript
import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import { responseOk } from "@/utils/response";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.create(req.body);
    responseOk(res, 201, product);
  } catch (error) {
    next(error); // Pass errors to the global error handler
  }
};
```

### 6. Create Route (`src/routes/product.routes.ts`)
Define the endpoints and apply middleware.

```typescript
import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", protect, productController.create);
// router.get("/", productController.getAll);

export default router;
```

### 7. Register Route (`src/app.ts`)
Add the new route file to the main application.

```typescript
import productRoutes from "./routes/product.routes";

// ...
app.use("/api/v1/products", productRoutes);
```

---

## Key Conventions & Rules

1.  **Validation**:
    *   Use `zod` for schema definitions.
    *   Use `validate()` helper from `@/validations/validate` inside **Services**, not Controllers.
    *   This ensures business logic and validation stay coupled in the Service layer.

2.  **Error Handling**:
    *   **Services**: Throw `ResponseError(statusCode, message)` for known logic errors (e.g., 404 Not Found, 400 Bad Request).
    *   **Controllers**: Wrap all async code in `try...catch`. In the `catch` block, call `next(error)`.
    *   Do not send responses manually (e.g., `res.status(400).json(...)`) in the catch block. Let the global error middleware handle it.

3.  **Response Format**:
    *   Use `responseOk(res, status, data, pagination?)` helper from `@/utils/response`.
    *   This ensures a consistent JSON structure `{ data: ... }` or `{ data: ..., page: ... }`.

4.  **Imports**:
    *   Use the path alias `@/` (mapped to `src/`) for clean imports.

5.  **Naming**:
    *   **Files**: `kebab-case.type.ts` (e.g., `user.model.ts`, `auth.controller.ts`).
    *   **Classes/Interfaces**: `PascalCase` (e.g., `RegisterDTO`, `UserSchema`).
    *   **Variables/Functions**: `camelCase` (e.g., `authService`, `createProduct`).
