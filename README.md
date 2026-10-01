# NestJS Auth & Users API (TypeORM + MySQL + Jose JWT + Swagger + React.js)

A production-ready NestJS REST API with TypeORM MySQL integration, Jose JWT authentication, Swagger OpenAPI documentation, and a React.js interactive frontend dashboard.

---

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11
- **ORM / Database**: [TypeORM](https://typeorm.io/) with [MySQL](https://www.mysql.com/) (`mysql2` driver)
- **Authentication**: JWT using [`jose`](https://github.com/panva/jose) library
- **Documentation**: [Swagger / OpenAPI](https://swagger.io/) (`@nestjs/swagger`)
- **Frontend Dashboard**: [React.js](https://react.dev/) (Vite + TypeScript + Lucide Icons)
- **Language**: Strict TypeScript (`ts`)

---

## 📋 Features & API Endpoints

### 1. Users API (`/users`)
- `POST /users` – Create user (Hashes password with `bcryptjs`, validates input DTO)
- `GET /users` – List all active users (`[Jwt Bearer Auth]`)
- `GET /users/:id` – Get user by ID (`[Jwt Bearer Auth]`)
- `POST /users/:id` & `PATCH /users/:id` – Update user details (`[Jwt Bearer Auth]`)
- `DELETE /users/:id` & `DELETE /users/:id/soft` – Soft delete user (`[Jwt Bearer Auth]`)
- `DELETE /users/:id/hard` – Hard delete user permanently (`[Jwt Bearer Auth]`)

### 2. Auth API (`/auth`)
- `POST /auth/login` – Login with credentials and return Jwt Token signed via `jose`
- `GET /auth/me` – Get current authenticated user profile based on Jwt Bearer token

### 3. User Entity Fields
- `id` (Primary Key, Auto-Increment)
- `first_name` (string)
- `last_name` (string)
- `email` (string, unique)
- `password` (string, hashed, excluded from responses)
- `created_at` (timestamp, `@CreateDateColumn`)
- `modified_at` (timestamp, `@UpdateDateColumn`)
- `deleted_at` (timestamp, nullable, `@DeleteDateColumn`)

---

## 🚀 Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure your MySQL server is running and configure credentials in `.env`:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=primis_auth_db
DB_SYNCHRONIZE=true

JWT_SECRET=super_secret_jwt_key_primis_task_2026_change_in_prod
JWT_EXPIRES_IN=24h
```

*(Note: If MySQL is not locally running, setting `DB_TYPE=sqlite` seamlessly uses an embedded database for zero-config testing).*

---

### 2. Running the Backend Server

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start server in development watch mode
npm run start:dev
```

- Server will start at `http://localhost:3000`
- Interactive Swagger UI documentation is available at `http://localhost:3000/docs`

---

### 3. Running the React.js Dashboard

```bash
# Start React frontend client
npm run start:client
```
The React frontend dashboard will launch at `http://localhost:5173`.

---

### 4. Running Tests

```bash
npm run test
```

---

## 📚 API Documentation (Swagger)

Navigate to `http://localhost:3000/docs` to test all endpoints via Swagger UI.

1. Call `POST /auth/login` to obtain your JWT token.
2. Click **Authorize** at the top right of the Swagger UI and enter your token.
3. Access protected `/users` and `/auth/me` endpoints.
