# Family Tree Backend API

[![CI Pipeline](https://github.com/your-username/family-tree-backend/actions/workflows/test.yml/badge.svg)](https://github.com/your-username/family-tree-backend/actions/workflows/test.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%E2%9C%93-blue)](https://docker.com/)

A production-ready Express.js API for managing family trees with authentication, PostgreSQL database, and comprehensive testing.

## Features

- **Authentication**: JWT-based auth with Google OAuth2
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful endpoints for Trees, People, Relations, Media, and Education
- **Testing**: Vitest with Supertest for comprehensive endpoint testing
- **Docker**: Containerized development and testing environments
- **Security**: Rate limiting, CORS, Helmet, input validation with Joi

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Development Setup

1. **Clone and setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start development environment:**
   ```bash
   npm run docker:up
   ```

   This starts:
   - API server on `http://localhost:5000`
   - PostgreSQL database on `localhost:5432`

3. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

4. **View API documentation:**
   - API endpoints are available at `http://localhost:5000/api/v1/`

### Testing

#### Local Testing
```bash
npm test
```

#### Docker Testing
```bash
npm run test:docker
```

This runs tests in an isolated Docker environment with a separate test database.

## Docker Commands

```bash
# Build and start development environment
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop environment
npm run docker:down

# Run tests in Docker
npm run test:docker
```

## API Endpoints

### Trees
- `GET /api/v1/trees` - List all trees
- `POST /api/v1/trees` - Create tree
- `GET /api/v1/trees/:id` - Get tree by ID
- `GET /api/v1/trees/slug/:slug` - Get tree by slug
- `PATCH /api/v1/trees/:id` - Update tree
- `DELETE /api/v1/trees/:id` - Delete tree

### People
- `GET /api/v1/trees/:treeId/people` - List people in tree
- `POST /api/v1/trees/:treeId/people` - Create person
- `GET /api/v1/people/:id` - Get person by ID
- `PATCH /api/v1/people/:id` - Update person
- `DELETE /api/v1/people/:id` - Delete person

### Relations
- `GET /api/v1/trees/:treeId/relations` - List relations in tree
- `POST /api/v1/trees/:treeId/relations` - Create relation
- `GET /api/v1/relations/:id` - Get relation by ID
- `PATCH /api/v1/relations/:id` - Update relation
- `DELETE /api/v1/relations/:id` - Delete relation

### Media
- `GET /api/v1/trees/:treeId/media` - List media in tree
- `POST /api/v1/trees/:treeId/media` - Upload media
- `GET /api/v1/media/:id` - Get media by ID
- `PATCH /api/v1/media/:id` - Update media
- `DELETE /api/v1/media/:id` - Delete media

### Education
- `GET /api/v1/people/:personId/education` - List person's education
- `POST /api/v1/people/:personId/education` - Add education
- `GET /api/v1/education/:id` - Get education by ID
- `PATCH /api/v1/education/:id` - Update education
- `DELETE /api/v1/education/:id` - Delete education

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout user

## Environment Variables

See `.env.example` for all required environment variables. Key ones:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_ACCESS_SECRET`: JWT access token secret (64+ chars)
- `JWT_REFRESH_SECRET`: JWT refresh token secret (64+ chars)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## Database Schema

The application uses Prisma with PostgreSQL. Main models:

- `User`: Authentication users
- `Tree`: Family trees
- `Person`: Individuals in trees
- `Relation`: Relationships between people
- `Media`: Photos/documents for people
- `EducationEntry`: Education history for people

## Testing Strategy

- **Unit Tests**: Service layer business logic
- **Integration Tests**: API endpoints with mocked controllers
- **Database Tests**: Prisma operations (in-memory or test DB)

Test files are located in `/test/` directory and use Vitest framework.

## Development Workflow

1. Make code changes
2. Run pre-commit checks: `npm run test:ci`
3. Test in Docker: `npm run test:docker`
4. Commit changes

### Pre-commit Checks

Before pushing code, run:

```bash
npm run test:ci  # Runs linting + tests
```

This ensures your code passes the same checks as CI.

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration:

- **Triggers**: Runs on every push and pull request to `main`, `master`, and `develop` branches
- **Tests**: Unit and integration tests with PostgreSQL database
- **Docker**: Integration tests in isolated Docker environment
- **Security**: Automated security scanning and dependency checks
- **Quality**: Code linting and formatting checks

### Branch Protection

Merges to protected branches require:
- ✅ All tests passing
- ✅ Code review approval
- ✅ Branch up to date with base branch

See `.github/BRANCH_PROTECTION.md` for detailed setup instructions.

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use `npm run prisma:deploy` for migrations
3. Use `npm start` instead of `npm run dev`
4. Configure production database URL
5. Set secure JWT secrets and OAuth credentials

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker-compose ps`
- Check database logs: `docker-compose logs db`
- Verify DATABASE_URL in .env

### Test Failures
- Run tests in Docker: `npm run test:docker`
- Check test database: separate from dev database
- Ensure all dependencies are installed

### Port Conflicts
- API runs on port 5000
- Database runs on port 5432 (5433 for tests)
- Change ports in docker-compose.yml if needed