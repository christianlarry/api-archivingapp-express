# Authentication Upgrade Plan: JWT Refresh Token Rotation

This document outlines the plan to upgrade the current authentication system to use **Short-lived Access Tokens** and **Rotated Refresh Tokens** with **Reuse Detection**.

## 🎯 Objectives

1.  **Enhanced Security**: Minimize the window of opportunity for stolen access tokens (short lifespan).
2.  **Secure Rotation**: Every time a refresh token is used, it is invalidated and replaced with a new one.
3.  **Reuse Detection**: If an old (rotated) refresh token is used again (potential theft), the system will invalidate **all** refresh tokens for that user, forcing a re-login on all devices.
4.  **Better UX**: Users stay logged in without frequent manual re-authentication.

---

## 🏗 Architecture & Flow

### Token Storage Strategy
*   **Access Token**: Sent in JSON response body. Stored in Client Memory (React State) or `Authorization` header. Short expiry (e.g., 15 minutes).
*   **Refresh Token**: Sent as **HttpOnly, Secure, SameSite Cookie**. This prevents XSS attacks from stealing the refresh token. Long expiry (e.g., 7 days).

### The Rotation Flow
1.  **Login**: Server returns Access Token (JSON) + Refresh Token (Cookie). Refresh Token is saved in DB.
2.  **Access Resource**: Client sends Access Token in Header.
3.  **Token Expired**: Client receives 401.
4.  **Refresh Request**: Client hits `/auth/refresh`. Browser automatically sends the Cookie.
5.  **Rotation Logic**:
    *   Server validates Refresh Token signature.
    *   **Scenario A (Normal)**: Token is found in DB.
        *   Delete *old* token from DB.
        *   Create *new* Access Token + *new* Refresh Token.
        *   Save *new* Refresh Token to DB.
        *   Send new pair to client.
    *   **Scenario B (Reuse Attack)**: Token signature is valid, but token is **NOT** in DB (it was already rotated).
        *   **Action**: Assume theft. **Delete ALL refresh tokens** for this user.
        *   Result: Attacker and Victim both lose access. Victim must re-login.

---

## 📝 Implementation Steps

### 1. Environment & Config (`src/config/env.ts`)
Add new environment variables for expiration times and secrets.

```env
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRATION=7d
```

### 2. Database Schema Update (`src/models/user.model.ts`)
Update `IUser` to store a list of valid refresh tokens.

```typescript
// Add to UserSchema
refreshTokens: {
    type: [String],
    select: false // Do not return in queries by default
}
```
*Note: We will cap this array (e.g., max 5 devices) to prevent infinite growth.*

### 3. Utility Updates (`src/utils/jwt.ts`)
*   Update `generateToken` to strictly be `generateAccessToken`.
*   Add `generateRefreshToken`.
*   Add `verifyRefreshToken`.
*   Add helper `sendRefreshTokenCookie(res, token)`.

### 4. Service Layer Updates (`src/services/auth.service.ts`)
*   **`login`**: Generate both tokens. Push refresh token to User's DB array.
*   **`refreshToken`**:
    *   Input: `incomingRefreshToken` (from cookie).
    *   Logic: Verify signature -> Check DB for existence -> Handle Rotation or Reuse Detection -> Save changes.
*   **`logout`**: Remove the specific refresh token from DB and clear cookie.

### 5. Controller Updates (`src/controllers/auth.controller.ts`)
*   Update `login`: Use `sendRefreshTokenCookie`.
*   Add `refreshToken`: Handle the refresh flow.
*   Add `logout`: Handle logout flow.

### 6. Routes Update (`src/routes/auth.routes.ts`)
*   `POST /refresh-token`
*   `POST /logout`

---

## ✅ Checklist for Review

- [ ] Does the `User` model support storing multiple tokens (multi-device support)? **Yes.**
- [ ] Is the Refresh Token exposed to client-side JS? **No (HttpOnly Cookie).**
- [ ] What happens if an attacker steals a used Refresh Token? **Reuse Detection triggers, invalidating the victim's session immediately.**
