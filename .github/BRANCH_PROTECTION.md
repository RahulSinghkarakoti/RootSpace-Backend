# Branch Protection Rules

To enforce CI checks before merging, configure branch protection rules in your GitHub repository:

## Required Status Checks

Go to: **Settings** → **Branches** → **Add rule**

### For branches: `main`, `master`, `develop`

**Require status checks to pass before merging:**
- [x] Require branches to be up to date before merging
- [x] Status checks found in the last week for this repository:
  - [x] `test` (CI Pipeline - Tests & Quality Checks / Run Tests)
  - [x] `docker-test` (CI Pipeline - Tests & Quality Checks / Docker Integration Tests)
  - [x] `security-check` (CI Pipeline - Tests & Quality Checks / Security Scan)

**Require pull request reviews:**
- [x] Require review from Code Owners
- [x] Required approvals: 1
- [x] Dismiss stale pull request approvals when new commits are pushed

**Additional settings:**
- [x] Include administrators
- [x] Restrict pushes that create matching branches
- [x] Allow force pushes: No
- [x] Allow deletions: No

## CI Pipeline Features

The pipeline includes:

1. **Unit & Integration Tests** - Runs Vitest test suite with PostgreSQL
2. **Docker Integration Tests** - Tests the full Docker environment
3. **Code Quality Checks** - Linting and security scanning
4. **Database Setup** - Automatic Prisma migrations in test environment

## Local Development

Before pushing, ensure tests pass locally:

```bash
# Run tests locally
npm test

# Run tests in Docker
npm run test:docker

# Run linting
npm run lint
```

## Troubleshooting

### Tests Failing in CI but Passing Locally

1. Check environment variables in CI match local `.env`
2. Ensure database schema is up to date
3. Check for platform-specific dependencies

### Docker Tests Failing

1. Verify Docker Compose configuration
2. Check PostgreSQL service health
3. Ensure all required ports are available

### Security Scan Issues

Security scan failures are warnings only. Review and update dependencies as needed:

```bash
npm audit fix
npm update
```