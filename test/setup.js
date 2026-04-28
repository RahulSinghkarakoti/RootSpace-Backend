import { vi, beforeEach } from 'vitest';

// Mock Prisma to prevent database connections during tests
vi.mock('../src/config/prisma.js', () => ({
  default: {
    trees: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    person: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), findFirst: vi.fn() },
    relation: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), findFirst: vi.fn() },
    media: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), findFirst: vi.fn() },
    educationEntry: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), findFirst: vi.fn() },
  },
}));

vi.mock('../src/middleware/auth.middleware.js', () => ({
  protect: (req, _res, next) => {
    req.user = { id: 'test-user' };
    next();
  },
  restrict: () => (_req, _res, next) => next(),
}));

const createMockService = (methods) => ({
  default: methods.reduce((acc, method) => {
    acc[method] = vi.fn();
    return acc;
  }, {}),
});

vi.mock('../src/services/tree.service.js', () =>
  createMockService([
    'createTree',
    'getAllTrees',
    'getTreeById',
    'getTreeBySlug',
    'deleteTree',
    'updateTree',
  ]),
);

vi.mock('../src/services/person.service.js', () =>
  createMockService([
    'createPerson',
    'getAllPeople',
    'getPersonInTree',
    'getPersonById',
    'updatePerson',
    'deletePerson',
  ]),
);

vi.mock('../src/services/relation.service.js', () =>
  createMockService([
    'createRelation',
    'getTreeRelations',
    'getRelationById',
    'updateRelation',
    'deleteRelation',
  ]),
);

vi.mock('../src/services/media.service.js', () =>
  createMockService([
    'createMedia',
    'getTreeMedia',
    'getMediaById',
    'updateMedia',
    'deleteMedia',
  ]),
);

vi.mock('../src/services/education.service.js', () =>
  createMockService([
    'createEducation',
    'getPersonEducation',
    'getEducationById',
    'updateEducation',
    'deleteEducation',
  ]),
);

beforeEach(() => {
  vi.clearAllMocks();
});
