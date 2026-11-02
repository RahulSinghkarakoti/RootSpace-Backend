# 🌳 RootSpace — Backend API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18.2-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4.1-2D3748.svg?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-FCC72B?logo=vitest&logoColor=black)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A production-ready, highly secure RESTful API powering **RootSpace** — a multi-generational family tree, genealogy, and historical legacy platform. Built with Node.js, Express, Prisma ORM, and PostgreSQL.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A: Docker Setup (Recommended)](#option-a-docker-setup-recommended)
  - [Option B: Local Node.js Setup](#option-b-local-nodejs-setup)
- [Environment Configuration](#-environment-configuration)
- [Database & Prisma Migrations](#-database--prisma-migrations)
- [API Reference](#-api-reference)
  - [Health & Diagnostics](#health--diagnostics)
  - [Authentication & Sessions](#authentication--sessions)
  - [Dashboard & Metrics](#dashboard--metrics)
  - [Family Trees & Collaboration](#family-trees--collaboration)
  - [Tree Sharing & Permission Scopes](#tree-sharing--permission-scopes)
  - [People & Nodes](#people--nodes)
  - [Relationships](#relationships)
  - [Education Entries](#education-entries)
  - [Media & Documents](#media--documents)
  - [File Uploads](#file-uploads)
- [Security & Middleware](#-security--middleware)
- [Testing Strategy](#-testing-strategy)
- [Logging & Observability](#-logging--observability)
- [Connected Frontend Repository](#-connected-frontend-repository)

---

## 🌟 Overview

RootSpace Backend handles all core business logic, authentication, relational graph structures, permission verification, and multimedia metadata for RootSpace. It models complex multi-generational family graphs with kinship rules (`PARENT_OF`, `SPOUSE_OF`, `SIBLING_OF`), granular share tokens with fine-grained access control, session management, and automated email workflows.

---

## 🏛️ System Architecture

```
                    ┌──────────────────────────────┐
                    │    RootSpace Frontend App    │
                    │   (React / Vite / XYFlow)    │
                    └──────────────┬───────────────┘
                                   │ HTTP / JSON (REST)
                                   ▼
                    ┌──────────────────────────────┐
                    │      Express.js Router       │
                    │   (Helmet, CORS, RateLimit)  │
                    └──────────────┬───────────────┘
                                   │
              ┌────────────────────┼───────────────────┐
              ▼                    ▼                   ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │  Auth & Sessions │ │  Tree & Kinship  │ │ Media & Uploads  │
    │  JWT / Passport  │ │   Graph Engine   │ │ Resend / Assets  │
    └─────────┬────────┘ └─────────┬────────┘ └─────────┬────────┘
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │      Prisma ORM Layer        │
                    │  (@prisma/client & pg pool)  │
                    └──────────────┬───────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │     PostgreSQL Database      │
                    │ (Users, Trees, Nodes, Links) │
                    └──────────────────────────────┘
```

---

## ✨ Key Features

- **Robust Authentication & Session Security**:
  - Secure email/password registration with **Bcrypt** salt hashing.
  - **Google OAuth 2.0** integration using Passport.js.
  - Dual JWT token model (short-lived access tokens + long-lived rotating refresh tokens).
  - Session tracking with remote multi-device session revocation (`/revoke-session/:id` & `/logout-all`).
  - Forgot password & transactional emails powered by **Resend**.
- **Genealogy Graph & Relational Data Model**:
  - Trees with customizable metadata, unique slugs, cover images, and public/private toggles.
  - Person entity tracking: full name, gender, birth/death dates, birthplace, avatars, and notes.
  - Formal kinship modeling (`PARENT_OF`, `SPOUSE_OF`, `SIBLING_OF`).
  - Education history tracking (degrees, institutions, dates, fields of study).
  - Media & archival document associations.
- **Granular Share Tokens & Permission Scopes**:
  - Generate expiring or perpetual invite links with customizable permissions:
    - `VIEW_ONLY` — Read-only access to tree layout and members.
    - `MEDIA_ONLY` — Upload family photos and documents only.
    - `ADD_PERSON` — Add new relatives (with optional individual `personLimit` quotas).
    - `CONTRIBUTOR` — Add relatives and upload media.
    - `EDITOR` — Manage and edit own added relatives.
    - `FULL_ACCESS` — Complete tree modification (excluding tree deletion).
- **Security & Reliability**:
  - **Helmet** protection for secure HTTP headers.
  - Strict **CORS** origin whitelisting.
  - Tiered **Rate Limiting** (standard window limits + strict authentication brute-force limiter).
  - **Joi** schema validation for all incoming request bodies and parameters.
- **Enterprise Observability**:
  - Structured **Winston** logging with daily log rotation (`/logs/error-*.log`, `/logs/combined-*.log`).
  - **Morgan** HTTP request logging with response status colorization.
  - Standardized JSON responses with custom `AppError` exception handling.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Runtime** | [Node.js](https://nodejs.org/) (ES Modules) | High-performance asynchronous backend engine |
| **Framework** | [Express.js v4](https://expressjs.com/) | RESTful routing and middleware pipeline |
| **ORM** | [Prisma v7](https://www.prisma.io/) | Type-safe schema definition and query builder |
| **Database** | [PostgreSQL 15](https://www.postgresql.org/) | Relational database for family graphs and users |
| **Authentication**| [JSON Web Tokens](https://jwt.io/) & [Passport.js](http://www.passportjs.org/) | Access/refresh token lifecycle and Google OAuth 2.0 |
| **Validation** | [Joi](https://joi.dev/) | Strict schema validation middleware |
| **Email Service**| [Resend](https://resend.com/) | Transactional password recovery emails |
| **Logging** | [Winston](https://github.com/winstonjs/winston) + [Morgan](https://github.com/expressjs/morgan) | Rotating log files and HTTP request monitoring |
| **Testing** | [Vitest](https://vitest.dev/) + [Supertest](https://github.com/ladjs/supertest) | Fast unit and integration endpoint tests |
| **Container** | [Docker](https://docker.com/) & Docker Compose | Repeatable local dev and test environments |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **PostgreSQL**: `v14+` (or use Docker Compose)
- **Docker & Docker Compose** (optional, for containerized setup)

---

### Option A: Docker Setup (Recommended)

1. **Clone and enter the directory:**
   ```bash
   git clone https://github.com/RahulSinghkarakoti/RootSpace-Backend.git
   cd RootSpace-Backend
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Update secrets and database URLs as needed
   ```

3. **Start the containers:**
   ```bash
   npm run docker:up
   ```
   *Spins up Express API on `http://localhost:5000` and PostgreSQL on port `5432`.*

4. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```

5. **Tail container logs:**
   ```bash
   npm run docker:logs
   ```

---

### Option B: Local Node.js Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Ensure `DATABASE_URL` points to an active PostgreSQL database.

3. **Generate Prisma Client and apply migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000` with Nodemon reload.*

---

## ⚙️ Environment Configuration

| Variable | Description | Example / Default |
|---|---|---|
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |
| `PORT` | Port for the Express server | `5000` |
| `API_PREFIX` | Prefix for all API routes | `/api/v1` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/rootspace_db?schema=public` |
| `JWT_ACCESS_SECRET` | 64-character random secret for access tokens | Generated via crypto |
| `JWT_REFRESH_SECRET` | 64-character random secret for refresh tokens | Generated via crypto |
| `JWT_ACCESS_EXPIRES` | Expiration time for access tokens | `15m` |
| `JWT_REFRESH_EXPIRES`| Expiration time for refresh tokens | `7d` |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth 2.0 Client ID | `your_client_id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth 2.0 Client Secret | `your_secret` |
| `GOOGLE_CALLBACK_URL` | OAuth redirect URI | `http://localhost:5000/api/v1/auth/google/callback` |
| `ALLOWED_ORIGINS` | Comma-separated list of permitted CORS origins | `http://localhost:5173,http://localhost:3000` |
| `FRONTEND_URL` | Client URL for OAuth redirects | `http://localhost:5173` |
| `RESEND_API_KEY` | Resend API key for transactional emails | `re_123456...` |
| `PASSWORD_RESET_SECRET` | Secret key for reset token hashing | Generated via crypto |
| `RATE_LIMIT_WINDOW_MS` | Window duration for rate limiting (ms) | `900000` (15 minutes) |
| `RATE_LIMIT_MAX` | Max general requests per IP window | `100` |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts per IP window | `10` |

---

## 🗄️ Database & Prisma Migrations

Prisma handles schema definitions and migrations located in [`prisma/schema.prisma`](prisma/schema.prisma).

```bash
# Generate the Prisma Client
npm run prisma:generate

# Apply migrations in development
npm run prisma:migrate

# Apply migrations in production
npm run prisma:deploy

# Open interactive Prisma Studio GUI (http://localhost:5555)
npm run prisma:studio
```

### Core Data Models:
- **`User`**: Account identity, credentials, role (`USER`, `ADMIN`, `SUPERADMIN`), OAuth records.
- **`Trees`**: Family tree containers, slug identifiers, visibility flags, member count.
- **`TreeShareToken`**: Share tokens, permissions, person addition quotas, expiration timestamps.
- **`TreeShareMember`**: User memberships linked to shared trees, tracking contributor metrics.
- **`Person`**: Relatives/nodes containing personal biographical data.
- **`Relation`**: Edges connecting two people (`PARENT_OF`, `SPOUSE_OF`, `SIBLING_OF`).
- **`EducationEntry`**: Academic timeline records for individual persons.
- **`Media`**: Documents, photographs, and media records linked to trees and persons.
- **`RefreshToken`** & **`AuditLog`**: Security token storage and activity audit logs.

---

## 📡 API Reference

All endpoints are mounted under the prefix: **`/api/v1`**.

### Health & Diagnostics
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/ping` | Fast liveness check (`pong`) | No |
| `GET` | `/health` | Server uptime, timestamp, and environment | No |

### Authentication & Sessions
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login with email and password | No |
| `GET` | `/auth/google` | Initiate Google OAuth 2.0 login | No |
| `GET` | `/auth/google/callback` | Google OAuth callback handler | No |
| `POST` | `/auth/refresh` | Refresh access token using refresh token | No |
| `POST` | `/auth/logout` | Revoke current refresh token and logout | No |
| `POST` | `/auth/logout-all` | Invalidate all sessions across devices | Yes |
| `GET` | `/auth/sessions` | List active sessions for authenticated user | Yes |
| `POST` | `/auth/revoke-session/:id` | Revoke a specific active session | Yes |
| `POST` | `/auth/send-password-reset-email` | Dispatch password reset email via Resend | No |
| `POST` | `/auth/change-password` | Complete password reset using verified token | No |
| `GET` | `/auth/me` | Fetch authenticated user profile | Yes |

### Dashboard & Metrics
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/dashboard` | Fetch aggregated dashboard stats, tree counts, and recent activity | Yes |

### Family Trees & Collaboration
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/trees` | List all trees owned by the user | Yes |
| `POST` | `/trees` | Create a new family tree | Yes |
| `GET` | `/trees/collaborations` | Fetch trees shared with the user | Yes |
| `GET` | `/trees/:id` | Fetch tree by ID (including nodes & relations) | Yes |
| `GET` | `/trees/slug/:slug` | Fetch public or accessible tree by slug | Yes |
| `PATCH` | `/trees/:id` | Update tree metadata, cover image, or visibility | Yes |
| `DELETE` | `/trees/:id` | Delete a family tree and cascade relations | Yes |

### Tree Sharing & Permission Scopes
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/trees/:treeId/share` | Generate a share token with permissions & quotas | Yes |
| `GET` | `/trees/:treeId/share` | List active share links and collaborator tokens | Yes |
| `PATCH` | `/trees/:treeId/share/:token` | Update permissions or quota of a share token | Yes |
| `DELETE` | `/trees/:treeId/share/:token` | Revoke/delete a share link | Yes |
| `GET` | `/shared-trees` | List all trees user has joined via share tokens | Yes |
| `GET` | `/shared-trees/:token/verify` | Verify share token validity and permission level | Yes |
| `GET` | `/shared-trees/:token` | Fetch tree graph data using a valid share token | Yes |

### People & Nodes
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/trees/:treeId/person` | List all people in a specific tree | Yes |
| `POST` | `/trees/:treeId/person` | Create a person in a tree (validates quotas) | Yes |
| `GET` | `/trees/:treeId/person/:personId` | Get person details within a tree | Yes |
| `GET` | `/people/:id` | Get person by ID | Yes |
| `PATCH` | `/people/:id` | Update person details (vital dates, bio, avatar) | Yes |
| `DELETE` | `/people/:id` | Remove person from tree | Yes |

### Relationships
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/trees/:treeId/relations` | List all kinship relations in a tree | Yes |
| `POST` | `/trees/:treeId/relations` | Create relation (`PARENT_OF`, `SPOUSE_OF`, `SIBLING_OF`) | Yes |
| `GET` | `/relations/:id` | Get relation by ID | Yes |
| `PATCH` | `/relations/:id` | Update relation details | Yes |
| `DELETE` | `/relations/:id` | Remove kinship relationship | Yes |

### Education Entries
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/people/:personId/education` | List all education entries for a person | Yes |
| `POST` | `/people/:personId/education` | Add education record | Yes |
| `GET` | `/education/:id` | Get education entry by ID | Yes |
| `PATCH` | `/education/:id` | Update education record | Yes |
| `DELETE` | `/education/:id` | Delete education entry | Yes |

### Media & Documents
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/trees/:treeId/media` | List media items attached to a tree | Yes |
| `POST` | `/trees/:treeId/media` | Attach media item to tree or person | Yes |
| `GET` | `/media/:id` | Get media record by ID | Yes |
| `PATCH` | `/media/:id` | Update media caption or metadata | Yes |
| `DELETE` | `/media/:id` | Delete media record | Yes |

### File Uploads
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/upload/signature` | Request pre-signed URL / upload authorization | Yes |
| `POST` | `/upload/avatar` | Process avatar image upload | Yes |

---

## 🔒 Security & Middleware

- **`protect` Middleware**: Validates JWT access token from Authorization header or cookies, attaches user record to request context.
- **`rateLimiter`**: Express Rate Limit prevents denial-of-service and brute force credential attacks.
- **`validate` Middleware**: Joi schemas ensure incoming payloads strictly conform to required formats before hitting controllers.
- **`errorHandler`**: Centralized error middleware formats all operational and unexpected errors into uniform JSON payloads with debug traces in development.

---

## 🧪 Testing Strategy

The backend includes a comprehensive test suite powered by **Vitest** and **Supertest** covering routes, controllers, and permission validations.

```bash
# Run test suite once
npm test

# Run tests in watch mode
npm run test:watch

# Run linter and tests (CI mode)
npm run test:ci

# Run tests inside an isolated Docker test container
npm run test:docker
```

---

## 📝 Logging & Observability

RootSpace uses **Winston** with daily log rotation. Logs are automatically categorized and stored in `Backend/logs/`:
- `error-YYYY-MM-DD.log`: Operational and runtime exceptions with stack traces.
- `combined-YYYY-MM-DD.log`: Full system activity, audit logs, and HTTP transactions.

---

## 🔗 Connected Frontend Repository

The interactive visual client for RootSpace is located here:

👉 **[RootSpace Frontend Repository](https://github.com/RahulSinghkarakoti/Rootspace-frontend)**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
