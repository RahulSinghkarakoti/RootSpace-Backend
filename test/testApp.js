import express from 'express';
import { vi } from 'vitest';

// Create mock controller functions using vi.hoisted to avoid hoisting issues
const mockController = vi.hoisted(() => ({
  createTree: vi.fn(),
  getAllTrees: vi.fn(),
  getTreeById: vi.fn(),
  getTreeBySlug: vi.fn(),
  updateTree: vi.fn(),
  deleteTree: vi.fn(),
  createPerson: vi.fn(),
  getAllPeople: vi.fn(),
  getPersonInTree: vi.fn(),
  getPersonById: vi.fn(),
  updatePerson: vi.fn(),
  deletePerson: vi.fn(),
  createRelation: vi.fn(),
  getTreeRelations: vi.fn(),
  getRelationById: vi.fn(),
  updateRelation: vi.fn(),
  deleteRelation: vi.fn(),
  createMedia: vi.fn(),
  getTreeMedia: vi.fn(),
  getMediaById: vi.fn(),
  updateMedia: vi.fn(),
  deleteMedia: vi.fn(),
  createEducation: vi.fn(),
  getPersonEducation: vi.fn(),
  getEducationById: vi.fn(),
  updateEducation: vi.fn(),
  deleteEducation: vi.fn(),
}));

// Export the mock controller for use in tests
export { mockController };

// Mock the route modules
vi.mock('../src/routes/tree.routes.js', () => {
  const router = express.Router();

  router.post('/', mockController.createTree);
  router.get('/', mockController.getAllTrees);
  router.get('/:id', mockController.getTreeById);
  router.get('/slug/:slug', mockController.getTreeBySlug);
  router.patch('/:id', mockController.updateTree);
  router.delete('/:id', mockController.deleteTree);

  // People under trees
  router.post('/:treeId/person', mockController.createPerson);
  router.get('/:treeId/person', mockController.getAllPeople);
  router.get('/:treeId/person/:personId', mockController.getPersonInTree);

  // Relations under trees
  router.post('/:treeId/relations', mockController.createRelation);
  router.get('/:treeId/relations', mockController.getTreeRelations);

  // Media under trees
  router.post('/:treeId/media', mockController.createMedia);
  router.get('/:treeId/media', mockController.getTreeMedia);

  return { default: router };
});

vi.mock('../src/routes/person.routes.js', () => {
  const router = express.Router();

  router.get('/:id', mockController.getPersonById);
  router.patch('/:id', mockController.updatePerson);
  router.delete('/:id', mockController.deletePerson);

  return { default: router };
});

vi.mock('../src/routes/relation.routes.js', () => {
  const router = express.Router();

  router.post('/', mockController.createRelation);
  router.get('/tree/:treeId', mockController.getTreeRelations);
  router.get('/:id', mockController.getRelationById);
  router.patch('/:id', mockController.updateRelation);
  router.delete('/:id', mockController.deleteRelation);

  return { default: router };
});

vi.mock('../src/routes/media.routes.js', () => {
  const router = express.Router();

  router.post('/', mockController.createMedia);
  router.get('/tree/:treeId', mockController.getTreeMedia);
  router.get('/:id', mockController.getMediaById);
  router.patch('/:id', mockController.updateMedia);
  router.delete('/:id', mockController.deleteMedia);

  return { default: router };
});

vi.mock('../src/routes/education.routes.js', () => {
  const router = express.Router();

  router.post('/people/:personId/education', mockController.createEducation);
  router.get('/people/:personId/education', mockController.getPersonEducation);
  router.get('/education/:id', mockController.getEducationById);
  router.patch('/education/:id', mockController.updateEducation);
  router.delete('/education/:id', mockController.deleteEducation);

  return { default: router };
});

import treeRoutes from '../src/routes/tree.routes.js';
import personRoutes from '../src/routes/person.routes.js';
import relationRoutes from '../src/routes/relation.routes.js';
import mediaRoutes from '../src/routes/media.routes.js';
import educationRoutes from '../src/routes/education.routes.js';

const createTestApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount routes with protection (mocked)
  app.use('/api/v1/trees', treeRoutes);
  app.use('/api/v1/people', personRoutes);
  app.use('/api/v1/relations', relationRoutes);
  app.use('/api/v1/media', mediaRoutes);
  app.use('/api/v1', educationRoutes);

  return app;
};

export default createTestApp;